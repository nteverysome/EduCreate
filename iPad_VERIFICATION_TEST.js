// ============================================================================
// iPad 容器大小動態調整系統 - 驗證測試
// ============================================================================

// 🔥 第一步：iPad 容器大小分類函數
function classifyIPadSize(w, h) {
    if (w <= 768) return 'small';      // iPad mini: 768×1024
    else if (w <= 820) return 'medium'; // iPad/Air: 810×1080, 820×1180
    else if (w <= 834) return 'large';  // iPad Pro 11": 834×1194
    else return 'xlarge';               // iPad Pro 12.9": 1024×1366
}

// 🔥 第二步：根據 iPad 大小獲取最優參數
function getIPadOptimalParams(iPadSize) {
    const params = {
        small: {
            sideMargin: 15,
            topButtonArea: 40,
            bottomButtonArea: 40,
            horizontalSpacing: 12,
            verticalSpacing: 35,
            chineseFontSize: 24
        },
        medium: {
            sideMargin: 18,
            topButtonArea: 42,
            bottomButtonArea: 42,
            horizontalSpacing: 14,
            verticalSpacing: 38,
            chineseFontSize: 28
        },
        large: {
            sideMargin: 20,
            topButtonArea: 45,
            bottomButtonArea: 45,
            horizontalSpacing: 15,
            verticalSpacing: 40,
            chineseFontSize: 32
        },
        xlarge: {
            sideMargin: 25,
            topButtonArea: 50,
            bottomButtonArea: 50,
            horizontalSpacing: 18,
            verticalSpacing: 45,
            chineseFontSize: 36
        }
    };
    return params[iPadSize];
}

// ============================================================================
// 測試用例
// ============================================================================

const testCases = [
    { name: 'iPad mini', width: 768, height: 1024 },
    { name: 'iPad 標準', width: 810, height: 1080 },
    { name: 'iPad Air', width: 820, height: 1180 },
    { name: 'iPad Pro 11"', width: 834, height: 1194 },
    { name: 'iPad Pro 12.9"', width: 1024, height: 1366 }
];

console.log('='.repeat(100));
console.log('📱 iPad 容器大小動態調整系統 - 驗證測試');
console.log('='.repeat(100));

testCases.forEach(testCase => {
    const { name, width, height } = testCase;
    const iPadSize = classifyIPadSize(width, height);
    const params = getIPadOptimalParams(iPadSize);
    
    // 計算可用空間
    const availableWidth = width - params.sideMargin * 2;
    const availableHeight = height - params.topButtonArea - params.bottomButtonArea;
    
    // 計算卡片尺寸（5列）
    const cols = 5;
    const cardWidth = (availableWidth - params.horizontalSpacing * (cols + 1)) / cols;
    const rows = 2; // 假設 2 行
    const cardHeight = (availableHeight - params.verticalSpacing * (rows + 1)) / rows / 1.4;
    
    console.log(`\n📱 ${name} (${width}×${height})`);
    console.log('-'.repeat(100));
    console.log(`  分類: ${iPadSize}`);
    console.log(`  邊距設定:`);
    console.log(`    - sideMargin: ${params.sideMargin}px`);
    console.log(`    - topButtonArea: ${params.topButtonArea}px`);
    console.log(`    - bottomButtonArea: ${params.bottomButtonArea}px`);
    console.log(`  間距設定:`);
    console.log(`    - horizontalSpacing: ${params.horizontalSpacing}px`);
    console.log(`    - verticalSpacing: ${params.verticalSpacing}px`);
    console.log(`  文字大小: ${params.chineseFontSize}px`);
    console.log(`  可用空間:`);
    console.log(`    - availableWidth: ${availableWidth.toFixed(1)}px`);
    console.log(`    - availableHeight: ${availableHeight.toFixed(1)}px`);
    console.log(`  卡片尺寸 (5列 × 2行):`);
    console.log(`    - cardWidth: ${cardWidth.toFixed(1)}px`);
    console.log(`    - cardHeight: ${cardHeight.toFixed(1)}px`);
    console.log(`    - 比例: ${(cardWidth / cardHeight).toFixed(2)}:1`);
});

console.log('\n' + '='.repeat(100));
console.log('✅ 驗證完成');
console.log('='.repeat(100));

// ============================================================================
// 對比分析
// ============================================================================

console.log('\n📊 對比分析 - iPad 1024×1366 vs iPad 768×1024');
console.log('='.repeat(100));

const xlarge = getIPadOptimalParams('xlarge');
const small = getIPadOptimalParams('small');

console.log('\n邊距對比:');
console.log(`  sideMargin: ${small.sideMargin}px (small) → ${xlarge.sideMargin}px (xlarge) [+${((xlarge.sideMargin - small.sideMargin) / small.sideMargin * 100).toFixed(0)}%]`);
console.log(`  topButtonArea: ${small.topButtonArea}px (small) → ${xlarge.topButtonArea}px (xlarge) [+${((xlarge.topButtonArea - small.topButtonArea) / small.topButtonArea * 100).toFixed(0)}%]`);

console.log('\n間距對比:');
console.log(`  horizontalSpacing: ${small.horizontalSpacing}px (small) → ${xlarge.horizontalSpacing}px (xlarge) [+${((xlarge.horizontalSpacing - small.horizontalSpacing) / small.horizontalSpacing * 100).toFixed(0)}%]`);
console.log(`  verticalSpacing: ${small.verticalSpacing}px (small) → ${xlarge.verticalSpacing}px (xlarge) [+${((xlarge.verticalSpacing - small.verticalSpacing) / small.verticalSpacing * 100).toFixed(0)}%]`);

console.log('\n文字大小對比:');
console.log(`  chineseFontSize: ${small.chineseFontSize}px (small) → ${xlarge.chineseFontSize}px (xlarge) [+${((xlarge.chineseFontSize - small.chineseFontSize) / small.chineseFontSize * 100).toFixed(0)}%]`);

console.log('\n' + '='.repeat(100));

