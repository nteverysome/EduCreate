/**
 * 調試太空船圖片的腳本 - 檢查實際尺寸和配置
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugSpaceshipImage() {
  try {
    const imagePath = path.join(__dirname, '../public/assets/sprite_player_spaceship_up_down.png');
    
    console.log('🔍 調試太空船圖片...');
    console.log(`📁 檢查文件: ${imagePath}`);
    
    if (!fs.existsSync(imagePath)) {
      console.error('❌ 圖片文件不存在!');
      return;
    }
    
    const stats = fs.statSync(imagePath);
    console.log(`📊 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // 載入圖片
    const image = await loadImage(imagePath);
    console.log(`🖼️ 圖片尺寸: ${image.width} x ${image.height} pixels`);
    
    // 嘗試不同的幀配置
    console.log('\n🎯 可能的幀配置:');
    
    const possibleConfigs = [
      { name: '單幀 (整張圖)', frameWidth: image.width, frameHeight: image.height, frames: 1 },
      { name: '水平2幀', frameWidth: Math.floor(image.width / 2), frameHeight: image.height, frames: 2 },
      { name: '水平3幀', frameWidth: Math.floor(image.width / 3), frameHeight: image.height, frames: 3 },
      { name: '水平4幀', frameWidth: Math.floor(image.width / 4), frameHeight: image.height, frames: 4 },
      { name: '垂直2幀', frameWidth: image.width, frameHeight: Math.floor(image.height / 2), frames: 2 },
      { name: '垂直3幀', frameWidth: image.width, frameHeight: Math.floor(image.height / 3), frames: 3 },
      { name: '垂直4幀', frameWidth: image.width, frameHeight: Math.floor(image.height / 4), frames: 4 },
      { name: '2x2網格', frameWidth: Math.floor(image.width / 2), frameHeight: Math.floor(image.height / 2), frames: 4 }
    ];
    
    for (let i = 0; i < possibleConfigs.length; i++) {
      const config = possibleConfigs[i];
      console.log(`\n   ${i + 1}. ${config.name}:`);
      console.log(`      frameWidth: ${config.frameWidth}`);
      console.log(`      frameHeight: ${config.frameHeight}`);
      console.log(`      總幀數: ${config.frames}`);
      
      // 檢查是否為合理的配置
      if (config.frameWidth > 0 && config.frameHeight > 0 && 
          config.frameWidth <= image.width && config.frameHeight <= image.height) {
        console.log(`      ✅ 有效配置`);
      } else {
        console.log(`      ❌ 無效配置`);
      }
    }
    
    // 基於文件名推薦配置
    console.log('\n🎯 基於文件名 "sprite_player_spaceship_up_down.png" 的推薦:');
    
    if (image.height > image.width) {
      // 垂直布局
      const rows = 2; // up_down 表示上下兩個狀態
      const frameWidth = image.width;
      const frameHeight = Math.floor(image.height / rows);
      
      console.log(`   推薦: 垂直2幀布局 (上下移動)`);
      console.log(`   frameWidth: ${frameWidth}`);
      console.log(`   frameHeight: ${frameHeight}`);
      console.log(`   總幀數: ${rows}`);
      
      return {
        recommended: {
          frameWidth: frameWidth,
          frameHeight: frameHeight,
          totalFrames: rows,
          layout: 'vertical'
        }
      };
    } else {
      // 水平布局
      const cols = 2; // up_down 表示左右兩個狀態
      const frameWidth = Math.floor(image.width / cols);
      const frameHeight = image.height;
      
      console.log(`   推薦: 水平2幀布局`);
      console.log(`   frameWidth: ${frameWidth}`);
      console.log(`   frameHeight: ${frameHeight}`);
      console.log(`   總幀數: ${cols}`);
      
      return {
        recommended: {
          frameWidth: frameWidth,
          frameHeight: frameHeight,
          totalFrames: cols,
          layout: 'horizontal'
        }
      };
    }
    
  } catch (error) {
    console.error('❌ 調試失敗:', error.message);
    return null;
  }
}

// 如果直接運行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  debugSpaceshipImage().then(result => {
    if (result) {
      console.log('\n💻 建議的 Phaser 配置:');
      const config = result.recommended;
      
      console.log(`\nthis.load.spritesheet('player_spaceship', 'assets/sprite_player_spaceship_up_down.png', {`);
      console.log(`  frameWidth: ${config.frameWidth},`);
      console.log(`  frameHeight: ${config.frameHeight}`);
      console.log(`});`);
      
      console.log(`\nthis.anims.create({`);
      console.log(`  key: 'spaceship_fly',`);
      console.log(`  frames: this.anims.generateFrameNumbers('player_spaceship', { start: 0, end: ${config.totalFrames - 1} }),`);
      console.log(`  frameRate: 6,`);
      console.log(`  repeat: -1`);
      console.log(`});`);
      
    } else {
      console.error('💥 無法生成配置建議');
    }
  });
}

export { debugSpaceshipImage };
