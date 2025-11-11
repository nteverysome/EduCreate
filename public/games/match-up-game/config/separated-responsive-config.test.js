/**
 * 分離模式響應式配置測試套件
 * 
 * 測試各種解析度下的響應式布局計算
 */

if (typeof SeparatedResponsiveConfig !== 'undefined') {
    class SeparatedResponsiveConfigTest {
        /**
         * 運行所有測試
         */
        static runAllTests() {
            console.log('🧪 開始運行分離模式響應式配置測試...\n');

            this.testBreakpointDetection();
            this.testCardSizeCalculation();
            this.testFontSizeCalculation();
            this.testMarginCalculation();
            this.testCompleteLayout();
            this.testRealWorldScenarios();

            console.log('\n✅ 所有測試完成！');
        }

        /**
         * 測試斷點檢測
         */
        static testBreakpointDetection() {
            console.log('📱 測試 1: 斷點檢測');
            const testCases = [
                { width: 375, height: 667, expected: 'mobile' },
                { width: 768, height: 1024, expected: 'tablet' },
                { width: 1024, height: 768, expected: 'desktop' },
                { width: 1440, height: 900, expected: 'wide' }
            ];

            testCases.forEach(tc => {
                const config = new SeparatedResponsiveConfig(tc.width, tc.height);
                const result = config.breakpoint === tc.expected ? '✅' : '❌';
                console.log(`  ${result} ${tc.width}×${tc.height} → ${config.breakpoint} (期望: ${tc.expected})`);
            });
            console.log('');
        }

        /**
         * 測試卡片大小計算
         */
        static testCardSizeCalculation() {
            console.log('📐 測試 2: 卡片大小計算');
            const testCases = [
                { width: 375, height: 667, itemCount: 5 },
                { width: 768, height: 1024, itemCount: 10 },
                { width: 1024, height: 768, itemCount: 8 },
                { width: 1440, height: 900, itemCount: 12 }
            ];

            testCases.forEach(tc => {
                const config = new SeparatedResponsiveConfig(tc.width, tc.height, tc.itemCount);
                const layout = config.calculateLayout();
                console.log(`  📦 ${tc.width}×${tc.height} (${tc.itemCount}項):`);
                console.log(`     卡片大小: ${layout.cardSize.width.toFixed(0)}×${layout.cardSize.height.toFixed(0)}px`);
                console.log(`     列數: ${layout.cols}, 字體: ${layout.fontSize}px`);
            });
            console.log('');
        }

        /**
         * 測試字體大小計算
         */
        static testFontSizeCalculation() {
            console.log('🔤 測試 3: 字體大小計算');
            const widths = [375, 480, 768, 1024, 1440];
            
            widths.forEach(w => {
                const fontSize = FontSizeCalculator.calculateByWidth(w);
                console.log(`  寬度 ${w}px → 字體 ${fontSize}px`);
            });

            console.log('\n  中文字體大小（基於卡片高度）:');
            const cardHeights = [100, 150, 200, 250];
            const textLengths = [1, 2, 3, 4, 5, 6];

            cardHeights.forEach(h => {
                const sizes = textLengths.map(len => 
                    FontSizeCalculator.calculateChineseFontSize(h, len)
                ).join(', ');
                console.log(`  卡片高度 ${h}px: ${sizes}`);
            });
            console.log('');
        }

        /**
         * 測試邊距計算
         */
        static testMarginCalculation() {
            console.log('📏 測試 4: 邊距計算');
            const itemCounts = [1, 5, 10, 15, 20];
            const baseMargin = 20;
            const baseSpacing = 12;

            console.log('  動態邊距（基於項目數量）:');
            itemCounts.forEach(count => {
                const margin = MarginCalculator.calculateDynamicMargin(baseMargin, count);
                console.log(`    ${count}項 → ${margin}px`);
            });

            console.log('\n  動態間距（基於項目數量）:');
            itemCounts.forEach(count => {
                const spacing = MarginCalculator.calculateDynamicSpacing(baseSpacing, count);
                console.log(`    ${count}項 → ${spacing}px`);
            });
            console.log('');
        }

        /**
         * 測試完整布局計算
         */
        static testCompleteLayout() {
            console.log('🎨 測試 5: 完整布局計算');
            const scenarios = [
                { width: 375, height: 667, itemCount: 5, name: '手機直向' },
                { width: 812, height: 375, itemCount: 8, name: '手機橫向' },
                { width: 1024, height: 768, itemCount: 10, name: '平板' },
                { width: 1440, height: 900, itemCount: 12, name: '桌面' }
            ];

            scenarios.forEach(s => {
                const config = new SeparatedResponsiveConfig(s.width, s.height, s.itemCount);
                const layout = config.calculateLayout();
                const positions = config.calculateContainerPositions();

                console.log(`\n  ${s.name} (${s.width}×${s.height}):`);
                console.log(`    斷點: ${layout.breakpoint}`);
                console.log(`    卡片: ${layout.cardSize.width.toFixed(0)}×${layout.cardSize.height.toFixed(0)}px`);
                console.log(`    列數: ${layout.cols}`);
                console.log(`    字體: ${layout.fontSize}px`);
                console.log(`    左容器 X: ${positions.left.x.toFixed(0)}px`);
                console.log(`    右容器 X: ${positions.right.x.toFixed(0)}px`);
            });
            console.log('');
        }

        /**
         * 測試真實場景
         */
        static testRealWorldScenarios() {
            console.log('🌍 測試 6: 真實場景');
            
            // 場景 1: 手機用戶打開遊戲
            console.log('\n  場景 1: 手機用戶 (iPhone 12)');
            const mobile = new SeparatedResponsiveConfig(390, 844, 8);
            mobile.printConfig();

            // 場景 2: 平板用戶打開遊戲
            console.log('\n  場景 2: 平板用戶 (iPad)');
            const tablet = new SeparatedResponsiveConfig(1024, 1366, 12);
            tablet.printConfig();

            // 場景 3: 桌面用戶打開遊戲
            console.log('\n  場景 3: 桌面用戶 (1440p)');
            const desktop = new SeparatedResponsiveConfig(1440, 900, 15);
            desktop.printConfig();
        }
    }

    // 導出測試類
    window.SeparatedResponsiveConfigTest = SeparatedResponsiveConfigTest;

    // 自動運行測試（如果在開發環境）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🧪 檢測到開發環境，準備運行測試...');
        // 延遲運行以確保所有依賴都已加載
        setTimeout(() => {
            SeparatedResponsiveConfigTest.runAllTests();
        }, 1000);
    }
}

