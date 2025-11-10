/**
 * 🔥 [Phase 5] 單元測試 - 分離模式配置系統
 * 
 * 測試對象：
 * - DeviceDetector 類
 * - SeparatedModeConfig 類
 * - SeparatedLayoutCalculator 類
 * 
 * 測試框架：簡單的測試框架（不依賴外部庫）
 */

// 🔥 簡單的測試框架
class SimpleTestFramework {
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
        console.log('🧪 開始運行單元測試...\n');

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
        console.log('📊 測試結果摘要');
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

// 🔥 創建測試框架實例
const testFramework = new SimpleTestFramework();

// ============================================
// DeviceDetector 單元測試
// ============================================

testFramework.test('DeviceDetector.getDeviceType - 手機直向', () => {
    const deviceType = DeviceDetector.getDeviceType(375, 667);
    testFramework.assertEqual(deviceType, 'mobile-portrait', 'DeviceDetector.getDeviceType');
});

testFramework.test('DeviceDetector.getDeviceType - 手機橫向', () => {
    const deviceType = DeviceDetector.getDeviceType(667, 375);
    testFramework.assertEqual(deviceType, 'mobile-landscape', 'DeviceDetector.getDeviceType');
});

testFramework.test('DeviceDetector.getDeviceType - 平板直向', () => {
    const deviceType = DeviceDetector.getDeviceType(768, 1024);
    testFramework.assertEqual(deviceType, 'tablet-portrait', 'DeviceDetector.getDeviceType');
});

testFramework.test('DeviceDetector.getDeviceType - 平板橫向', () => {
    const deviceType = DeviceDetector.getDeviceType(1024, 768);
    testFramework.assertEqual(deviceType, 'tablet-landscape', 'DeviceDetector.getDeviceType');
});

testFramework.test('DeviceDetector.getDeviceType - 桌面', () => {
    const deviceType = DeviceDetector.getDeviceType(1920, 1080);
    testFramework.assertEqual(deviceType, 'desktop', 'DeviceDetector.getDeviceType');
});

testFramework.test('DeviceDetector.getScreenSize - 小屏幕', () => {
    const screenSize = DeviceDetector.getScreenSize(400);
    testFramework.assertEqual(screenSize, 'small', 'DeviceDetector.getScreenSize');
});

testFramework.test('DeviceDetector.getScreenSize - 中等屏幕', () => {
    const screenSize = DeviceDetector.getScreenSize(700);
    testFramework.assertEqual(screenSize, 'medium', 'DeviceDetector.getScreenSize');
});

testFramework.test('DeviceDetector.getScreenSize - 大屏幕', () => {
    const screenSize = DeviceDetector.getScreenSize(1000);
    testFramework.assertEqual(screenSize, 'large', 'DeviceDetector.getScreenSize');
});

// ============================================
// SeparatedLayoutCalculator 單元測試
// ============================================

testFramework.test('SeparatedLayoutCalculator - 計算卡片尺寸', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 5, 'left-right');
    const cardSize = calculator.calculateCardSize();
    
    testFramework.assert(cardSize.width > 0, '卡片寬度應大於 0');
    testFramework.assert(cardSize.height > 0, '卡片高度應大於 0');
    testFramework.assert(cardSize.width <= 375, '卡片寬度應小於等於屏幕寬度');
    testFramework.assert(cardSize.height <= 667, '卡片高度應小於等於屏幕高度');
});

testFramework.test('SeparatedLayoutCalculator - 計算位置', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 5, 'left-right');
    const positions = calculator.calculatePositions();
    
    testFramework.assert(positions.leftX >= 0, '左側 X 應大於等於 0');
    testFramework.assert(positions.rightX >= 0, '右側 X 應大於等於 0');
    testFramework.assert(positions.leftStartY >= 0, '左側 Y 應大於等於 0');
    testFramework.assert(positions.rightStartY >= 0, '右側 Y 應大於等於 0');
});

testFramework.test('SeparatedLayoutCalculator - 計算間距', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 5, 'left-right');
    const spacing = calculator.calculateSpacing();
    
    testFramework.assert(spacing.horizontal >= 0, '水平間距應大於等於 0');
    testFramework.assert(spacing.vertical >= 0, '垂直間距應大於等於 0');
});

testFramework.test('SeparatedLayoutCalculator - 計算列數', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 10, 'left-right');
    const columns = calculator.calculateColumns(false);
    
    testFramework.assert(columns > 0, '列數應大於 0');
    testFramework.assert(columns <= 10, '列數應小於等於卡片數');
});

testFramework.test('SeparatedLayoutCalculator - 計算行數', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 10, 'left-right');
    const columns = calculator.calculateColumns(false);
    const rows = calculator.calculateRows(columns);
    
    testFramework.assert(rows > 0, '行數應大於 0');
    testFramework.assert(rows * columns >= 10, '行數 × 列數應大於等於卡片數');
});

testFramework.test('SeparatedLayoutCalculator - 計算字體大小', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 5, 'left-right');
    const fontSize = calculator.calculateFontSize(50, 'Hello');
    
    testFramework.assert(fontSize > 0, '字體大小應大於 0');
    testFramework.assert(fontSize <= 50, '字體大小應小於等於卡片高度');
});

testFramework.test('SeparatedLayoutCalculator - 獲取佈局變體', () => {
    const calculator1 = new SeparatedLayoutCalculator(375, 667, 3, 'left-right');
    const variant1 = calculator1.getLayoutVariant();
    testFramework.assertEqual(variant1, 'single-column', 'SeparatedLayoutCalculator.getLayoutVariant');

    const calculator2 = new SeparatedLayoutCalculator(375, 667, 10, 'left-right');
    const variant2 = calculator2.getLayoutVariant();
    testFramework.assertEqual(variant2, 'multi-rows', 'SeparatedLayoutCalculator.getLayoutVariant');
});

// ============================================
// 邊界值測試
// ============================================

testFramework.test('邊界值測試 - 最小卡片數', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 1, 'left-right');
    const cardSize = calculator.calculateCardSize();
    
    testFramework.assert(cardSize.width > 0, '最小卡片數時卡片寬度應大於 0');
    testFramework.assert(cardSize.height > 0, '最小卡片數時卡片高度應大於 0');
});

testFramework.test('邊界值測試 - 最大卡片數', () => {
    const calculator = new SeparatedLayoutCalculator(375, 667, 30, 'left-right');
    const cardSize = calculator.calculateCardSize();
    
    testFramework.assert(cardSize.width > 0, '最大卡片數時卡片寬度應大於 0');
    testFramework.assert(cardSize.height > 0, '最大卡片數時卡片高度應大於 0');
});

testFramework.test('邊界值測試 - 最小屏幕尺寸', () => {
    const calculator = new SeparatedLayoutCalculator(320, 568, 5, 'left-right');
    const cardSize = calculator.calculateCardSize();
    
    testFramework.assert(cardSize.width > 0, '最小屏幕尺寸時卡片寬度應大於 0');
    testFramework.assert(cardSize.height > 0, '最小屏幕尺寸時卡片高度應大於 0');
});

testFramework.test('邊界值測試 - 最大屏幕尺寸', () => {
    const calculator = new SeparatedLayoutCalculator(2560, 1440, 5, 'left-right');
    const cardSize = calculator.calculateCardSize();
    
    testFramework.assert(cardSize.width > 0, '最大屏幕尺寸時卡片寬度應大於 0');
    testFramework.assert(cardSize.height > 0, '最大屏幕尺寸時卡片高度應大於 0');
});

// ============================================
// 運行測試
// ============================================

// 等待 DOM 加載完成後運行測試
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        testFramework.run();
    });
} else {
    testFramework.run();
}

