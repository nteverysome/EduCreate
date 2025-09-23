const fs = require('fs');
const path = require('path');

// 創建缺失的精靈圖文件
function createMissingSprites() {
    console.log('🎨 創建缺失的精靈圖文件...');
    
    const assetsDir = 'public/games/pushpull-game/dist/assets/images';
    
    // 創建簡單的 1x1 像素 PNG 文件 (Base64 編碼)
    const createSimplePNG = (width, height, color = [255, 255, 255, 255]) => {
        // 這是一個 1x1 白色像素的 PNG 文件的 Base64 編碼
        const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        return Buffer.from(base64PNG, 'base64');
    };
    
    // 需要創建的精靈圖文件
    const missingSprites = [
        { name: 'spider.png', width: 32, height: 32 },
        { name: 'heart.png', width: 32, height: 32 },
        { name: 'frog.png', width: 32, height: 48 },
        { name: 'frog2.png', width: 48, height: 32 },
        { name: 'trail.png', width: 32, height: 32 },
        { name: 'block.png', width: 48, height: 48 },
        { name: 'star.png', width: 32, height: 32 }
    ];
    
    missingSprites.forEach(sprite => {
        const filePath = path.join(assetsDir, sprite.name);
        
        if (!fs.existsSync(filePath)) {
            console.log(`📝 創建 ${sprite.name} (${sprite.width}x${sprite.height})`);
            
            // 創建簡單的佔位符 PNG
            const pngData = createSimplePNG(sprite.width, sprite.height);
            fs.writeFileSync(filePath, pngData);
            
            console.log(`✅ ${sprite.name} 已創建`);
        } else {
            console.log(`✅ ${sprite.name} 已存在`);
        }
    });
    
    console.log('🎨 精靈圖文件創建完成');
}

// 執行創建
createMissingSprites();
