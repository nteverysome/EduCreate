/**
 * 自動組合太空船腳本
 * 從精靈表中自動提取組件並組合成完整的太空船
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 自動組合太空船腳本啟動');

// 配置參數
const config = {
  spritesheetPath: path.join(__dirname, '../public/assets/random_shooter-sheet.png'),
  outputPath: path.join(__dirname, '../public/assets/complete_spaceship.png'),
  frameWidth: 64,
  frameHeight: 64,
  canvasWidth: 400,
  canvasHeight: 300,
  mode: 'balanced' // 平衡型設計
};

// 自動組合設計模板
const designTemplates = {
  balanced: {
    name: '平衡型太空船',
    components: [
      { index: 0, x: 200, y: 150, scale: 1.5, rotation: 0, type: 'hull' },      // 主船體
      { index: 1, x: 200, y: 200, scale: 1.2, rotation: 0, type: 'engine' },   // 引擎
      { index: 2, x: 200, y: 100, scale: 0.8, rotation: 0, type: 'weapon' },   // 武器
      { index: 3, x: 150, y: 160, scale: 0.7, rotation: -15, type: 'wing' },   // 左翼
      { index: 3, x: 250, y: 160, scale: 0.7, rotation: 15, type: 'wing' }     // 右翼
    ]
  },
  aggressive: {
    name: '攻擊型太空船',
    components: [
      { index: 0, x: 200, y: 150, scale: 1.3, rotation: 0, type: 'hull' },
      { index: 1, x: 200, y: 80, scale: 1.0, rotation: 0, type: 'weapon' },
      { index: 2, x: 170, y: 120, scale: 0.8, rotation: -30, type: 'weapon' },
      { index: 2, x: 230, y: 120, scale: 0.8, rotation: 30, type: 'weapon' },
      { index: 3, x: 200, y: 220, scale: 1.4, rotation: 0, type: 'engine' }
    ]
  },
  heavy: {
    name: '重型太空船',
    components: [
      { index: 0, x: 200, y: 150, scale: 2.0, rotation: 0, type: 'hull' },
      { index: 1, x: 200, y: 70, scale: 1.5, rotation: 0, type: 'weapon' },
      { index: 2, x: 120, y: 150, scale: 1.2, rotation: -90, type: 'weapon' },
      { index: 2, x: 280, y: 150, scale: 1.2, rotation: 90, type: 'weapon' },
      { index: 3, x: 200, y: 250, scale: 1.8, rotation: 0, type: 'engine' }
    ]
  }
};

async function autoComposeSpaceship() {
  try {
    console.log('📋 檢查精靈表文件...');
    
    if (!fs.existsSync(config.spritesheetPath)) {
      throw new Error(`精靈表文件不存在: ${config.spritesheetPath}`);
    }
    
    console.log('✅ 精靈表文件存在');
    
    // 載入精靈表圖片
    console.log('🖼️ 載入精靈表圖片...');
    const spritesheetImage = await loadImage(config.spritesheetPath);
    console.log(`✅ 精靈表載入成功: ${spritesheetImage.width}x${spritesheetImage.height}`);
    
    // 計算網格信息
    const cols = Math.floor(spritesheetImage.width / config.frameWidth);
    const rows = Math.floor(spritesheetImage.height / config.frameHeight);
    const totalFrames = cols * rows;
    
    console.log(`📊 精靈表分析: ${cols}列 x ${rows}行 = ${totalFrames}個組件`);
    
    // 創建輸出畫布
    const canvas = createCanvas(config.canvasWidth, config.canvasHeight);
    const ctx = canvas.getContext('2d');
    
    // 清空畫布（透明背景）
    ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    // 獲取設計模板
    const template = designTemplates[config.mode];
    console.log(`🎨 使用設計模板: ${template.name}`);
    
    // 自動組合組件
    console.log('🤖 開始自動組合組件...');
    
    for (let i = 0; i < template.components.length; i++) {
      const component = template.components[i];
      
      // 確保組件索引在有效範圍內
      const componentIndex = Math.min(component.index, totalFrames - 1);
      
      // 計算組件在精靈表中的位置
      const col = componentIndex % cols;
      const row = Math.floor(componentIndex / cols);
      const sourceX = col * config.frameWidth;
      const sourceY = row * config.frameHeight;
      
      console.log(`  🔧 組合組件 ${i + 1}: 索引${componentIndex} (${component.type}) 位置(${component.x}, ${component.y}) 縮放${component.scale}`);
      
      // 保存當前變換狀態
      ctx.save();
      
      // 移動到組件位置
      ctx.translate(component.x, component.y);
      
      // 應用縮放
      ctx.scale(component.scale, component.scale);
      
      // 應用旋轉
      if (component.rotation) {
        ctx.rotate(component.rotation * Math.PI / 180);
      }
      
      // 繪製組件（以中心為錨點）
      ctx.drawImage(
        spritesheetImage,
        sourceX, sourceY, config.frameWidth, config.frameHeight,
        -config.frameWidth / 2, -config.frameHeight / 2, config.frameWidth, config.frameHeight
      );
      
      // 恢復變換狀態
      ctx.restore();
    }
    
    console.log('✅ 組件組合完成');
    
    // 保存結果
    console.log('💾 保存完整太空船圖片...');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(config.outputPath, buffer);
    
    console.log(`✅ 完整太空船已保存到: ${config.outputPath}`);
    
    // 生成報告
    const report = {
      timestamp: new Date().toISOString(),
      template: template.name,
      components: template.components.length,
      outputSize: `${config.canvasWidth}x${config.canvasHeight}`,
      outputPath: config.outputPath,
      spritesheetInfo: {
        size: `${spritesheetImage.width}x${spritesheetImage.height}`,
        grid: `${cols}x${rows}`,
        totalFrames: totalFrames
      }
    };
    
    const reportPath = path.join(__dirname, '../test-results/spaceship-composition-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📊 組合報告已生成');
    console.log('🎯 自動組合完成！');
    
    return {
      success: true,
      outputPath: config.outputPath,
      report: report
    };
    
  } catch (error) {
    console.error('❌ 自動組合失敗:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 支持不同的組合模式
async function composeWithMode(mode = 'balanced') {
  config.mode = mode;
  console.log(`🎯 設置組合模式: ${mode}`);
  return await autoComposeSpaceship();
}

// 如果直接運行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] || 'balanced';
  composeWithMode(mode).then(result => {
    if (result.success) {
      console.log('🚀 自動組合太空船成功完成！');
      console.log(`📁 輸出文件: ${result.outputPath}`);
    } else {
      console.error('💥 自動組合失敗:', result.error);
      process.exit(1);
    }
  });
}

export { autoComposeSpaceship, composeWithMode };
