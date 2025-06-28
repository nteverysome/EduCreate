/**
 * 遊戲適配器系統 - 將統一內容轉換為各種遊戲格式
 * 模仿 wordwall.net 的內容適配模式
 */

import { UniversalContent, UniversalContentItem, GameType } from './UniversalContentManager';

// 各種遊戲的數據格式定義
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  image?: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
  leftImage?: string;
  rightImage?: string;
}

export interface FlashCard {
  id: string;
  front: string;
  back: string;
  frontImage?: string;
  backImage?: string;
  category?: string;
}

export interface SpinWheelItem {
  id: string;
  text: string;
  color?: string;
  weight?: number;
}

export interface WhackAMoleItem {
  id: string;
  text: string;
  isCorrect: boolean;
  points?: number;
}

export interface MemoryCard {
  id: string;
  content: string;
  matchId: string;
  type: 'term' | 'definition';
  image?: string;
}

export interface WordSearchWord {
  id: string;
  word: string;
  clue?: string;
}

export interface CrosswordClue {
  id: string;
  clue: string;
  answer: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
}

export interface FillBlankQuestion {
  id: string;
  sentence: string;
  blanks: { position: number; answer: string; options?: string[] }[];
}

export interface TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation?: string;
  image?: string;
}

export interface DragDropItem {
  id: string;
  content: string;
  category: string;
  image?: string;
}

export class GameAdapters {
  /**
   * 轉換為測驗問答格式
   */
  static toQuiz(content: UniversalContent): QuizQuestion[] {
    return content.items.map((item, index) => {
      // 創建錯誤選項
      const wrongOptions = content.items
        .filter((_, i) => i !== index)
        .map(i => i.definition)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [item.definition, ...wrongOptions].sort(() => Math.random() - 0.5);
      const correctAnswer = options.indexOf(item.definition);
      
      return {
        id: item.id,
        question: item.term,
        options,
        correctAnswer,
        explanation: `正確答案是：${item.definition}`,
        image: item.image
      };
    });
  }

  /**
   * 轉換為配對遊戲格式
   */
  static toMatching(content: UniversalContent): MatchingPair[] {
    return content.items.map(item => ({
      id: item.id,
      left: item.term,
      right: item.definition,
      leftImage: item.image
    }));
  }

  /**
   * 轉換為單字卡片格式
   */
  static toFlashCards(content: UniversalContent): FlashCard[] {
    return content.items.map(item => ({
      id: item.id,
      front: item.term,
      back: item.definition,
      frontImage: item.image,
      category: item.category
    }));
  }

  /**
   * 轉換為隨機轉盤格式
   */
  static toSpinWheel(content: UniversalContent): SpinWheelItem[] {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    return content.items.map((item, index) => ({
      id: item.id,
      text: item.term,
      color: colors[index % colors.length],
      weight: 1
    }));
  }

  /**
   * 轉換為打地鼠格式
   */
  static toWhackAMole(content: UniversalContent, targetTerm?: string): WhackAMoleItem[] {
    const target = targetTerm || content.items[Math.floor(Math.random() * content.items.length)].term;
    
    return content.items.map(item => ({
      id: item.id,
      text: item.term,
      isCorrect: item.term === target,
      points: item.term === target ? 10 : -5
    }));
  }

  /**
   * 轉換為記憶卡片格式
   */
  static toMemoryCards(content: UniversalContent): MemoryCard[] {
    const cards: MemoryCard[] = [];
    
    content.items.forEach(item => {
      cards.push(
        {
          id: `${item.id}_term`,
          content: item.term,
          matchId: item.id,
          type: 'term',
          image: item.image
        },
        {
          id: `${item.id}_def`,
          content: item.definition,
          matchId: item.id,
          type: 'definition'
        }
      );
    });
    
    return cards.sort(() => Math.random() - 0.5);
  }

  /**
   * 轉換為單字搜尋格式
   */
  static toWordSearch(content: UniversalContent): WordSearchWord[] {
    return content.items.map(item => ({
      id: item.id,
      word: item.term.replace(/\s+/g, '').toUpperCase(),
      clue: item.definition
    }));
  }

  /**
   * 轉換為填字遊戲格式
   */
  static toCrossword(content: UniversalContent): CrosswordClue[] {
    return content.items.map((item, index) => ({
      id: item.id,
      clue: item.definition,
      answer: item.term.replace(/\s+/g, '').toUpperCase(),
      direction: index % 2 === 0 ? 'across' : 'down',
      startRow: Math.floor(index / 2) + 1,
      startCol: (index % 2) + 1
    }));
  }

  /**
   * 轉換為填空題格式
   */
  static toFillBlank(content: UniversalContent): FillBlankQuestion[] {
    return content.items.map(item => {
      const sentence = `這個詞的意思是 ___，它是 ${item.term}。`;
      const wrongOptions = content.items
        .filter(i => i.id !== item.id)
        .map(i => i.definition)
        .slice(0, 3);
      
      return {
        id: item.id,
        sentence,
        blanks: [{
          position: sentence.indexOf('___'),
          answer: item.definition,
          options: [item.definition, ...wrongOptions].sort(() => Math.random() - 0.5)
        }]
      };
    });
  }

  /**
   * 轉換為是非題格式
   */
  static toTrueFalse(content: UniversalContent): TrueFalseQuestion[] {
    const questions: TrueFalseQuestion[] = [];
    
    content.items.forEach(item => {
      // 正確陳述
      questions.push({
        id: `${item.id}_true`,
        statement: `${item.term} 的意思是 ${item.definition}`,
        isTrue: true,
        explanation: '這是正確的定義。',
        image: item.image
      });
      
      // 錯誤陳述（隨機配對）
      const wrongDef = content.items
        .filter(i => i.id !== item.id)
        .map(i => i.definition)[Math.floor(Math.random() * (content.items.length - 1))];
      
      if (wrongDef) {
        questions.push({
          id: `${item.id}_false`,
          statement: `${item.term} 的意思是 ${wrongDef}`,
          isTrue: false,
          explanation: `錯誤。正確答案是：${item.definition}`,
          image: item.image
        });
      }
    });
    
    return questions.sort(() => Math.random() - 0.5);
  }

  /**
   * 轉換為拖拽排序格式
   */
  static toDragDrop(content: UniversalContent): DragDropItem[] {
    return content.items.map(item => ({
      id: item.id,
      content: item.term,
      category: item.category || '詞彙',
      image: item.image
    }));
  }

  /**
   * 根據遊戲類型自動轉換內容
   */
  static adaptContent(content: UniversalContent, gameType: GameType): any {
    switch (gameType) {
      case 'quiz':
        return this.toQuiz(content);
      case 'matching':
        return this.toMatching(content);
      case 'flashcards':
        return this.toFlashCards(content);
      case 'spin-wheel':
        return this.toSpinWheel(content);
      case 'whack-a-mole':
        return this.toWhackAMole(content);
      case 'memory-cards':
        return this.toMemoryCards(content);
      case 'word-search':
        return this.toWordSearch(content);
      case 'crossword':
        return this.toCrossword(content);
      case 'fill-blank':
        return this.toFillBlank(content);
      case 'true-false':
        return this.toTrueFalse(content);
      case 'drag-drop':
        return this.toDragDrop(content);
      default:
        throw new Error(`不支持的遊戲類型: ${gameType}`);
    }
  }

  /**
   * 獲取遊戲數據的統計信息
   */
  static getGameStats(content: UniversalContent, gameType: GameType): {
    itemCount: number;
    estimatedDuration: string;
    difficulty: string;
    features: string[];
  } {
    const itemCount = content.items.length;
    
    const stats = {
      itemCount,
      estimatedDuration: '5-10分鐘',
      difficulty: '中等',
      features: [] as string[]
    };
    
    switch (gameType) {
      case 'quiz':
        stats.estimatedDuration = `${Math.ceil(itemCount * 0.5)}-${Math.ceil(itemCount * 1)}分鐘`;
        stats.difficulty = itemCount > 20 ? '困難' : itemCount > 10 ? '中等' : '簡單';
        stats.features = ['多選題', '即時反饋', '分數統計'];
        break;
      
      case 'matching':
        stats.estimatedDuration = `${Math.ceil(itemCount * 0.3)}-${Math.ceil(itemCount * 0.6)}分鐘`;
        stats.difficulty = itemCount > 15 ? '困難' : itemCount > 8 ? '中等' : '簡單';
        stats.features = ['拖拽操作', '視覺配對', '動畫效果'];
        break;
      
      case 'flashcards':
        stats.estimatedDuration = `${Math.ceil(itemCount * 0.2)}-${Math.ceil(itemCount * 0.4)}分鐘`;
        stats.difficulty = '簡單';
        stats.features = ['翻轉動畫', '進度追蹤', '重複學習'];
        break;
      
      default:
        break;
    }
    
    return stats;
  }
}
