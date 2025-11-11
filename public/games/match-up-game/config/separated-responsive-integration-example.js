/**
 * 分離模式響應式配置集成示例
 * 
 * 展示如何在 game.js 中使用 SeparatedResponsiveConfig
 * 這是一個參考實現，可以直接複製到 game.js 中使用
 */

if (typeof SeparatedResponsiveConfig !== 'undefined') {
    class SeparatedResponsiveIntegrationExample {
        /**
         * 示例 1: 基本的響應式布局計算
         */
        static example1_BasicLayout() {
            console.log('📱 示例 1: 基本的響應式布局計算');

            const width = window.innerWidth;
            const height = window.innerHeight;
            const itemCount = 10;

            // 創建配置
            const config = new SeparatedResponsiveConfig(width, height, itemCount);

            // 獲取布局
            const layout = config.calculateLayout();

            console.log(`
                屏幕大小: ${width}×${height}
                斷點: ${layout.breakpoint}
                卡片大小: ${layout.cardSize.width.toFixed(0)}×${layout.cardSize.height.toFixed(0)}px
                列數: ${layout.cols}
                字體大小: ${layout.fontSize}px
                邊距: ${JSON.stringify(layout.margins)}
            `);

            return layout;
        }

        /**
         * 示例 2: 計算左右容器位置
         */
        static example2_ContainerPositions() {
            console.log('📍 示例 2: 計算左右容器位置');

            const config = new SeparatedResponsiveConfig(
                window.innerWidth,
                window.innerHeight,
                10
            );

            const positions = config.calculateContainerPositions();

            console.log(`
                左容器:
                  X: ${positions.left.x.toFixed(0)}px
                  寬度: ${positions.left.width.toFixed(0)}px
                
                右容器:
                  X: ${positions.right.x.toFixed(0)}px
                  寬度: ${positions.right.width.toFixed(0)}px
            `);

            return positions;
        }

        /**
         * 示例 3: 在 createSeparatedLayout 中使用
         */
        static example3_CreateSeparatedLayout(pairs, width, height) {
            console.log('🎮 示例 3: 在 createSeparatedLayout 中使用');

            // 創建響應式配置
            const config = new SeparatedResponsiveConfig(width, height, pairs.length);
            const layout = config.calculateLayout();
            const positions = config.calculateContainerPositions();

            console.log(`
                準備創建 ${pairs.length} 對卡片
                使用斷點: ${layout.breakpoint}
                卡片大小: ${layout.cardSize.width.toFixed(0)}×${layout.cardSize.height.toFixed(0)}px
                字體大小: ${layout.fontSize}px
            `);

            // 這是實際的實現邏輯
            const result = {
                config,
                layout,
                positions,
                cardWidth: layout.cardSize.width,
                cardHeight: layout.cardSize.height,
                fontSize: layout.fontSize,
                leftX: positions.left.x,
                rightX: positions.right.x,
                spacing: layout.margins.spacing
            };

            return result;
        }

        /**
         * 示例 4: 動態字體大小計算
         */
        static example4_DynamicFontSize() {
            console.log('🔤 示例 4: 動態字體大小計算');

            const cardHeight = 150;
            const textLengths = [1, 2, 3, 4, 5, 6];

            console.log(`卡片高度: ${cardHeight}px`);
            console.log('中文字體大小（基於文字長度）:');

            textLengths.forEach(len => {
                const fontSize = FontSizeCalculator.calculateChineseFontSize(
                    cardHeight,
                    len,
                    'desktop'
                );
                console.log(`  ${len}個字: ${fontSize}px`);
            });
        }

        /**
         * 示例 5: 監聽窗口大小變化
         */
        static example5_ResizeListener() {
            console.log('📐 示例 5: 監聽窗口大小變化');

            let currentBreakpoint = null;
            let resizeTimeout;

            window.addEventListener('resize', () => {
                // 防抖
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const config = new SeparatedResponsiveConfig(
                        window.innerWidth,
                        window.innerHeight
                    );

                    if (config.breakpoint !== currentBreakpoint) {
                        currentBreakpoint = config.breakpoint;
                        console.log(`✅ 斷點已改變: ${currentBreakpoint}`);
                        console.log(`新布局:`, config.calculateLayout());
                        // 這裡可以觸發重新渲染
                    }
                }, 250);
            });

            console.log('✅ 已設置窗口大小監聽器');
        }

        /**
         * 示例 6: 完整的遊戲場景集成
         */
        static example6_CompleteGameIntegration(pairs, width, height) {
            console.log('🎯 示例 6: 完整的遊戲場景集成');

            // 步驟 1: 創建配置
            const config = new SeparatedResponsiveConfig(width, height, pairs.length);
            const layout = config.calculateLayout();
            const positions = config.calculateContainerPositions();

            // 步驟 2: 提取計算結果
            const {
                cardSize: { width: cardWidth, height: cardHeight },
                fontSize,
                margins,
                breakpoint
            } = layout;

            // 步驟 3: 計算卡片位置
            const cardPositions = pairs.map((pair, index) => {
                const row = Math.floor(index / layout.cols);
                const col = index % layout.cols;

                return {
                    left: {
                        x: positions.left.x + col * (cardWidth + margins.spacing),
                        y: margins.top + row * (cardHeight + margins.spacing)
                    },
                    right: {
                        x: positions.right.x + col * (cardWidth + margins.spacing),
                        y: margins.top + row * (cardHeight + margins.spacing)
                    }
                };
            });

            // 步驟 4: 返回完整的布局信息
            const gameLayout = {
                breakpoint,
                cardWidth,
                cardHeight,
                fontSize,
                margins,
                positions,
                cardPositions,
                totalCards: pairs.length,
                cols: layout.cols
            };

            console.log('✅ 遊戲布局計算完成:', gameLayout);
            return gameLayout;
        }

        /**
         * 示例 7: 調試和驗證
         */
        static example7_DebugAndValidate() {
            console.log('🐛 示例 7: 調試和驗證');

            const testCases = [
                { width: 375, height: 667, name: '手機直向' },
                { width: 812, height: 375, name: '手機橫向' },
                { width: 1024, height: 768, name: '平板' },
                { width: 1440, height: 900, name: '桌面' }
            ];

            testCases.forEach(tc => {
                const config = new SeparatedResponsiveConfig(tc.width, tc.height, 10);
                const layout = config.calculateLayout();

                console.log(`\n${tc.name} (${tc.width}×${tc.height}):`);
                console.log(`  ✓ 斷點: ${layout.breakpoint}`);
                console.log(`  ✓ 卡片: ${layout.cardSize.width.toFixed(0)}×${layout.cardSize.height.toFixed(0)}px`);
                console.log(`  ✓ 列數: ${layout.cols}`);
                console.log(`  ✓ 字體: ${layout.fontSize}px`);

                // 驗證卡片大小在合理範圍內
                const isValid = layout.cardSize.width > 50 && layout.cardSize.width < 300;
                console.log(`  ${isValid ? '✅' : '❌'} 卡片大小驗證`);
            });
        }

        /**
         * 運行所有示例
         */
        static runAllExamples() {
            console.log('🚀 開始運行所有示例...\n');

            this.example1_BasicLayout();
            console.log('\n' + '='.repeat(50) + '\n');

            this.example2_ContainerPositions();
            console.log('\n' + '='.repeat(50) + '\n');

            const pairs = Array(10).fill(null).map((_, i) => ({
                question: `Question ${i + 1}`,
                answer: `Answer ${i + 1}`
            }));
            this.example3_CreateSeparatedLayout(pairs, window.innerWidth, window.innerHeight);
            console.log('\n' + '='.repeat(50) + '\n');

            this.example4_DynamicFontSize();
            console.log('\n' + '='.repeat(50) + '\n');

            this.example5_ResizeListener();
            console.log('\n' + '='.repeat(50) + '\n');

            this.example6_CompleteGameIntegration(pairs, window.innerWidth, window.innerHeight);
            console.log('\n' + '='.repeat(50) + '\n');

            this.example7_DebugAndValidate();

            console.log('\n✅ 所有示例運行完成！');
        }
    }

    // 導出到全局作用域
    window.SeparatedResponsiveIntegrationExample = SeparatedResponsiveIntegrationExample;

    // 在開發環境自動運行示例
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('💡 提示: 在控制台中運行 SeparatedResponsiveIntegrationExample.runAllExamples() 查看示例');
    }
}

