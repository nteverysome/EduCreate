/**
 * 內容驗證系統 - 模仿 wordwall.net 的內容驗證機制
 * 提供全面的內容驗證、錯誤提示和修復建議
 */

import { UniversalContent, UniversalContentItem, GameType } from './UniversalContentManager';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  canPublish: boolean;
  requiredFields: string[];
  missingFields: string[];
}

export class ContentValidator {
  /**
   * 驗證統一內容
   */
  static validateContent(content: Partial<UniversalContent>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const requiredFields = ['title', 'items'];
    const missingFields: string[] = [];

    // 1. 驗證標題
    if (!content.title || content.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: '活動標題是必需的',
        severity: 'error',
        suggestion: '請輸入一個描述性的標題'
      });
      missingFields.push('title');
    } else if (content.title.length > 100) {
      warnings.push({
        field: 'title',
        message: '標題過長，建議控制在100字符以內',
        severity: 'warning',
        suggestion: '考慮使用更簡潔的標題'
      });
    }

    // 2. 驗證內容項目
    if (!content.items || content.items.length === 0) {
      errors.push({
        field: 'items',
        message: '至少需要1個內容項目',
        severity: 'error',
        suggestion: '請添加問題和答案對'
      });
      missingFields.push('items');
    } else {
      // 驗證每個內容項目
      content.items.forEach((item, index) => {
        const itemErrors = this.validateContentItem(item, index);
        errors.push(...itemErrors.filter(e => e.severity === 'error'));
        warnings.push(...itemErrors.filter(e => e.severity === 'warning'));
      });

      // 檢查內容項目數量
      if (content.items.length > 100) {
        warnings.push({
          field: 'items',
          message: '內容項目過多，可能影響遊戲性能',
          severity: 'warning',
          suggestion: '考慮將內容分成多個活動'
        });
      }
    }

    // 3. 驗證描述
    if (content.description && content.description.length > 500) {
      warnings.push({
        field: 'description',
        message: '描述過長，建議控制在500字符以內',
        severity: 'warning'
      });
    }

    // 4. 驗證標籤
    if (content.tags && content.tags.length > 10) {
      warnings.push({
        field: 'tags',
        message: '標籤過多，建議控制在10個以內',
        severity: 'warning'
      });
    }

    const isValid = errors.length === 0;
    const canPublish = isValid && missingFields.length === 0;

    return {
      isValid,
      errors,
      warnings,
      canPublish,
      requiredFields,
      missingFields
    };
  }

  /**
   * 驗證單個內容項目
   */
  static validateContentItem(item: UniversalContentItem, index: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // 驗證詞彙/問題
    if (!item.term || item.term.trim().length === 0) {
      errors.push({
        field: `items[${index}].term`,
        message: `第${index + 1}項的問題/詞彙不能為空`,
        severity: 'error',
        suggestion: '請輸入問題或詞彙'
      });
    } else if (item.term.length > 200) {
      errors.push({
        field: `items[${index}].term`,
        message: `第${index + 1}項的問題過長`,
        severity: 'warning',
        suggestion: '建議控制在200字符以內'
      });
    }

    // 驗證定義/答案
    if (!item.definition || item.definition.trim().length === 0) {
      errors.push({
        field: `items[${index}].definition`,
        message: `第${index + 1}項的答案/定義不能為空`,
        severity: 'error',
        suggestion: '請輸入答案或定義'
      });
    } else if (item.definition.length > 500) {
      errors.push({
        field: `items[${index}].definition`,
        message: `第${index + 1}項的答案過長`,
        severity: 'warning',
        suggestion: '建議控制在500字符以內'
      });
    }

    // 檢查重複項目
    // 這個檢查需要在外部進行，因為需要比較所有項目

    return errors;
  }

  /**
   * 檢查重複的內容項目
   */
  static checkDuplicateItems(items: UniversalContentItem[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const termMap = new Map<string, number[]>();

    // 建立詞彙映射
    items.forEach((item, index) => {
      const normalizedTerm = item.term.toLowerCase().trim();
      if (!termMap.has(normalizedTerm)) {
        termMap.set(normalizedTerm, []);
      }
      termMap.get(normalizedTerm)!.push(index);
    });

    // 檢查重複
    termMap.forEach((indices, term) => {
      if (indices.length > 1) {
        errors.push({
          field: `items[${indices.join(',')}].term`,
          message: `重複的詞彙/問題: "${term}" (項目 ${indices.map(i => i + 1).join(', ')})`,
          severity: 'warning',
          suggestion: '考慮合併或修改重複的項目'
        });
      }
    });

    return errors;
  }

  /**
   * 驗證遊戲兼容性
   */
  static validateGameCompatibility(content: UniversalContent, gameType: GameType): ValidationError[] {
    const errors: ValidationError[] = [];
    const itemCount = content.items.length;

    // 根據遊戲類型檢查最小/最大項目數量
    const gameRequirements = this.getGameRequirements(gameType);

    if (itemCount < gameRequirements.minItems) {
      errors.push({
        field: 'items',
        message: `${gameRequirements.name} 至少需要 ${gameRequirements.minItems} 個項目，當前只有 ${itemCount} 個`,
        severity: 'error',
        suggestion: `請添加至少 ${gameRequirements.minItems - itemCount} 個項目`
      });
    }

    if (itemCount > gameRequirements.maxItems) {
      errors.push({
        field: 'items',
        message: `${gameRequirements.name} 最多支持 ${gameRequirements.maxItems} 個項目，當前有 ${itemCount} 個`,
        severity: 'warning',
        suggestion: `建議減少到 ${gameRequirements.maxItems} 個項目以獲得最佳體驗`
      });
    }

    // 檢查特殊要求
    if (gameRequirements.requiresEvenItems && itemCount % 2 !== 0) {
      errors.push({
        field: 'items',
        message: `${gameRequirements.name} 需要偶數個項目進行配對`,
        severity: 'error',
        suggestion: '請添加或刪除一個項目使總數為偶數'
      });
    }

    return errors;
  }

  /**
   * 獲取遊戲要求
   */
  static getGameRequirements(gameType: GameType) {
    const requirements = {
      'quiz': { name: '測驗問答', minItems: 1, maxItems: 50, requiresEvenItems: false },
      'matching': { name: '配對遊戲', minItems: 3, maxItems: 20, requiresEvenItems: false },
      'flashcards': { name: '單字卡片', minItems: 1, maxItems: 100, requiresEvenItems: false },
      'spin-wheel': { name: '隨機轉盤', minItems: 2, maxItems: 20, requiresEvenItems: false },
      'whack-a-mole': { name: '打地鼠', minItems: 5, maxItems: 30, requiresEvenItems: false },
      'memory-cards': { name: '記憶卡片', minItems: 4, maxItems: 24, requiresEvenItems: true },
      'word-search': { name: '單字搜尋', minItems: 5, maxItems: 25, requiresEvenItems: false },
      'crossword': { name: '填字遊戲', minItems: 5, maxItems: 20, requiresEvenItems: false },
      'fill-blanks': { name: '填空題', minItems: 3, maxItems: 30, requiresEvenItems: false },
      'true-false': { name: '是非題', minItems: 5, maxItems: 50, requiresEvenItems: false },
      'drag-sort': { name: '拖拽排序', minItems: 3, maxItems: 15, requiresEvenItems: false },
      'balloon-pop': { name: '氣球爆破', minItems: 5, maxItems: 25, requiresEvenItems: false },
      'airplane': { name: '飛機遊戲', minItems: 5, maxItems: 30, requiresEvenItems: false },
      'maze-chase': { name: '迷宮追逐', minItems: 5, maxItems: 20, requiresEvenItems: false }
    };

    return requirements[gameType] || { name: '未知遊戲', minItems: 1, maxItems: 50, requiresEvenItems: false };
  }

  /**
   * 生成修復建議
   */
  static generateFixSuggestions(validationResult: ValidationResult): string[] {
    const suggestions: string[] = [];

    if (validationResult.missingFields.includes('title')) {
      suggestions.push('添加一個描述性的活動標題');
    }

    if (validationResult.missingFields.includes('items')) {
      suggestions.push('添加至少一個問題和答案對');
    }

    if (validationResult.errors.length > 0) {
      suggestions.push('修復所有錯誤項目');
    }

    if (validationResult.warnings.length > 0) {
      suggestions.push('考慮處理警告項目以提升質量');
    }

    return suggestions;
  }

  /**
   * 格式化驗證錯誤消息
   */
  static formatErrorMessage(errors: ValidationError[]): string {
    if (errors.length === 0) return '';

    const errorMessages = errors
      .filter(e => e.severity === 'error')
      .map(e => e.message);

    if (errorMessages.length === 1) {
      return errorMessages[0];
    }

    return `發現 ${errorMessages.length} 個錯誤:\n${errorMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}`;
  }
}
