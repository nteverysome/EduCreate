/**
 * SeparatedLayoutCalculator 新方法測試
 * 測試 Screenshot_279 更新的新方法
 */

// 模擬全局對象
if (typeof window === 'undefined') {
    global.window = {};
}

// 加載計算器
const SeparatedLayoutCalculator = require('./separated-layout-calculator.js');

console.log('🧪 開始測試 SeparatedLayoutCalculator 新方法\n');

// 測試 1: calculateLeftLayout
console.log('📊 測試 1: calculateLeftLayout()');
const testCases = [
    { itemCount: 3, expected: { columns: 1, rows: 3, layout: 'single-column' } },
    { itemCount: 4, expected: { columns: 1, rows: 4, layout: 'single-column' } },
    { itemCount: 5, expected: { columns: 1, rows: 5, layout: 'single-column' } },
    { itemCount: 7, expected: { columns: 2, rows: 4, layout: 'multi-rows' } },
    { itemCount: 10, expected: { columns: 10, rows: 1, layout: 'single-row' } },
    { itemCount: 20, expected: { columns: 10, rows: 2, layout: 'multi-rows' } }
];

const calculator = new SeparatedLayoutCalculator(1024, 768, 7, 'left-right');

testCases.forEach(testCase => {
    const result = calculator.calculateLeftLayout(testCase.itemCount);
    const passed = 
        result.columns === testCase.expected.columns &&
        result.rows === testCase.expected.rows &&
        result.layout === testCase.expected.layout;
    
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} itemCount=${testCase.itemCount}: ${JSON.stringify(result)}`);
});

// 測試 2: calculateRightLayout
console.log('\n📊 測試 2: calculateRightLayout()');
[3, 5, 7, 10, 20].forEach(itemCount => {
    const result = calculator.calculateRightLayout(itemCount);
    const passed = result.columns === 1 && result.rows === itemCount && result.layout === 'single-column';
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} itemCount=${itemCount}: ${JSON.stringify(result)}`);
});

// 測試 3: calculateCardSizeByItemCount
console.log('\n📊 測試 3: calculateCardSizeByItemCount()');
const sizeTestCases = [
    { itemCount: 3, expected: { width: 120, height: 65 } },
    { itemCount: 4, expected: { width: 110, height: 56 } },
    { itemCount: 5, expected: { width: 100, height: 48 } },
    { itemCount: 7, expected: { width: 80, height: 35 } },
    { itemCount: 10, expected: { width: 60, height: 28 } },
    { itemCount: 20, expected: { width: 70, height: 40 } }
];

sizeTestCases.forEach(testCase => {
    const result = calculator.calculateCardSizeByItemCount(testCase.itemCount);
    const passed = result.width === testCase.expected.width && result.height === testCase.expected.height;
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} itemCount=${testCase.itemCount}: ${result.width}×${result.height}px`);
});

// 測試 4: calculateLeftCardPosition
console.log('\n📊 測試 4: calculateLeftCardPosition()');
const leftLayout = calculator.calculateLeftLayout(7);
console.log(`  佈局: ${leftLayout.columns} 列 × ${leftLayout.rows} 行`);
for (let i = 0; i < 7; i++) {
    const pos = calculator.calculateLeftCardPosition(i, leftLayout.columns, 80, 35, 100, 100);
    console.log(`  ✅ 卡片 ${i}: (${pos.x.toFixed(0)}, ${pos.y.toFixed(0)})`);
}

// 測試 5: calculateRightCardPosition
console.log('\n📊 測試 5: calculateRightCardPosition()');
for (let i = 0; i < 5; i++) {
    const pos = calculator.calculateRightCardPosition(i, 35, 500, 100);
    console.log(`  ✅ 卡片 ${i}: (${pos.x.toFixed(0)}, ${pos.y.toFixed(0)})`);
}

console.log('\n✅ 所有測試完成！');

