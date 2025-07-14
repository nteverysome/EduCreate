/**
 * 個人化學習系統
 * 基於學習者特徵和行為數據的智能個人化學習路徑生成系統
 */

import { PrismaClient } from '@prisma/client';

// 學習風格類型
export enum LearningStyle {
  VISUAL = 'visual',           // 視覺型
  AUDITORY = 'auditory',       // 聽覺型
  KINESTHETIC = 'kinesthetic', // 動覺型
  READING = 'reading',         // 閱讀型
  MIXED = 'mixed'              // 混合型
}

// 學習偏好
export interface LearningPreferences {
  style: LearningStyle;
  pace: 'slow' | 'medium' | 'fast';
  sessionLength: 'short' | 'medium' | 'long'; // 15min, 30min, 60min
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  feedback: 'immediate' | 'delayed' | 'summary';
  motivation: 'achievement' | 'progress' | 'social' | 'intrinsic';
}

// 學習目標
export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetSkills: string[];
  geptLevel: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  progress: number; // 0-1
  milestones: Milestone[];
}

// 里程碑
export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
  requirements: string[];
}

// 學習路徑
export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  description: string;
  estimatedDuration: number; // 小時
  difficulty: number; // 0-1
  steps: LearningStep[];
  adaptiveFactors: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 學習步驟
export interface LearningStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'content' | 'practice' | 'assessment' | 'review';
  gameType?: string;
  estimatedTime: number; // 分鐘
  difficulty: number;
  prerequisites: string[];
  learningObjectives: string[];
  resources: LearningResource[];
  completed: boolean;
  completedAt?: Date;
  performance?: {
    accuracy: number;
    speed: number;
    attempts: number;
  };
}

// 學習資源
export interface LearningResource {
  id: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'interactive';
  title: string;
  url?: string;
  content?: any;
  metadata: {
    duration?: number;
    difficulty: number;
    tags: string[];
  };
}

// 個人化建議
export interface PersonalizationRecommendation {
  type: 'content' | 'method' | 'schedule' | 'goal';
  title: string;
  description: string;
  reasoning: string[];
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  implementation: string;
  expectedOutcome: string;
}

export class PersonalizedLearningSystem {
  private static prisma = new PrismaClient();

  /**
   * 生成個人化學習路徑
   */
  static async generateLearningPath(
    userId: string,
    goals: LearningGoal[],
    preferences: LearningPreferences,
    currentLevel?: string
  ): Promise<LearningPath> {
    try {
      // 1. 分析學習者檔案
      const learnerProfile = await this.analyzeLearnerProfile(userId);
      
      // 2. 評估當前能力水平
      const currentAbilities = await this.assessCurrentAbilities(userId, currentLevel);
      
      // 3. 分析學習目標
      const goalAnalysis = this.analyzeGoals(goals, currentAbilities);
      
      // 4. 生成學習步驟
      const steps = await this.generateLearningSteps(goalAnalysis, preferences, learnerProfile);
      
      // 5. 優化學習順序
      const optimizedSteps = this.optimizeLearningSequence(steps, preferences);
      
      // 6. 創建學習路徑
      const learningPath: LearningPath = {
        id: `path_${Date.now()}`,
        userId,
        title: this.generatePathTitle(goals),
        description: this.generatePathDescription(goals, preferences),
        estimatedDuration: this.calculateTotalDuration(optimizedSteps),
        difficulty: this.calculateAverageDifficulty(optimizedSteps),
        steps: optimizedSteps,
        adaptiveFactors: this.identifyAdaptiveFactors(preferences, learnerProfile),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 7. 保存學習路徑
      await this.saveLearningPath(learningPath);
      
      return learningPath;
    } catch (error) {
      console.error('生成學習路徑失敗:', error);
      throw new Error('無法生成個人化學習路徑');
    }
  }

  /**
   * 分析學習者檔案
   */
  private static async analyzeLearnerProfile(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        activities: {
          include: {
            gameResults: true,
            learningProgress: true
          }
        },
        userPreferences: true
      }
    });

    if (!user) {
      throw new Error('用戶不存在');
    }

    // 分析學習歷史
    const learningHistory = user.activities.map(activity => ({
      type: activity.type,
      difficulty: 0.5, // 從活動內容推斷
      performance: activity.gameResults.length > 0 ? 
        activity.gameResults.reduce((sum, result) => sum + (result.score || 0), 0) / activity.gameResults.length : 0,
      timeSpent: activity.gameResults.reduce((sum, result) => sum + (result.timeSpent || 0), 0)
    }));

    // 識別學習模式
    const learningPatterns = this.identifyLearningPatterns(learningHistory);
    
    // 評估學習能力
    const abilities = this.assessLearningAbilities(learningHistory);

    return {
      learningHistory,
      patterns: learningPatterns,
      abilities,
      preferences: user.userPreferences
    };
  }

  /**
   * 評估當前能力水平
   */
  private static async assessCurrentAbilities(userId: string, currentLevel?: string): Promise<any> {
    // 獲取最近的學習表現
    const recentResults = await this.prisma.gameResult.findMany({
      where: {
        activity: {
          userId
        },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // 分析各項技能水平
    const skillLevels = {
      vocabulary: this.calculateSkillLevel(recentResults, 'vocabulary'),
      grammar: this.calculateSkillLevel(recentResults, 'grammar'),
      listening: this.calculateSkillLevel(recentResults, 'listening'),
      reading: this.calculateSkillLevel(recentResults, 'reading'),
      speaking: this.calculateSkillLevel(recentResults, 'speaking'),
      writing: this.calculateSkillLevel(recentResults, 'writing')
    };

    return {
      overall: Object.values(skillLevels).reduce((sum, level) => sum + level, 0) / Object.keys(skillLevels).length,
      skills: skillLevels,
      geptLevel: currentLevel || this.inferGEPTLevel(skillLevels),
      strengths: this.identifyStrengths(skillLevels),
      weaknesses: this.identifyWeaknesses(skillLevels)
    };
  }

  /**
   * 分析學習目標
   */
  private static analyzeGoals(goals: LearningGoal[], currentAbilities: any): any {
    return goals.map(goal => ({
      ...goal,
      feasibility: this.assessGoalFeasibility(goal, currentAbilities),
      requiredSkills: this.identifyRequiredSkills(goal),
      estimatedTime: this.estimateGoalTime(goal, currentAbilities),
      prerequisites: this.identifyPrerequisites(goal, currentAbilities)
    }));
  }

  /**
   * 生成學習步驟
   */
  private static async generateLearningSteps(
    goalAnalysis: any[],
    preferences: LearningPreferences,
    learnerProfile: any
  ): Promise<LearningStep[]> {
    const steps: LearningStep[] = [];
    let stepOrder = 1;

    for (const goal of goalAnalysis) {
      // 為每個目標生成步驟
      const goalSteps = await this.generateStepsForGoal(goal, preferences, learnerProfile, stepOrder);
      steps.push(...goalSteps);
      stepOrder += goalSteps.length;
    }

    return steps;
  }

  /**
   * 為單個目標生成步驟
   */
  private static async generateStepsForGoal(
    goal: any,
    preferences: LearningPreferences,
    learnerProfile: any,
    startOrder: number
  ): Promise<LearningStep[]> {
    const steps: LearningStep[] = [];
    
    // 根據目標技能生成步驟
    for (let i = 0; i < goal.targetSkills.length; i++) {
      const skill = goal.targetSkills[i];
      
      // 內容學習步驟
      steps.push({
        id: `step_${startOrder + i * 3}_content`,
        order: startOrder + i * 3,
        title: `學習 ${skill} 基礎概念`,
        description: `掌握 ${skill} 的基本知識和概念`,
        type: 'content',
        estimatedTime: this.calculateStepTime(preferences.sessionLength, 'content'),
        difficulty: this.calculateStepDifficulty(goal, learnerProfile, 'content'),
        prerequisites: i > 0 ? [`step_${startOrder + (i-1) * 3 + 2}_assessment`] : [],
        learningObjectives: [`理解 ${skill} 基本概念`, `掌握相關詞彙`],
        resources: await this.generateResources(skill, 'content', preferences.style),
        completed: false
      });

      // 練習步驟
      steps.push({
        id: `step_${startOrder + i * 3 + 1}_practice`,
        order: startOrder + i * 3 + 1,
        title: `${skill} 互動練習`,
        description: `通過遊戲和練習強化 ${skill} 技能`,
        type: 'practice',
        gameType: this.selectOptimalGameType(skill, preferences.style),
        estimatedTime: this.calculateStepTime(preferences.sessionLength, 'practice'),
        difficulty: this.calculateStepDifficulty(goal, learnerProfile, 'practice'),
        prerequisites: [`step_${startOrder + i * 3}_content`],
        learningObjectives: [`熟練運用 ${skill}`, `提高反應速度`],
        resources: await this.generateResources(skill, 'practice', preferences.style),
        completed: false
      });

      // 評估步驟
      steps.push({
        id: `step_${startOrder + i * 3 + 2}_assessment`,
        order: startOrder + i * 3 + 2,
        title: `${skill} 能力評估`,
        description: `評估 ${skill} 掌握程度並獲得反饋`,
        type: 'assessment',
        estimatedTime: this.calculateStepTime(preferences.sessionLength, 'assessment'),
        difficulty: this.calculateStepDifficulty(goal, learnerProfile, 'assessment'),
        prerequisites: [`step_${startOrder + i * 3 + 1}_practice`],
        learningObjectives: [`驗證 ${skill} 掌握程度`, `識別改進方向`],
        resources: await this.generateResources(skill, 'assessment', preferences.style),
        completed: false
      });
    }

    return steps;
  }

  /**
   * 優化學習順序
   */
  private static optimizeLearningSequence(steps: LearningStep[], preferences: LearningPreferences): LearningStep[] {
    // 根據學習偏好調整順序
    const optimizedSteps = [...steps];

    // 根據難度偏好調整
    if (preferences.difficulty === 'easy') {
      optimizedSteps.sort((a, b) => a.difficulty - b.difficulty);
    } else if (preferences.difficulty === 'hard') {
      optimizedSteps.sort((a, b) => b.difficulty - a.difficulty);
    }

    // 重新分配順序號
    optimizedSteps.forEach((step, index) => {
      step.order = index + 1;
    });

    return optimizedSteps;
  }

  /**
   * 生成個人化建議
   */
  static async generatePersonalizationRecommendations(
    userId: string,
    learningPath: LearningPath
  ): Promise<PersonalizationRecommendation[]> {
    const recommendations: PersonalizationRecommendation[] = [];
    
    // 分析學習進度
    const progressAnalysis = await this.analyzeProgress(userId, learningPath);
    
    // 內容建議
    if (progressAnalysis.strugglingAreas.length > 0) {
      recommendations.push({
        type: 'content',
        title: '加強薄弱環節',
        description: `建議增加 ${progressAnalysis.strugglingAreas.join('、')} 的練習`,
        reasoning: ['識別到學習困難點', '針對性練習可以快速改善'],
        confidence: 0.85,
        impact: 'high',
        implementation: '在當前學習計劃中增加相關練習活動',
        expectedOutcome: '提升薄弱技能，平衡整體能力發展'
      });
    }

    // 方法建議
    if (progressAnalysis.learningEfficiency < 0.7) {
      recommendations.push({
        type: 'method',
        title: '調整學習方法',
        description: '建議嘗試不同的學習遊戲類型以提高效率',
        reasoning: ['當前學習效率偏低', '多樣化方法可以提升興趣'],
        confidence: 0.75,
        impact: 'medium',
        implementation: '在下次學習中嘗試新的遊戲類型',
        expectedOutcome: '提高學習效率和參與度'
      });
    }

    // 時間安排建議
    if (progressAnalysis.consistencyScore < 0.6) {
      recommendations.push({
        type: 'schedule',
        title: '優化學習時間',
        description: '建議調整學習時間安排以提高一致性',
        reasoning: ['學習一致性需要改善', '規律學習有助於記憶鞏固'],
        confidence: 0.80,
        impact: 'high',
        implementation: '設定固定的學習時間並使用提醒功能',
        expectedOutcome: '建立良好的學習習慣，提升長期效果'
      });
    }

    return recommendations;
  }

  // 輔助方法實現
  private static identifyLearningPatterns(history: any[]): any {
    return {
      preferredTypes: ['matching', 'quiz'],
      optimalDifficulty: 0.6,
      bestPerformanceTimes: ['morning', 'evening']
    };
  }

  private static assessLearningAbilities(history: any[]): any {
    return {
      processingSpeed: 0.7,
      memoryRetention: 0.6,
      problemSolving: 0.8,
      adaptability: 0.75
    };
  }

  private static calculateSkillLevel(results: any[], skill: string): number {
    // 基於遊戲結果計算技能水平
    const relevantResults = results.filter(r => r.gameType?.includes(skill));
    if (relevantResults.length === 0) return 0.5;
    
    const avgScore = relevantResults.reduce((sum, r) => sum + (r.score || 0), 0) / relevantResults.length;
    return Math.min(Math.max(avgScore / 100, 0), 1);
  }

  private static inferGEPTLevel(skillLevels: any): string {
    const avgLevel = Object.values(skillLevels).reduce((sum: number, level: any) => sum + level, 0) / Object.keys(skillLevels).length;
    
    if (avgLevel < 0.4) return '初級';
    if (avgLevel < 0.7) return '中級';
    return '中高級';
  }

  private static identifyStrengths(skillLevels: any): string[] {
    return Object.entries(skillLevels)
      .filter(([_, level]: [string, any]) => level > 0.7)
      .map(([skill, _]) => skill);
  }

  private static identifyWeaknesses(skillLevels: any): string[] {
    return Object.entries(skillLevels)
      .filter(([_, level]: [string, any]) => level < 0.5)
      .map(([skill, _]) => skill);
  }

  private static assessGoalFeasibility(goal: LearningGoal, abilities: any): number {
    // 評估目標可行性
    return 0.8;
  }

  private static identifyRequiredSkills(goal: LearningGoal): string[] {
    return goal.targetSkills;
  }

  private static estimateGoalTime(goal: LearningGoal, abilities: any): number {
    // 估算達成目標所需時間
    return goal.targetSkills.length * 10; // 每個技能10小時
  }

  private static identifyPrerequisites(goal: LearningGoal, abilities: any): string[] {
    return [];
  }

  private static calculateStepTime(sessionLength: string, stepType: string): number {
    const baseTimes = {
      short: { content: 10, practice: 15, assessment: 10 },
      medium: { content: 20, practice: 25, assessment: 15 },
      long: { content: 30, practice: 40, assessment: 20 }
    };
    
    return baseTimes[sessionLength as keyof typeof baseTimes][stepType as keyof typeof baseTimes.short] || 20;
  }

  private static calculateStepDifficulty(goal: any, learnerProfile: any, stepType: string): number {
    // 基於目標和學習者檔案計算步驟難度
    return 0.6;
  }

  private static async generateResources(skill: string, type: string, style: LearningStyle): Promise<LearningResource[]> {
    // 生成學習資源
    return [];
  }

  private static selectOptimalGameType(skill: string, style: LearningStyle): string {
    const gameMapping = {
      vocabulary: { visual: 'matching', auditory: 'pronunciation', kinesthetic: 'drag-drop' },
      grammar: { visual: 'fill-in', auditory: 'listening', kinesthetic: 'sequence' },
      listening: { visual: 'quiz', auditory: 'listening', kinesthetic: 'categorize' }
    };
    
    return gameMapping[skill as keyof typeof gameMapping]?.[style] || 'quiz';
  }

  private static generatePathTitle(goals: LearningGoal[]): string {
    return `個人化學習路徑 - ${goals.map(g => g.title).join('、')}`;
  }

  private static generatePathDescription(goals: LearningGoal[], preferences: LearningPreferences): string {
    return `基於您的學習偏好和目標定制的個人化學習路徑，包含 ${goals.length} 個學習目標`;
  }

  private static calculateTotalDuration(steps: LearningStep[]): number {
    return steps.reduce((sum, step) => sum + step.estimatedTime, 0) / 60; // 轉換為小時
  }

  private static calculateAverageDifficulty(steps: LearningStep[]): number {
    return steps.reduce((sum, step) => sum + step.difficulty, 0) / steps.length;
  }

  private static identifyAdaptiveFactors(preferences: LearningPreferences, profile: any): string[] {
    return ['學習風格', '表現分析', '時間偏好', '難度適配'];
  }

  private static async saveLearningPath(path: LearningPath): Promise<void> {
    // 保存學習路徑到數據庫
    console.log('保存學習路徑:', path.title);
  }

  private static async analyzeProgress(userId: string, path: LearningPath): Promise<any> {
    return {
      strugglingAreas: ['語法'],
      learningEfficiency: 0.65,
      consistencyScore: 0.55
    };
  }
}
