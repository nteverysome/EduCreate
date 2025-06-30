/**
 * Quiz 遊戲資產生成器
 * 使用 Image Generation MCP 並行生成所有 Quiz 相關視覺資產
 */

export interface QuizAsset {
  id: string;
  name: string;
  type: 'BUTTON' | 'ICON' | 'BACKGROUND' | 'EFFECT';
  prompt: string;
  style: string;
  size: string;
  usage: string;
  generatedUrl?: string;
  localPath?: string;
}

export class QuizAssetGenerator {
  private static readonly QUIZ_ASSETS: QuizAsset[] = [
    // 答案按鈕
    {
      id: 'quiz_correct_button',
      name: '正確答案按鈕',
      type: 'BUTTON',
      prompt: 'Green correct answer button with white checkmark icon, modern flat design, educational theme, rounded corners, subtle shadow, clean typography, bright colors',
      style: 'flat-ui',
      size: '300x80',
      usage: '用戶選擇正確答案時顯示'
    },
    {
      id: 'quiz_incorrect_button',
      name: '錯誤答案按鈕',
      type: 'BUTTON',
      prompt: 'Red incorrect answer button with white X icon, modern flat design, educational theme, rounded corners, subtle shadow, clean typography',
      style: 'flat-ui',
      size: '300x80',
      usage: '用戶選擇錯誤答案時顯示'
    },
    {
      id: 'quiz_option_button',
      name: '選項按鈕',
      type: 'BUTTON',
      prompt: 'Neutral quiz option button, light blue gradient, modern design, educational theme, rounded corners, hover effect, clean typography',
      style: 'flat-ui',
      size: '300x80',
      usage: '未選擇狀態的答案選項'
    },
    {
      id: 'quiz_selected_button',
      name: '已選擇按鈕',
      type: 'BUTTON',
      prompt: 'Selected quiz option button, blue gradient with glow effect, modern design, educational theme, rounded corners, active state',
      style: 'flat-ui',
      size: '300x80',
      usage: '用戶點擊選擇的答案選項'
    },

    // 圖標元素
    {
      id: 'quiz_timer_icon',
      name: '計時器圖標',
      type: 'ICON',
      prompt: 'Clock timer icon, blue color, clean minimalist design, educational style, transparent background, modern flat icon',
      style: 'icon',
      size: '64x64',
      usage: '顯示剩餘時間'
    },
    {
      id: 'quiz_score_icon',
      name: '分數圖標',
      type: 'ICON',
      prompt: 'Star score icon, golden yellow color, sparkle effect, educational style, transparent background, achievement badge',
      style: 'icon',
      size: '64x64',
      usage: '顯示當前分數'
    },
    {
      id: 'quiz_question_icon',
      name: '問題圖標',
      type: 'ICON',
      prompt: 'Question mark icon, purple color, modern design, educational style, transparent background, help symbol',
      style: 'icon',
      size: '64x64',
      usage: '標識問題區域'
    },
    {
      id: 'quiz_progress_icon',
      name: '進度圖標',
      type: 'ICON',
      prompt: 'Progress bar icon, green gradient, completion indicator, educational style, transparent background, achievement symbol',
      style: 'icon',
      size: '64x64',
      usage: '顯示測驗進度'
    },

    // 背景元素
    {
      id: 'quiz_main_background',
      name: '主背景',
      type: 'BACKGROUND',
      prompt: 'Quiz game main background, light gradient from blue to white, educational theme, clean modern design, subtle pattern',
      style: 'background',
      size: '1920x1080',
      usage: '遊戲主背景'
    },
    {
      id: 'quiz_question_panel',
      name: '問題面板背景',
      type: 'BACKGROUND',
      prompt: 'Question panel background, white with subtle shadow, rounded corners, modern card design, educational theme',
      style: 'ui-panel',
      size: '800x400',
      usage: '問題顯示區域背景'
    },
    {
      id: 'quiz_score_panel',
      name: '分數面板背景',
      type: 'BACKGROUND',
      prompt: 'Score display panel, golden gradient background, star decorations, educational game style, achievement design',
      style: 'ui-panel',
      size: '300x120',
      usage: '分數顯示區域背景'
    },

    // 特效元素
    {
      id: 'quiz_correct_effect',
      name: '正確答案特效',
      type: 'EFFECT',
      prompt: 'Correct answer celebration effect, green sparkles and stars, success animation, educational theme, transparent background',
      style: 'particle-effect',
      size: '200x200',
      usage: '答對時的慶祝特效'
    },
    {
      id: 'quiz_incorrect_effect',
      name: '錯誤答案特效',
      type: 'EFFECT',
      prompt: 'Incorrect answer feedback effect, red shake lines, error indication, educational theme, transparent background',
      style: 'particle-effect',
      size: '200x200',
      usage: '答錯時的反饋特效'
    },
    {
      id: 'quiz_completion_effect',
      name: '完成測驗特效',
      type: 'EFFECT',
      prompt: 'Quiz completion celebration, colorful confetti and fireworks, victory animation, educational theme, transparent background',
      style: 'particle-effect',
      size: '400x400',
      usage: '測驗完成時的慶祝特效'
    },
    {
      id: 'quiz_streak_effect',
      name: '連續答對特效',
      type: 'EFFECT',
      prompt: 'Answer streak effect, golden chain links, combo indicator, educational theme, transparent background, achievement glow',
      style: 'particle-effect',
      size: '150x150',
      usage: '連續答對時的特效'
    }
  ];

  /**
   * 獲取所有 Quiz 資產定義
   */
  static getAllAssets(): QuizAsset[] {
    return [...this.QUIZ_ASSETS];
  }

  /**
   * 根據類型獲取資產
   */
  static getAssetsByType(type: QuizAsset['type']): QuizAsset[] {
    return this.QUIZ_ASSETS.filter(asset => asset.type === type);
  }

  /**
   * 根據ID獲取資產
   */
  static getAssetById(id: string): QuizAsset | undefined {
    return this.QUIZ_ASSETS.find(asset => asset.id === id);
  }

  /**
   * 生成所有 Quiz 資產
   */
  static async generateAllAssets(): Promise<QuizAsset[]> {
    console.log('🎨 開始生成 Quiz 遊戲資產...');
    console.log(`📊 總資產數量: ${this.QUIZ_ASSETS.length}`);

    const generatedAssets: QuizAsset[] = [];
    const errors: string[] = [];

    // 按類型分組並行生成
    const assetGroups = {
      BUTTON: this.getAssetsByType('BUTTON'),
      ICON: this.getAssetsByType('ICON'),
      BACKGROUND: this.getAssetsByType('BACKGROUND'),
      EFFECT: this.getAssetsByType('EFFECT')
    };

    console.log('🔄 按類型並行生成資產:');
    Object.entries(assetGroups).forEach(([type, assets]) => {
      console.log(`  ${type}: ${assets.length} 個資產`);
    });

    try {
      // 並行生成所有類型的資產
      const groupPromises = Object.entries(assetGroups).map(async ([type, assets]) => {
        console.log(`🎨 開始生成 ${type} 資產...`);
        
        const groupResults = await Promise.all(
          assets.map(asset => this.generateSingleAsset(asset))
        );
        
        console.log(`✅ ${type} 資產生成完成`);
        return groupResults;
      });

      const allResults = await Promise.all(groupPromises);
      const flatResults = allResults.flat();

      // 統計結果
      flatResults.forEach(result => {
        if (result.success) {
          generatedAssets.push(result.asset);
        } else {
          errors.push(result.error);
        }
      });

      console.log('\n🎉 Quiz 資產生成完成！');
      console.log(`✅ 成功生成: ${generatedAssets.length} 個資產`);
      console.log(`❌ 生成失敗: ${errors.length} 個資產`);
      
      if (errors.length > 0) {
        console.log('錯誤詳情:', errors);
      }

      return generatedAssets;

    } catch (error) {
      console.error('❌ Quiz 資產生成失敗:', error);
      throw error;
    }
  }

  /**
   * 生成單個資產
   */
  private static async generateSingleAsset(asset: QuizAsset): Promise<{
    success: boolean;
    asset: QuizAsset;
    error?: string;
  }> {
    try {
      console.log(`  🖼️ 生成: ${asset.name}`);
      
      // TODO: 實際調用 Image Generation MCP
      // const imageUrl = await imageGenerationMCP.generateImage({
      //   prompt: asset.prompt,
      //   style: asset.style,
      //   size: asset.size
      // });

      // 模擬生成過程
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      // 模擬生成的 URL
      const mockUrl = `https://quiz-assets.wordwall.com/${asset.id}.png`;
      const localPath = `/assets/quiz/${asset.id}.png`;

      const generatedAsset: QuizAsset = {
        ...asset,
        generatedUrl: mockUrl,
        localPath
      };

      console.log(`    ✅ ${asset.name} 生成成功`);
      
      return {
        success: true,
        asset: generatedAsset
      };

    } catch (error) {
      const errorMsg = `生成 ${asset.name} 失敗: ${error instanceof Error ? error.message : '未知錯誤'}`;
      console.error(`    ❌ ${errorMsg}`);
      
      return {
        success: false,
        asset,
        error: errorMsg
      };
    }
  }

  /**
   * 獲取資產統計
   */
  static getAssetStats() {
    const stats = {
      total: this.QUIZ_ASSETS.length,
      byType: {} as Record<string, number>,
      generated: this.QUIZ_ASSETS.filter(asset => asset.generatedUrl).length,
      pending: this.QUIZ_ASSETS.filter(asset => !asset.generatedUrl).length
    };

    // 按類型統計
    this.QUIZ_ASSETS.forEach(asset => {
      stats.byType[asset.type] = (stats.byType[asset.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * 創建資產使用指南
   */
  static generateUsageGuide(): string {
    let guide = '# Quiz 遊戲資產使用指南\n\n';
    
    const assetsByType = {
      BUTTON: this.getAssetsByType('BUTTON'),
      ICON: this.getAssetsByType('ICON'),
      BACKGROUND: this.getAssetsByType('BACKGROUND'),
      EFFECT: this.getAssetsByType('EFFECT')
    };

    Object.entries(assetsByType).forEach(([type, assets]) => {
      guide += `## ${type} 資產\n\n`;
      assets.forEach(asset => {
        guide += `### ${asset.name}\n`;
        guide += `- **ID**: \`${asset.id}\`\n`;
        guide += `- **尺寸**: ${asset.size}\n`;
        guide += `- **用途**: ${asset.usage}\n`;
        if (asset.generatedUrl) {
          guide += `- **URL**: ${asset.generatedUrl}\n`;
        }
        guide += '\n';
      });
    });

    return guide;
  }
}
