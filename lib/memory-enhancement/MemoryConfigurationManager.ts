/**
 * 記憶配置管理器
 * 基於 WordWall 分析的記憶增強配置
 */

import { MemoryConfiguration, MemoryEnhancementEngine } from './MemoryEnhancementEngine';

export interface TemplateMemoryMapping {
  templateId: string;
  templateName: string;
  primaryMemoryType: string;
  secondaryMemoryTypes: string[];
  optimalConfiguration: MemoryConfiguration;
  enhancementFeatures: string[];
  scientificBasis: string[];
}

export class MemoryConfigurationManager {
  private engine: MemoryEnhancementEngine;
  private templateMappings: Map<string, TemplateMemoryMapping> = new Map();

  constructor() {
    this.engine = new MemoryEnhancementEngine();
    this.initializeTemplateMappings();
  }

  /**
   * 初始化基於 25 個 WordWall 模板分析的記憶映射
   */
  private initializeTemplateMappings(): void {
    const mappings: TemplateMemoryMapping[] = [
      {
        templateId: 'quiz',
        templateName: 'Quiz',
        primaryMemoryType: 'recognition',
        secondaryMemoryTypes: ['semantic'],
        optimalConfiguration: this.engine.getOptimalConfiguration('quiz'),
        enhancementFeatures: ['多選項設計', '干擾項優化', '即時反饋', '成就系統'],
        scientificBasis: ['識別記憶優於回憶記憶', '多選項降低認知負荷', '即時反饋增強學習']
      },
      {
        templateId: 'gameshow-quiz',
        templateName: 'Gameshow Quiz',
        primaryMemoryType: 'stress-enhanced',
        secondaryMemoryTypes: ['recognition', 'emotional'],
        optimalConfiguration: {
          primaryMemoryType: 'stress-enhanced',
          secondaryMemoryTypes: ['recognition', 'emotional'],
          difficultyLevel: 4,
          timeConstraints: { enabled: true, duration: 30, pressureLevel: 'high' },
          repetitionSettings: { spacedRepetition: false, intervalMultiplier: 1.0, maxRepetitions: 1 },
          feedbackMechanisms: { immediate: true, delayed: false, explanatory: true, emotional: true },
          visualEnhancements: { progressiveReveal: false, colorCoding: true, spatialArrangement: false, animationEffects: true },
          competitiveElements: { enabled: true, buzzInSystem: true, leaderboard: true, achievements: true }
        },
        enhancementFeatures: ['時間壓力', '競爭機制', '生命值系統', '獎勵機制', '音效反饋'],
        scientificBasis: ['壓力激素增強記憶鞏固', '競爭激發多巴胺釋放', '情緒記憶更持久']
      },
      {
        templateId: 'matching-pairs',
        templateName: 'Matching Pairs',
        primaryMemoryType: 'spatial',
        secondaryMemoryTypes: ['working', 'episodic'],
        optimalConfiguration: {
          primaryMemoryType: 'spatial',
          secondaryMemoryTypes: ['working', 'episodic'],
          difficultyLevel: 3,
          timeConstraints: { enabled: false, duration: 0, pressureLevel: 'low' },
          repetitionSettings: { spacedRepetition: true, intervalMultiplier: 1.8, maxRepetitions: 4 },
          feedbackMechanisms: { immediate: true, delayed: false, explanatory: false, emotional: true },
          visualEnhancements: { progressiveReveal: true, colorCoding: false, spatialArrangement: true, animationEffects: true },
          competitiveElements: { enabled: false, buzzInSystem: false, leaderboard: false, achievements: true }
        },
        enhancementFeatures: ['空間記憶', '翻轉動畫', '配對反饋', '記憶宮殿技巧'],
        scientificBasis: ['海馬體空間記憶機制', '視覺空間工作記憶', '位置編碼效應']
      },
      {
        templateId: 'anagram',
        templateName: 'Anagram',
        primaryMemoryType: 'reconstructive',
        secondaryMemoryTypes: ['orthographic', 'working'],
        optimalConfiguration: {
          primaryMemoryType: 'reconstructive',
          secondaryMemoryTypes: ['orthographic', 'working'],
          difficultyLevel: 3,
          timeConstraints: { enabled: true, duration: 120, pressureLevel: 'medium' },
          repetitionSettings: { spacedRepetition: true, intervalMultiplier: 1.6, maxRepetitions: 3 },
          feedbackMechanisms: { immediate: true, delayed: false, explanatory: true, emotional: false },
          visualEnhancements: { progressiveReveal: false, colorCoding: true, spatialArrangement: true, animationEffects: true },
          competitiveElements: { enabled: false, buzzInSystem: false, leaderboard: false, achievements: true }
        },
        enhancementFeatures: ['拖拽重排', '字母提示', '拼寫檢查', '漸進難度'],
        scientificBasis: ['重構記憶激活前額葉', '拼寫記憶視覺詞形區', '工作記憶容量限制']
      },
      {
        templateId: 'hangman',
        templateName: 'Hangman',
        primaryMemoryType: 'generative',
        secondaryMemoryTypes: ['orthographic', 'risk-decision'],
        optimalConfiguration: {
          primaryMemoryType: 'generative',
          secondaryMemoryTypes: ['orthographic', 'risk-decision'],
          difficultyLevel: 3,
          timeConstraints: { enabled: false, duration: 0, pressureLevel: 'low' },
          repetitionSettings: { spacedRepetition: true, intervalMultiplier: 2.0, maxRepetitions: 3 },
          feedbackMechanisms: { immediate: true, delayed: false, explanatory: true, emotional: true },
          visualEnhancements: { progressiveReveal: true, colorCoding: true, spatialArrangement: false, animationEffects: true },
          competitiveElements: { enabled: false, buzzInSystem: false, leaderboard: false, achievements: true }
        },
        enhancementFeatures: ['生成記憶', '風險評估', '漸進揭示', '錯誤學習'],
        scientificBasis: ['生成效應增強記憶', '錯誤學習促進鞏固', '風險決策前額葉激活']
      },
      {
        templateId: 'match-up',
        templateName: 'Match up',
        primaryMemoryType: 'associative',
        secondaryMemoryTypes: ['semantic', 'spatial'],
        optimalConfiguration: {
          primaryMemoryType: 'associative',
          secondaryMemoryTypes: ['semantic', 'spatial'],
          difficultyLevel: 2,
          timeConstraints: { enabled: false, duration: 0, pressureLevel: 'low' },
          repetitionSettings: { spacedRepetition: true, intervalMultiplier: 1.5, maxRepetitions: 4 },
          feedbackMechanisms: { immediate: true, delayed: false, explanatory: true, emotional: false },
          visualEnhancements: { progressiveReveal: false, colorCoding: true, spatialArrangement: true, animationEffects: true },
          competitiveElements: { enabled: false, buzzInSystem: false, leaderboard: false, achievements: true }
        },
        enhancementFeatures: ['關聯學習', '拖拽配對', '語義網絡', '視覺連線'],
        scientificBasis: ['關聯記憶海馬體機制', '語義網絡顳葉激活', '拖拽操作運動記憶']
      },
      {
        templateId: 'open-box',
        templateName: 'Open the box',
        primaryMemoryType: 'emotional',
        secondaryMemoryTypes: ['reveal', 'random-reinforcement'],
        optimalConfiguration: {
          primaryMemoryType: 'emotional',
          secondaryMemoryTypes: ['reveal', 'random-reinforcement'],
          difficultyLevel: 1,
          timeConstraints: { enabled: false, duration: 0, pressureLevel: 'low' },
          repetitionSettings: { spacedRepetition: false, intervalMultiplier: 1.0, maxRepetitions: 1 },
          feedbackMechanisms: { immediate: true, delayed: false, explanatory: false, emotional: true },
          visualEnhancements: { progressiveReveal: true, colorCoding: true, spatialArrangement: false, animationEffects: true },
          competitiveElements: { enabled: false, buzzInSystem: false, leaderboard: false, achievements: true }
        },
        enhancementFeatures: ['驚喜機制', '情緒反饋', '隨機獎勵', '開箱動畫'],
        scientificBasis: ['情緒記憶杏仁核增強', '驚喜效應多巴胺釋放', '隨機強化學習理論']
      },
      {
        templateId: 'flash-cards',
        templateName: 'Flash cards',
        primaryMemoryType: 'active-recall',
        secondaryMemoryTypes: ['spaced-repetition', 'semantic'],
        optimalConfiguration: {
          primaryMemoryType: 'active-recall',
          secondaryMemoryTypes: ['spaced-repetition', 'semantic'],
          difficultyLevel: 2,
          timeConstraints: { enabled: false, duration: 0, pressureLevel: 'low' },
          repetitionSettings: { spacedRepetition: true, intervalMultiplier: 2.5, maxRepetitions: 8 },
          feedbackMechanisms: { immediate: true, delayed: true, explanatory: true, emotional: false },
          visualEnhancements: { progressiveReveal: true, colorCoding: false, spatialArrangement: false, animationEffects: true },
          competitiveElements: { enabled: false, buzzInSystem: false, leaderboard: false, achievements: true }
        },
        enhancementFeatures: ['主動回憶', '間隔重複', '翻轉動畫', '難度調節'],
        scientificBasis: ['主動回憶測試效應', '間隔重複遺忘曲線', '檢索練習記憶鞏固']
      },
      {
        templateId: 'image-quiz',
        templateName: 'Image quiz',
        primaryMemoryType: 'visual-recognition',
        secondaryMemoryTypes: ['progressive-revelation', 'speed-decision'],
        optimalConfiguration: this.engine.getOptimalConfiguration('image-quiz'),
        enhancementFeatures: ['漸進揭示', '搶答系統', '視覺識別', '競爭機制'],
        scientificBasis: ['視覺識別顳葉下部', '漸進處理視覺皮層', '競爭機制多巴胺']
      },
      {
        templateId: 'whack-a-mole',
        templateName: 'Whack-a-mole',
        primaryMemoryType: 'reaction-speed',
        secondaryMemoryTypes: ['target-selection', 'binary-decision'],
        optimalConfiguration: this.engine.getOptimalConfiguration('whack-a-mole'),
        enhancementFeatures: ['反應訓練', '目標選擇', '時間壓力', '動作記憶'],
        scientificBasis: ['反應速度小腦機制', '選擇性注意頂葉', '時間壓力前額葉']
      }
    ];

    mappings.forEach(mapping => {
      this.templateMappings.set(mapping.templateId, mapping);
    });
  }

  /**
   * 獲取模板的記憶映射
   */
  public getTemplateMapping(templateId: string): TemplateMemoryMapping | undefined {
    return this.templateMappings.get(templateId);
  }

  /**
   * 獲取所有模板映射
   */
  public getAllTemplateMappings(): TemplateMemoryMapping[] {
    return Array.from(this.templateMappings.values());
  }

  /**
   * 根據記憶類型獲取相關模板
   */
  public getTemplatesByMemoryType(memoryType: string): TemplateMemoryMapping[] {
    return this.getAllTemplateMappings().filter(mapping => 
      mapping.primaryMemoryType === memoryType || 
      mapping.secondaryMemoryTypes.includes(memoryType)
    );
  }

  /**
   * 根據難度級別獲取模板
   */
  public getTemplatesByDifficulty(level: number): TemplateMemoryMapping[] {
    return this.getAllTemplateMappings().filter(mapping => 
      mapping.optimalConfiguration.difficultyLevel === level
    );
  }

  /**
   * 獲取支持時間壓力的模板
   */
  public getTimePressureTemplates(): TemplateMemoryMapping[] {
    return this.getAllTemplateMappings().filter(mapping => 
      mapping.optimalConfiguration.timeConstraints.enabled
    );
  }

  /**
   * 獲取支持競爭機制的模板
   */
  public getCompetitiveTemplates(): TemplateMemoryMapping[] {
    return this.getAllTemplateMappings().filter(mapping => 
      mapping.optimalConfiguration.competitiveElements.enabled
    );
  }

  /**
   * 根據認知負荷獲取推薦模板
   */
  public getTemplatesByCognitiveLoad(load: 'low' | 'medium' | 'high'): TemplateMemoryMapping[] {
    return this.getAllTemplateMappings().filter(mapping => {
      const memoryType = this.engine.getMemoryType(mapping.primaryMemoryType);
      return memoryType?.cognitiveLoad === load;
    });
  }

  /**
   * 生成個性化學習路徑
   */
  public generateLearningPath(
    userLevel: number, 
    preferredMemoryTypes: string[], 
    timeAvailable: number
  ): TemplateMemoryMapping[] {
    let availableTemplates = this.getAllTemplateMappings();

    // 根據用戶級別篩選
    availableTemplates = availableTemplates.filter(template => 
      template.optimalConfiguration.difficultyLevel <= userLevel + 1
    );

    // 根據偏好記憶類型篩選
    if (preferredMemoryTypes.length > 0) {
      availableTemplates = availableTemplates.filter(template =>
        preferredMemoryTypes.some(type => 
          template.primaryMemoryType === type || 
          template.secondaryMemoryTypes.includes(type)
        )
      );
    }

    // 根據時間限制篩選
    if (timeAvailable < 10) {
      availableTemplates = availableTemplates.filter(template =>
        !template.optimalConfiguration.timeConstraints.enabled ||
        template.optimalConfiguration.timeConstraints.duration <= timeAvailable * 60
      );
    }

    // 按記憶效果排序（優先選擇間隔重複和主動回憶）
    availableTemplates.sort((a, b) => {
      const aScore = this.calculateMemoryEffectivenessScore(a);
      const bScore = this.calculateMemoryEffectivenessScore(b);
      return bScore - aScore;
    });

    return availableTemplates.slice(0, 5); // 返回前5個推薦模板
  }

  /**
   * 計算記憶效果評分
   */
  private calculateMemoryEffectivenessScore(mapping: TemplateMemoryMapping): number {
    let score = 0;
    const config = mapping.optimalConfiguration;

    // 間隔重複加分
    if (config.repetitionSettings.spacedRepetition) score += 3;
    
    // 主動回憶加分
    if (mapping.primaryMemoryType === 'active-recall') score += 3;
    
    // 多感官加分
    if (mapping.secondaryMemoryTypes.length > 1) score += 2;
    
    // 即時反饋加分
    if (config.feedbackMechanisms.immediate) score += 2;
    
    // 情緒增強加分
    if (config.feedbackMechanisms.emotional) score += 1;
    
    // 視覺增強加分
    if (config.visualEnhancements.progressiveReveal || 
        config.visualEnhancements.animationEffects) score += 1;

    return score;
  }

  /**
   * 獲取記憶增強引擎
   */
  public getEngine(): MemoryEnhancementEngine {
    return this.engine;
  }
}
