/**
 * EduCreate 記憶增強引擎
 * 基於 25 個 WordWall 模板分析的記憶科學原理
 */

export interface MemoryType {
  id: string;
  name: string;
  description: string;
  cognitiveLoad: 'low' | 'medium' | 'high';
  memorySystem: 'working' | 'short-term' | 'long-term' | 'procedural' | 'episodic';
  neuralBasis: string[];
  enhancementStrategies: string[];
}

export interface MemoryConfiguration {
  primaryMemoryType: string;
  secondaryMemoryTypes: string[];
  difficultyLevel: number; // 1-5
  timeConstraints: {
    enabled: boolean;
    duration: number; // seconds
    pressureLevel: 'low' | 'medium' | 'high';
  };
  repetitionSettings: {
    spacedRepetition: boolean;
    intervalMultiplier: number;
    maxRepetitions: number;
  };
  feedbackMechanisms: {
    immediate: boolean;
    delayed: boolean;
    explanatory: boolean;
    emotional: boolean;
  };
  visualEnhancements: {
    progressiveReveal: boolean;
    colorCoding: boolean;
    spatialArrangement: boolean;
    animationEffects: boolean;
  };
  competitiveElements: {
    enabled: boolean;
    buzzInSystem: boolean;
    leaderboard: boolean;
    achievements: boolean;
  };
}

export class MemoryEnhancementEngine {
  private memoryTypes: Map<string, MemoryType> = new Map();
  
  constructor() {
    this.initializeMemoryTypes();
  }

  /**
   * 初始化基於 WordWall 分析的 25 種記憶類型
   */
  private initializeMemoryTypes(): void {
    const memoryTypes: MemoryType[] = [
      {
        id: 'recognition',
        name: '識別記憶',
        description: '基於選擇的識別能力',
        cognitiveLoad: 'low',
        memorySystem: 'long-term',
        neuralBasis: ['前額葉皮層', '顳葉'],
        enhancementStrategies: ['多選項設計', '干擾項優化', '視覺提示']
      },
      {
        id: 'generative',
        name: '生成記憶',
        description: '主動生成和構建信息',
        cognitiveLoad: 'high',
        memorySystem: 'working',
        neuralBasis: ['前額葉皮層', '海馬體'],
        enhancementStrategies: ['漸進提示', '部分線索', '錯誤學習']
      },
      {
        id: 'reconstructive',
        name: '重構記憶',
        description: '重新組織和排列信息',
        cognitiveLoad: 'medium',
        memorySystem: 'working',
        neuralBasis: ['頂葉皮層', '前額葉皮層'],
        enhancementStrategies: ['拖拽交互', '視覺反饋', '步驟分解']
      },
      {
        id: 'spatial',
        name: '空間記憶',
        description: '空間位置和關係記憶',
        cognitiveLoad: 'medium',
        memorySystem: 'episodic',
        neuralBasis: ['海馬體', '頂葉皮層'],
        enhancementStrategies: ['空間布局', '位置編碼', '路徑記憶']
      },
      {
        id: 'stress-enhanced',
        name: '壓力記憶',
        description: '時間壓力下的記憶鞏固',
        cognitiveLoad: 'high',
        memorySystem: 'episodic',
        neuralBasis: ['杏仁核', '海馬體', '前額葉皮層'],
        enhancementStrategies: ['時間限制', '競爭機制', '獎勵系統']
      },
      {
        id: 'associative',
        name: '關聯記憶',
        description: '建立概念間的聯繫',
        cognitiveLoad: 'medium',
        memorySystem: 'long-term',
        neuralBasis: ['海馬體', '顳葉皮層'],
        enhancementStrategies: ['配對練習', '語義網絡', '類比學習']
      },
      {
        id: 'emotional',
        name: '情緒記憶',
        description: '情緒增強的記憶編碼',
        cognitiveLoad: 'low',
        memorySystem: 'episodic',
        neuralBasis: ['杏仁核', '海馬體'],
        enhancementStrategies: ['驚喜元素', '情緒反饋', '故事情境']
      },
      {
        id: 'active-recall',
        name: '主動回憶記憶',
        description: '主動檢索和回憶',
        cognitiveLoad: 'high',
        memorySystem: 'long-term',
        neuralBasis: ['前額葉皮層', '海馬體'],
        enhancementStrategies: ['間隔重複', '測試效應', '提取練習']
      },
      {
        id: 'visual-search',
        name: '視覺搜索記憶',
        description: '視覺信息的搜索和識別',
        cognitiveLoad: 'medium',
        memorySystem: 'working',
        neuralBasis: ['視覺皮層', '頂葉皮層'],
        enhancementStrategies: ['視覺突出', '搜索策略', '注意引導']
      },
      {
        id: 'sequential-reconstruction',
        name: '順序重構記憶',
        description: '序列信息的重新排列',
        cognitiveLoad: 'medium',
        memorySystem: 'working',
        neuralBasis: ['前額葉皮層', '頂葉皮層'],
        enhancementStrategies: ['序列提示', '邏輯關係', '時間順序']
      },
      {
        id: 'random-reinforcement',
        name: '隨機強化記憶',
        description: '隨機獎勵的記憶強化',
        cognitiveLoad: 'low',
        memorySystem: 'procedural',
        neuralBasis: ['基底神經節', '多巴胺系統'],
        enhancementStrategies: ['隨機獎勵', '變比強化', '驚喜機制']
      },
      {
        id: 'semantic',
        name: '語義記憶',
        description: '概念和意義的記憶',
        cognitiveLoad: 'medium',
        memorySystem: 'long-term',
        neuralBasis: ['顳葉皮層', '前額葉皮層'],
        enhancementStrategies: ['語義網絡', '概念圖', '關鍵詞提取']
      },
      {
        id: 'orthographic',
        name: '拼寫記憶',
        description: '文字形式和拼寫的記憶',
        cognitiveLoad: 'medium',
        memorySystem: 'long-term',
        neuralBasis: ['視覺詞形區', '顳葉皮層'],
        enhancementStrategies: ['字母組合', '拼寫規則', '視覺記憶']
      },
      {
        id: 'dynamic-tracking',
        name: '動態追蹤記憶',
        description: '移動目標的追蹤和記憶',
        cognitiveLoad: 'high',
        memorySystem: 'working',
        neuralBasis: ['頂葉皮層', '小腦'],
        enhancementStrategies: ['運動預測', '軌跡記憶', '反應訓練']
      },
      {
        id: 'target-selection',
        name: '目標選擇記憶',
        description: '特定目標的選擇和記憶',
        cognitiveLoad: 'medium',
        memorySystem: 'working',
        neuralBasis: ['前額葉皮層', '頂葉皮層'],
        enhancementStrategies: ['選擇性注意', '目標突出', '干擾抑制']
      },
      {
        id: 'reveal',
        name: '揭示記憶',
        description: '漸進揭示的記憶建構',
        cognitiveLoad: 'medium',
        memorySystem: 'episodic',
        neuralBasis: ['海馬體', '前額葉皮層'],
        enhancementStrategies: ['漸進揭示', '預期建立', '驚喜效應']
      },
      {
        id: 'risk-decision',
        name: '風險決策記憶',
        description: '風險評估的決策記憶',
        cognitiveLoad: 'high',
        memorySystem: 'working',
        neuralBasis: ['前額葉皮層', '前扣帶皮層'],
        enhancementStrategies: ['風險評估', '概率學習', '決策樹']
      },
      {
        id: 'binary-decision',
        name: '二元判斷記憶',
        description: '快速二元選擇的記憶',
        cognitiveLoad: 'low',
        memorySystem: 'procedural',
        neuralBasis: ['基底神經節', '前額葉皮層'],
        enhancementStrategies: ['快速反應', '直覺判斷', '模式識別']
      },
      {
        id: 'input-generation',
        name: '輸入生成記憶',
        description: '主動輸入和生成記憶',
        cognitiveLoad: 'high',
        memorySystem: 'working',
        neuralBasis: ['前額葉皮層', '運動皮層'],
        enhancementStrategies: ['輸入反饋', '自動完成', '錯誤糾正']
      },
      {
        id: 'spatial-navigation',
        name: '空間導航記憶',
        description: '空間導航和路徑記憶',
        cognitiveLoad: 'high',
        memorySystem: 'episodic',
        neuralBasis: ['海馬體', '內嗅皮層'],
        enhancementStrategies: ['路徑學習', '地標記憶', '空間地圖']
      },
      {
        id: 'reaction-speed',
        name: '反應速度記憶',
        description: '快速反應的記憶訓練',
        cognitiveLoad: 'medium',
        memorySystem: 'procedural',
        neuralBasis: ['小腦', '基底神經節'],
        enhancementStrategies: ['反應訓練', '速度漸進', '肌肉記憶']
      },
      {
        id: 'auditory',
        name: '語音記憶',
        description: '聽覺信息的記憶處理',
        cognitiveLoad: 'medium',
        memorySystem: 'working',
        neuralBasis: ['顳葉皮層', '聽覺皮層'],
        enhancementStrategies: ['聽覺循環', '語音編碼', '節奏記憶']
      },
      {
        id: 'categorical',
        name: '分類記憶',
        description: '分類和歸納的記憶',
        cognitiveLoad: 'medium',
        memorySystem: 'long-term',
        neuralBasis: ['前額葉皮層', '顳葉皮層'],
        enhancementStrategies: ['分類學習', '概念層次', '特徵提取']
      },
      {
        id: 'speed-decision',
        name: '速度決策記憶',
        description: '時間壓力下的快速決策',
        cognitiveLoad: 'high',
        memorySystem: 'working',
        neuralBasis: ['前額葉皮層', '前扣帶皮層'],
        enhancementStrategies: ['時間壓力', '快速判斷', '直覺決策']
      },
      {
        id: 'visual-recognition',
        name: '視覺識別記憶',
        description: '視覺模式的識別和記憶',
        cognitiveLoad: 'medium',
        memorySystem: 'long-term',
        neuralBasis: ['視覺皮層', '顳葉下部'],
        enhancementStrategies: ['漸進揭示', '模式完成', '視覺編碼']
      }
    ];

    memoryTypes.forEach(type => {
      this.memoryTypes.set(type.id, type);
    });
  }

  /**
   * 根據模板類型獲取最佳記憶配置
   */
  public getOptimalConfiguration(templateType: string): MemoryConfiguration {
    const configurations: { [key: string]: MemoryConfiguration } = {
      'quiz': {
        primaryMemoryType: 'recognition',
        secondaryMemoryTypes: ['semantic'],
        difficultyLevel: 2,
        timeConstraints: { enabled: false, duration: 0, pressureLevel: 'low' },
        repetitionSettings: { spacedRepetition: true, intervalMultiplier: 1.5, maxRepetitions: 5 },
        feedbackMechanisms: { immediate: true, delayed: false, explanatory: true, emotional: false },
        visualEnhancements: { progressiveReveal: false, colorCoding: true, spatialArrangement: false, animationEffects: false },
        competitiveElements: { enabled: false, buzzInSystem: false, leaderboard: false, achievements: true }
      },
      'image-quiz': {
        primaryMemoryType: 'visual-recognition',
        secondaryMemoryTypes: ['recognition', 'speed-decision'],
        difficultyLevel: 3,
        timeConstraints: { enabled: true, duration: 30, pressureLevel: 'medium' },
        repetitionSettings: { spacedRepetition: true, intervalMultiplier: 2.0, maxRepetitions: 3 },
        feedbackMechanisms: { immediate: true, delayed: false, explanatory: true, emotional: true },
        visualEnhancements: { progressiveReveal: true, colorCoding: false, spatialArrangement: false, animationEffects: true },
        competitiveElements: { enabled: true, buzzInSystem: true, leaderboard: true, achievements: true }
      },
      'whack-a-mole': {
        primaryMemoryType: 'reaction-speed',
        secondaryMemoryTypes: ['target-selection', 'binary-decision'],
        difficultyLevel: 4,
        timeConstraints: { enabled: true, duration: 60, pressureLevel: 'high' },
        repetitionSettings: { spacedRepetition: false, intervalMultiplier: 1.0, maxRepetitions: 1 },
        feedbackMechanisms: { immediate: true, delayed: false, explanatory: false, emotional: true },
        visualEnhancements: { progressiveReveal: false, colorCoding: true, spatialArrangement: true, animationEffects: true },
        competitiveElements: { enabled: true, buzzInSystem: false, leaderboard: true, achievements: true }
      }
      // 更多配置將在後續添加...
    };

    return configurations[templateType] || this.getDefaultConfiguration();
  }

  /**
   * 獲取默認記憶配置
   */
  private getDefaultConfiguration(): MemoryConfiguration {
    return {
      primaryMemoryType: 'recognition',
      secondaryMemoryTypes: [],
      difficultyLevel: 2,
      timeConstraints: { enabled: false, duration: 0, pressureLevel: 'low' },
      repetitionSettings: { spacedRepetition: true, intervalMultiplier: 1.5, maxRepetitions: 3 },
      feedbackMechanisms: { immediate: true, delayed: false, explanatory: true, emotional: false },
      visualEnhancements: { progressiveReveal: false, colorCoding: false, spatialArrangement: false, animationEffects: false },
      competitiveElements: { enabled: false, buzzInSystem: false, leaderboard: false, achievements: false }
    };
  }

  /**
   * 獲取記憶類型信息
   */
  public getMemoryType(id: string): MemoryType | undefined {
    return this.memoryTypes.get(id);
  }

  /**
   * 獲取所有記憶類型
   */
  public getAllMemoryTypes(): MemoryType[] {
    return Array.from(this.memoryTypes.values());
  }

  /**
   * 根據認知負荷篩選記憶類型
   */
  public getMemoryTypesByCognitiveLoad(load: 'low' | 'medium' | 'high'): MemoryType[] {
    return this.getAllMemoryTypes().filter(type => type.cognitiveLoad === load);
  }

  /**
   * 根據記憶系統篩選記憶類型
   */
  public getMemoryTypesBySystem(system: string): MemoryType[] {
    return this.getAllMemoryTypes().filter(type => type.memorySystem === system);
  }
}
