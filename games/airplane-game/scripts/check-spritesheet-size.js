/**
 * 檢查精靈表尺寸的腳本
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkSpritesheetSize() {
  try {
    const spritesheetPath = path.join(__dirname, '../public/assets/random_shooter-sheet.png');
    
    if (!fs.existsSync(spritesheetPath)) {
      console.error('❌ 精靈表文件不存在:', spritesheetPath);
      return;
    }
    
    console.log('🔍 檢查精靈表尺寸...');
    
    const image = await loadImage(spritesheetPath);
    
    console.log('📊 精靈表信息:');
    console.log(`   文件路徑: ${spritesheetPath}`);
    console.log(`   圖片尺寸: ${image.width} x ${image.height} pixels`);
    console.log(`   文件大小: ${(fs.statSync(spritesheetPath).size / 1024).toFixed(2)} KB`);
    
    // 根據用戶描述：1行4列
    console.log('\n🎯 根據用戶描述 (1行4列) 計算幀尺寸:');
    const frameWidth = Math.floor(image.width / 4);  // 4列
    const frameHeight = image.height;                // 1行
    
    console.log(`   建議幀尺寸: ${frameWidth} x ${frameHeight}`);
    console.log(`   總幀數: 4 (1行 x 4列)`);
    
    // 生成 Phaser 配置
    console.log('\n💻 建議的 Phaser 配置:');
    console.log(`this.load.spritesheet('spaceship_animation', 'assets/random_shooter-sheet.png', {`);
    console.log(`  frameWidth: ${frameWidth},`);
    console.log(`  frameHeight: ${frameHeight}`);
    console.log(`});`);
    
    console.log('\n🎮 動畫配置:');
    console.log(`this.anims.create({`);
    console.log(`  key: 'spaceship_fly',`);
    console.log(`  frames: this.anims.generateFrameNumbers('spaceship_animation', { start: 0, end: 3 }),`);
    console.log(`  frameRate: 8,`);
    console.log(`  repeat: -1`);
    console.log(`});`);
    
    // 檢查是否為合理的幀尺寸
    if (frameWidth > 0 && frameHeight > 0) {
      console.log('\n✅ 幀尺寸計算成功');
      
      // 創建測試畫布來驗證
      const canvas = createCanvas(frameWidth * 4, frameHeight);
      const ctx = canvas.getContext('2d');
      
      // 繪製完整精靈表
      ctx.drawImage(image, 0, 0);
      
      // 保存測試圖片
      const testPath = path.join(__dirname, '../test-results/spritesheet-analysis.png');
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(testPath, buffer);
      
      console.log(`📸 測試圖片已保存: ${testPath}`);
      
      return {
        width: image.width,
        height: image.height,
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        totalFrames: 4
      };
    } else {
      console.error('❌ 計算出的幀尺寸無效');
      return null;
    }
    
  } catch (error) {
    console.error('❌ 檢查精靈表失敗:', error.message);
    return null;
  }
}

// 如果直接運行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  checkSpritesheetSize().then(result => {
    if (result) {
      console.log('\n🎯 檢查完成！請使用上述配置更新遊戲代碼。');
    } else {
      console.error('💥 檢查失敗！');
      process.exit(1);
    }
  });
}

export { checkSpritesheetSize };
