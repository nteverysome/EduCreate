/**
 * AI 自動評分系統 - 第三階段
 * 使用 AI 自動評分學生答案和學習成果
 */

import { GameType } from '../content/UniversalContentManager';

export interface GradingRequest {
  id: string;
  studentId: string;
  activityId: string;
  gameType: GameType;
  questions: QuestionData[];
  answers: StudentAnswer[];
  rubric?: GradingRubric;
  options: GradingOptions;
}

export interface QuestionData {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'matching' | 'fill-blank' | 'true-false';
  question: string;
  correctAnswer?: any;
  possibleAnswers?: string[];
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  learningObjective?: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: any;
  timeSpent: number; // 秒
  attempts: number;
  confidence?: number; // 學生自評信心度 0-1
  submittedAt: Date;
}

export interface GradingRubric {
  criteria: GradingCriterion[];
  totalPoints: number;
  passingScore: number;
  gradingMethod: 'strict' | 'lenient' | 'adaptive';
}

export interface GradingCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxPoints: number;
  levels: GradingLevel[];
}

export interface GradingLevel {
  score: number;
  description: string;
  keywords?: string[];
}

export interface GradingOptions {
  enablePartialCredit: boolean;
  enableSpellCheck: boolean;
  enableGrammarCheck: boolean;
  enableSemanticAnalysis: boolean;
  enablePlagiarismCheck: boolean;
  provideFeedback: boolean;
  detailedExplanation: boolean;
  suggestImprovements: boolean;
}

export interface GradingResult {
  id: string;
  studentId: string;
  activityId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  passed: boolean;
  questionResults: QuestionResult[];
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  timeAnalysis: TimeAnalysis;
  metadata: GradingMetadata;
}

export interface QuestionResult {
  questionId: string;
  score: number;
  maxScore: number;
  isCorrect: boolean;
  partialCredit?: number;
  feedback: string;
  explanation?: string;
  mistakes?: string[];
  improvements?: string[];
  confidence: number; // AI 評分信心度
}

export interface TimeAnalysis {
  totalTime: number;
  averageTimePerQuestion: number;
  quickestQuestion: { id: string; time: number };
  slowestQuestion: { id: string; time: number };
  timeEfficiency: number; // 0-1
  pacing: 'too-fast' | 'optimal' | 'too-slow';
}

export interface GradingMetadata {
  gradedAt: Date;
  gradingTime: number; // 毫秒
  aiModel: string;
  confidence: number;
  humanReviewRequired: boolean;
  flags: string[];
  version: string;
}

export class AutoGradingSystem {
  private static models = {
    'gpt-4': { accuracy: 0.95, speed: 'medium', cost: 'high' },
    'gpt-3.5-turbo': { accuracy: 0.88, speed: 'fast', cost: 'low' },
    'claude-3': { accuracy: 0.92, speed: 'medium', cost: 'medium' }
  };

  private static defaultModel = 'gpt-4';
  private static gradeScale = {
    'A+': { min: 97, max: 100 },
    'A': { min: 93, max: 96 },
    'A-': { min: 90, max: 92 },
    'B+': { min: 87, max: 89 },
    'B': { min: 83, max: 86 },
    'B-': { min: 80, max: 82 },
    'C+': { min: 77, max: 79 },
    'C': { min: 73, max: 76 },
    'C-': { min: 70, max: 72 },
    'D': { min: 60, max: 69 },
    'F': { min: 0, max: 59 }
  };

  // 自動評分主方法
  static async gradeSubmission(request: GradingRequest): Promise<GradingResult> {
    const startTime = Date.now();
    
    try {
      // 驗證請求
      this.validateRequest(request);

      // 初始化結果
      const result: Partial<GradingResult> = {
        id: `grading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId: request.studentId,
        activityId: request.activityId,
        questionResults: [],
        strengths: [],
        weaknesses: [],
        suggestions: []
      };

      // 逐題評分
      const questionResults: QuestionResult[] = [];
      let totalScore = 0;
      let maxScore = 0;

      for (let i = 0; i < request.questions.length; i++) {
        const question = request.questions[i];
        const answer = request.answers.find(a => a.questionId === question.id);
        
        if (answer) {
          const questionResult = await this.gradeQuestion(question, answer, request.options);
          questionResults.push(questionResult);
          totalScore += questionResult.score;
        }
        
        maxScore += question.points;
      }

      result.questionResults = questionResults;
      result.totalScore = totalScore;
      result.maxScore = maxScore;
      result.percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      result.grade = this.calculateGrade(result.percentage);
      result.passed = result.percentage >= (request.rubric?.passingScore || 60);

      // 生成整體反饋
      result.overallFeedback = await this.generateOverallFeedback(result as GradingResult, request);

      // 分析優缺點
      const analysis = this.analyzePerformance(questionResults, request.questions);
      result.strengths = analysis.strengths;
      result.weaknesses = analysis.weaknesses;
      result.suggestions = analysis.suggestions;

      // 時間分析
      result.timeAnalysis = this.analyzeTime(request.answers, request.questions);

      // 元數據
      result.metadata = {
        gradedAt: new Date(),
        gradingTime: Date.now() - startTime,
        aiModel: this.defaultModel,
        confidence: this.calculateOverallConfidence(questionResults),
        humanReviewRequired: this.requiresHumanReview(result as GradingResult),
        flags: this.generateFlags(result as GradingResult),
        version: '1.0.0'
      };

      return result as GradingResult;

    } catch (error) {
      console.error('自動評分失敗:', error);
      throw new Error(`評分失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  // 單題評分
  private static async gradeQuestion(
    question: QuestionData,
    answer: StudentAnswer,
    options: GradingOptions
  ): Promise<QuestionResult> {
    const result: Partial<QuestionResult> = {
      questionId: question.id,
      maxScore: question.points,
      score: 0,
      isCorrect: false,
      feedback: '',
      confidence: 0
    };

    switch (question.type) {
      case 'multiple-choice':
        return this.gradeMultipleChoice(question, answer, options);
      
      case 'true-false':
        return this.gradeTrueFalse(question, answer, options);
      
      case 'short-answer':
        return await this.gradeShortAnswer(question, answer, options);
      
      case 'essay':
        return await this.gradeEssay(question, answer, options);
      
      case 'matching':
        return this.gradeMatching(question, answer, options);
      
      case 'fill-blank':
        return await this.gradeFillBlank(question, answer, options);
      
      default:
        result.feedback = '不支持的題型';
        result.confidence = 0;
        return result as QuestionResult;
    }
  }

  // 選擇題評分
  private static gradeMultipleChoice(
    question: QuestionData,
    answer: StudentAnswer,
    options: GradingOptions
  ): QuestionResult {
    const isCorrect = answer.answer === question.correctAnswer;
    
    return {
      questionId: question.id,
      score: isCorrect ? question.points : 0,
      maxScore: question.points,
      isCorrect,
      feedback: isCorrect ? '答案正確！' : `正確答案是 ${question.correctAnswer}`,
      confidence: 1.0
    };
  }

  // 是非題評分
  private static gradeTrueFalse(
    question: QuestionData,
    answer: StudentAnswer,
    options: GradingOptions
  ): QuestionResult {
    const isCorrect = answer.answer === question.correctAnswer;
    
    return {
      questionId: question.id,
      score: isCorrect ? question.points : 0,
      maxScore: question.points,
      isCorrect,
      feedback: isCorrect ? '答案正確！' : `正確答案是 ${question.correctAnswer ? '是' : '否'}`,
      confidence: 1.0
    };
  }

  // 簡答題評分
  private static async gradeShortAnswer(
    question: QuestionData,
    answer: StudentAnswer,
    options: GradingOptions
  ): Promise<QuestionResult> {
    const studentAnswer = answer.answer?.toString().toLowerCase().trim();
    const correctAnswer = question.correctAnswer?.toString().toLowerCase().trim();
    
    if (!studentAnswer) {
      return {
        questionId: question.id,
        score: 0,
        maxScore: question.points,
        isCorrect: false,
        feedback: '未提供答案',
        confidence: 1.0
      };
    }

    // 精確匹配
    if (studentAnswer === correctAnswer) {
      return {
        questionId: question.id,
        score: question.points,
        maxScore: question.points,
        isCorrect: true,
        feedback: '答案完全正確！',
        confidence: 1.0
      };
    }

    // 語義分析（如果啟用）
    if (options.enableSemanticAnalysis) {
      const semanticScore = await this.analyzeSemanticSimilarity(studentAnswer, correctAnswer);
      
      if (semanticScore > 0.8) {
        const score = Math.round(question.points * semanticScore);
        return {
          questionId: question.id,
          score,
          maxScore: question.points,
          isCorrect: score === question.points,
          partialCredit: semanticScore,
          feedback: `答案基本正確，語義相似度: ${Math.round(semanticScore * 100)}%`,
          confidence: 0.8
        };
      }
    }

    // 關鍵詞匹配
    const keywordScore = this.calculateKeywordMatch(studentAnswer, correctAnswer);
    if (keywordScore > 0.5 && options.enablePartialCredit) {
      const score = Math.round(question.points * keywordScore);
      return {
        questionId: question.id,
        score,
        maxScore: question.points,
        isCorrect: false,
        partialCredit: keywordScore,
        feedback: `部分正確，包含關鍵概念`,
        confidence: 0.6
      };
    }

    return {
      questionId: question.id,
      score: 0,
      maxScore: question.points,
      isCorrect: false,
      feedback: '答案不正確，請檢查關鍵概念',
      confidence: 0.7
    };
  }

  // 作文題評分
  private static async gradeEssay(
    question: QuestionData,
    answer: StudentAnswer,
    options: GradingOptions
  ): Promise<QuestionResult> {
    const essay = answer.answer?.toString().trim();
    
    if (!essay) {
      return {
        questionId: question.id,
        score: 0,
        maxScore: question.points,
        isCorrect: false,
        feedback: '未提供作文內容',
        confidence: 1.0
      };
    }

    // 使用 AI 評分作文
    const aiAnalysis = await this.analyzeEssayWithAI(essay, question);
    
    return {
      questionId: question.id,
      score: aiAnalysis.score,
      maxScore: question.points,
      isCorrect: aiAnalysis.score >= question.points * 0.7,
      feedback: aiAnalysis.feedback,
      explanation: aiAnalysis.explanation,
      mistakes: aiAnalysis.mistakes,
      improvements: aiAnalysis.improvements,
      confidence: aiAnalysis.confidence
    };
  }

  // 配對題評分
  private static gradeMatching(
    question: QuestionData,
    answer: StudentAnswer,
    options: GradingOptions
  ): QuestionResult {
    const studentMatches = answer.answer as { [key: string]: string };
    const correctMatches = question.correctAnswer as { [key: string]: string };
    
    let correctCount = 0;
    const totalCount = Object.keys(correctMatches).length;
    
    for (const [key, value] of Object.entries(correctMatches)) {
      if (studentMatches[key] === value) {
        correctCount++;
      }
    }
    
    const score = Math.round((correctCount / totalCount) * question.points);
    
    return {
      questionId: question.id,
      score,
      maxScore: question.points,
      isCorrect: correctCount === totalCount,
      feedback: `配對正確 ${correctCount}/${totalCount}`,
      confidence: 1.0
    };
  }

  // 填空題評分
  private static async gradeFillBlank(
    question: QuestionData,
    answer: StudentAnswer,
    options: GradingOptions
  ): Promise<QuestionResult> {
    const studentAnswers = answer.answer as string[];
    const correctAnswers = question.correctAnswer as string[];
    
    let correctCount = 0;
    const totalCount = correctAnswers.length;
    
    for (let i = 0; i < totalCount; i++) {
      const studentAnswer = studentAnswers[i]?.toLowerCase().trim();
      const correctAnswer = correctAnswers[i]?.toLowerCase().trim();
      
      if (studentAnswer === correctAnswer) {
        correctCount++;
      } else if (options.enableSemanticAnalysis) {
        const similarity = await this.analyzeSemanticSimilarity(studentAnswer, correctAnswer);
        if (similarity > 0.8) {
          correctCount += similarity;
        }
      }
    }
    
    const score = Math.round((correctCount / totalCount) * question.points);
    
    return {
      questionId: question.id,
      score,
      maxScore: question.points,
      isCorrect: correctCount === totalCount,
      feedback: `填空正確 ${Math.round(correctCount)}/${totalCount}`,
      confidence: 0.9
    };
  }

  // 語義相似度分析
  private static async analyzeSemanticSimilarity(text1: string, text2: string): Promise<number> {
    // 這裡應該調用 AI API 進行語義分析
    // 暫時使用簡單的字符串相似度
    const similarity = this.calculateStringSimilarity(text1, text2);
    return similarity;
  }

  // 字符串相似度計算
  private static calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // 編輯距離計算
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // 關鍵詞匹配計算
  private static calculateKeywordMatch(studentAnswer: string, correctAnswer: string): number {
    const studentWords = studentAnswer.split(/\s+/).filter(word => word.length > 2);
    const correctWords = correctAnswer.split(/\s+/).filter(word => word.length > 2);
    
    let matchCount = 0;
    for (const word of correctWords) {
      if (studentWords.includes(word)) {
        matchCount++;
      }
    }
    
    return correctWords.length > 0 ? matchCount / correctWords.length : 0;
  }

  // AI 作文分析
  private static async analyzeEssayWithAI(essay: string, question: QuestionData): Promise<any> {
    // 這裡應該調用 AI API 進行作文分析
    // 暫時返回模擬結果
    const wordCount = essay.split(/\s+/).length;
    const score = Math.min(question.points, Math.round((wordCount / 100) * question.points));
    
    return {
      score,
      feedback: `作文長度適中，內容需要進一步發展`,
      explanation: `字數: ${wordCount}，結構清晰度: 中等`,
      mistakes: ['語法錯誤較少', '邏輯連接需要加強'],
      improvements: ['增加具體例子', '改善段落過渡'],
      confidence: 0.7
    };
  }

  // 生成整體反饋
  private static async generateOverallFeedback(result: GradingResult, request: GradingRequest): Promise<string> {
    const percentage = result.percentage;
    
    if (percentage >= 90) {
      return '優秀的表現！您對這個主題有很好的理解。';
    } else if (percentage >= 80) {
      return '良好的表現！還有一些小地方可以改進。';
    } else if (percentage >= 70) {
      return '及格的表現，建議複習相關概念。';
    } else if (percentage >= 60) {
      return '需要更多練習，建議重新學習相關內容。';
    } else {
      return '需要大量練習，建議尋求額外幫助。';
    }
  }

  // 分析學習表現
  private static analyzePerformance(questionResults: QuestionResult[], questions: QuestionData[]): {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // 按主題分析
    const topicPerformance = new Map<string, { correct: number; total: number }>();
    
    questionResults.forEach((result, index) => {
      const question = questions[index];
      const topic = question.topic;
      
      if (!topicPerformance.has(topic)) {
        topicPerformance.set(topic, { correct: 0, total: 0 });
      }
      
      const performance = topicPerformance.get(topic)!;
      performance.total++;
      if (result.isCorrect) {
        performance.correct++;
      }
    });

    // 識別優勢和劣勢
    topicPerformance.forEach((performance, topic) => {
      const accuracy = performance.correct / performance.total;
      
      if (accuracy >= 0.8) {
        strengths.push(`${topic}: 表現優秀 (${Math.round(accuracy * 100)}%)`);
      } else if (accuracy < 0.6) {
        weaknesses.push(`${topic}: 需要改進 (${Math.round(accuracy * 100)}%)`);
        suggestions.push(`建議複習 ${topic} 相關內容`);
      }
    });

    return { strengths, weaknesses, suggestions };
  }

  // 時間分析
  private static analyzeTime(answers: StudentAnswer[], questions: QuestionData[]): TimeAnalysis {
    const totalTime = answers.reduce((sum, answer) => sum + answer.timeSpent, 0);
    const averageTimePerQuestion = totalTime / answers.length;
    
    let quickest = answers[0];
    let slowest = answers[0];
    
    answers.forEach(answer => {
      if (answer.timeSpent < quickest.timeSpent) quickest = answer;
      if (answer.timeSpent > slowest.timeSpent) slowest = answer;
    });

    // 計算時間效率
    const expectedTime = questions.reduce((sum, q) => {
      const baseTime = q.type === 'essay' ? 300 : q.type === 'short-answer' ? 120 : 30;
      return sum + baseTime;
    }, 0);
    
    const timeEfficiency = Math.min(1, expectedTime / totalTime);
    
    let pacing: 'too-fast' | 'optimal' | 'too-slow';
    if (timeEfficiency > 1.5) pacing = 'too-fast';
    else if (timeEfficiency < 0.7) pacing = 'too-slow';
    else pacing = 'optimal';

    return {
      totalTime,
      averageTimePerQuestion,
      quickestQuestion: { id: quickest.questionId, time: quickest.timeSpent },
      slowestQuestion: { id: slowest.questionId, time: slowest.timeSpent },
      timeEfficiency,
      pacing
    };
  }

  // 計算等級
  private static calculateGrade(percentage: number): string {
    for (const [grade, range] of Object.entries(this.gradeScale)) {
      if (percentage >= range.min && percentage <= range.max) {
        return grade;
      }
    }
    return 'F';
  }

  // 計算整體信心度
  private static calculateOverallConfidence(questionResults: QuestionResult[]): number {
    const totalConfidence = questionResults.reduce((sum, result) => sum + result.confidence, 0);
    return totalConfidence / questionResults.length;
  }

  // 判斷是否需要人工審核
  private static requiresHumanReview(result: GradingResult): boolean {
    return result.metadata.confidence < 0.7 || 
           result.questionResults.some(q => q.confidence < 0.6);
  }

  // 生成標記
  private static generateFlags(result: GradingResult): string[] {
    const flags: string[] = [];
    
    if (result.metadata.confidence < 0.7) {
      flags.push('low-confidence');
    }
    
    if (result.timeAnalysis.pacing === 'too-fast') {
      flags.push('completed-too-quickly');
    }
    
    if (result.percentage < 30) {
      flags.push('very-low-score');
    }
    
    return flags;
  }

  // 驗證請求
  private static validateRequest(request: GradingRequest): void {
    if (!request.studentId) throw new Error('學生 ID 不能為空');
    if (!request.activityId) throw new Error('活動 ID 不能為空');
    if (!request.questions.length) throw new Error('問題列表不能為空');
    if (!request.answers.length) throw new Error('答案列表不能為空');
  }

  // 批量評分
  static async gradeBatch(requests: GradingRequest[]): Promise<GradingResult[]> {
    const results: GradingResult[] = [];
    
    for (const request of requests) {
      try {
        const result = await this.gradeSubmission(request);
        results.push(result);
      } catch (error) {
        console.error(`評分失敗 (${request.id}):`, error);
      }
    }
    
    return results;
  }

  // 獲取評分統計
  static getGradingStats(): any {
    return {
      totalGraded: 0,
      averageScore: 0,
      averageGradingTime: 0,
      accuracyRate: 0.92
    };
  }
}
