/**
 * 自動評分 API 端點
 * 使用 AI 進行智能評分和反饋生成
 */

import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GradingRequest {
  questionType: 'multiple_choice' | 'short_answer' | 'essay' | 'matching' | 'true_false' | 'fill_blank';
  question: string;
  correctAnswer?: any;
  studentAnswer: any;
  rubric?: GradingRubric;
  context?: string;
  maxScore?: number;
}

interface GradingRubric {
  criteria: RubricCriterion[];
  totalPoints: number;
  passingScore: number;
}

interface RubricCriterion {
  name: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

interface RubricLevel {
  name: string;
  description: string;
  points: number;
}

interface GradingResult {
  score: number;
  maxScore: number;
  percentage: number;
  isCorrect: boolean;
  feedback: string;
  detailedFeedback?: DetailedFeedback;
  suggestions?: string[];
  confidence: number;
  gradingTime: number;
}

interface DetailedFeedback {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  rubricScores?: { [criterion: string]: number };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const gradingRequest: GradingRequest = req.body;
    
    // 驗證請求
    if (!gradingRequest.question || !gradingRequest.studentAnswer) {
      return res.status(400).json({
        error: '缺少必要參數',
        required: ['question', 'studentAnswer']
      });
    }

    const startTime = Date.now();
    const result = await gradeAnswer(gradingRequest);
    const gradingTime = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      result: {
        ...result,
        gradingTime
      },
      metadata: {
        questionType: gradingRequest.questionType,
        timestamp: new Date().toISOString(),
        model: 'gpt-4'
      }
    });

  } catch (error) {
    console.error('自動評分失敗:', error);
    return res.status(500).json({
      error: '自動評分失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 主要評分函數
async function gradeAnswer(request: GradingRequest): Promise<GradingResult> {
  const { questionType, question, correctAnswer, studentAnswer, rubric, context, maxScore = 100 } = request;

  switch (questionType) {
    case 'multiple_choice':
      return gradeMultipleChoice(question, correctAnswer, studentAnswer, maxScore);
    
    case 'true_false':
      return gradeTrueFalse(question, correctAnswer, studentAnswer, maxScore);
    
    case 'short_answer':
      return await gradeShortAnswer(question, correctAnswer, studentAnswer, maxScore, context);
    
    case 'essay':
      return await gradeEssay(question, studentAnswer, rubric, maxScore, context);
    
    case 'matching':
      return gradeMatching(question, correctAnswer, studentAnswer, maxScore);
    
    case 'fill_blank':
      return gradeFillBlank(question, correctAnswer, studentAnswer, maxScore);
    
    default:
      throw new Error(`不支持的題型: ${questionType}`);
  }
}

// 選擇題評分
function gradeMultipleChoice(question: string, correctAnswer: any, studentAnswer: any, maxScore: number): GradingResult {
  const isCorrect = correctAnswer === studentAnswer;
  const score = isCorrect ? maxScore : 0;
  
  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
    isCorrect,
    feedback: isCorrect ? '答案正確！' : `正確答案是 ${correctAnswer}`,
    confidence: 1.0,
    gradingTime: 0
  };
}

// 是非題評分
function gradeTrueFalse(question: string, correctAnswer: boolean, studentAnswer: boolean, maxScore: number): GradingResult {
  const isCorrect = correctAnswer === studentAnswer;
  const score = isCorrect ? maxScore : 0;
  
  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
    isCorrect,
    feedback: isCorrect ? '答案正確！' : `正確答案是 ${correctAnswer ? '是' : '否'}`,
    confidence: 1.0,
    gradingTime: 0
  };
}

// 簡答題評分（使用 AI）
async function gradeShortAnswer(
  question: string, 
  correctAnswer: string, 
  studentAnswer: string, 
  maxScore: number,
  context?: string
): Promise<GradingResult> {
  const prompt = `
請評分以下簡答題：

問題：${question}
${context ? `背景：${context}` : ''}
標準答案：${correctAnswer}
學生答案：${studentAnswer}

請根據以下標準評分：
1. 內容準確性 (40%)
2. 完整性 (30%)
3. 清晰度 (20%)
4. 相關性 (10%)

請返回 JSON 格式：
{
  "score": 分數 (0-${maxScore}),
  "percentage": 百分比,
  "isCorrect": 是否正確,
  "feedback": "詳細反饋",
  "strengths": ["優點1", "優點2"],
  "weaknesses": ["不足1", "不足2"],
  "improvements": ["改進建議1", "改進建議2"],
  "confidence": 信心度 (0-1)
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一個專業的教育評分助手，能夠公正、準確地評分學生答案。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    return {
      score: result.score || 0,
      maxScore,
      percentage: result.percentage || 0,
      isCorrect: result.isCorrect || false,
      feedback: result.feedback || '評分完成',
      detailedFeedback: {
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        improvements: result.improvements || []
      },
      confidence: result.confidence || 0.8,
      gradingTime: 0
    };

  } catch (error) {
    console.error('AI 評分失敗:', error);
    
    // 降級到簡單的文本匹配
    const similarity = calculateTextSimilarity(correctAnswer, studentAnswer);
    const score = Math.round(similarity * maxScore);
    
    return {
      score,
      maxScore,
      percentage: similarity * 100,
      isCorrect: similarity > 0.8,
      feedback: `基於文本相似度的評分：${Math.round(similarity * 100)}%`,
      confidence: 0.6,
      gradingTime: 0
    };
  }
}

// 作文評分（使用 AI）
async function gradeEssay(
  question: string,
  studentAnswer: string,
  rubric?: GradingRubric,
  maxScore: number = 100,
  context?: string
): Promise<GradingResult> {
  const prompt = `
請評分以下作文：

題目：${question}
${context ? `背景：${context}` : ''}
學生作文：${studentAnswer}

${rubric ? `評分標準：${JSON.stringify(rubric)}` : ''}

請根據以下標準評分：
1. 內容質量 (30%)
2. 結構組織 (25%)
3. 語言表達 (25%)
4. 創意思考 (20%)

請返回 JSON 格式：
{
  "score": 分數 (0-${maxScore}),
  "percentage": 百分比,
  "feedback": "詳細反饋",
  "strengths": ["優點"],
  "weaknesses": ["不足"],
  "improvements": ["改進建議"],
  "rubricScores": {"標準1": 分數, "標準2": 分數},
  "confidence": 信心度 (0-1)
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一個專業的作文評分老師，能夠全面評估學生的寫作能力。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    return {
      score: result.score || 0,
      maxScore,
      percentage: result.percentage || 0,
      isCorrect: (result.percentage || 0) >= 60,
      feedback: result.feedback || '評分完成',
      detailedFeedback: {
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        improvements: result.improvements || [],
        rubricScores: result.rubricScores
      },
      confidence: result.confidence || 0.8,
      gradingTime: 0
    };

  } catch (error) {
    console.error('作文評分失敗:', error);
    
    // 降級評分
    const wordCount = studentAnswer.split(/\s+/).length;
    const score = Math.min(Math.max(wordCount / 10, 20), maxScore);
    
    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
      isCorrect: score >= maxScore * 0.6,
      feedback: '基於字數的基礎評分，建議人工複核',
      confidence: 0.4,
      gradingTime: 0
    };
  }
}

// 配對題評分
function gradeMatching(question: string, correctAnswer: any[], studentAnswer: any[], maxScore: number): GradingResult {
  if (!Array.isArray(correctAnswer) || !Array.isArray(studentAnswer)) {
    return {
      score: 0,
      maxScore,
      percentage: 0,
      isCorrect: false,
      feedback: '答案格式錯誤',
      confidence: 1.0,
      gradingTime: 0
    };
  }

  let correctCount = 0;
  const total = correctAnswer.length;
  
  for (let i = 0; i < total; i++) {
    if (i < studentAnswer.length && correctAnswer[i] === studentAnswer[i]) {
      correctCount++;
    }
  }

  const score = Math.round((correctCount / total) * maxScore);
  const percentage = (correctCount / total) * 100;
  
  return {
    score,
    maxScore,
    percentage,
    isCorrect: correctCount === total,
    feedback: `正確配對 ${correctCount}/${total} 個`,
    confidence: 1.0,
    gradingTime: 0
  };
}

// 填空題評分
function gradeFillBlank(question: string, correctAnswer: string[], studentAnswer: string[], maxScore: number): GradingResult {
  if (!Array.isArray(correctAnswer) || !Array.isArray(studentAnswer)) {
    return {
      score: 0,
      maxScore,
      percentage: 0,
      isCorrect: false,
      feedback: '答案格式錯誤',
      confidence: 1.0,
      gradingTime: 0
    };
  }

  let correctCount = 0;
  const total = correctAnswer.length;
  
  for (let i = 0; i < total; i++) {
    if (i < studentAnswer.length) {
      const correct = correctAnswer[i].toLowerCase().trim();
      const student = studentAnswer[i].toLowerCase().trim();
      
      if (correct === student) {
        correctCount++;
      }
    }
  }

  const score = Math.round((correctCount / total) * maxScore);
  const percentage = (correctCount / total) * 100;
  
  return {
    score,
    maxScore,
    percentage,
    isCorrect: correctCount === total,
    feedback: `正確填空 ${correctCount}/${total} 個`,
    confidence: 1.0,
    gradingTime: 0
  };
}

// 計算文本相似度（簡化版本）
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}
