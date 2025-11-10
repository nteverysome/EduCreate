/**
 * 🔥 [Phase 5] 集成測試 - 分離模式佈局系統
 * 
 * 測試對象：
 * - 左右分離佈局（3-5 個卡片）
 * - 左右分離佈局（6-20 個卡片）
 * - 上下分離佈局（21+ 個卡片）
 * 
 * 測試方法：驗證佈局計算的正確性
 */

// 🔥 集成測試框架
class IntegrationTestFramework {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.results = [];
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('🧪 開始運行集成測試...\n');

        for (const test of this.tests) {
            try {
                await test.fn();
                this.passed++;
                this.results.push({ name: test.name, status: '✅ 通過' });
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.failed++;
                this.results.push({ name: test.name, status: '❌ 失敗', error: error.message });
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }

        this.printSummary();
    }

    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 集成測試結果摘要');
        console.log('='.repeat(50));
        console.log(`✅ 通過：${this.passed}`);
        console.log(`❌ 失敗：${this.failed}`);
        console.log(`📈 通過率：${((this.passed / (this.passed + this.failed)) * 100).toFixed(2)}%`);
        console.log('='.repeat(50) + '\n');
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message}: 期望 ${expected}，但得到 ${actual}`);
        }
    }

    assertRange(value, min, max, message) {
        if (value < min || value > max) {
            throw new Error(`${message}: 期望在 ${min}-${max} 之間，但得到 ${value}`);
        }
    }
}

// 🔥 創建集成測試框架實例
const integrationTestFramework = new IntegrationTestFramework();

// ============================================
// 左右分離佈局（3-5 個卡片）集成測試
// ============================================

integrationTestFramework.test('左右分離佈局 - 3 個卡片', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 3, 'left-right');
    
    const cardSize = calculator.calculateCardSize();
    const positions = calculator.calculatePositions();
    const spacing = calculator.calculateSpacing();
    const columns = calculator.calculateColumns(false);
    const rows = calculator.calculateRows(columns);
    
    integrationTestFramework.assert(cardSize.width > 0, '卡片寬度應大於 0');
    integrationTestFramework.assert(cardSize.height > 0, '卡片高度應大於 0');
    integrationTestFramework.assert(positions.leftX >= 0, '左側 X 應大於等於 0');
    integrationTestFramework.assert(positions.rightX >= 0, '右側 X 應大於等於 0');
    integrationTestFramework.assert(spacing.horizontal >= 0, '水平間距應大於等於 0');
    integrationTestFramework.assert(spacing.vertical >= 0, '垂直間距應大於等於 0');
    integrationTestFramework.assert(columns > 0, '列數應大於 0');
    integrationTestFramework.assert(rows > 0, '行數應大於 0');
});

integrationTestFramework.test('左右分離佈局 - 5 個卡片', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 5, 'left-right');
    
    const cardSize = calculator.calculateCardSize();
    const positions = calculator.calculatePositions();
    const spacing = calculator.calculateSpacing();
    const columns = calculator.calculateColumns(false);
    const rows = calculator.calculateRows(columns);
    
    integrationTestFramework.assert(cardSize.width > 0, '卡片寬度應大於 0');
    integrationTestFramework.assert(cardSize.height > 0, '卡片高度應大於 0');
    integrationTestFramework.assert(positions.leftX >= 0, '左側 X 應大於等於 0');
    integrationTestFramework.assert(positions.rightX >= 0, '右側 X 應大於等於 0');
    integrationTestFramework.assert(spacing.horizontal >= 0, '水平間距應大於等於 0');
    integrationTestFramework.assert(spacing.vertical >= 0, '垂直間距應大於等於 0');
    integrationTestFramework.assert(columns > 0, '列數應大於 0');
    integrationTestFramework.assert(rows > 0, '行數應大於 0');
});

// ============================================
// 左右分離佈局（6-20 個卡片）集成測試
// ============================================

integrationTestFramework.test('左右分離佈局 - 10 個卡片', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 10, 'left-right');
    
    const cardSize = calculator.calculateCardSize();
    const positions = calculator.calculatePositions();
    const spacing = calculator.calculateSpacing();
    const columns = calculator.calculateColumns(false);
    const rows = calculator.calculateRows(columns);
    
    integrationTestFramework.assert(cardSize.width > 0, '卡片寬度應大於 0');
    integrationTestFramework.assert(cardSize.height > 0, '卡片高度應大於 0');
    integrationTestFramework.assert(positions.leftX >= 0, '左側 X 應大於等於 0');
    integrationTestFramework.assert(positions.rightX >= 0, '右側 X 應大於等於 0');
    integrationTestFramework.assert(spacing.horizontal >= 0, '水平間距應大於等於 0');
    integrationTestFramework.assert(spacing.vertical >= 0, '垂直間距應大於等於 0');
    integrationTestFramework.assert(columns > 0, '列數應大於 0');
    integrationTestFramework.assert(rows > 0, '行數應大於 0');
    integrationTestFramework.assert(rows * columns >= 10, '行數 × 列數應大於等於卡片數');
});

integrationTestFramework.test('左右分離佈局 - 20 個卡片', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 20, 'left-right');
    
    const cardSize = calculator.calculateCardSize();
    const positions = calculator.calculatePositions();
    const spacing = calculator.calculateSpacing();
    const columns = calculator.calculateColumns(false);
    const rows = calculator.calculateRows(columns);
    
    integrationTestFramework.assert(cardSize.width > 0, '卡片寬度應大於 0');
    integrationTestFramework.assert(cardSize.height > 0, '卡片高度應大於 0');
    integrationTestFramework.assert(positions.leftX >= 0, '左側 X 應大於等於 0');
    integrationTestFramework.assert(positions.rightX >= 0, '右側 X 應大於等於 0');
    integrationTestFramework.assert(spacing.horizontal >= 0, '水平間距應大於等於 0');
    integrationTestFramework.assert(spacing.vertical >= 0, '垂直間距應大於等於 0');
    integrationTestFramework.assert(columns > 0, '列數應大於 0');
    integrationTestFramework.assert(rows > 0, '行數應大於 0');
    integrationTestFramework.assert(rows * columns >= 20, '行數 × 列數應大於等於卡片數');
});

// ============================================
// 上下分離佈局（21+ 個卡片）集成測試
// ============================================

integrationTestFramework.test('上下分離佈局 - 25 個卡片', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 25, 'top-bottom');
    
    const cardSize = calculator.calculateCardSize();
    const positions = calculator.calculatePositions();
    const spacing = calculator.calculateSpacing();
    const columns = calculator.calculateColumns(false);
    const rows = calculator.calculateRows(columns);
    
    integrationTestFramework.assert(cardSize.width > 0, '卡片寬度應大於 0');
    integrationTestFramework.assert(cardSize.height > 0, '卡片高度應大於 0');
    integrationTestFramework.assert(positions.leftX >= 0, '上方 X 應大於等於 0');
    integrationTestFramework.assert(positions.leftStartY >= 0, '上方 Y 應大於等於 0');
    integrationTestFramework.assert(positions.rightStartY >= 0, '下方 Y 應大於等於 0');
    integrationTestFramework.assert(spacing.horizontal >= 0, '水平間距應大於等於 0');
    integrationTestFramework.assert(spacing.vertical >= 0, '垂直間距應大於等於 0');
    integrationTestFramework.assert(columns > 0, '列數應大於 0');
    integrationTestFramework.assert(rows > 0, '行數應大於 0');
    integrationTestFramework.assert(rows * columns >= 25, '行數 × 列數應大於等於卡片數');
});

integrationTestFramework.test('上下分離佈局 - 30 個卡片', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 30, 'top-bottom');
    
    const cardSize = calculator.calculateCardSize();
    const positions = calculator.calculatePositions();
    const spacing = calculator.calculateSpacing();
    const columns = calculator.calculateColumns(false);
    const rows = calculator.calculateRows(columns);
    
    integrationTestFramework.assert(cardSize.width > 0, '卡片寬度應大於 0');
    integrationTestFramework.assert(cardSize.height > 0, '卡片高度應大於 0');
    integrationTestFramework.assert(positions.leftX >= 0, '上方 X 應大於等於 0');
    integrationTestFramework.assert(positions.leftStartY >= 0, '上方 Y 應大於等於 0');
    integrationTestFramework.assert(positions.rightStartY >= 0, '下方 Y 應大於等於 0');
    integrationTestFramework.assert(spacing.horizontal >= 0, '水平間距應大於等於 0');
    integrationTestFramework.assert(spacing.vertical >= 0, '垂直間距應大於等於 0');
    integrationTestFramework.assert(columns > 0, '列數應大於 0');
    integrationTestFramework.assert(rows > 0, '行數應大於 0');
    integrationTestFramework.assert(rows * columns >= 30, '行數 × 列數應大於等於卡片數');
});

// ============================================
// 多設備集成測試
// ============================================

integrationTestFramework.test('多設備測試 - 手機直向', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 10, 'left-right');
    const cardSize = calculator.calculateCardSize();
    
    integrationTestFramework.assert(cardSize.width > 0, '手機直向卡片寬度應大於 0');
    integrationTestFramework.assert(cardSize.height > 0, '手機直向卡片高度應大於 0');
});

integrationTestFramework.test('多設備測試 - 平板直向', () => {
    const calculator = new SeparatedLayoutCalculator(768, 1024, 10, 'left-right');
    const cardSize = calculator.calculateCardSize();
    
    integrationTestFramework.assert(cardSize.width > 0, '平板直向卡片寬度應大於 0');
    integrationTestFramework.assert(cardSize.height > 0, '平板直向卡片高度應大於 0');
});

integrationTestFramework.test('多設備測試 - 桌面', () => {
    const calculator = new SeparatedLayoutCalculator(1920, 1080, 10, 'left-right');
    const cardSize = calculator.calculateCardSize();
    
    integrationTestFramework.assert(cardSize.width > 0, '桌面卡片寬度應大於 0');
    integrationTestFramework.assert(cardSize.height > 0, '桌面卡片高度應大於 0');
});

// ============================================
// 運行測試
// ============================================

// 等待 DOM 加載完成後運行測試
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        integrationTestFramework.run();
    });
} else {
    integrationTestFramework.run();
}

