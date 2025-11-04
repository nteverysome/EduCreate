/**
 * 手機直向佈局分析工具
 * 模擬手機直向環境（375×667px）並分析佈局邏輯
 */

// 模擬手機直向設備參數
const MOBILE_PORTRAIT = {
    width: 375,
    height: 667,
    itemCount: 20,  // 每頁卡片數
    hasImages: true  // 假設有圖片
};

console.log('📱 手機直向佈局分析');
console.log('='.repeat(60));
console.log('設備參數:', MOBILE_PORTRAIT);
console.log('='.repeat(60));

// 模擬 createMixedLayout 函數的邏輯
function analyzeLayout(width, height, itemCount, hasImages) {
    console.log('\n🔍 開始分析佈局...\n');

    // 響應式檢測
    const isMobileDevice = width < 768;
    const isLandscapeMobile = width > height && height < 500;
    const isTinyHeight = height < 400;
    const isCompactMode = isMobileDevice || isLandscapeMobile || isTinyHeight;

    console.log('📱 響應式檢測:');
    console.log(`  - isMobileDevice: ${isMobileDevice} (width ${width} < 768)`);
    console.log(`  - isLandscapeMobile: ${isLandscapeMobile} (width ${width} > height ${height} && height < 500)`);
    console.log(`  - isTinyHeight: ${isTinyHeight} (height ${height} < 400)`);
    console.log(`  - isCompactMode: ${isCompactMode}`);
    console.log(`  - aspectRatio: ${(width / height).toFixed(2)}`);

    if (isCompactMode) {
        console.log('\n📱 進入緊湊模式（手機直向）');
        
        // 緊湊模式邏輯
        const cols = Math.min(5, itemCount);
        const rows = Math.ceil(itemCount / cols);
        
        console.log(`  - 列數: ${cols}`);
        console.log(`  - 行數: ${rows}`);
        console.log(`  - 總卡片: ${cols * rows}`);
        
        return {
            mode: '緊湊模式',
            cols,
            rows,
            totalCards: cols * rows
        };
    } else {
        console.log('\n🖥️ 進入桌面模式');
        
        // 桌面模式邏輯
        const aspectRatio = width / height;
        const topButtonAreaHeight = Math.max(50, Math.min(80, height * 0.08));
        const bottomButtonAreaHeight = Math.max(50, Math.min(80, height * 0.10));
        const sideMargin = Math.max(30, Math.min(80, width * 0.03));
        
        const availableWidth = width - sideMargin * 2;
        const availableHeight = height - topButtonAreaHeight - bottomButtonAreaHeight;
        
        console.log(`  - 可用寬度: ${availableWidth.toFixed(1)}px`);
        console.log(`  - 可用高度: ${availableHeight.toFixed(1)}px`);
        
        if (hasImages) {
            console.log('\n🟦 進入正方形模式（有圖片）');
            
            // 正方形模式邏輯
            const minSquareSize = 150;
            const horizontalSpacing = Math.max(15, Math.min(30, width * 0.01));
            const verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
            
            const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (minSquareSize + horizontalSpacing));
            
            let optimalCols;
            if (aspectRatio > 1.5) {
                optimalCols = Math.min(maxPossibleCols, 10, itemCount);
            } else if (aspectRatio > 1.2) {
                optimalCols = Math.min(maxPossibleCols, Math.ceil(10 * 0.8), itemCount);
            } else {
                optimalCols = Math.min(maxPossibleCols, Math.ceil(10 * 0.5), itemCount);
            }
            
            optimalCols = Math.max(1, Math.min(optimalCols, itemCount));
            const optimalRows = Math.ceil(itemCount / optimalCols);
            
            console.log(`  - 最小正方形尺寸: ${minSquareSize}px`);
            console.log(`  - 水平間距: ${horizontalSpacing.toFixed(1)}px`);
            console.log(`  - 垂直間距: ${verticalSpacing.toFixed(1)}px`);
            console.log(`  - 最大可能列數: ${maxPossibleCols}`);
            console.log(`  - 最佳列數: ${optimalCols}`);
            console.log(`  - 行數: ${optimalRows}`);
            
            return {
                mode: '正方形模式',
                cols: optimalCols,
                rows: optimalRows,
                totalCards: optimalCols * optimalRows,
                hasImages: true
            };
        } else {
            console.log('\n🟨 進入長方形模式（無圖片）');
            
            // 長方形模式邏輯
            const horizontalSpacing = Math.max(15, Math.min(30, width * 0.01));
            const verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
            
            const minCardWidth = 200;
            const minCardHeight = 100;
            
            const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (minCardWidth + horizontalSpacing));
            
            let optimalCols;
            if (aspectRatio > 2.0) {
                optimalCols = Math.min(8, Math.ceil(Math.sqrt(itemCount * aspectRatio)));
            } else if (aspectRatio > 1.5) {
                optimalCols = Math.min(6, Math.ceil(Math.sqrt(itemCount * aspectRatio / 1.5)));
            } else if (aspectRatio > 1.2) {
                optimalCols = Math.min(5, Math.ceil(Math.sqrt(itemCount)));
            } else {
                optimalCols = Math.min(5, Math.ceil(Math.sqrt(itemCount / aspectRatio)));
            }
            
            optimalCols = Math.max(1, Math.min(optimalCols, maxPossibleCols, itemCount));
            let optimalRows = Math.ceil(itemCount / optimalCols);
            
            console.log(`  - 最小卡片寬度: ${minCardWidth}px`);
            console.log(`  - 最小卡片高度: ${minCardHeight}px`);
            console.log(`  - 水平間距: ${horizontalSpacing.toFixed(1)}px`);
            console.log(`  - 垂直間距: ${verticalSpacing.toFixed(1)}px`);
            console.log(`  - 最大可能列數: ${maxPossibleCols}`);
            console.log(`  - 最佳列數: ${optimalCols}`);
            console.log(`  - 行數: ${optimalRows}`);
            
            return {
                mode: '長方形模式',
                cols: optimalCols,
                rows: optimalRows,
                totalCards: optimalCols * optimalRows,
                hasImages: false
            };
        }
    }
}

// 執行分析
const result = analyzeLayout(
    MOBILE_PORTRAIT.width,
    MOBILE_PORTRAIT.height,
    MOBILE_PORTRAIT.itemCount,
    MOBILE_PORTRAIT.hasImages
);

console.log('\n' + '='.repeat(60));
console.log('📊 分析結果:');
console.log('='.repeat(60));
console.log(JSON.stringify(result, null, 2));

console.log('\n' + '='.repeat(60));
console.log('🎯 預期結果:');
console.log('='.repeat(60));
console.log('✅ 正確情況:');
console.log('  - 模式: 正方形模式（因為 hasImages = true）');
console.log('  - 列數: 5');
console.log('  - 行數: 4');
console.log('  - 總卡片: 20');

console.log('\n❌ 錯誤情況:');
console.log('  - 模式: 長方形模式（因為 hasImages = false）');
console.log('  - 列數: 3');
console.log('  - 行數: 4');
console.log('  - 總卡片: 12');

console.log('\n' + '='.repeat(60));
if (result.mode === '正方形模式' && result.cols === 5 && result.rows === 4) {
    console.log('✅ 分析結果正確！');
} else if (result.mode === '緊湊模式' && result.cols === 5 && result.rows === 4) {
    console.log('✅ 分析結果正確（緊湊模式）！');
} else {
    console.log('❌ 分析結果不符合預期！');
    console.log('可能原因: hasImages 檢測失敗');
}
console.log('='.repeat(60));

