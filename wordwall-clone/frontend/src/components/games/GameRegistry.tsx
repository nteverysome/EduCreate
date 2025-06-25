import React from 'react';
import Quiz from './Quiz';
import MatchUp from './MatchUp';
import SpinWheel from './SpinWheel';
import GroupSort from './GroupSort';
import FlashCards from './FlashCards';
import Anagram from './Anagram';
import FindMatch from './FindMatch';
import OpenBox from './OpenBox';

// 遊戲模板類型定義
export type GameTemplateType = 
  | 'QUIZ'
  | 'MATCH_UP'
  | 'SPIN_WHEEL'
  | 'GROUP_SORT'
  | 'FLASH_CARDS'
  | 'ANAGRAM'
  | 'FIND_MATCH'
  | 'OPEN_BOX';

// 遊戲模板配置
export interface GameTemplate {
  id: GameTemplateType;
  name: string;
  description: string;
  icon: string;
  category: 'quiz' | 'matching' | 'sorting' | 'memory' | 'word' | 'random';
  difficulty: 'easy' | 'medium' | 'hard';
  features: string[];
  component: React.ComponentType<any>;
  isAvailable: boolean;
  minItems: number;
  maxItems: number;
  supportedContentTypes: string[];
  estimatedTime: string;
}

// 遊戲模板註冊表
export const gameTemplates: Record<GameTemplateType, GameTemplate> = {
  QUIZ: {
    id: 'QUIZ',
    name: '測驗',
    description: '多選題測驗，測試知識掌握程度',
    icon: '❓',
    category: 'quiz',
    difficulty: 'easy',
    features: ['多選題', '計時', '即時反饋', '分數統計'],
    component: Quiz,
    isAvailable: true,
    minItems: 1,
    maxItems: 50,
    supportedContentTypes: ['text', 'image'],
    estimatedTime: '5-15分鐘',
  },
  
  MATCH_UP: {
    id: 'MATCH_UP',
    name: '配對',
    description: '拖拽配對遊戲，連接相關的項目',
    icon: '🔗',
    category: 'matching',
    difficulty: 'medium',
    features: ['拖拽操作', '視覺配對', '多種佈局', '動畫效果'],
    component: MatchUp,
    isAvailable: true,
    minItems: 3,
    maxItems: 20,
    supportedContentTypes: ['text', 'image'],
    estimatedTime: '3-10分鐘',
  },
  
  SPIN_WHEEL: {
    id: 'SPIN_WHEEL',
    name: '轉盤',
    description: '旋轉轉盤選擇答案或做決定',
    icon: '🎡',
    category: 'random',
    difficulty: 'easy',
    features: ['隨機選擇', '自定義段落', '權重控制', '音效支持'],
    component: SpinWheel,
    isAvailable: true,
    minItems: 2,
    maxItems: 12,
    supportedContentTypes: ['text'],
    estimatedTime: '2-5分鐘',
  },
  
  GROUP_SORT: {
    id: 'GROUP_SORT',
    name: '分組排序',
    description: '將項目拖拽到正確的組別中',
    icon: '📂',
    category: 'sorting',
    difficulty: 'medium',
    features: ['拖拽分組', '多組別', '容量限制', '實時驗證'],
    component: GroupSort,
    isAvailable: true,
    minItems: 4,
    maxItems: 30,
    supportedContentTypes: ['text', 'image'],
    estimatedTime: '5-12分鐘',
  },
  
  FLASH_CARDS: {
    id: 'FLASH_CARDS',
    name: '閃卡',
    description: '翻轉卡片學習和記憶',
    icon: '🃏',
    category: 'memory',
    difficulty: 'easy',
    features: ['翻轉動畫', '間隔重複', '信心評估', '學習追蹤'],
    component: FlashCards,
    isAvailable: true,
    minItems: 1,
    maxItems: 100,
    supportedContentTypes: ['text', 'image'],
    estimatedTime: '10-30分鐘',
  },
  
  ANAGRAM: {
    id: 'ANAGRAM',
    name: '字謎重組',
    description: '重新排列字母組成正確的單詞',
    icon: '🔤',
    category: 'word',
    difficulty: 'hard',
    features: ['字母重組', '提示系統', '難度調節', '計時挑戰'],
    component: Anagram,
    isAvailable: true,
    minItems: 1,
    maxItems: 25,
    supportedContentTypes: ['text'],
    estimatedTime: '5-15分鐘',
  },
  
  FIND_MATCH: {
    id: 'FIND_MATCH',
    name: '找配對',
    description: '在網格中找到匹配的項目對',
    icon: '🔍',
    category: 'matching',
    difficulty: 'medium',
    features: ['記憶挑戰', '網格佈局', '翻轉動畫', '時間壓力'],
    component: FindMatch,
    isAvailable: true,
    minItems: 6,
    maxItems: 24,
    supportedContentTypes: ['text', 'image'],
    estimatedTime: '3-8分鐘',
  },
  
  OPEN_BOX: {
    id: 'OPEN_BOX',
    name: '開箱遊戲',
    description: '點擊打開盒子揭示隱藏的內容',
    icon: '📦',
    category: 'random',
    difficulty: 'easy',
    features: ['隨機揭示', '懸念效果', '獎勵機制', '驚喜元素'],
    component: OpenBox,
    isAvailable: true,
    minItems: 4,
    maxItems: 20,
    supportedContentTypes: ['text', 'image'],
    estimatedTime: '2-6分鐘',
  },
};

// 獲取可用的遊戲模板
export const getAvailableTemplates = (): GameTemplate[] => {
  return Object.values(gameTemplates).filter(template => template.isAvailable);
};

// 根據分類獲取模板
export const getTemplatesByCategory = (category: string): GameTemplate[] => {
  return Object.values(gameTemplates).filter(
    template => template.category === category && template.isAvailable
  );
};

// 根據難度獲取模板
export const getTemplatesByDifficulty = (difficulty: string): GameTemplate[] => {
  return Object.values(gameTemplates).filter(
    template => template.difficulty === difficulty && template.isAvailable
  );
};

// 獲取推薦模板
export const getRecommendedTemplates = (
  contentType: string,
  itemCount: number,
  targetTime?: string
): GameTemplate[] => {
  return Object.values(gameTemplates).filter(template => {
    if (!template.isAvailable) return false;
    
    // 檢查內容類型支持
    if (!template.supportedContentTypes.includes(contentType)) return false;
    
    // 檢查項目數量範圍
    if (itemCount < template.minItems || itemCount > template.maxItems) return false;
    
    return true;
  }).sort((a, b) => {
    // 按難度和受歡迎程度排序
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });
};

// 遊戲組件工廠
export const createGameComponent = (
  templateType: GameTemplateType,
  props: any
): React.ReactElement | null => {
  const template = gameTemplates[templateType];
  
  if (!template || !template.isAvailable) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">🚧</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            遊戲模板開發中
          </h3>
          <p className="text-gray-500">
            {template?.name || templateType} 即將推出
          </p>
        </div>
      </div>
    );
  }
  
  const GameComponent = template.component;
  return <GameComponent {...props} />;
};

// 驗證遊戲內容
export const validateGameContent = (
  templateType: GameTemplateType,
  content: any
): { isValid: boolean; errors: string[] } => {
  const template = gameTemplates[templateType];
  const errors: string[] = [];
  
  if (!template) {
    errors.push('未知的遊戲模板類型');
    return { isValid: false, errors };
  }
  
  if (!template.isAvailable) {
    errors.push('該遊戲模板暫不可用');
    return { isValid: false, errors };
  }
  
  // 根據不同模板類型驗證內容
  switch (templateType) {
    case 'QUIZ':
      if (!content.questions || !Array.isArray(content.questions)) {
        errors.push('測驗必須包含問題列表');
      } else if (content.questions.length < template.minItems) {
        errors.push(`至少需要 ${template.minItems} 個問題`);
      } else if (content.questions.length > template.maxItems) {
        errors.push(`最多支持 ${template.maxItems} 個問題`);
      }
      break;
      
    case 'MATCH_UP':
      if (!content.pairs || !Array.isArray(content.pairs)) {
        errors.push('配對遊戲必須包含配對列表');
      } else if (content.pairs.length < template.minItems) {
        errors.push(`至少需要 ${template.minItems} 個配對`);
      }
      break;
      
    case 'SPIN_WHEEL':
      if (!content.segments || !Array.isArray(content.segments)) {
        errors.push('轉盤必須包含段落列表');
      } else if (content.segments.length < template.minItems) {
        errors.push(`至少需要 ${template.minItems} 個段落`);
      }
      break;
      
    case 'GROUP_SORT':
      if (!content.groups || !content.items) {
        errors.push('分組排序必須包含組別和項目');
      } else if (content.items.length < template.minItems) {
        errors.push(`至少需要 ${template.minItems} 個項目`);
      }
      break;
      
    case 'FLASH_CARDS':
      if (!content.cards || !Array.isArray(content.cards)) {
        errors.push('閃卡必須包含卡片列表');
      } else if (content.cards.length < template.minItems) {
        errors.push(`至少需要 ${template.minItems} 張卡片`);
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 主要的遊戲註冊表導出
export const GameRegistry = gameTemplates;

export default {
  gameTemplates,
  getAvailableTemplates,
  getTemplatesByCategory,
  getTemplatesByDifficulty,
  getRecommendedTemplates,
  createGameComponent,
  validateGameContent,
};
