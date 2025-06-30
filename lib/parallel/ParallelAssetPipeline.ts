/**
 * 並行資產生成流水線
 * 同時生成數百個遊戲素材，實現極限加速
 */

export interface AssetGenerationBatch {
  id: string;
  name: string;
  prompts: string[];
  style: string;
  size: string;
  priority: number;
  estimatedTime: number;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  startTime?: Date;
  endTime?: Date;
  generatedUrls?: string[];
  error?: string;
}

export interface PipelineStats {
  totalBatches: number;
  completedBatches: number;
  totalAssets: number;
  generatedAssets: number;
  failedAssets: number;
  averageGenerationTime: number;
  throughputPerMinute: number;
}

export class ParallelAssetPipeline {
  private static readonly MAX_CONCURRENT_BATCHES = 10;
  private static readonly BATCH_SIZE = 20;
  private static readonly RETRY_ATTEMPTS = 3;

  private static batches: AssetGenerationBatch[] = [];
  private static stats: PipelineStats = {
    totalBatches: 0,
    completedBatches: 0,
    totalAssets: 0,
    generatedAssets: 0,
    failedAssets: 0,
    averageGenerationTime: 0,
    throughputPerMinute: 0
  };

  /**
   * 啟動極限並行資產生成
   */
  static async startUltraParallelGeneration(): Promise<void> {
    console.log('🎨 啟動極限並行資產生成流水線');
    
    // 生成所有資產批次
    this.batches = this.createAllAssetBatches();
    this.stats.totalBatches = this.batches.length;
    this.stats.totalAssets = this.batches.reduce((sum, batch) => sum + batch.prompts.length, 0);

    console.log(`📊 總批次: ${this.stats.totalBatches}`);
    console.log(`🖼️ 總資產: ${this.stats.totalAssets}`);
    console.log(`⚡ 並行度: ${this.MAX_CONCURRENT_BATCHES} 批次同時執行`);

    const startTime = Date.now();

    try {
      // 分組並行執行
      const batchGroups = this.chunkArray(this.batches, this.MAX_CONCURRENT_BATCHES);
      
      for (const group of batchGroups) {
        const groupPromises = group.map(batch => this.executeBatch(batch));
        await Promise.all(groupPromises);
        
        // 實時統計更新
        this.updateStats();
        this.printProgress();
      }

      const endTime = Date.now();
      const totalTime = (endTime - startTime) / 1000;
      
      console.log('🎉 並行資產生成完成！');
      this.printFinalStats(totalTime);

    } catch (error) {
      console.error('❌ 並行資產生成失敗:', error);
      this.printErrorStats();
    }
  }

  /**
   * 創建所有資產生成批次
   */
  private static createAllAssetBatches(): AssetGenerationBatch[] {
    const allBatches: AssetGenerationBatch[] = [];

    // Quiz 遊戲資產批次
    allBatches.push({
      id: 'quiz_ui_batch',
      name: 'Quiz UI 元素',
      prompts: [
        'Green correct answer button with checkmark, modern design, educational theme',
        'Red incorrect answer button with X icon, modern design, educational theme',
        'Blue timer clock icon, clean design, educational style',
        'Golden score display panel, star decorations, game UI',
        'Quiz question background panel, light blue gradient',
        'Answer option hover effect, subtle glow, interactive',
        'Quiz completion celebration, confetti effect, success',
        'Quiz progress bar, colorful segments, educational'
      ],
      style: 'game-ui',
      size: '256x256',
      priority: 1,
      estimatedTime: 8,
      status: 'PENDING'
    });

    // 打地鼠遊戲資產批次
    allBatches.push({
      id: 'whack_characters_batch',
      name: '打地鼠角色',
      prompts: [
        'Cute cartoon mole, happy expression, brown fur, big eyes',
        'Dizzy cartoon mole, stars around head, confused expression',
        'Surprised cartoon mole, wide eyes, mouth open',
        'Sleeping cartoon mole, peaceful expression, closed eyes',
        'Angry cartoon mole, red face, steam from ears',
        'Cartoon hammer tool, wooden handle, silver head',
        'Mole hole in grass, dark circular opening',
        'Grass background texture, bright green, natural'
      ],
      style: 'cartoon',
      size: '128x128',
      priority: 1,
      estimatedTime: 10,
      status: 'PENDING'
    });

    // 配對遊戲資產批次
    allBatches.push({
      id: 'match_elements_batch',
      name: '配對遊戲元素',
      prompts: [
        'Drag handle icon, six dots pattern, gray color',
        'Match success sparkle effect, golden particles',
        'Connection line, blue gradient, curved arrow',
        'Match card background, white with shadow',
        'Correct match glow effect, green outline',
        'Wrong match shake effect, red outline',
        'Match completion fireworks, colorful celebration',
        'Matching pair highlight, yellow border glow'
      ],
      style: 'game-ui',
      size: '200x200',
      priority: 1,
      estimatedTime: 9,
      status: 'PENDING'
    });

    // 填字遊戲資產批次
    allBatches.push({
      id: 'crossword_elements_batch',
      name: '填字遊戲元素',
      prompts: [
        'Letter tile, white background, black border, clean typography',
        'Crossword grid cell, numbered, clean design',
        'Hint bubble, light blue background, rounded corners',
        'Crossword clue panel, organized layout, readable font',
        'Letter input cursor, blinking animation, blue color',
        'Correct letter glow, green highlight effect',
        'Wrong letter shake, red highlight effect',
        'Crossword completion banner, congratulations design'
      ],
      style: 'game-ui',
      size: '64x64',
      priority: 2,
      estimatedTime: 7,
      status: 'PENDING'
    });

    // 輪盤遊戲資產批次
    allBatches.push({
      id: 'wheel_components_batch',
      name: '輪盤遊戲組件',
      prompts: [
        'Colorful spinning wheel, 8 sections, bright colors',
        'Wheel pointer arrow, red metallic, pointing down',
        'Wheel center hub, golden circle, decorative',
        'Wheel section divider, thin black lines',
        'Spin button, large circular, press effect',
        'Wheel spinning blur effect, motion lines',
        'Winner highlight, golden glow, celebration',
        'Wheel background, radial gradient, festive'
      ],
      style: 'game-ui',
      size: '400x400',
      priority: 2,
      estimatedTime: 12,
      status: 'PENDING'
    });

    // 記憶遊戲資產批次
    allBatches.push({
      id: 'memory_cards_batch',
      name: '記憶遊戲卡片',
      prompts: [
        'Memory card back, blue pattern, educational design',
        'Memory card flip animation, 3D effect, smooth',
        'Matched pair glow, green outline, success effect',
        'Card mismatch shake, red outline, error effect',
        'Memory game grid, organized layout, clean',
        'Card reveal animation, fade in effect',
        'Memory completion celebration, star burst',
        'Card shuffle animation, dynamic movement'
      ],
      style: 'game-ui',
      size: '120x120',
      priority: 2,
      estimatedTime: 8,
      status: 'PENDING'
    });

    // 迷宮遊戲資產批次
    allBatches.push({
      id: 'maze_environment_batch',
      name: '迷宮遊戲環境',
      prompts: [
        'Maze wall tile, stone texture, 3D effect',
        'Maze floor tile, smooth surface, neutral color',
        'Maze player character, cute avatar, top view',
        'Maze goal target, glowing star, attractive',
        'Maze collectible item, coin or gem, shiny',
        'Maze enemy character, simple design, avoidable',
        'Maze power-up item, special effect, beneficial',
        'Maze completion portal, magical effect, exit'
      ],
      style: 'game-3d',
      size: '64x64',
      priority: 3,
      estimatedTime: 15,
      status: 'PENDING'
    });

    // 通用 UI 元素批次
    allBatches.push({
      id: 'common_ui_batch',
      name: '通用 UI 元素',
      prompts: [
        'Play button, green circle, white triangle',
        'Pause button, orange circle, two bars',
        'Stop button, red circle, white square',
        'Settings gear icon, gray color, mechanical',
        'Home button, house icon, welcoming',
        'Back arrow button, left pointing, navigation',
        'Next arrow button, right pointing, progression',
        'Help question mark, blue circle, assistance'
      ],
      style: 'icon',
      size: '48x48',
      priority: 1,
      estimatedTime: 6,
      status: 'PENDING'
    });

    return allBatches;
  }

  /**
   * 執行單個批次生成
   */
  private static async executeBatch(batch: AssetGenerationBatch): Promise<void> {
    try {
      console.log(`🎨 開始生成批次: ${batch.name} (${batch.prompts.length} 個資產)`);
      
      batch.status = 'GENERATING';
      batch.startTime = new Date();

      // 模擬並行圖像生成（實際應該調用 Image Generation MCP）
      const generatedUrls = await this.simulateBatchGeneration(batch);
      
      batch.status = 'COMPLETED';
      batch.endTime = new Date();
      batch.generatedUrls = generatedUrls;

      const duration = (batch.endTime.getTime() - batch.startTime.getTime()) / 1000;
      console.log(`✅ 批次完成: ${batch.name} (${duration.toFixed(1)}s, ${generatedUrls.length} 個資產)`);

    } catch (error) {
      batch.status = 'FAILED';
      batch.endTime = new Date();
      batch.error = error instanceof Error ? error.message : '未知錯誤';
      
      console.error(`❌ 批次失敗: ${batch.name} - ${batch.error}`);
    }
  }

  /**
   * 模擬批次生成（實際應該調用真正的 Image Generation MCP）
   */
  private static async simulateBatchGeneration(batch: AssetGenerationBatch): Promise<string[]> {
    const urls: string[] = [];
    
    // 模擬並行生成時間
    const generationTime = Math.random() * 3000 + 2000; // 2-5秒
    await new Promise(resolve => setTimeout(resolve, generationTime));

    // 為每個提示詞生成模擬 URL
    for (let i = 0; i < batch.prompts.length; i++) {
      const prompt = batch.prompts[i];
      const sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const url = `https://generated-assets.wordwall.com/${batch.id}/${sanitizedPrompt}_${i}.png`;
      urls.push(url);
    }

    return urls;
  }

  /**
   * 更新統計信息
   */
  private static updateStats(): void {
    this.stats.completedBatches = this.batches.filter(b => b.status === 'COMPLETED').length;
    this.stats.generatedAssets = this.batches
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, batch) => sum + (batch.generatedUrls?.length || 0), 0);
    this.stats.failedAssets = this.batches
      .filter(b => b.status === 'FAILED')
      .reduce((sum, batch) => sum + batch.prompts.length, 0);
  }

  /**
   * 打印進度
   */
  private static printProgress(): void {
    const progress = Math.round((this.stats.completedBatches / this.stats.totalBatches) * 100);
    console.log(`📈 進度: ${progress}% (${this.stats.completedBatches}/${this.stats.totalBatches} 批次)`);
    console.log(`🖼️ 已生成: ${this.stats.generatedAssets} 個資產`);
  }

  /**
   * 打印最終統計
   */
  private static printFinalStats(totalTime: number): void {
    this.stats.averageGenerationTime = totalTime / this.stats.generatedAssets;
    this.stats.throughputPerMinute = (this.stats.generatedAssets / totalTime) * 60;

    console.log('\n🎉 並行資產生成完成統計:');
    console.log(`⏱️ 總時間: ${totalTime.toFixed(1)} 秒`);
    console.log(`🖼️ 生成資產: ${this.stats.generatedAssets} 個`);
    console.log(`❌ 失敗資產: ${this.stats.failedAssets} 個`);
    console.log(`📊 成功率: ${Math.round((this.stats.generatedAssets / this.stats.totalAssets) * 100)}%`);
    console.log(`⚡ 平均生成時間: ${this.stats.averageGenerationTime.toFixed(2)} 秒/資產`);
    console.log(`🚀 生成速度: ${this.stats.throughputPerMinute.toFixed(1)} 資產/分鐘`);
    console.log(`🎯 加速倍數: ${Math.round(this.stats.throughputPerMinute / 2)}x (相比順序生成)`);
  }

  /**
   * 打印錯誤統計
   */
  private static printErrorStats(): void {
    console.log('\n❌ 錯誤統計:');
    const failedBatches = this.batches.filter(b => b.status === 'FAILED');
    failedBatches.forEach(batch => {
      console.log(`  - ${batch.name}: ${batch.error}`);
    });
  }

  /**
   * 獲取實時統計
   */
  static getRealtimeStats(): PipelineStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * 工具方法
   */
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
