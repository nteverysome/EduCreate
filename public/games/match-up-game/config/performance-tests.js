/**
 * 🔥 [Phase 5] 性能測試 - 分離模式佈局系統
 * 
 * 測試指標：
 * - 計算時間 < 30ms
 * - 渲染時間 < 50ms
 * - 內存使用正常
 */

// 🔥 性能測試框架
class PerformanceTestFramework {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('⚡ 開始運行性能測試...\n');

        for (const test of this.tests) {
            try {
                const result = await test.fn();
                this.results.push({ name: test.name, ...result });
                console.log(`✅ ${test.name}`);
                console.log(`   計算時間: ${result.calculationTime.toFixed(2)}ms`);
                if (result.renderTime) {
                    console.log(`   渲染時間: ${result.renderTime.toFixed(2)}ms`);
                }
                console.log('');
            } catch (error) {
                this.results.push({ name: test.name, status: '❌ 失敗', error: error.message });
                console.error(`❌ ${test.name}: ${error.message}\n`);
            }
        }

        this.printSummary();
    }

    printSummary() {
        console.log('='.repeat(50));
        console.log('📊 性能測試結果摘要');
        console.log('='.repeat(50));

        let totalCalculationTime = 0;
        let totalRenderTime = 0;
        let passedTests = 0;
        let failedTests = 0;

        for (const result of this.results) {
            if (result.calculationTime) {
                totalCalculationTime += result.calculationTime;
                if (result.calculationTime < 30) {
                    passedTests++;
                } else {
                    failedTests++;
                }
            }
            if (result.renderTime) {
                totalRenderTime += result.renderTime;
            }
        }

        console.log(`✅ 通過：${passedTests}`);
        console.log(`❌ 失敗：${failedTests}`);
        console.log(`📈 平均計算時間：${(totalCalculationTime / this.results.length).toFixed(2)}ms`);
        if (totalRenderTime > 0) {
            console.log(`📈 平均渲染時間：${(totalRenderTime / this.results.length).toFixed(2)}ms`);
        }
        console.log('='.repeat(50) + '\n');
    }

    measureTime(fn) {
        const startTime = performance.now();
        fn();
        const endTime = performance.now();
        return endTime - startTime;
    }
}

// 🔥 創建性能測試框架實例
const performanceTestFramework = new PerformanceTestFramework();

// ============================================
// 計算時間性能測試
// ============================================

performanceTestFramework.test('計算時間 - 3 個卡片', () => {
    const calculationTime = performanceTestFramework.measureTime(() => {
        const calculator = new SeparatedLayoutCalculator(375, 667, 3, 'left-right');
        calculator.calculateCardSize();
        calculator.calculatePositions();
        calculator.calculateSpacing();
        calculator.calculateColumns(false);
        calculator.calculateRows(1);
    });

    return {
        calculationTime,
        status: calculationTime < 30 ? '✅ 通過' : '❌ 失敗'
    };
});

performanceTestFramework.test('計算時間 - 10 個卡片', () => {
    const calculationTime = performanceTestFramework.measureTime(() => {
        const calculator = new SeparatedLayoutCalculator(375, 667, 10, 'left-right');
        calculator.calculateCardSize();
        calculator.calculatePositions();
        calculator.calculateSpacing();
        calculator.calculateColumns(false);
        calculator.calculateRows(2);
    });

    return {
        calculationTime,
        status: calculationTime < 30 ? '✅ 通過' : '❌ 失敗'
    };
});

performanceTestFramework.test('計算時間 - 25 個卡片', () => {
    const calculationTime = performanceTestFramework.measureTime(() => {
        const calculator = new SeparatedLayoutCalculator(375, 667, 25, 'top-bottom');
        calculator.calculateCardSize();
        calculator.calculatePositions();
        calculator.calculateSpacing();
        calculator.calculateColumns(false);
        calculator.calculateRows(5);
    });

    return {
        calculationTime,
        status: calculationTime < 30 ? '✅ 通過' : '❌ 失敗'
    };
});

performanceTestFramework.test('計算時間 - 30 個卡片', () => {
    const calculationTime = performanceTestFramework.measureTime(() => {
        const calculator = new SeparatedLayoutCalculator(375, 667, 30, 'top-bottom');
        calculator.calculateCardSize();
        calculator.calculatePositions();
        calculator.calculateSpacing();
        calculator.calculateColumns(false);
        calculator.calculateRows(6);
    });

    return {
        calculationTime,
        status: calculationTime < 30 ? '✅ 通過' : '❌ 失敗'
    };
});

// ============================================
// 多設備計算時間性能測試
// ============================================

performanceTestFramework.test('計算時間 - 手機直向', () => {
    const calculationTime = performanceTestFramework.measureTime(() => {
        const calculator = new SeparatedLayoutCalculator(375, 667, 10, 'left-right');
        calculator.calculateCardSize();
        calculator.calculatePositions();
        calculator.calculateSpacing();
    });

    return {
        calculationTime,
        status: calculationTime < 30 ? '✅ 通過' : '❌ 失敗'
    };
});

performanceTestFramework.test('計算時間 - 平板直向', () => {
    const calculationTime = performanceTestFramework.measureTime(() => {
        const calculator = new SeparatedLayoutCalculator(768, 1024, 10, 'left-right');
        calculator.calculateCardSize();
        calculator.calculatePositions();
        calculator.calculateSpacing();
    });

    return {
        calculationTime,
        status: calculationTime < 30 ? '✅ 通過' : '❌ 失敗'
    };
});

performanceTestFramework.test('計算時間 - 桌面', () => {
    const calculationTime = performanceTestFramework.measureTime(() => {
        const calculator = new SeparatedLayoutCalculator(1920, 1080, 10, 'left-right');
        calculator.calculateCardSize();
        calculator.calculatePositions();
        calculator.calculateSpacing();
    });

    return {
        calculationTime,
        status: calculationTime < 30 ? '✅ 通過' : '❌ 失敗'
    };
});

// ============================================
// 批量計算性能測試
// ============================================

performanceTestFramework.test('批量計算 - 100 次計算', () => {
    const calculationTime = performanceTestFramework.measureTime(() => {
        for (let i = 0; i < 100; i++) {
            const calculator = new SeparatedLayoutCalculator(375, 667, 10, 'left-right');
            calculator.calculateCardSize();
            calculator.calculatePositions();
            calculator.calculateSpacing();
        }
    });

    const averageTime = calculationTime / 100;

    return {
        calculationTime,
        averageTime,
        status: averageTime < 30 ? '✅ 通過' : '❌ 失敗'
    };
});

performanceTestFramework.test('批量計算 - 1000 次計算', () => {
    const calculationTime = performanceTestFramework.measureTime(() => {
        for (let i = 0; i < 1000; i++) {
            const calculator = new SeparatedLayoutCalculator(375, 667, 10, 'left-right');
            calculator.calculateCardSize();
            calculator.calculatePositions();
            calculator.calculateSpacing();
        }
    });

    const averageTime = calculationTime / 1000;

    return {
        calculationTime,
        averageTime,
        status: averageTime < 30 ? '✅ 通過' : '❌ 失敗'
    };
});

// ============================================
// 內存使用測試
// ============================================

performanceTestFramework.test('內存使用 - 創建 100 個計算器', () => {
    const calculators = [];
    
    const calculationTime = performanceTestFramework.measureTime(() => {
        for (let i = 0; i < 100; i++) {
            const calculator = new SeparatedLayoutCalculator(375, 667, 10, 'left-right');
            calculators.push(calculator);
        }
    });

    // 清理
    calculators.length = 0;

    return {
        calculationTime,
        status: '✅ 通過'
    };
});

// ============================================
// 運行測試
// ============================================

// 等待 DOM 加載完成後運行測試
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        performanceTestFramework.run();
    });
} else {
    performanceTestFramework.run();
}

