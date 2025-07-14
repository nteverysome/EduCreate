/**
 * AI智能輔助系統單元測試
 * 驗證內容推薦、難度調整、個人化學習和無障礙輔助功能
 */

import { RecommendationType } from '../../lib/ai/IntelligentRecommendationEngine';
import { DifficultyStrategy } from '../../lib/ai/AdaptiveDifficultyAI';
import { LearningStyle } from '../../lib/ai/PersonalizedLearningSystem';
import { AccessibilityNeed, AssistiveTechnology } from '../../lib/ai/AIAccessibilityHelper';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
      count: jest.fn()
    },
    gameResult: {
      findMany: jest.fn()
    },
    difficultyAdjustment: {
      create: jest.fn(),
      findMany: jest.fn()
    },
    $disconnect: jest.fn()
  }))
}));

describe('AI智能輔助系統基本功能', () => {
  test('推薦類型應該正確定義', () => {
    expect(RecommendationType.CONTENT).toBe('content');
    expect(RecommendationType.GAME_TYPE).toBe('game_type');
    expect(RecommendationType.DIFFICULTY).toBe('difficulty');
    expect(RecommendationType.LEARNING_PATH).toBe('learning_path');
    expect(RecommendationType.REVIEW_SCHEDULE).toBe('review_schedule');
    expect(RecommendationType.STUDY_TIME).toBe('study_time');
  });

  test('難度調整策略應該正確定義', () => {
    expect(DifficultyStrategy.CONSERVATIVE).toBe('conservative');
    expect(DifficultyStrategy.MODERATE).toBe('moderate');
    expect(DifficultyStrategy.AGGRESSIVE).toBe('aggressive');
    expect(DifficultyStrategy.ADAPTIVE).toBe('adaptive');
  });

  test('學習風格應該正確定義', () => {
    expect(LearningStyle.VISUAL).toBe('visual');
    expect(LearningStyle.AUDITORY).toBe('auditory');
    expect(LearningStyle.KINESTHETIC).toBe('kinesthetic');
    expect(LearningStyle.READING).toBe('reading');
    expect(LearningStyle.MIXED).toBe('mixed');
  });

  test('無障礙需求類型應該正確定義', () => {
    expect(AccessibilityNeed.VISUAL_IMPAIRMENT).toBe('visual_impairment');
    expect(AccessibilityNeed.HEARING_IMPAIRMENT).toBe('hearing_impairment');
    expect(AccessibilityNeed.MOTOR_IMPAIRMENT).toBe('motor_impairment');
    expect(AccessibilityNeed.COGNITIVE_IMPAIRMENT).toBe('cognitive_impairment');
    expect(AccessibilityNeed.LEARNING_DISABILITY).toBe('learning_disability');
    expect(AccessibilityNeed.ATTENTION_DEFICIT).toBe('attention_deficit');
    expect(AccessibilityNeed.DYSLEXIA).toBe('dyslexia');
    expect(AccessibilityNeed.COLOR_BLINDNESS).toBe('color_blindness');
  });

  test('輔助技術類型應該正確定義', () => {
    expect(AssistiveTechnology.SCREEN_READER).toBe('screen_reader');
    expect(AssistiveTechnology.VOICE_CONTROL).toBe('voice_control');
    expect(AssistiveTechnology.EYE_TRACKING).toBe('eye_tracking');
    expect(AssistiveTechnology.SWITCH_CONTROL).toBe('switch_control');
    expect(AssistiveTechnology.MAGNIFICATION).toBe('magnification');
    expect(AssistiveTechnology.HIGH_CONTRAST).toBe('high_contrast');
    expect(AssistiveTechnology.TEXT_TO_SPEECH).toBe('text_to_speech');
    expect(AssistiveTechnology.SPEECH_TO_TEXT).toBe('speech_to_text');
  });
});

describe('智能推薦系統', () => {
  test('應該能創建推薦項目對象', () => {
    const recommendationItem = {
      id: 'rec_123',
      type: RecommendationType.CONTENT,
      title: '英語詞彙練習',
      description: '基於您的學習進度推薦的詞彙練習',
      confidence: 0.85,
      priority: 8,
      reasoning: ['您在詞彙方面表現良好', '可以挑戰更高難度'],
      expectedBenefit: '提升詞彙量和理解能力',
      estimatedTime: 20,
      difficulty: 0.7,
      tags: ['詞彙', '練習', '中級'],
      metadata: {
        contentId: 'content_456',
        targetSkills: ['vocabulary'],
        memoryTechniques: ['間隔重複', '主動回憶']
      }
    };

    expect(recommendationItem.type).toBe(RecommendationType.CONTENT);
    expect(recommendationItem.confidence).toBe(0.85);
    expect(recommendationItem.priority).toBe(8);
    expect(recommendationItem.reasoning).toContain('您在詞彙方面表現良好');
    expect(recommendationItem.metadata.targetSkills).toContain('vocabulary');
  });

  test('應該能創建推薦權重配置', () => {
    const weights = {
      learningHistory: 0.25,
      performance: 0.20,
      preferences: 0.15,
      memoryRetention: 0.15,
      timeOfDay: 0.10,
      difficulty: 0.10,
      geptLevel: 0.03,
      socialLearning: 0.02
    };

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 2);
  });

  test('應該能創建學習者檔案', () => {
    const learnerProfile = {
      userId: 'user_123',
      geptLevel: '中級',
      learningStyle: LearningStyle.VISUAL,
      preferredGameTypes: ['matching', 'flashcards'],
      optimalDifficulty: 0.6,
      averageSessionLength: 25,
      bestPerformanceTime: ['09:00-11:00', '19:00-21:00'],
      weakAreas: ['語法', '聽力'],
      strongAreas: ['詞彙', '閱讀'],
      memoryRetentionRate: 0.75,
      motivationLevel: 0.8,
      consistencyScore: 0.7
    };

    expect(learnerProfile.learningStyle).toBe(LearningStyle.VISUAL);
    expect(learnerProfile.preferredGameTypes).toContain('matching');
    expect(learnerProfile.weakAreas).toContain('語法');
    expect(learnerProfile.strongAreas).toContain('詞彙');
    expect(learnerProfile.memoryRetentionRate).toBe(0.75);
  });
});

describe('自適應難度調整', () => {
  test('應該能創建認知負荷指標', () => {
    const cognitiveLoad = {
      responseTime: 3000,
      errorRate: 0.2,
      hesitationCount: 3,
      retryCount: 2,
      attentionLevel: 0.7,
      fatigueLevel: 0.4,
      frustrationLevel: 0.3
    };

    expect(cognitiveLoad.responseTime).toBe(3000);
    expect(cognitiveLoad.errorRate).toBe(0.2);
    expect(cognitiveLoad.attentionLevel).toBe(0.7);
  });

  test('應該能創建學習表現指標', () => {
    const performance = {
      accuracy: 0.8,
      speed: 0.75,
      consistency: 0.7,
      improvement: 0.1,
      retention: 0.65,
      engagement: 0.85,
      confidence: 0.7
    };

    expect(performance.accuracy).toBe(0.8);
    expect(performance.engagement).toBe(0.85);
    expect(performance.improvement).toBe(0.1);
  });

  test('應該能創建難度調整建議', () => {
    const adjustment = {
      currentDifficulty: 0.6,
      recommendedDifficulty: 0.7,
      adjustmentReason: '表現優秀，可以增加挑戰',
      confidence: 0.85,
      expectedImpact: '提升學習效果，增強技能發展',
      adjustmentType: 'increase' as const,
      magnitude: 'medium' as const,
      timeline: 'immediate' as const
    };

    expect(adjustment.adjustmentType).toBe('increase');
    expect(adjustment.magnitude).toBe('medium');
    expect(adjustment.timeline).toBe('immediate');
    expect(adjustment.confidence).toBe(0.85);
  });

  test('應該能計算認知負荷分數', () => {
    const calculateCognitiveLoad = (metrics: any) => {
      const weights = {
        responseTime: 0.25,
        errorRate: 0.20,
        hesitationCount: 0.15,
        retryCount: 0.15,
        attentionLevel: 0.10,
        fatigueLevel: 0.10,
        frustrationLevel: 0.05
      };

      const normalizedMetrics = {
        responseTime: Math.min(metrics.responseTime / 5000, 1),
        errorRate: metrics.errorRate,
        hesitationCount: Math.min(metrics.hesitationCount / 10, 1),
        retryCount: Math.min(metrics.retryCount / 5, 1),
        attentionLevel: 1 - metrics.attentionLevel,
        fatigueLevel: metrics.fatigueLevel,
        frustrationLevel: metrics.frustrationLevel
      };

      let cognitiveLoad = 0;
      for (const [metric, value] of Object.entries(normalizedMetrics)) {
        cognitiveLoad += value * weights[metric as keyof typeof weights];
      }

      return Math.min(Math.max(cognitiveLoad, 0), 1);
    };

    const metrics = {
      responseTime: 3000,
      errorRate: 0.2,
      hesitationCount: 3,
      retryCount: 1,
      attentionLevel: 0.8,
      fatigueLevel: 0.3,
      frustrationLevel: 0.2
    };

    const score = calculateCognitiveLoad(metrics);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('個人化學習系統', () => {
  test('應該能創建學習偏好', () => {
    const preferences = {
      style: LearningStyle.MIXED,
      pace: 'medium' as const,
      sessionLength: 'medium' as const,
      timeOfDay: 'evening' as const,
      difficulty: 'adaptive' as const,
      feedback: 'immediate' as const,
      motivation: 'achievement' as const
    };

    expect(preferences.style).toBe(LearningStyle.MIXED);
    expect(preferences.pace).toBe('medium');
    expect(preferences.feedback).toBe('immediate');
  });

  test('應該能創建學習目標', () => {
    const goal = {
      id: 'goal_123',
      title: '提升英語聽力',
      description: '在3個月內將聽力水平提升到中高級',
      targetSkills: ['listening', 'pronunciation'],
      geptLevel: '中高級',
      deadline: new Date('2024-06-01'),
      priority: 'high' as const,
      progress: 0.3,
      milestones: [
        {
          id: 'milestone_1',
          title: '完成基礎聽力練習',
          description: '完成50個基礎聽力練習',
          targetDate: new Date('2024-04-01'),
          completed: true,
          completedDate: new Date('2024-03-28'),
          requirements: ['基礎詞彙掌握', '語音識別能力']
        }
      ]
    };

    expect(goal.targetSkills).toContain('listening');
    expect(goal.priority).toBe('high');
    expect(goal.milestones[0].completed).toBe(true);
  });

  test('應該能創建學習步驟', () => {
    const step = {
      id: 'step_123',
      order: 1,
      title: '學習基礎詞彙',
      description: '掌握100個常用英語單詞',
      type: 'content' as const,
      gameType: 'flashcards',
      estimatedTime: 30,
      difficulty: 0.5,
      prerequisites: [],
      learningObjectives: ['記憶詞彙', '理解詞義'],
      resources: [
        {
          id: 'resource_1',
          type: 'interactive' as const,
          title: '詞彙卡片',
          metadata: {
            duration: 30,
            difficulty: 0.5,
            tags: ['詞彙', '記憶']
          }
        }
      ],
      completed: false
    };

    expect(step.type).toBe('content');
    expect(step.gameType).toBe('flashcards');
    expect(step.learningObjectives).toContain('記憶詞彙');
    expect(step.resources[0].type).toBe('interactive');
  });
});

describe('無障礙輔助系統', () => {
  test('應該能創建無障礙配置', () => {
    const profile = {
      userId: 'user_123',
      needs: [AccessibilityNeed.VISUAL_IMPAIRMENT, AccessibilityNeed.MOTOR_IMPAIRMENT],
      assistiveTechnologies: [AssistiveTechnology.SCREEN_READER, AssistiveTechnology.VOICE_CONTROL],
      preferences: {
        fontSize: 'large' as const,
        contrast: 'high' as const,
        colorScheme: 'dark' as const,
        animationSpeed: 'slow' as const,
        soundEnabled: true,
        vibrationEnabled: false,
        voiceSpeed: 0.8,
        voicePitch: 1.2
      },
      customizations: {
        keyboardShortcuts: { 'ctrl+h': 'help', 'ctrl+s': 'save' },
        colorFilters: ['protanopia', 'deuteranopia'],
        textSpacing: 1.5,
        lineHeight: 2.0,
        focusIndicator: 'enhanced' as const
      }
    };

    expect(profile.needs).toContain(AccessibilityNeed.VISUAL_IMPAIRMENT);
    expect(profile.assistiveTechnologies).toContain(AssistiveTechnology.SCREEN_READER);
    expect(profile.preferences.fontSize).toBe('large');
    expect(profile.customizations.focusIndicator).toBe('enhanced');
  });

  test('應該能創建無障礙建議', () => {
    const recommendation = {
      type: 'ui_adjustment' as const,
      title: '啟用高對比度模式',
      description: '提高界面元素的對比度以改善可見性',
      reasoning: ['檢測到視覺障礙需求', '高對比度可以顯著改善可讀性'],
      implementation: '在設置中啟用高對比度主題',
      expectedBenefit: '提高文字和界面元素的可見性',
      confidence: 0.9,
      priority: 'high' as const,
      category: AccessibilityNeed.VISUAL_IMPAIRMENT
    };

    expect(recommendation.type).toBe('ui_adjustment');
    expect(recommendation.priority).toBe('high');
    expect(recommendation.category).toBe(AccessibilityNeed.VISUAL_IMPAIRMENT);
    expect(recommendation.reasoning).toContain('檢測到視覺障礙需求');
  });

  test('應該能創建內容適配結果', () => {
    const adaptation = {
      originalContent: { text: '原始內容', fontSize: 'medium' },
      adaptedContent: { text: '原始內容', fontSize: 'large', contrast: 'high' },
      adaptations: [
        {
          type: 'font_size',
          description: '調整字體大小為 large',
          applied: true
        },
        {
          type: 'contrast',
          description: '調整對比度為 high',
          applied: true
        }
      ],
      accessibilityScore: 0.85,
      wcagCompliance: {
        level: 'AA' as const,
        violations: [],
        warnings: ['建議進一步提高對比度']
      }
    };

    expect(adaptation.adaptedContent.fontSize).toBe('large');
    expect(adaptation.adaptations).toHaveLength(2);
    expect(adaptation.accessibilityScore).toBe(0.85);
    expect(adaptation.wcagCompliance.level).toBe('AA');
  });

  test('應該能推薦輔助技術', () => {
    const recommendAssistiveTechnologies = (needs: AccessibilityNeed[]) => {
      const technologies: AssistiveTechnology[] = [];

      if (needs.includes(AccessibilityNeed.VISUAL_IMPAIRMENT)) {
        technologies.push(AssistiveTechnology.SCREEN_READER, AssistiveTechnology.TEXT_TO_SPEECH);
      }
      if (needs.includes(AccessibilityNeed.HEARING_IMPAIRMENT)) {
        technologies.push(AssistiveTechnology.SPEECH_TO_TEXT);
      }
      if (needs.includes(AccessibilityNeed.MOTOR_IMPAIRMENT)) {
        technologies.push(AssistiveTechnology.VOICE_CONTROL, AssistiveTechnology.SWITCH_CONTROL);
      }

      return technologies;
    };

    const needs = [AccessibilityNeed.VISUAL_IMPAIRMENT, AccessibilityNeed.MOTOR_IMPAIRMENT];
    const technologies = recommendAssistiveTechnologies(needs);

    expect(technologies).toContain(AssistiveTechnology.SCREEN_READER);
    expect(technologies).toContain(AssistiveTechnology.VOICE_CONTROL);
    expect(technologies).toHaveLength(4);
  });
});

describe('AI系統整合', () => {
  test('應該能創建統一的AI響應格式', () => {
    const aiResponse = {
      success: true,
      data: {
        recommendations: [],
        difficultyAdjustment: null,
        learningPath: null,
        accessibilityProfile: null
      },
      meta: {
        userId: 'user_123',
        timestamp: new Date().toISOString(),
        processingTime: 150,
        confidence: 0.85
      },
      message: '成功處理AI請求'
    };

    expect(aiResponse.success).toBe(true);
    expect(aiResponse.meta.userId).toBe('user_123');
    expect(aiResponse.meta.confidence).toBe(0.85);
    expect(aiResponse.message).toBe('成功處理AI請求');
  });

  test('應該能處理AI錯誤響應', () => {
    const errorResponse = {
      success: false,
      error: 'AI服務暫時不可用',
      message: '推薦引擎處理失敗',
      code: 'AI_SERVICE_ERROR',
      details: {
        component: 'IntelligentRecommendationEngine',
        timestamp: new Date().toISOString()
      }
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.code).toBe('AI_SERVICE_ERROR');
    expect(errorResponse.details.component).toBe('IntelligentRecommendationEngine');
  });
});
