/**
 * 分析新太空船圖片結構的腳本
 * 文件：sprite_player_spaceship_up_down.png
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeNewSpaceship() {
  try {
    const spaceshipPath = path.join(__dirname, '../public/assets/sprite_player_spaceship_up_down.png');
    
    if (!fs.existsSync(spaceshipPath)) {
      console.error('❌ 新太空船文件不存在:', spaceshipPath);
      return null;
    }
    
    console.log('🔍 分析新太空船圖片結構...');
    console.log(`📁 文件路徑: ${spaceshipPath}`);
    
    const image = await loadImage(spaceshipPath);
    
    console.log('\n📊 圖片基本信息:');
    console.log(`   圖片尺寸: ${image.width} x ${image.height} pixels`);
    console.log(`   文件大小: ${(fs.statSync(spaceshipPath).size / 1024).toFixed(2)} KB`);
    
    // 根據文件名 "sprite_player_spaceship_up_down.png" 分析可能的布局
    console.log('\n🎯 根據文件名分析可能的布局:');
    console.log('   文件名包含 "up_down" 表示可能是上下移動動畫');
    
    // 嘗試不同的幀布局配置
    const possibleLayouts = [
      { name: '垂直2幀 (上下)', cols: 1, rows: 2, desc: '垂直排列，上幀和下幀' },
      { name: '垂直3幀 (上中下)', cols: 1, rows: 3, desc: '垂直排列，上中下三個狀態' },
      { name: '垂直4幀', cols: 1, rows: 4, desc: '垂直排列，4個動畫幀' },
      { name: '水平2幀', cols: 2, rows: 1, desc: '水平排列，2個狀態' },
      { name: '水平3幀', cols: 3, rows: 1, desc: '水平排列，3個狀態' },
      { name: '水平4幀', cols: 4, rows: 1, desc: '水平排列，4個動畫幀' },
      { name: '2x2網格', cols: 2, rows: 2, desc: '2x2網格布局' }
    ];
    
    console.log('\n💡 可能的幀布局配置:');
    
    for (let i = 0; i < possibleLayouts.length; i++) {
      const layout = possibleLayouts[i];
      const frameWidth = Math.floor(image.width / layout.cols);
      const frameHeight = Math.floor(image.height / layout.rows);
      
      console.log(`\n   ${i + 1}. ${layout.name}:`);
      console.log(`      幀尺寸: ${frameWidth} x ${frameHeight}`);
      console.log(`      總幀數: ${layout.cols * layout.rows}`);
      console.log(`      描述: ${layout.desc}`);
      
      // 檢查是否為合理的幀尺寸
      if (frameWidth > 16 && frameHeight > 16 && frameWidth < 512 && frameHeight < 512) {
        console.log(`      ✅ 合理的幀尺寸`);
      } else {
        console.log(`      ⚠️  幀尺寸可能不合理`);
      }
    }
    
    // 推薦最可能的配置
    console.log('\n🎯 推薦配置:');
    
    // 基於文件名 "up_down" 推測最可能是垂直布局
    if (image.height > image.width) {
      console.log('   圖片高度大於寬度，推薦垂直布局');
      const rows = Math.round(image.height / image.width);
      const frameWidth = image.width;
      const frameHeight = Math.floor(image.height / rows);
      
      console.log(`   推薦: 垂直${rows}幀布局`);
      console.log(`   幀尺寸: ${frameWidth} x ${frameHeight}`);
      
      return {
        width: image.width,
        height: image.height,
        recommendedLayout: {
          cols: 1,
          rows: rows,
          frameWidth: frameWidth,
          frameHeight: frameHeight,
          totalFrames: rows,
          type: 'vertical'
        }
      };
    } else {
      console.log('   圖片寬度大於或等於高度，推薦水平布局');
      const cols = Math.round(image.width / image.height);
      const frameWidth = Math.floor(image.width / cols);
      const frameHeight = image.height;
      
      console.log(`   推薦: 水平${cols}幀布局`);
      console.log(`   幀尺寸: ${frameWidth} x ${frameHeight}`);
      
      return {
        width: image.width,
        height: image.height,
        recommendedLayout: {
          cols: cols,
          rows: 1,
          frameWidth: frameWidth,
          frameHeight: frameHeight,
          totalFrames: cols,
          type: 'horizontal'
        }
      };
    }
    
  } catch (error) {
    console.error('❌ 分析新太空船失敗:', error.message);
    return null;
  }
}

// 如果直接運行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeNewSpaceship().then(result => {
    if (result) {
      console.log('\n🎯 分析完成！');
      console.log('📋 建議的 Phaser 配置:');
      const layout = result.recommendedLayout;
      
      console.log(`\nthis.load.spritesheet('player_spaceship', 'assets/sprite_player_spaceship_up_down.png', {`);
      console.log(`  frameWidth: ${layout.frameWidth},`);
      console.log(`  frameHeight: ${layout.frameHeight}`);
      console.log(`});`);
      
      console.log(`\nthis.anims.create({`);
      console.log(`  key: 'spaceship_fly',`);
      console.log(`  frames: this.anims.generateFrameNumbers('player_spaceship', { start: 0, end: ${layout.totalFrames - 1} }),`);
      console.log(`  frameRate: 8,`);
      console.log(`  repeat: -1`);
      console.log(`});`);
      
    } else {
      console.error('💥 分析失敗！');
      process.exit(1);
    }
  });
}

export { analyzeNewSpaceship };
