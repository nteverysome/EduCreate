import { GameEngine, GameSession, GameResult, QuestionResult } from '../types/game';
import { aiAgentTracer } from '../tracing';

interface GroupSortItem {
  id: string;
  text: string;
  image?: string;
  correctGroupId: string;
  points?: number;
}

interface GroupSortGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
  maxItems?: number;
}

interface GroupSortContent {
  groups: GroupSortGroup[];
  items: GroupSortItem[];
  allowEmptyGroups: boolean;
  showGroupLabels: boolean;
  autoValidate: boolean;
  shuffleItems: boolean;
  timeLimit?: number;
  instructions?: string;
}

interface GroupSortAnswer {
  itemPlacements: Record<string, string>; // itemId -> groupId
  timeSpent: number;
  moveCount: number;
  timestamp: number;
}

/**
 * Group Sort 遊戲引擎
 * 
 * 功能：
 * - 拖拽分組排序
 * - 多組別分類
 * - 自動驗證
 * - 計分系統
 * - 錯誤提示
 */
export class GroupSortEngine implements GameEngine {
  async validateAnswer(
    content: GroupSortContent,
    questionId: string,
    answer: GroupSortAnswer
  ): Promise<QuestionResult> {
    return aiAgentTracer.traceGameLogic('GROUP_SORT', 'validate_answer', async () => {
      let correctCount = 0;
      let totalItems = content.items.length;
      let score = 0;
      const maxScore = content.items.reduce((sum, item) => sum + (item.points || 10), 0);
      
      const itemResults: Array<{
        itemId: string;
        isCorrect: boolean;
        correctGroup: string;
        placedGroup: string;
        points: number;
      }> = [];

      // 檢查每個項目的分組
      for (const item of content.items) {
        const placedGroupId = answer.itemPlacements[item.id];
        const isCorrect = placedGroupId === item.correctGroupId;
        const points = isCorrect ? (item.points || 10) : 0;

        if (isCorrect) {
          correctCount++;
          score += points;
        }

        itemResults.push({
          itemId: item.id,
          isCorrect,
          correctGroup: item.correctGroupId,
          placedGroup: placedGroupId || 'none',
          points,
        });
      }

      // 檢查空組別（如果不允許）
      let emptyGroupPenalty = 0;
      if (!content.allowEmptyGroups) {
        const usedGroups = new Set(Object.values(answer.itemPlacements));
        const emptyGroups = content.groups.filter(group => !usedGroups.has(group.id));
        emptyGroupPenalty = emptyGroups.length * 5; // 每個空組別扣5分
      }

      // 檢查組別容量限制
      let overflowPenalty = 0;
      for (const group of content.groups) {
        if (group.maxItems) {
          const itemsInGroup = Object.values(answer.itemPlacements).filter(
            groupId => groupId === group.id
          ).length;
          
          if (itemsInGroup > group.maxItems) {
            overflowPenalty += (itemsInGroup - group.maxItems) * 3; // 每個超出項目扣3分
          }
        }
      }

      const finalScore = Math.max(0, score - emptyGroupPenalty - overflowPenalty);
      const accuracy = totalItems > 0 ? (correctCount / totalItems) * 100 : 0;

      // 生成反饋
      let feedback = `正確分組 ${correctCount}/${totalItems} 個項目`;
      if (emptyGroupPenalty > 0) {
        feedback += `，空組別扣分 ${emptyGroupPenalty}`;
      }
      if (overflowPenalty > 0) {
        feedback += `，超出限制扣分 ${overflowPenalty}`;
      }

      return {
        questionId,
        isCorrect: correctCount === totalItems && emptyGroupPenalty === 0 && overflowPenalty === 0,
        score: finalScore,
        maxScore,
        feedback,
        timeSpent: answer.timeSpent,
        details: {
          correctCount,
          totalItems,
          accuracy: Math.round(accuracy * 100) / 100,
          moveCount: answer.moveCount,
          itemResults,
          emptyGroupPenalty,
          overflowPenalty,
        },
      };
    });
  }

  async calculateResult(
    content: GroupSortContent,
    answers: Record<string, GroupSortAnswer>,
    timeTaken: number
  ): Promise<GameResult> {
    return aiAgentTracer.traceGameLogic('GROUP_SORT', 'calculate_result', async () => {
      const questionResults: QuestionResult[] = [];
      let totalScore = 0;
      let totalMaxScore = 0;
      let totalCorrect = 0;
      let totalMoves = 0;

      // 處理每個問題的結果
      for (const [questionId, answer] of Object.entries(answers)) {
        const result = await this.validateAnswer(content, questionId, answer);
        questionResults.push(result);
        
        totalScore += result.score;
        totalMaxScore += result.maxScore;
        if (result.isCorrect) totalCorrect++;
        totalMoves += answer.moveCount;
      }

      const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
      const questionsCount = Object.keys(answers).length;

      // 計算效率分數（基於移動次數）
      const optimalMoves = content.items.length; // 理想情況下每個項目移動一次
      const actualMoves = totalMoves / questionsCount;
      const efficiency = optimalMoves > 0 ? Math.max(0, (optimalMoves / actualMoves) * 100) : 100;

      // 計算等級
      let grade = 'F';
      if (percentage >= 90 && efficiency >= 80) grade = 'A';
      else if (percentage >= 80 && efficiency >= 70) grade = 'B';
      else if (percentage >= 70 && efficiency >= 60) grade = 'C';
      else if (percentage >= 60) grade = 'D';

      // 生成反饋
      const avgAccuracy = questionResults.reduce((sum, r) => 
        sum + (r.details?.accuracy || 0), 0) / questionsCount;
      
      let feedback = `平均準確率 ${Math.round(avgAccuracy)}%`;
      if (efficiency < 70) {
        feedback += `，建議減少不必要的移動`;
      }
      if (totalCorrect === questionsCount) {
        feedback += `，完美完成所有分組！`;
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
          averageAccuracy: Math.round(avgAccuracy * 100) / 100,
          efficiency: Math.round(efficiency * 100) / 100,
          totalMoves,
          averageMoves: Math.round(actualMoves * 100) / 100,
          groupsUsed: content.groups.length,
          itemsTotal: content.items.length,
        },
      };
    });
  }

  /**
   * 驗證分組規則
   */
  validateGroupRules(
    content: GroupSortContent,
    placements: Record<string, string>
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 檢查組別容量限制
    for (const group of content.groups) {
      if (group.maxItems) {
        const itemsInGroup = Object.values(placements).filter(
          groupId => groupId === group.id
        ).length;
        
        if (itemsInGroup > group.maxItems) {
          errors.push(`組別 "${group.name}" 超出最大容量 ${group.maxItems}`);
        }
      }
    }

    // 檢查是否有未分組的項目
    const unplacedItems = content.items.filter(item => !placements[item.id]);
    if (unplacedItems.length > 0) {
      errors.push(`還有 ${unplacedItems.length} 個項目未分組`);
    }

    // 檢查空組別
    if (!content.allowEmptyGroups) {
      const usedGroups = new Set(Object.values(placements));
      const emptyGroups = content.groups.filter(group => !usedGroups.has(group.id));
      if (emptyGroups.length > 0) {
        errors.push(`不允許空組別，但有 ${emptyGroups.length} 個組別為空`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 生成提示
   */
  generateHint(
    content: GroupSortContent,
    currentPlacements: Record<string, string>
  ): string | null {
    // 找到第一個錯誤放置的項目
    for (const item of content.items) {
      const currentGroup = currentPlacements[item.id];
      if (currentGroup && currentGroup !== item.correctGroupId) {
        const correctGroup = content.groups.find(g => g.id === item.correctGroupId);
        return `"${item.text}" 應該放在 "${correctGroup?.name}" 組別中`;
      }
    }

    // 找到未分組的項目
    const unplacedItem = content.items.find(item => !currentPlacements[item.id]);
    if (unplacedItem) {
      const correctGroup = content.groups.find(g => g.id === unplacedItem.correctGroupId);
      return `試試將 "${unplacedItem.text}" 放入 "${correctGroup?.name}" 組別`;
    }

    return null;
  }

  /**
   * 計算分組統計
   */
  calculateGroupStats(
    content: GroupSortContent,
    placements: Record<string, string>
  ): Record<string, {
    totalItems: number;
    correctItems: number;
    incorrectItems: number;
    accuracy: number;
  }> {
    const stats: Record<string, any> = {};

    // 初始化統計
    content.groups.forEach(group => {
      stats[group.id] = {
        totalItems: 0,
        correctItems: 0,
        incorrectItems: 0,
        accuracy: 0,
      };
    });

    // 計算每個組別的統計
    content.items.forEach(item => {
      const placedGroup = placements[item.id];
      if (placedGroup && stats[placedGroup]) {
        stats[placedGroup].totalItems++;
        
        if (placedGroup === item.correctGroupId) {
          stats[placedGroup].correctItems++;
        } else {
          stats[placedGroup].incorrectItems++;
        }
      }
    });

    // 計算準確率
    Object.keys(stats).forEach(groupId => {
      const group = stats[groupId];
      group.accuracy = group.totalItems > 0 
        ? (group.correctItems / group.totalItems) * 100 
        : 0;
    });

    return stats;
  }

  /**
   * 生成隨機項目順序
   */
  shuffleItems(items: GroupSortItem[]): GroupSortItem[] {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 生成多人遊戲結果
   */
  async calculateMultiplayerResult(
    content: GroupSortContent,
    playerAnswers: Record<string, Record<string, GroupSortAnswer>>,
    timeTaken: number
  ): Promise<{
    results: Record<string, GameResult>;
    ranking: Array<{ playerId: string; score: number; accuracy: number; rank: number }>;
    stats: any;
  }> {
    const results: Record<string, GameResult> = {};
    const playerStats: Array<{ 
      playerId: string; 
      score: number; 
      accuracy: number; 
      efficiency: number;
    }> = [];

    // 計算每個玩家的結果
    for (const [playerId, answers] of Object.entries(playerAnswers)) {
      const result = await this.calculateResult(content, answers, timeTaken);
      results[playerId] = result;
      
      playerStats.push({
        playerId,
        score: result.score,
        accuracy: result.details?.averageAccuracy || 0,
        efficiency: result.details?.efficiency || 0,
      });
    }

    // 排序並添加排名
    playerStats.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return b.efficiency - a.efficiency;
    });

    const ranking = playerStats.map((player, index) => ({
      playerId: player.playerId,
      score: player.score,
      accuracy: player.accuracy,
      rank: index + 1,
    }));

    return {
      results,
      ranking,
      stats: {
        totalPlayers: Object.keys(playerAnswers).length,
        averageScore: playerStats.reduce((sum, p) => sum + p.score, 0) / playerStats.length,
        averageAccuracy: playerStats.reduce((sum, p) => sum + p.accuracy, 0) / playerStats.length,
        averageEfficiency: playerStats.reduce((sum, p) => sum + p.efficiency, 0) / playerStats.length,
      },
    };
  }
}

export default GroupSortEngine;
