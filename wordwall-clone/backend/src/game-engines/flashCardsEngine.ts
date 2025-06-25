import { GameEngine, GameSession, GameResult, QuestionResult } from '../types/game';
import { aiAgentTracer } from '../tracing';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  frontImage?: string;
  backImage?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
}

interface FlashCardsContent {
  cards: FlashCard[];
  mode: 'study' | 'quiz' | 'memory'; // 學習、測驗、記憶模式
  showProgress: boolean;
  shuffleCards: boolean;
  autoFlip: boolean;
  autoFlipDelay: number; // 自動翻轉延遲（毫秒）
  allowSkip: boolean;
  repeatIncorrect: boolean;
  studyDirection: 'front-to-back' | 'back-to-front' | 'both';
}

interface FlashCardAnswer {
  cardId: string;
  confidence: 'low' | 'medium' | 'high'; // 信心程度
  timeSpent: number;
  flipsCount: number;
  skipped: boolean;
  timestamp: number;
}

/**
 * Flash Cards 遊戲引擎
 * 
 * 功能：
 * - 閃卡學習系統
 * - 間隔重複算法
 * - 信心評估
 * - 學習進度追蹤
 * - 自適應學習
 */
export class FlashCardsEngine implements GameEngine {
  async validateAnswer(
    content: FlashCardsContent,
    questionId: string,
    answer: FlashCardAnswer
  ): Promise<QuestionResult> {
    return aiAgentTracer.traceGameLogic('FLASH_CARDS', 'validate_answer', async () => {
      const card = content.cards.find(c => c.id === answer.cardId);
      
      if (!card) {
        return {
          questionId,
          isCorrect: false,
          score: 0,
          maxScore: 100,
          feedback: '無效的卡片',
          timeSpent: answer.timeSpent,
        };
      }

      // 根據信心程度和時間計算分數
      let baseScore = 0;
      let feedback = '';

      if (answer.skipped) {
        baseScore = 0;
        feedback = '跳過了這張卡片';
      } else {
        // 根據信心程度給分
        switch (answer.confidence) {
          case 'high':
            baseScore = 100;
            feedback = '很有信心！';
            break;
          case 'medium':
            baseScore = 70;
            feedback = '還不錯';
            break;
          case 'low':
            baseScore = 40;
            feedback = '需要更多練習';
            break;
        }

        // 根據時間調整分數
        const optimalTime = 5000; // 5秒為最佳時間
        const timeBonus = Math.max(0, (optimalTime - answer.timeSpent) / optimalTime * 20);
        baseScore += timeBonus;

        // 根據翻轉次數調整分數
        const flipPenalty = Math.max(0, (answer.flipsCount - 1) * 5);
        baseScore -= flipPenalty;
      }

      const finalScore = Math.max(0, Math.min(100, baseScore));

      return {
        questionId,
        isCorrect: !answer.skipped && answer.confidence !== 'low',
        score: finalScore,
        maxScore: 100,
        feedback,
        timeSpent: answer.timeSpent / 1000,
        details: {
          confidence: answer.confidence,
          flipsCount: answer.flipsCount,
          skipped: answer.skipped,
          timeBonus: Math.round((baseScore - (answer.skipped ? 0 : 
            answer.confidence === 'high' ? 100 : 
            answer.confidence === 'medium' ? 70 : 40)) * 100) / 100,
          difficulty: card.difficulty,
        },
      };
    });
  }

  async calculateResult(
    content: FlashCardsContent,
    answers: Record<string, FlashCardAnswer>,
    timeTaken: number
  ): Promise<GameResult> {
    return aiAgentTracer.traceGameLogic('FLASH_CARDS', 'calculate_result', async () => {
      const questionResults: QuestionResult[] = [];
      let totalScore = 0;
      let totalMaxScore = 0;
      let highConfidenceCount = 0;
      let mediumConfidenceCount = 0;
      let lowConfidenceCount = 0;
      let skippedCount = 0;

      // 處理每張卡片的結果
      for (const [questionId, answer] of Object.entries(answers)) {
        const result = await this.validateAnswer(content, questionId, answer);
        questionResults.push(result);
        
        totalScore += result.score;
        totalMaxScore += result.maxScore;

        // 統計信心程度
        if (answer.skipped) {
          skippedCount++;
        } else {
          switch (answer.confidence) {
            case 'high':
              highConfidenceCount++;
              break;
            case 'medium':
              mediumConfidenceCount++;
              break;
            case 'low':
              lowConfidenceCount++;
              break;
          }
        }
      }

      const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
      const cardsCount = Object.keys(answers).length;
      const masteredCards = highConfidenceCount;
      const needReviewCards = mediumConfidenceCount + lowConfidenceCount;

      // 計算學習效率
      const averageTimePerCard = questionResults.reduce((sum, r) => sum + r.timeSpent, 0) / cardsCount;
      const efficiency = averageTimePerCard > 0 ? Math.min(100, (5 / averageTimePerCard) * 100) : 0;

      // 計算等級
      let grade = 'F';
      if (percentage >= 90 && masteredCards >= cardsCount * 0.8) grade = 'A';
      else if (percentage >= 80 && masteredCards >= cardsCount * 0.6) grade = 'B';
      else if (percentage >= 70 && masteredCards >= cardsCount * 0.4) grade = 'C';
      else if (percentage >= 60) grade = 'D';

      // 生成反饋
      let feedback = `掌握了 ${masteredCards}/${cardsCount} 張卡片`;
      if (needReviewCards > 0) {
        feedback += `，還有 ${needReviewCards} 張需要複習`;
      }
      if (skippedCount > 0) {
        feedback += `，跳過了 ${skippedCount} 張`;
      }

      // 生成學習建議
      const suggestions = this.generateStudySuggestions(questionResults, content);

      return {
        score: totalScore,
        maxScore: totalMaxScore,
        percentage: Math.round(percentage * 100) / 100,
        correctAnswers: highConfidenceCount + mediumConfidenceCount,
        totalQuestions: cardsCount,
        timeTaken,
        grade,
        feedback,
        questionResults,
        details: {
          masteredCards,
          needReviewCards,
          skippedCards: skippedCount,
          averageTimePerCard: Math.round(averageTimePerCard * 100) / 100,
          efficiency: Math.round(efficiency * 100) / 100,
          confidenceDistribution: {
            high: highConfidenceCount,
            medium: mediumConfidenceCount,
            low: lowConfidenceCount,
            skipped: skippedCount,
          },
          suggestions,
        },
      };
    });
  }

  /**
   * 生成學習建議
   */
  private generateStudySuggestions(
    results: QuestionResult[],
    content: FlashCardsContent
  ): string[] {
    const suggestions: string[] = [];

    // 分析低信心卡片
    const lowConfidenceCards = results.filter(r => 
      r.details?.confidence === 'low' || r.details?.skipped
    );

    if (lowConfidenceCards.length > 0) {
      suggestions.push(`重點複習 ${lowConfidenceCards.length} 張困難卡片`);
    }

    // 分析時間使用
    const averageTime = results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length;
    if (averageTime > 10) {
      suggestions.push('嘗試提高反應速度，目標在5秒內回答');
    }

    // 分析翻轉次數
    const highFlipCards = results.filter(r => (r.details?.flipsCount || 0) > 2);
    if (highFlipCards.length > results.length * 0.3) {
      suggestions.push('減少翻轉次數，嘗試先思考再查看答案');
    }

    // 根據難度分析
    const difficultyStats = this.analyzeDifficultyPerformance(results, content);
    if (difficultyStats.hard.accuracy < 50) {
      suggestions.push('困難卡片需要更多練習');
    }

    return suggestions;
  }

  /**
   * 分析不同難度的表現
   */
  private analyzeDifficultyPerformance(
    results: QuestionResult[],
    content: FlashCardsContent
  ): Record<string, { accuracy: number; averageTime: number; count: number }> {
    const stats: Record<string, { accuracy: number; averageTime: number; count: number }> = {
      easy: { accuracy: 0, averageTime: 0, count: 0 },
      medium: { accuracy: 0, averageTime: 0, count: 0 },
      hard: { accuracy: 0, averageTime: 0, count: 0 },
    };

    results.forEach(result => {
      const difficulty = result.details?.difficulty || 'medium';
      const isCorrect = result.details?.confidence === 'high';
      
      stats[difficulty].count++;
      if (isCorrect) {
        stats[difficulty].accuracy++;
      }
      stats[difficulty].averageTime += result.timeSpent;
    });

    // 計算百分比和平均值
    Object.keys(stats).forEach(difficulty => {
      const stat = stats[difficulty];
      if (stat.count > 0) {
        stat.accuracy = (stat.accuracy / stat.count) * 100;
        stat.averageTime = stat.averageTime / stat.count;
      }
    });

    return stats;
  }

  /**
   * 計算間隔重複調度
   */
  calculateSpacedRepetition(
    cardId: string,
    confidence: 'low' | 'medium' | 'high',
    previousInterval: number = 1
  ): {
    nextReviewDate: Date;
    interval: number;
    easeFactor: number;
  } {
    let interval = previousInterval;
    let easeFactor = 2.5; // 默認難度因子

    // 根據信心程度調整間隔
    switch (confidence) {
      case 'low':
        interval = 1; // 1天後複習
        easeFactor = 1.3;
        break;
      case 'medium':
        interval = Math.max(1, Math.round(previousInterval * 1.3));
        easeFactor = 2.0;
        break;
      case 'high':
        interval = Math.max(1, Math.round(previousInterval * 2.5));
        easeFactor = 2.5;
        break;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
      nextReviewDate,
      interval,
      easeFactor,
    };
  }

  /**
   * 獲取需要複習的卡片
   */
  getCardsForReview(
    cards: FlashCard[],
    reviewSchedule: Record<string, { nextReviewDate: Date; interval: number }>
  ): FlashCard[] {
    const now = new Date();
    
    return cards.filter(card => {
      const schedule = reviewSchedule[card.id];
      if (!schedule) return true; // 新卡片
      
      return schedule.nextReviewDate <= now;
    });
  }

  /**
   * 生成學習統計
   */
  generateLearningStats(
    results: QuestionResult[],
    content: FlashCardsContent
  ): {
    totalCards: number;
    masteredCards: number;
    learningCards: number;
    newCards: number;
    averageAccuracy: number;
    studyTime: number;
    streakDays: number;
  } {
    const totalCards = content.cards.length;
    const masteredCards = results.filter(r => r.details?.confidence === 'high').length;
    const learningCards = results.filter(r => 
      r.details?.confidence === 'medium' || r.details?.confidence === 'low'
    ).length;
    const newCards = totalCards - results.length;

    const correctAnswers = results.filter(r => r.isCorrect).length;
    const averageAccuracy = results.length > 0 ? (correctAnswers / results.length) * 100 : 0;
    
    const studyTime = results.reduce((sum, r) => sum + r.timeSpent, 0);

    return {
      totalCards,
      masteredCards,
      learningCards,
      newCards,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      studyTime: Math.round(studyTime * 100) / 100,
      streakDays: 0, // 需要從數據庫獲取
    };
  }

  /**
   * 生成多人遊戲結果
   */
  async calculateMultiplayerResult(
    content: FlashCardsContent,
    playerAnswers: Record<string, Record<string, FlashCardAnswer>>,
    timeTaken: number
  ): Promise<{
    results: Record<string, GameResult>;
    ranking: Array<{ playerId: string; score: number; masteredCards: number; rank: number }>;
    stats: any;
  }> {
    const results: Record<string, GameResult> = {};
    const playerStats: Array<{ 
      playerId: string; 
      score: number; 
      masteredCards: number;
      efficiency: number;
    }> = [];

    // 計算每個玩家的結果
    for (const [playerId, answers] of Object.entries(playerAnswers)) {
      const result = await this.calculateResult(content, answers, timeTaken);
      results[playerId] = result;
      
      playerStats.push({
        playerId,
        score: result.score,
        masteredCards: result.details?.masteredCards || 0,
        efficiency: result.details?.efficiency || 0,
      });
    }

    // 排序並添加排名
    playerStats.sort((a, b) => {
      if (b.masteredCards !== a.masteredCards) return b.masteredCards - a.masteredCards;
      if (b.score !== a.score) return b.score - a.score;
      return b.efficiency - a.efficiency;
    });

    const ranking = playerStats.map((player, index) => ({
      playerId: player.playerId,
      score: player.score,
      masteredCards: player.masteredCards,
      rank: index + 1,
    }));

    return {
      results,
      ranking,
      stats: {
        totalPlayers: Object.keys(playerAnswers).length,
        averageScore: playerStats.reduce((sum, p) => sum + p.score, 0) / playerStats.length,
        averageMasteredCards: playerStats.reduce((sum, p) => sum + p.masteredCards, 0) / playerStats.length,
        totalCardsStudied: content.cards.length,
      },
    };
  }
}

export default FlashCardsEngine;
