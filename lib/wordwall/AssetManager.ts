/**
 * WordWall 視覺資產管理器
 * 整合 Image Generation MCP，自動生成和管理遊戲視覺資產
 */

export interface GameAsset {
  id: string;
  name: string;
  type: 'UI' | 'CHARACTER' | 'BACKGROUND' | 'ICON' | 'ILLUSTRATION';
  gameTemplate: string;
  prompt: string;
  style: string;
  size: string;
  url?: string;
  localPath?: string;
  generatedAt?: Date;
  isGenerated: boolean;
}

export interface AssetGenerationRequest {
  name: string;
  type: GameAsset['type'];
  gameTemplate: string;
  prompt: string;
  style?: string;
  size?: string;
  variations?: number;
}

export class WordWallAssetManager {
  private static assetTemplates: Record<string, GameAsset[]> = {
    // Quiz 遊戲資產
    quiz: [
      {
        id: 'quiz_correct_button',
        name: '正確答案按鈕',
        type: 'UI',
        gameTemplate: 'quiz',
        prompt: 'Green correct answer button with checkmark icon, clean modern design, educational theme, bright colors, rounded corners',
        style: 'game-ui',
        size: '256x64',
        isGenerated: false
      },
      {
        id: 'quiz_incorrect_button',
        name: '錯誤答案按鈕',
        type: 'UI',
        gameTemplate: 'quiz',
        prompt: 'Red incorrect answer button with X icon, clean modern design, educational theme, bright colors, rounded corners',
        style: 'game-ui',
        size: '256x64',
        isGenerated: false
      },
      {
        id: 'quiz_timer_icon',
        name: '計時器圖標',
        type: 'ICON',
        gameTemplate: 'quiz',
        prompt: 'Clock timer icon, simple clean design, blue color, educational style, transparent background',
        style: 'icon',
        size: '64x64',
        isGenerated: false
      },
      {
        id: 'quiz_score_background',
        name: '分數顯示背景',
        type: 'UI',
        gameTemplate: 'quiz',
        prompt: 'Score display panel background, golden yellow gradient, star decorations, educational game style',
        style: 'game-ui',
        size: '200x80',
        isGenerated: false
      }
    ],

    // 打地鼠遊戲資產
    whack_mole: [
      {
        id: 'mole_happy',
        name: '開心地鼠',
        type: 'CHARACTER',
        gameTemplate: 'whack_mole',
        prompt: 'Cute cartoon mole character, happy expression, brown fur, big eyes, educational game style, transparent background',
        style: 'cartoon',
        size: '128x128',
        isGenerated: false
      },
      {
        id: 'mole_dizzy',
        name: '暈眩地鼠',
        type: 'CHARACTER',
        gameTemplate: 'whack_mole',
        prompt: 'Cute cartoon mole character, dizzy expression with stars around head, brown fur, educational game style, transparent background',
        style: 'cartoon',
        size: '128x128',
        isGenerated: false
      },
      {
        id: 'hammer_tool',
        name: '錘子工具',
        type: 'ICON',
        gameTemplate: 'whack_mole',
        prompt: 'Cartoon hammer tool, wooden handle, silver head, game cursor style, educational theme, transparent background',
        style: 'cartoon',
        size: '64x64',
        isGenerated: false
      },
      {
        id: 'hole_background',
        name: '洞穴背景',
        type: 'BACKGROUND',
        gameTemplate: 'whack_mole',
        prompt: 'Mole hole in green grass, circular dark opening, cartoon style, educational game background',
        style: 'cartoon',
        size: '128x128',
        isGenerated: false
      }
    ],

    // 配對遊戲資產
    match_up: [
      {
        id: 'drag_handle',
        name: '拖拽手柄',
        type: 'ICON',
        gameTemplate: 'match_up',
        prompt: 'Drag handle icon, six dots in grid pattern, gray color, simple clean design, transparent background',
        style: 'icon',
        size: '32x32',
        isGenerated: false
      },
      {
        id: 'match_success_effect',
        name: '配對成功效果',
        type: 'UI',
        gameTemplate: 'match_up',
        prompt: 'Success sparkle effect, golden stars and particles, celebration animation frame, transparent background',
        style: 'effect',
        size: '128x128',
        isGenerated: false
      },
      {
        id: 'connection_line',
        name: '連接線',
        type: 'UI',
        gameTemplate: 'match_up',
        prompt: 'Curved connection line, blue gradient, arrow at end, smooth design for matching game',
        style: 'game-ui',
        size: '200x20',
        isGenerated: false
      }
    ],

    // 隨機輪盤資產
    spin_wheel: [
      {
        id: 'wheel_background',
        name: '輪盤背景',
        type: 'UI',
        gameTemplate: 'spin_wheel',
        prompt: 'Colorful spinning wheel background, divided into 8 sections, bright educational colors, clean design',
        style: 'game-ui',
        size: '400x400',
        isGenerated: false
      },
      {
        id: 'wheel_pointer',
        name: '輪盤指針',
        type: 'UI',
        gameTemplate: 'spin_wheel',
        prompt: 'Wheel pointer arrow, red color, metallic finish, pointing downward, game style',
        style: 'game-ui',
        size: '60x80',
        isGenerated: false
      }
    ],

    // 填字遊戲資產
    crossword: [
      {
        id: 'letter_tile',
        name: '字母方塊',
        type: 'UI',
        gameTemplate: 'crossword',
        prompt: 'Letter tile for crossword, white background, black border, clean typography, square shape',
        style: 'game-ui',
        size: '48x48',
        isGenerated: false
      },
      {
        id: 'hint_bubble',
        name: '提示氣泡',
        type: 'UI',
        gameTemplate: 'crossword',
        prompt: 'Speech bubble for hints, light blue background, rounded corners, educational style',
        style: 'game-ui',
        size: '200x100',
        isGenerated: false
      }
    ]
  };

  /**
   * 獲取指定遊戲模板的所有資產
   */
  static getAssetsByTemplate(templateName: string): GameAsset[] {
    return this.assetTemplates[templateName] || [];
  }

  /**
   * 獲取所有資產模板
   */
  static getAllAssetTemplates(): Record<string, GameAsset[]> {
    return this.assetTemplates;
  }

  /**
   * 根據ID獲取資產
   */
  static getAssetById(id: string): GameAsset | undefined {
    for (const template of Object.values(this.assetTemplates)) {
      const asset = template.find(asset => asset.id === id);
      if (asset) return asset;
    }
    return undefined;
  }

  /**
   * 獲取需要生成的資產列表
   */
  static getPendingAssets(): GameAsset[] {
    const allAssets: GameAsset[] = [];
    Object.values(this.assetTemplates).forEach(template => {
      allAssets.push(...template.filter(asset => !asset.isGenerated));
    });
    return allAssets;
  }

  /**
   * 標記資產為已生成
   */
  static markAssetAsGenerated(id: string, url: string, localPath?: string): boolean {
    for (const template of Object.values(this.assetTemplates)) {
      const asset = template.find(asset => asset.id === id);
      if (asset) {
        asset.isGenerated = true;
        asset.url = url;
        asset.localPath = localPath;
        asset.generatedAt = new Date();
        return true;
      }
    }
    return false;
  }

  /**
   * 生成資產統計
   */
  static getAssetStats() {
    const allAssets: GameAsset[] = [];
    Object.values(this.assetTemplates).forEach(template => {
      allAssets.push(...template);
    });

    const stats = {
      total: allAssets.length,
      generated: allAssets.filter(asset => asset.isGenerated).length,
      pending: allAssets.filter(asset => !asset.isGenerated).length,
      byType: {} as Record<string, number>,
      byTemplate: {} as Record<string, number>
    };

    // 按類型統計
    allAssets.forEach(asset => {
      stats.byType[asset.type] = (stats.byType[asset.type] || 0) + 1;
      stats.byTemplate[asset.gameTemplate] = (stats.byTemplate[asset.gameTemplate] || 0) + 1;
    });

    return stats;
  }

  /**
   * 創建資產生成請求
   */
  static createGenerationRequest(assetId: string): AssetGenerationRequest | null {
    const asset = this.getAssetById(assetId);
    if (!asset) return null;

    return {
      name: asset.name,
      type: asset.type,
      gameTemplate: asset.gameTemplate,
      prompt: asset.prompt,
      style: asset.style,
      size: asset.size,
      variations: 1
    };
  }

  /**
   * 批量創建生成請求
   */
  static createBatchGenerationRequests(templateName?: string): AssetGenerationRequest[] {
    let assets: GameAsset[];
    
    if (templateName) {
      assets = this.getAssetsByTemplate(templateName).filter(asset => !asset.isGenerated);
    } else {
      assets = this.getPendingAssets();
    }

    return assets.map(asset => ({
      name: asset.name,
      type: asset.type,
      gameTemplate: asset.gameTemplate,
      prompt: asset.prompt,
      style: asset.style,
      size: asset.size,
      variations: 1
    }));
  }
}
