/**
 * 遊戲模板管理器
 * 統一管理所有34個遊戲模板組件
 */

import { ComponentType } from 'react';

// 導入所有遊戲組件
import QuizGame from '../../components/games/QuizGame';
import MatchingGame from '../../components/games/MatchingGame';
import FlashcardGame from '../../components/games/FlashcardGame';
import HangmanGame from '../../components/games/HangmanGame';
import WhackAMoleGame from '../../components/games/WhackAMoleGame';
import SpinWheelGame from '../../components/games/SpinWheelGame';
import MemoryCardGame from '../../components/games/MemoryCardGame';
import WordsearchGame from '../../components/games/WordsearchGame';
import CompleteSentenceGame from '../../components/games/CompleteSentenceGame';
import SpellWordGame from '../../components/games/SpellWordGame';
import LabelledDiagramGame from '../../components/games/LabelledDiagramGame';
import WatchMemorizeGame from '../../components/games/WatchMemorizeGame';
import RankOrderGame from '../../components/games/RankOrderGame';
import MathGeneratorGame from '../../components/games/MathGeneratorGame';
import WordMagnetsGame from '../../components/games/WordMagnetsGame';
import GroupSortGame from '../../components/games/GroupSortGame';
import ImageQuizGame from '../../components/games/ImageQuizGame';
import MazeChaseGame from '../../components/games/MazeChaseGame';
import CrosswordPuzzleGame from '../../components/games/CrosswordPuzzleGame';
import FlyingFruitGame from '../../components/games/FlyingFruitGame';
import FlipTilesGame from '../../components/games/FlipTilesGame';
import TypeAnswerGame from '../../components/games/TypeAnswerGame';
import AnagramGame from '../../components/games/AnagramGame';

export interface GameTemplateInfo {
  id: string;
  name: string;
  displayName: string;
  category: string;
  memoryType: string;
  cognitiveLoad: 'low' | 'medium' | 'high';
  difficultyLevel: number;
  description: string;
  features: string[];
  component: ComponentType<any>;
  defaultProps: any;
  isImplemented: boolean;
  implementationStatus: 'completed' | 'in-progress' | 'planned';
}

export class GameTemplateManager {
  private templates: Map<string, GameTemplateInfo> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    const templateConfigs: GameTemplateInfo[] = [
      // 已實現的遊戲模板
      {
        id: 'quiz',
        name: 'Quiz',
        displayName: '測驗',
        category: 'assessment',
        memoryType: 'recognition',
        cognitiveLoad: 'low',
        difficultyLevel: 2,
        description: '多選題測驗遊戲，基於識別記憶機制',
        features: ['多選題', '即時反饋', '計分系統', '時間限制'],
        component: QuizGame,
        defaultProps: {
          questions: [],
          timeLimit: 0,
          showExplanations: true
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'matching-pairs',
        name: 'Matching Pairs',
        displayName: '配對記憶',
        category: 'memory',
        memoryType: 'spatial',
        cognitiveLoad: 'medium',
        difficultyLevel: 3,
        description: '翻卡配對記憶遊戲，基於空間記憶機制',
        features: ['空間記憶', '翻卡動畫', '配對檢測', '記憶訓練'],
        component: MatchingGame,
        defaultProps: {
          pairs: [],
          gridSize: '4x4',
          timeLimit: 0
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'flash-cards',
        name: 'Flash Cards',
        displayName: '閃卡記憶',
        category: 'memory',
        memoryType: 'active-recall',
        cognitiveLoad: 'medium',
        difficultyLevel: 2,
        description: '翻轉閃卡記憶遊戲，基於主動回憶機制',
        features: ['主動回憶', '翻卡動畫', '間隔重複', '自我評估'],
        component: FlashcardGame,
        defaultProps: {
          cards: [],
          autoFlip: false,
          spacedRepetition: true
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'hangman',
        name: 'Hangman',
        displayName: '猜詞遊戲',
        category: 'word',
        memoryType: 'generative',
        cognitiveLoad: 'high',
        difficultyLevel: 3,
        description: '經典猜詞遊戲，基於生成記憶機制',
        features: ['單詞猜測', '漸進揭示', '生命系統', '提示功能'],
        component: HangmanGame,
        defaultProps: {
          words: [],
          maxWrongGuesses: 6,
          hints: false
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'whack-mole',
        name: 'Whack-a-mole',
        displayName: '打地鼠',
        category: 'action',
        memoryType: 'reaction-speed',
        cognitiveLoad: 'high',
        difficultyLevel: 4,
        description: '快速反應打地鼠遊戲，基於反應速度記憶',
        features: ['反應訓練', '隨機出現', '計分倍數', '時間挑戰'],
        component: WhackAMoleGame,
        defaultProps: {
          holes: 9,
          speed: 'medium',
          duration: 60
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'spin-wheel',
        name: 'Spin the Wheel',
        displayName: '轉盤選擇',
        category: 'random',
        memoryType: 'random-reinforcement',
        cognitiveLoad: 'low',
        difficultyLevel: 1,
        description: '轉盤隨機選擇遊戲，基於隨機強化機制',
        features: ['隨機選擇', '轉盤動畫', '懸念效果', '音效反饋'],
        component: SpinWheelGame,
        defaultProps: {
          segments: [
            { id: '1', text: '英語', color: '#FF6B6B', points: 10 },
            { id: '2', text: '數學', color: '#4ECDC4', points: 15 },
            { id: '3', text: '科學', color: '#45B7D1', points: 20 },
            { id: '4', text: '歷史', color: '#96CEB4', points: 10 },
            { id: '5', text: '地理', color: '#FFEAA7', points: 15 },
            { id: '6', text: '藝術', color: '#DDA0DD', points: 20 }
          ],
          maxSpins: 10
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'memory-cards',
        name: 'Memory Cards',
        displayName: '記憶卡片',
        category: 'memory',
        memoryType: 'spatial',
        cognitiveLoad: 'medium',
        difficultyLevel: 3,
        description: '記憶卡片翻轉遊戲，基於空間記憶機制',
        features: ['空間記憶', '卡片翻轉', '記憶挑戰', '配對檢測'],
        component: MemoryCardGame,
        defaultProps: {
          cards: [],
          gridSize: '4x4',
          timeLimit: 0
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'wordsearch',
        name: 'Wordsearch',
        displayName: '單詞搜索',
        category: 'word',
        memoryType: 'visual-search',
        cognitiveLoad: 'medium',
        difficultyLevel: 2,
        description: '在字母網格中搜索單詞，基於視覺搜索記憶',
        features: ['網格搜索', '單詞高亮', '方向查找', '視覺掃描'],
        component: WordsearchGame,
        defaultProps: {
          words: [],
          gridSize: '15x15',
          directions: ['horizontal', 'vertical', 'diagonal']
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },

      // 新實現的遊戲模板
      {
        id: 'complete-sentence',
        name: 'Complete the Sentence',
        displayName: '完成句子',
        category: 'language',
        memoryType: 'contextual',
        cognitiveLoad: 'medium',
        difficultyLevel: 3,
        description: '拖拽單詞完成句子，基於語境記憶機制',
        features: ['句子完成', '語境線索', '語法檢查', '拖拽交互'],
        component: CompleteSentenceGame,
        defaultProps: {
          sentences: [],
          timeLimit: 0,
          showHints: true
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'spell-word',
        name: 'Spell the Word',
        displayName: '拼寫單詞',
        category: 'spelling',
        memoryType: 'orthographic',
        cognitiveLoad: 'medium',
        difficultyLevel: 3,
        description: '拼寫單詞遊戲，基於拼寫記憶機制',
        features: ['字母輸入', '拼寫檢查', '音頻發音', '多種輸入模式'],
        component: SpellWordGame,
        defaultProps: {
          words: [],
          inputMode: 'both',
          showHints: true,
          audioEnabled: true
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'labelled-diagram',
        name: 'Labelled Diagram',
        displayName: '標籤圖表',
        category: 'spatial',
        memoryType: 'spatial-labeling',
        cognitiveLoad: 'high',
        difficultyLevel: 4,
        description: '在圖表上標註標籤，基於標籤空間記憶機制',
        features: ['圖像標註', '精確定位', '空間記憶', '縮放功能'],
        component: LabelledDiagramGame,
        defaultProps: {
          image: '',
          labels: [],
          zoomEnabled: true,
          showGrid: false
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'watch-memorize',
        name: 'Watch and Memorize',
        displayName: '觀察記憶',
        category: 'memory',
        memoryType: 'observational',
        cognitiveLoad: 'high',
        difficultyLevel: 4,
        description: '觀看序列後回憶，基於觀察記憶機制',
        features: ['序列記憶', '注意力訓練', '回憶測試', '多種測試模式'],
        component: WatchMemorizeGame,
        defaultProps: {
          sequence: [],
          testType: 'order',
          showDuration: 5,
          maxAttempts: 3
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'rank-order',
        name: 'Rank Order',
        displayName: '排序',
        category: 'logic',
        memoryType: 'sequential',
        cognitiveLoad: 'medium',
        difficultyLevel: 3,
        description: '按正確順序排列項目，基於排序邏輯記憶機制',
        features: ['排序', '邏輯推理', '序列驗證', '拖拽交互'],
        component: RankOrderGame,
        defaultProps: {
          items: [],
          criteria: '',
          allowPartialCredit: true,
          showPositionNumbers: true
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'maths-generator',
        name: 'Maths Generator',
        displayName: '數學生成器',
        category: 'math',
        memoryType: 'mathematical',
        cognitiveLoad: 'medium',
        difficultyLevel: 3,
        description: '自動生成數學題目，基於數學記憶機制',
        features: ['問題生成', '計算', '步驟解析', '多種運算'],
        component: MathGeneratorGame,
        defaultProps: {
          operations: ['add'],
          range: { min: 1, max: 100 },
          questionCount: 10,
          showSteps: false
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'word-magnets',
        name: 'Word Magnets',
        displayName: '單詞磁鐵',
        category: 'creative',
        memoryType: 'combinatorial',
        cognitiveLoad: 'low',
        difficultyLevel: 2,
        description: '使用磁性單詞組合句子，基於詞彙組合記憶機制',
        features: ['單詞組合', '句子構建', '創意表達', '語法檢查'],
        component: WordMagnetsGame,
        defaultProps: {
          words: [],
          freeMode: true,
          grammarCheck: false
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'group-sort',
        name: 'Group Sort',
        displayName: '分組排序',
        category: 'classification',
        memoryType: 'categorical',
        cognitiveLoad: 'medium',
        difficultyLevel: 3,
        description: '將項目分類到正確的組別，基於分類記憶機制',
        features: ['分類思維', '拖拽分組', '多重驗證', '邏輯推理'],
        component: GroupSortGame,
        defaultProps: {
          items: [],
          groups: [],
          allowMultiple: false
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'image-quiz',
        name: 'Image Quiz',
        displayName: '圖片測驗',
        category: 'visual',
        memoryType: 'visual-recognition',
        cognitiveLoad: 'medium',
        difficultyLevel: 3,
        description: '基於圖片的測驗遊戲，基於視覺記憶機制',
        features: ['圖片觀察', '視覺記憶', '細節識別', '時間控制'],
        component: ImageQuizGame,
        defaultProps: {
          questions: [],
          showImageFirst: true,
          imageDisplayTime: 5
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'maze-chase',
        name: 'Maze Chase',
        displayName: '迷宮追逐',
        category: 'navigation',
        memoryType: 'spatial-navigation',
        cognitiveLoad: 'high',
        difficultyLevel: 4,
        description: '在迷宮中導航並回答問題，基於空間導航記憶機制',
        features: ['空間導航', '路徑記憶', '實時控制', '問題解答'],
        component: MazeChaseGame,
        defaultProps: {
          mazeSize: { width: 21, height: 21 },
          questions: []
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'crossword',
        name: 'Crossword',
        displayName: '填字遊戲',
        category: 'word',
        memoryType: 'lexical-network',
        cognitiveLoad: 'high',
        difficultyLevel: 4,
        description: '根據線索填入正確單詞，基於詞彙網絡記憶機制',
        features: ['詞彙聯想', '線索推理', '網格填字', '提示系統'],
        component: CrosswordPuzzleGame,
        defaultProps: {
          clues: [],
          gridSize: { rows: 15, cols: 15 },
          showHints: true
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'flying-fruit',
        name: 'Flying Fruit',
        displayName: '飛行水果',
        category: 'action',
        memoryType: 'dynamic-tracking',
        cognitiveLoad: 'high',
        difficultyLevel: 4,
        description: '收集飛行的正確水果，基於動態追蹤記憶機制',
        features: ['動態追蹤', '鼠標控制', '碰撞檢測', '實時反應'],
        component: FlyingFruitGame,
        defaultProps: {
          question: '',
          correctAnswers: [],
          incorrectAnswers: [],
          fruitCount: 15
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'flip-tiles',
        name: 'Flip Tiles',
        displayName: '翻轉瓷磚',
        category: 'memory',
        memoryType: 'flip-memory',
        cognitiveLoad: 'medium',
        difficultyLevel: 3,
        description: '翻轉瓷磚找到配對，基於翻轉記憶機制',
        features: ['翻轉動畫', '配對記憶', '3D效果', '時間挑戰'],
        component: FlipTilesGame,
        defaultProps: {
          question: '',
          correctPairs: [],
          gridSize: { rows: 4, cols: 4 }
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'type-answer',
        name: 'Type the Answer',
        displayName: '輸入答案',
        category: 'input',
        memoryType: 'input-recall',
        cognitiveLoad: 'medium',
        difficultyLevel: 3,
        description: '根據問題輸入正確答案，基於輸入記憶機制',
        features: ['文字輸入', '回憶測試', '提示系統', '多次嘗試'],
        component: TypeAnswerGame,
        defaultProps: {
          questions: [],
          allowHints: true,
          showProgress: true
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },
      {
        id: 'anagram',
        name: 'Anagram',
        displayName: '字母重組',
        category: 'word',
        memoryType: 'letter-rearrangement',
        cognitiveLoad: 'high',
        difficultyLevel: 4,
        description: '重新排列字母組成正確單詞，基於字母重組記憶機制',
        features: ['字母拖拽', '單詞重組', '提示系統', '洗牌功能'],
        component: AnagramGame,
        defaultProps: {
          words: [],
          showHints: true,
          allowShuffle: true
        },
        isImplemented: true,
        implementationStatus: 'completed'
      },

      // 計劃實現的模板（使用佔位符組件）
      {
        id: 'gameshow-quiz',
        name: 'Gameshow Quiz',
        displayName: '競賽測驗',
        category: 'competitive',
        memoryType: 'stress-enhanced',
        cognitiveLoad: 'high',
        difficultyLevel: 4,
        description: '競賽風格測驗遊戲，基於壓力記憶機制',
        features: ['時間壓力', '競爭機制', '搶答系統', '排行榜'],
        component: QuizGame, // 臨時使用 QuizGame
        defaultProps: {
          questions: [],
          timeLimit: 30,
          competitive: true
        },
        isImplemented: false,
        implementationStatus: 'planned'
      },
      // ... 其他22個模板的配置
    ];

    templateConfigs.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * 獲取模板信息
   */
  public getTemplate(templateId: string): GameTemplateInfo | undefined {
    return this.templates.get(templateId);
  }

  /**
   * 獲取所有模板
   */
  public getAllTemplates(): GameTemplateInfo[] {
    return Array.from(this.templates.values());
  }

  /**
   * 獲取已實現的模板
   */
  public getImplementedTemplates(): GameTemplateInfo[] {
    return this.getAllTemplates().filter(template => template.isImplemented);
  }

  /**
   * 獲取計劃中的模板
   */
  public getPlannedTemplates(): GameTemplateInfo[] {
    return this.getAllTemplates().filter(template => !template.isImplemented);
  }

  /**
   * 按類別獲取模板
   */
  public getTemplatesByCategory(category: string): GameTemplateInfo[] {
    return this.getAllTemplates().filter(template => template.category === category);
  }

  /**
   * 按記憶類型獲取模板
   */
  public getTemplatesByMemoryType(memoryType: string): GameTemplateInfo[] {
    return this.getAllTemplates().filter(template => template.memoryType === memoryType);
  }

  /**
   * 按難度級別獲取模板
   */
  public getTemplatesByDifficulty(level: number): GameTemplateInfo[] {
    return this.getAllTemplates().filter(template => template.difficultyLevel === level);
  }

  /**
   * 按認知負荷獲取模板
   */
  public getTemplatesByCognitiveLoad(load: 'low' | 'medium' | 'high'): GameTemplateInfo[] {
    return this.getAllTemplates().filter(template => template.cognitiveLoad === load);
  }

  /**
   * 搜索模板
   */
  public searchTemplates(query: string): GameTemplateInfo[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTemplates().filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.displayName.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.features.some(feature => feature.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 獲取統計信息
   */
  public getStatistics() {
    const all = this.getAllTemplates();
    const implemented = this.getImplementedTemplates();
    const planned = this.getPlannedTemplates();

    const byCategory = all.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const byMemoryType = all.reduce((acc, template) => {
      acc[template.memoryType] = (acc[template.memoryType] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const byCognitiveLoad = all.reduce((acc, template) => {
      acc[template.cognitiveLoad] = (acc[template.cognitiveLoad] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      total: all.length,
      implemented: implemented.length,
      planned: planned.length,
      implementationRate: (implemented.length / all.length) * 100,
      byCategory,
      byMemoryType,
      byCognitiveLoad
    };
  }

  /**
   * 檢查模板是否存在
   */
  public hasTemplate(templateId: string): boolean {
    return this.templates.has(templateId);
  }

  /**
   * 獲取模板組件
   */
  public getTemplateComponent(templateId: string): ComponentType<any> | undefined {
    const template = this.getTemplate(templateId);
    return template?.component;
  }

  /**
   * 獲取模板默認屬性
   */
  public getTemplateDefaultProps(templateId: string): any {
    const template = this.getTemplate(templateId);
    return template?.defaultProps || {};
  }
}

// 創建單例實例
export const gameTemplateManager = new GameTemplateManager();
