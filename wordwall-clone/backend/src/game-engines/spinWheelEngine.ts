import { GameEngine, GameSession, GameResult, QuestionResult } from '../types/game';
import { aiAgentTracer } from '../tracing';

interface SpinWheelSegment {
  id: string;
  text: string;
  color: string;
  weight: number; // 權重，影響被選中的概率
  isCorrect?: boolean; // 對於問答模式
  points?: number; // 分數
}

interface SpinWheelContent {
  segments: SpinWheelSegment[];
  mode: 'random' | 'quiz' | 'decision'; // 模式：隨機、問答、決策
  spinDuration: number; // 轉動持續時間（毫秒）
  showPointer: boolean;
  allowMultipleSpin: boolean;
  enableSound: boolean;
  question?: string; // 問答模式的問題
}

interface SpinWheelAnswer {
  segmentId: string;
  spinAngle: number;
  spinDuration: number;
  timestamp: number;
}

/**
 * Spin the Wheel 遊戲引擎
 * 
 * 功能：
 * - 隨機轉盤選擇
 * - 問答模式轉盤
 * - 決策輔助轉盤
 * - 權重控制
 * - 動畫效果
 */
export class SpinWheelEngine implements GameEngine {
  async validateAnswer(
    content: SpinWheelContent,
    questionId: string,
    answer: SpinWheelAnswer
  ): Promise<QuestionResult> {
    return aiAgentTracer.traceGameLogic('SPIN_WHEEL', 'validate_answer', async () => {
      const segment = content.segments.find(s => s.id === answer.segmentId);
      
      if (!segment) {
        return {
          questionId,
          isCorrect: false,
          score: 0,
          maxScore: 100,
          feedback: '無效的選擇',
          timeSpent: 0,
        };
      }

      let isCorrect = true;
      let score = segment.points || 0;
      let feedback = `選中了: ${segment.text}`;

      // 問答模式的驗證
      if (content.mode === 'quiz' && segment.isCorrect !== undefined) {
        isCorrect = segment.isCorrect;
        score = isCorrect ? (segment.points || 100) : 0;
        feedback = isCorrect 
          ? `正確！選中了: ${segment.text}` 
          : `錯誤！選中了: ${segment.text}`;
      }

      // 隨機模式總是正確
      if (content.mode === 'random') {
        isCorrect = true;
        score = segment.points || 50;
        feedback = `幸運選中: ${segment.text}`;
      }

      // 決策模式總是正確
      if (content.mode === 'decision') {
        isCorrect = true;
        score = 100;
        feedback = `決策結果: ${segment.text}`;
      }

      return {
        questionId,
        isCorrect,
        score,
        maxScore: Math.max(...content.segments.map(s => s.points || 100)),
        feedback,
        timeSpent: answer.spinDuration / 1000,
        details: {
          selectedSegment: segment,
          spinAngle: answer.spinAngle,
          spinDuration: answer.spinDuration,
        },
      };
    });
  }

  async calculateResult(
    content: SpinWheelContent,
    answers: Record<string, SpinWheelAnswer>,
    timeTaken: number
  ): Promise<GameResult> {
    return aiAgentTracer.traceGameLogic('SPIN_WHEEL', 'calculate_result', async () => {
      const questionResults: QuestionResult[] = [];
      let totalScore = 0;
      let totalMaxScore = 0;
      let totalCorrect = 0;

      // 處理每個轉盤結果
      for (const [questionId, answer] of Object.entries(answers)) {
        const result = await this.validateAnswer(content, questionId, answer);
        questionResults.push(result);
        
        totalScore += result.score;
        totalMaxScore += result.maxScore;
        if (result.isCorrect) totalCorrect++;
      }

      const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
      const questionsCount = Object.keys(answers).length;

      // 計算等級
      let grade = 'F';
      if (percentage >= 90) grade = 'A';
      else if (percentage >= 80) grade = 'B';
      else if (percentage >= 70) grade = 'C';
      else if (percentage >= 60) grade = 'D';

      // 生成反饋
      let feedback = '';
      if (content.mode === 'quiz') {
        feedback = `答對了 ${totalCorrect}/${questionsCount} 個問題`;
      } else if (content.mode === 'random') {
        feedback = `完成了 ${questionsCount} 次轉盤`;
      } else if (content.mode === 'decision') {
        feedback = `做出了 ${questionsCount} 個決策`;
      }

      return {
        score: totalScore,
        maxScore: totalMaxScore,
        percentage: Math.round(percentage * 100) / 100,
        correctAnswers: totalCorrect,
        totalQuestions: questionsCount,
        timeTaken,
        grade,
        feedback,
        questionResults,
        details: {
          mode: content.mode,
          averageSpinTime: questionResults.reduce((sum, r) => sum + r.timeSpent, 0) / questionsCount,
          segments: content.segments.length,
        },
      };
    });
  }

  /**
   * 生成轉盤結果（服務器端驗證）
   */
  generateSpinResult(content: SpinWheelContent): {
    selectedSegment: SpinWheelSegment;
    angle: number;
    duration: number;
  } {
    // 計算權重總和
    const totalWeight = content.segments.reduce((sum, segment) => sum + segment.weight, 0);
    
    // 生成隨機數
    const random = Math.random() * totalWeight;
    
    // 根據權重選擇段落
    let currentWeight = 0;
    let selectedSegment = content.segments[0];
    
    for (const segment of content.segments) {
      currentWeight += segment.weight;
      if (random <= currentWeight) {
        selectedSegment = segment;
        break;
      }
    }

    // 計算角度
    const segmentIndex = content.segments.indexOf(selectedSegment);
    const segmentAngle = 360 / content.segments.length;
    const baseAngle = segmentIndex * segmentAngle;
    
    // 添加隨機偏移，使指針指向段落中間
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
    const finalAngle = baseAngle + segmentAngle / 2 + randomOffset;
    
    // 添加多圈旋轉使效果更真實
    const fullRotations = 3 + Math.random() * 2; // 3-5圈
    const totalAngle = fullRotations * 360 + finalAngle;

    return {
      selectedSegment,
      angle: totalAngle,
      duration: content.spinDuration || 3000,
    };
  }

  /**
   * 驗證客戶端轉盤結果
   */
  verifySpinResult(
    content: SpinWheelContent,
    clientAngle: number,
    serverResult: { selectedSegment: SpinWheelSegment; angle: number }
  ): boolean {
    const segmentAngle = 360 / content.segments.length;
    const normalizedClientAngle = clientAngle % 360;
    const normalizedServerAngle = serverResult.angle % 360;
    
    // 允許一定的誤差範圍
    const tolerance = segmentAngle * 0.1;
    
    return Math.abs(normalizedClientAngle - normalizedServerAngle) <= tolerance;
  }

  /**
   * 生成轉盤配置
   */
  generateWheelConfig(segments: SpinWheelSegment[]): {
    colors: string[];
    labels: string[];
    weights: number[];
  } {
    return {
      colors: segments.map(s => s.color),
      labels: segments.map(s => s.text),
      weights: segments.map(s => s.weight),
    };
  }

  /**
   * 計算段落統計
   */
  calculateSegmentStats(
    content: SpinWheelContent,
    results: SpinWheelAnswer[]
  ): Record<string, { count: number; percentage: number }> {
    const stats: Record<string, { count: number; percentage: number }> = {};
    
    // 初始化統計
    content.segments.forEach(segment => {
      stats[segment.id] = { count: 0, percentage: 0 };
    });

    // 計算每個段落被選中的次數
    results.forEach(result => {
      if (stats[result.segmentId]) {
        stats[result.segmentId].count++;
      }
    });

    // 計算百分比
    const total = results.length;
    Object.keys(stats).forEach(segmentId => {
      stats[segmentId].percentage = total > 0 
        ? (stats[segmentId].count / total) * 100 
        : 0;
    });

    return stats;
  }

  /**
   * 生成多人遊戲結果
   */
  async calculateMultiplayerResult(
    content: SpinWheelContent,
    playerAnswers: Record<string, Record<string, SpinWheelAnswer>>,
    timeTaken: number
  ): Promise<{
    results: Record<string, GameResult>;
    ranking: Array<{ playerId: string; score: number; rank: number }>;
    stats: any;
  }> {
    const results: Record<string, GameResult> = {};
    const playerScores: Array<{ playerId: string; score: number }> = [];

    // 計算每個玩家的結果
    for (const [playerId, answers] of Object.entries(playerAnswers)) {
      const result = await this.calculateResult(content, answers, timeTaken);
      results[playerId] = result;
      playerScores.push({ playerId, score: result.score });
    }

    // 排序並添加排名
    playerScores.sort((a, b) => b.score - a.score);
    const ranking = playerScores.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    // 計算統計信息
    const allAnswers = Object.values(playerAnswers).flatMap(answers => Object.values(answers));
    const segmentStats = this.calculateSegmentStats(content, allAnswers);

    return {
      results,
      ranking,
      stats: {
        totalPlayers: Object.keys(playerAnswers).length,
        totalSpins: allAnswers.length,
        segmentStats,
        averageScore: playerScores.reduce((sum, p) => sum + p.score, 0) / playerScores.length,
      },
    };
  }
}

export default SpinWheelEngine;
