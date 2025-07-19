/**
 * 跨等級學習管理器
 * 實現GEPT等級間的學習路徑規劃、等級轉換支援和個人化學習建議
 */

import { GEPTLevel, GEPTWord } from './GEPTManager';
import { LearnerProfile, LearningProgress } from './GEPTAdaptationEngine';
import { VocabularyLearningState, VocabularyAnalysis } from './VocabularyDifficultyManager';

// 等級轉換建議
export interface LevelTransitionRecommendation {
  currentLevel: GEPTLevel;
  recommendedLevel: GEPTLevel;
  confidence: number;
  readinessScore: number;
  requirements: LevelRequirement[];
  estimatedTime: number; // 天數
  learningPath: LearningPathStep[];
  reasons: string[];
}

// 等級要求
export interface LevelRequirement {
  type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'overall';
  description: string;
  currentScore: number;
  requiredScore: number;
  progress: number; // 0-1
  priority: 'high' | 'medium' | 'low';
}

// 學習路徑步驟
export interface LearningPathStep {
  id: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'practice' | 'assessment';
  level: GEPTLevel;
  estimatedTime: number; // 分鐘
  prerequisites: string[];
  objectives: string[];
  resources: LearningResource[];
  isCompleted: boolean;
}

// 學習資源
export interface LearningResource {
  type: 'exercise' | 'reading' | 'video' | 'audio' | 'game';
  title: string;
  description: string;
  url?: string;
  difficulty: number; // 1-10
  estimatedTime: number; // 分鐘
}

// 跨等級學習計劃
export interface CrossLevelLearningPlan {
  userId: string;
  currentLevel: GEPTLevel;
  targetLevel: GEPTLevel;
  startDate: number;
  estimatedCompletionDate: number;
  phases: LearningPhase[];
  milestones: LearningMilestone[];
  adaptiveAdjustments: AdaptiveAdjustment[];
}

// 學習階段
export interface LearningPhase {
  id: string;
  name: string;
  level: GEPTLevel;
  startDate: number;
  endDate: number;
  objectives: string[];
  activities: LearningPathStep[];
  assessments: Assessment[];
  isCompleted: boolean;
}

// 學習里程碑
export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: number;
  requirements: LevelRequirement[];
  rewards: string[];
  isAchieved: boolean;
}

// 自適應調整
export interface AdaptiveAdjustment {
  timestamp: number;
  type: 'pace' | 'difficulty' | 'focus' | 'method';
  reason: string;
  adjustment: string;
  impact: string;
}

// 評估
export interface Assessment {
  id: string;
  type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'comprehensive';
  level: GEPTLevel;
  questions: AssessmentQuestion[];
  passingScore: number;
  timeLimit: number; // 分鐘
}

// 評估問題
export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'matching' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
}

export class CrossLevelLearningManager {
  private learningPlans: Map<string, CrossLevelLearningPlan> = new Map();
  private levelRequirements: Map<GEPTLevel, LevelRequirement[]> = new Map();

  constructor() {
    this.initializeLevelRequirements();
  }

  /**
   * 初始化等級要求
   */
  private initializeLevelRequirements(): void {
    // 初級要求
    this.levelRequirements.set('elementary', [
      {
        type: 'vocabulary',
        description: '掌握基礎詞彙 (500-800字)',
        currentScore: 0,
        requiredScore: 80,
        progress: 0,
        priority: 'high'
      },
      {
        type: 'grammar',
        description: '基本語法結構',
        currentScore: 0,
        requiredScore: 75,
        progress: 0,
        priority: 'high'
      },
      {
        type: 'reading',
        description: '簡單文章理解',
        currentScore: 0,
        requiredScore: 70,
        progress: 0,
        priority: 'medium'
      }
    ]);

    // 中級要求
    this.levelRequirements.set('intermediate', [
      {
        type: 'vocabulary',
        description: '掌握中級詞彙 (1500-2500字)',
        currentScore: 0,
        requiredScore: 85,
        progress: 0,
        priority: 'high'
      },
      {
        type: 'grammar',
        description: '複雜語法結構',
        currentScore: 0,
        requiredScore: 80,
        progress: 0,
        priority: 'high'
      },
      {
        type: 'reading',
        description: '中等難度文章理解',
        currentScore: 0,
        requiredScore: 75,
        progress: 0,
        priority: 'medium'
      },
      {
        type: 'listening',
        description: '日常對話理解',
        currentScore: 0,
        requiredScore: 70,
        progress: 0,
        priority: 'medium'
      }
    ]);

    // 中高級要求
    this.levelRequirements.set('high-intermediate', [
      {
        type: 'vocabulary',
        description: '掌握高級詞彙 (3000-4000字)',
        currentScore: 0,
        requiredScore: 90,
        progress: 0,
        priority: 'high'
      },
      {
        type: 'grammar',
        description: '高級語法和慣用語',
        currentScore: 0,
        requiredScore: 85,
        progress: 0,
        priority: 'high'
      },
      {
        type: 'reading',
        description: '學術和專業文章理解',
        currentScore: 0,
        requiredScore: 80,
        progress: 0,
        priority: 'high'
      },
      {
        type: 'listening',
        description: '複雜對話和演講理解',
        currentScore: 0,
        requiredScore: 75,
        progress: 0,
        priority: 'medium'
      }
    ]);
  }

  /**
   * 評估等級轉換準備度
   */
  assessLevelTransitionReadiness(
    learnerProfile: LearnerProfile,
    vocabularyAnalysis: VocabularyAnalysis,
    targetLevel?: GEPTLevel
  ): LevelTransitionRecommendation {
    const currentLevel = learnerProfile.currentLevel;
    const suggestedTarget = targetLevel || this.suggestNextLevel(learnerProfile);
    
    // 計算準備度分數
    const readinessScore = this.calculateReadinessScore(
      learnerProfile,
      vocabularyAnalysis,
      suggestedTarget
    );

    // 獲取等級要求
    const requirements = this.assessLevelRequirements(
      learnerProfile,
      vocabularyAnalysis,
      suggestedTarget
    );

    // 生成學習路徑
    const learningPath = this.generateLearningPath(
      currentLevel,
      suggestedTarget,
      requirements
    );

    // 估算時間
    const estimatedTime = this.estimateTransitionTime(
      requirements,
      learnerProfile.learningPreferences.learningPace
    );

    // 生成建議原因
    const reasons = this.generateTransitionReasons(
      readinessScore,
      requirements,
      learnerProfile
    );

    return {
      currentLevel,
      recommendedLevel: suggestedTarget,
      confidence: this.calculateConfidence(readinessScore, requirements),
      readinessScore,
      requirements,
      estimatedTime,
      learningPath,
      reasons
    };
  }

  /**
   * 建議下一個等級
   */
  private suggestNextLevel(learnerProfile: LearnerProfile): GEPTLevel {
    const levelOrder: GEPTLevel[] = ['elementary', 'intermediate', 'high-intermediate'];
    const currentIndex = levelOrder.indexOf(learnerProfile.currentLevel);
    
    // 基於學習進度分析
    const recentProgress = learnerProfile.progressHistory.slice(-10);
    const avgAccuracy = recentProgress.length > 0 
      ? recentProgress.reduce((sum, p) => sum + p.accuracy, 0) / recentProgress.length
      : 0;

    if (avgAccuracy >= 0.85 && currentIndex < levelOrder.length - 1) {
      return levelOrder[currentIndex + 1];
    } else if (avgAccuracy < 0.6 && currentIndex > 0) {
      return levelOrder[currentIndex - 1];
    } else {
      return learnerProfile.currentLevel;
    }
  }

  /**
   * 計算準備度分數
   */
  private calculateReadinessScore(
    learnerProfile: LearnerProfile,
    vocabularyAnalysis: VocabularyAnalysis,
    targetLevel: GEPTLevel
  ): number {
    let score = 0;
    let totalWeight = 0;

    // 詞彙準備度 (40%)
    const vocabWeight = 0.4;
    const vocabScore = this.calculateVocabularyReadiness(vocabularyAnalysis, targetLevel);
    score += vocabScore * vocabWeight;
    totalWeight += vocabWeight;

    // 學習表現 (30%)
    const performanceWeight = 0.3;
    const performanceScore = this.calculatePerformanceReadiness(learnerProfile);
    score += performanceScore * performanceWeight;
    totalWeight += performanceWeight;

    // 學習一致性 (20%)
    const consistencyWeight = 0.2;
    const consistencyScore = this.calculateConsistencyReadiness(learnerProfile);
    score += consistencyScore * consistencyWeight;
    totalWeight += consistencyWeight;

    // 學習動機 (10%)
    const motivationWeight = 0.1;
    const motivationScore = this.calculateMotivationReadiness(learnerProfile);
    score += motivationScore * motivationWeight;
    totalWeight += motivationWeight;

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * 計算詞彙準備度
   */
  private calculateVocabularyReadiness(
    vocabularyAnalysis: VocabularyAnalysis,
    targetLevel: GEPTLevel
  ): number {
    const levelOrder: GEPTLevel[] = ['elementary', 'intermediate', 'high-intermediate'];
    const targetIndex = levelOrder.indexOf(targetLevel);
    
    let readiness = 0;
    let totalWords = 0;

    // 計算各等級詞彙掌握情況
    for (let i = 0; i <= targetIndex; i++) {
      const level = levelOrder[i];
      const levelWords = vocabularyAnalysis.levelDistribution[level] || 0;
      totalWords += levelWords;
      
      // 權重：越接近目標等級權重越高
      const weight = (i + 1) / (targetIndex + 1);
      readiness += levelWords * weight;
    }

    // 基於總詞彙量的期望值計算準備度
    const expectedWords = this.getExpectedVocabularySize(targetLevel);
    return Math.min(1, totalWords / expectedWords);
  }

  /**
   * 計算表現準備度
   */
  private calculatePerformanceReadiness(learnerProfile: LearnerProfile): number {
    const recentProgress = learnerProfile.progressHistory.slice(-20);
    if (recentProgress.length === 0) return 0.5;

    const avgAccuracy = recentProgress.reduce((sum, p) => sum + p.accuracy, 0) / recentProgress.length;
    const avgScore = recentProgress.reduce((sum, p) => sum + p.score, 0) / recentProgress.length;
    
    // 正規化分數 (假設最高分數為100)
    const normalizedScore = Math.min(1, avgScore / 100);
    
    return (avgAccuracy + normalizedScore) / 2;
  }

  /**
   * 計算一致性準備度
   */
  private calculateConsistencyReadiness(learnerProfile: LearnerProfile): number {
    const recentProgress = learnerProfile.progressHistory.slice(-30);
    if (recentProgress.length < 7) return 0.3; // 數據不足

    // 計算學習頻率
    const daysSinceStart = (Date.now() - recentProgress[0].timestamp) / (24 * 60 * 60 * 1000);
    const learningFrequency = recentProgress.length / daysSinceStart;
    
    // 計算表現穩定性
    const accuracies = recentProgress.map(p => p.accuracy);
    const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - avgAccuracy, 2), 0) / accuracies.length;
    const stability = Math.max(0, 1 - variance);

    return (Math.min(1, learningFrequency * 7) + stability) / 2;
  }

  /**
   * 計算動機準備度
   */
  private calculateMotivationReadiness(learnerProfile: LearnerProfile): number {
    // 基於學習偏好和目標設定
    let motivation = 0.5; // 基礎動機

    if (learnerProfile.targetLevel !== learnerProfile.currentLevel) {
      motivation += 0.3; // 有明確目標
    }

    if (learnerProfile.learningPreferences.learningPace === 'fast') {
      motivation += 0.2; // 積極學習態度
    }

    return Math.min(1, motivation);
  }

  /**
   * 評估等級要求
   */
  private assessLevelRequirements(
    learnerProfile: LearnerProfile,
    vocabularyAnalysis: VocabularyAnalysis,
    targetLevel: GEPTLevel
  ): LevelRequirement[] {
    const baseRequirements = this.levelRequirements.get(targetLevel) || [];
    
    return baseRequirements.map(req => {
      const updatedReq = { ...req };
      
      switch (req.type) {
        case 'vocabulary':
          updatedReq.currentScore = this.calculateVocabularyScore(vocabularyAnalysis, targetLevel);
          break;
        case 'grammar':
          updatedReq.currentScore = this.calculateGrammarScore(learnerProfile);
          break;
        case 'reading':
          updatedReq.currentScore = this.calculateReadingScore(learnerProfile);
          break;
        case 'listening':
          updatedReq.currentScore = this.calculateListeningScore(learnerProfile);
          break;
        case 'overall':
          updatedReq.currentScore = this.calculateOverallScore(learnerProfile);
          break;
      }
      
      updatedReq.progress = updatedReq.currentScore / updatedReq.requiredScore;
      return updatedReq;
    });
  }

  /**
   * 生成學習路徑
   */
  private generateLearningPath(
    currentLevel: GEPTLevel,
    targetLevel: GEPTLevel,
    requirements: LevelRequirement[]
  ): LearningPathStep[] {
    const steps: LearningPathStep[] = [];
    
    // 基於未達標的要求生成學習步驟
    requirements.forEach((req, index) => {
      if (req.progress < 1) {
        const step: LearningPathStep = {
          id: `step_${req.type}_${index}`,
          title: `提升${req.type}能力`,
          description: req.description,
          type: req.type as any,
          level: targetLevel,
          estimatedTime: this.estimateStepTime(req),
          prerequisites: index > 0 ? [`step_${requirements[index-1].type}_${index-1}`] : [],
          objectives: [req.description],
          resources: this.generateLearningResources(req.type, targetLevel),
          isCompleted: false
        };
        steps.push(step);
      }
    });

    return steps;
  }

  /**
   * 生成學習資源
   */
  private generateLearningResources(type: string, level: GEPTLevel): LearningResource[] {
    const resources: LearningResource[] = [];
    
    switch (type) {
      case 'vocabulary':
        resources.push({
          type: 'game',
          title: 'Match配對遊戲',
          description: `${level}等級詞彙配對練習`,
          difficulty: this.getLevelDifficulty(level),
          estimatedTime: 15
        });
        break;
      case 'grammar':
        resources.push({
          type: 'exercise',
          title: '語法練習',
          description: `${level}等級語法結構練習`,
          difficulty: this.getLevelDifficulty(level),
          estimatedTime: 20
        });
        break;
      case 'reading':
        resources.push({
          type: 'reading',
          title: '閱讀理解',
          description: `${level}等級文章閱讀`,
          difficulty: this.getLevelDifficulty(level),
          estimatedTime: 25
        });
        break;
    }
    
    return resources;
  }

  /**
   * 創建跨等級學習計劃
   */
  createCrossLevelLearningPlan(
    userId: string,
    currentLevel: GEPTLevel,
    targetLevel: GEPTLevel,
    learnerProfile: LearnerProfile
  ): CrossLevelLearningPlan {
    const startDate = Date.now();
    const phases = this.generateLearningPhases(currentLevel, targetLevel, learnerProfile);
    const estimatedDays = phases.reduce((sum, phase) => 
      sum + (phase.endDate - phase.startDate) / (24 * 60 * 60 * 1000), 0
    );
    
    const plan: CrossLevelLearningPlan = {
      userId,
      currentLevel,
      targetLevel,
      startDate,
      estimatedCompletionDate: startDate + estimatedDays * 24 * 60 * 60 * 1000,
      phases,
      milestones: this.generateMilestones(phases),
      adaptiveAdjustments: []
    };

    this.learningPlans.set(userId, plan);
    return plan;
  }

  /**
   * 生成學習階段
   */
  private generateLearningPhases(
    currentLevel: GEPTLevel,
    targetLevel: GEPTLevel,
    learnerProfile: LearnerProfile
  ): LearningPhase[] {
    const phases: LearningPhase[] = [];
    const levelOrder: GEPTLevel[] = ['elementary', 'intermediate', 'high-intermediate'];
    const startIndex = levelOrder.indexOf(currentLevel);
    const endIndex = levelOrder.indexOf(targetLevel);
    
    let currentDate = Date.now();
    
    for (let i = startIndex; i <= endIndex; i++) {
      const level = levelOrder[i];
      const phaseDuration = this.calculatePhaseDuration(level, learnerProfile);
      
      const phase: LearningPhase = {
        id: `phase_${level}`,
        name: `${level}等級學習階段`,
        level,
        startDate: currentDate,
        endDate: currentDate + phaseDuration,
        objectives: this.getPhaseObjectives(level),
        activities: [],
        assessments: [],
        isCompleted: false
      };
      
      phases.push(phase);
      currentDate += phaseDuration;
    }
    
    return phases;
  }

  /**
   * 輔助方法
   */
  private getExpectedVocabularySize(level: GEPTLevel): number {
    switch (level) {
      case 'elementary': return 800;
      case 'intermediate': return 2500;
      case 'high-intermediate': return 4000;
      default: return 1000;
    }
  }

  private getLevelDifficulty(level: GEPTLevel): number {
    switch (level) {
      case 'elementary': return 3;
      case 'intermediate': return 6;
      case 'high-intermediate': return 9;
      default: return 5;
    }
  }

  private calculateVocabularyScore(analysis: VocabularyAnalysis, level: GEPTLevel): number {
    const expectedSize = this.getExpectedVocabularySize(level);
    return Math.min(100, (analysis.knownWords / expectedSize) * 100);
  }

  private calculateGrammarScore(profile: LearnerProfile): number {
    // 簡化的語法分數計算
    const recentProgress = profile.progressHistory.slice(-10);
    return recentProgress.length > 0 
      ? recentProgress.reduce((sum, p) => sum + p.accuracy, 0) / recentProgress.length * 100
      : 50;
  }

  private calculateReadingScore(profile: LearnerProfile): number {
    // 簡化的閱讀分數計算
    return this.calculateGrammarScore(profile) * 0.9; // 略低於語法分數
  }

  private calculateListeningScore(profile: LearnerProfile): number {
    // 簡化的聽力分數計算
    return this.calculateGrammarScore(profile) * 0.8; // 通常聽力較困難
  }

  private calculateOverallScore(profile: LearnerProfile): number {
    return this.calculateGrammarScore(profile);
  }

  private estimateStepTime(requirement: LevelRequirement): number {
    const gap = requirement.requiredScore - requirement.currentScore;
    return Math.max(30, gap * 2); // 每分差距需要2分鐘，最少30分鐘
  }

  private estimateTransitionTime(
    requirements: LevelRequirement[],
    pace: 'slow' | 'normal' | 'fast'
  ): number {
    const baseTime = requirements.reduce((sum, req) => sum + this.estimateStepTime(req), 0);
    const paceMultiplier = { slow: 1.5, normal: 1, fast: 0.7 }[pace];
    return Math.ceil(baseTime * paceMultiplier / 60); // 轉換為天數
  }

  private calculateConfidence(readinessScore: number, requirements: LevelRequirement[]): number {
    const avgProgress = requirements.reduce((sum, req) => sum + req.progress, 0) / requirements.length;
    return (readinessScore + avgProgress) / 2;
  }

  private generateTransitionReasons(
    readinessScore: number,
    requirements: LevelRequirement[],
    profile: LearnerProfile
  ): string[] {
    const reasons: string[] = [];
    
    if (readinessScore >= 0.8) {
      reasons.push('整體準備度良好，建議進階學習');
    } else if (readinessScore >= 0.6) {
      reasons.push('基礎穩固，可以開始挑戰更高等級');
    } else {
      reasons.push('建議先鞏固當前等級基礎');
    }
    
    const weakAreas = requirements.filter(req => req.progress < 0.7);
    if (weakAreas.length > 0) {
      reasons.push(`需要加強：${weakAreas.map(req => req.type).join('、')}`);
    }
    
    return reasons;
  }

  private calculatePhaseDuration(level: GEPTLevel, profile: LearnerProfile): number {
    const baseDuration = { elementary: 30, intermediate: 45, 'high-intermediate': 60 }[level];
    const paceMultiplier = { slow: 1.5, normal: 1, fast: 0.7 }[profile.learningPreferences.learningPace];
    return baseDuration * paceMultiplier * 24 * 60 * 60 * 1000; // 轉換為毫秒
  }

  private getPhaseObjectives(level: GEPTLevel): string[] {
    switch (level) {
      case 'elementary':
        return ['掌握基礎詞彙', '理解簡單語法', '能進行基本對話'];
      case 'intermediate':
        return ['擴展詞彙量', '掌握複雜語法', '理解中等難度文章'];
      case 'high-intermediate':
        return ['精通高級詞彙', '運用複雜語法', '理解學術文章'];
      default:
        return ['提升英語能力'];
    }
  }

  private generateMilestones(phases: LearningPhase[]): LearningMilestone[] {
    return phases.map((phase, index) => ({
      id: `milestone_${phase.id}`,
      title: `完成${phase.name}`,
      description: `達到${phase.level}等級要求`,
      targetDate: phase.endDate,
      requirements: [],
      rewards: [`解鎖${phase.level}等級證書`],
      isAchieved: false
    }));
  }

  /**
   * 獲取學習計劃
   */
  getLearningPlan(userId: string): CrossLevelLearningPlan | null {
    return this.learningPlans.get(userId) || null;
  }

  /**
   * 清除用戶數據
   */
  clearUserData(userId: string): void {
    this.learningPlans.delete(userId);
  }
}
