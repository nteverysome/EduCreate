// 📄 分頁計算邏輯測試

/**
 * 模擬 GameScene 的分頁計算方法
 */
class MockGameScene {
    calculateMaxCardsPerPage(width, height, layout = 'mixed') {
        // 🔥 檢測設備類型和模式
        const isMobileDevice = width < 768;
        const isLandscapeMobile = width > height && height < 500;
        const isTinyHeight = height < 400;
        const isCompactMode = isMobileDevice || isLandscapeMobile || isTinyHeight;

        // 根據佈局模式決定列數
        let cols;
        if (layout === 'mixed') {
            cols = isCompactMode ? 5 : 3;  // 混合模式：緊湊 5 列，正常 3 列
        } else {
            // 分離模式：根據寬度動態決定
            const sideMargin = 20;
            const availableWidth = width - sideMargin * 2;
            cols = Math.max(1, Math.floor(availableWidth / 150));
        }

        // 計算可用高度
        const topButtonArea = isCompactMode ? 50 : 60;
        const bottomButtonArea = isCompactMode ? 50 : 60;
        const availableHeight = height - topButtonArea - bottomButtonArea;

        // 計算卡片尺寸和行數
        const verticalSpacing = Math.max(5, Math.min(20, availableHeight * 0.02));
        const cardHeight = 67;
        const chineseTextHeight = 20;
        const totalUnitHeight = cardHeight + chineseTextHeight + verticalSpacing;

        const maxRows = Math.max(1, Math.floor((availableHeight - verticalSpacing) / totalUnitHeight));
        const maxCardsPerPage = cols * maxRows;

        return maxCardsPerPage;
    }

    calculatePaginationWithLayout(totalPairs, width, height, layout = 'mixed') {
        const maxCardsPerPage = this.calculateMaxCardsPerPage(width, height, layout);
        const itemsPerPage = Math.max(1, maxCardsPerPage);
        const totalPages = Math.ceil(totalPairs / itemsPerPage);
        const enablePagination = totalPages > 1;

        return {
            itemsPerPage,
            totalPages,
            enablePagination,
            maxCardsPerPage
        };
    }
}

// 🧪 測試用例
process.stdout.write('=== 📄 分頁計算邏輯測試 ===\n\n');

const scene = new MockGameScene();

// 測試 1：手機直向（375×667px）- 混合模式
process.stdout.write('✅ 測試 1：手機直向（375×667px）- 混合模式\n');
const test1 = scene.calculatePaginationWithLayout(20, 375, 667, 'mixed');
process.stdout.write('輸入：20 個卡片\n');
process.stdout.write('結果：' + JSON.stringify(test1) + '\n');
process.stdout.write('預期：itemsPerPage ≥ 20, totalPages = 1, enablePagination = false\n');
process.stdout.write('驗證：' + (test1.totalPages === 1 && !test1.enablePagination ? '✅ 通過' : '❌ 失敗') + '\n\n');

// 測試 2：手機直向（375×667px）- 混合模式 - 30 個卡片
process.stdout.write('✅ 測試 2：手機直向（375×667px）- 混合模式 - 30 個卡片\n');
const test2 = scene.calculatePaginationWithLayout(30, 375, 667, 'mixed');
process.stdout.write('輸入：30 個卡片\n');
process.stdout.write('結果：' + JSON.stringify(test2) + '\n');
process.stdout.write('預期：totalPages = 2, enablePagination = true\n');
process.stdout.write('驗證：' + (test2.totalPages === 2 && test2.enablePagination ? '✅ 通過' : '❌ 失敗') + '\n\n');

// 測試 3：手機橫向（812×375px）- 混合模式
process.stdout.write('✅ 測試 3：手機橫向（812×375px）- 混合模式\n');
const test3 = scene.calculatePaginationWithLayout(20, 812, 375, 'mixed');
process.stdout.write('輸入：20 個卡片\n');
process.stdout.write('結果：' + JSON.stringify(test3) + '\n');
process.stdout.write('預期：itemsPerPage ≥ 20, totalPages = 1, enablePagination = false\n');
process.stdout.write('驗證：' + (test3.totalPages === 1 && !test3.enablePagination ? '✅ 通過' : '❌ 失敗') + '\n\n');

// 測試 4：平板直向（768×1024px）- 分離模式
process.stdout.write('✅ 測試 4：平板直向（768×1024px）- 分離模式\n');
const test4 = scene.calculatePaginationWithLayout(50, 768, 1024, 'separated');
process.stdout.write('輸入：50 個卡片\n');
process.stdout.write('結果：' + JSON.stringify(test4) + '\n');
process.stdout.write('預期：totalPages = 2, enablePagination = true\n');
process.stdout.write('驗證：' + (test4.totalPages === 2 && test4.enablePagination ? '✅ 通過' : '❌ 失敗') + '\n\n');

// 測試 5：桌面版（1920×1080px）- 分離模式
process.stdout.write('✅ 測試 5：桌面版（1920×1080px）- 分離模式\n');
const test5 = scene.calculatePaginationWithLayout(100, 1920, 1080, 'separated');
process.stdout.write('輸入：100 個卡片\n');
process.stdout.write('結果：' + JSON.stringify(test5) + '\n');
process.stdout.write('預期：totalPages ≥ 2, enablePagination = true\n');
process.stdout.write('驗證：' + (test5.totalPages >= 2 && test5.enablePagination ? '✅ 通過' : '❌ 失敗') + '\n\n');

// 測試 6：極小高度（375×300px）- 混合模式
process.stdout.write('✅ 測試 6：極小高度（375×300px）- 混合模式\n');
const test6 = scene.calculatePaginationWithLayout(20, 375, 300, 'mixed');
process.stdout.write('輸入：20 個卡片\n');
process.stdout.write('結果：' + JSON.stringify(test6) + '\n');
process.stdout.write('預期：使用緊湊模式（isTinyHeight = true）\n');
process.stdout.write('驗證：' + (test6.maxCardsPerPage > 0 ? '✅ 通過' : '❌ 失敗') + '\n\n');

// 測試 7：邊界情況 - 1 個卡片
process.stdout.write('✅ 測試 7：邊界情況 - 1 個卡片\n');
const test7 = scene.calculatePaginationWithLayout(1, 375, 667, 'mixed');
process.stdout.write('輸入：1 個卡片\n');
process.stdout.write('結果：' + JSON.stringify(test7) + '\n');
process.stdout.write('預期：totalPages = 1, enablePagination = false\n');
process.stdout.write('驗證：' + (test7.totalPages === 1 && !test7.enablePagination ? '✅ 通過' : '❌ 失敗') + '\n\n');

// 測試 8：邊界情況 - 0 個卡片
process.stdout.write('✅ 測試 8：邊界情況 - 0 個卡片\n');
const test8 = scene.calculatePaginationWithLayout(0, 375, 667, 'mixed');
process.stdout.write('輸入：0 個卡片\n');
process.stdout.write('結果：' + JSON.stringify(test8) + '\n');
process.stdout.write('預期：totalPages = 0 或 1, itemsPerPage ≥ 1\n');
process.stdout.write('驗證：' + (test8.itemsPerPage >= 1 ? '✅ 通過' : '❌ 失敗') + '\n\n');

// 統計測試結果
const tests = [test1, test2, test3, test4, test5, test6, test7, test8];
const passedTests = [
    test1.totalPages === 1 && !test1.enablePagination,
    test2.totalPages === 2 && test2.enablePagination,
    test3.totalPages === 1 && !test3.enablePagination,
    test4.totalPages === 2 && test4.enablePagination,
    test5.totalPages >= 2 && test5.enablePagination,
    test6.maxCardsPerPage > 0,
    test7.totalPages === 1 && !test7.enablePagination,
    test8.itemsPerPage >= 1
].filter(Boolean).length;

process.stdout.write('=== 📊 測試結果統計 ===\n');
process.stdout.write('✅ 通過：' + passedTests + ' / ' + tests.length + '\n');
process.stdout.write('❌ 失敗：' + (tests.length - passedTests) + ' / ' + tests.length + '\n\n');

if (passedTests === tests.length) {
    process.stdout.write('🎉 所有測試通過！\n');
} else {
    process.stdout.write('⚠️ 有些測試失敗，請檢查邏輯\n');
}

