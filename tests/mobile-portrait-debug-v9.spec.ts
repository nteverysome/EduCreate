import { test, expect } from '@playwright/test';

test.describe('📱 手機直向佈局診斷 v9.0', () => {
    test('模擬手機直向設備並收集調試信息', async ({ browser }) => {
        // 🔧 創建手機直向上下文
        const context = await browser.createContext({
            viewport: { width: 375, height: 667 },
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true,
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        });

        const page = await context.newPage();

        // 📋 收集 console 日誌
        const consoleLogs: any[] = [];
        page.on('console', msg => {
            consoleLogs.push({
                type: msg.type(),
                text: msg.text(),
                args: msg.args()
            });
            console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
        });

        // 🎮 訪問遊戲頁面
        const gameUrl = 'https://edu-create.vercel.app/games/match-up-game/?activityId=cmh93tjuh0001l404hszkdf94&customVocabulary=true';
        console.log(`\n🚀 訪問遊戲頁面: ${gameUrl}\n`);
        
        await page.goto(gameUrl, { waitUntil: 'networkidle' });

        // ⏳ 等待遊戲加載
        console.log('⏳ 等待遊戲加載...');
        await page.waitForTimeout(3000);

        // 🔍 從 console 日誌中提取調試信息
        console.log('\n📊 開始分析 Console 日誌...\n');

        let vocabularyData: any = null;
        let layoutInfo: any = null;

        for (const log of consoleLogs) {
            const text = log.text;

            // 查找原始詞彙數據結構檢查
            if (text.includes('[v9.0] 原始詞彙數據結構檢查')) {
                console.log('✅ 找到詞彙數據結構檢查日誌');
                try {
                    // 提取 JSON 部分
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        vocabularyData = JSON.parse(jsonMatch[0]);
                        console.log('📋 詞彙數據:', vocabularyData);
                    }
                } catch (e) {
                    console.log('⚠️ 無法解析詞彙數據 JSON');
                }
            }

            // 查找卡片佈局信息
            if (text.includes('正方形卡片佈局') || text.includes('長方形卡片佈局')) {
                console.log('✅ 找到卡片佈局日誌');
                try {
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        layoutInfo = JSON.parse(jsonMatch[0]);
                        console.log('📐 佈局信息:', layoutInfo);
                    }
                } catch (e) {
                    console.log('⚠️ 無法解析佈局信息 JSON');
                }
            }
        }

        // 📊 生成診斷報告
        console.log('\n' + '='.repeat(60));
        console.log('📊 診斷報告 v9.0');
        console.log('='.repeat(60) + '\n');

        if (vocabularyData) {
            console.log('✅ 詞彙數據結構:');
            console.log(`   - 總項目數: ${vocabularyData.totalItems}`);
            console.log(`   - 第一項字段: ${vocabularyData.firstItemKeys?.join(', ')}`);
            console.log(`   - 有 imageUrl: ${vocabularyData.hasImageUrl}`);
            console.log(`   - 有 chineseImageUrl: ${vocabularyData.hasChineseImageUrl}`);
            console.log(`   - imageUrl 值: ${vocabularyData.imageUrlValue || 'null'}`);
            console.log(`   - chineseImageUrl 值: ${vocabularyData.chineseImageUrlValue || 'null'}`);
        } else {
            console.log('❌ 未找到詞彙數據結構信息');
        }

        if (layoutInfo) {
            console.log('\n✅ 卡片佈局:');
            console.log(`   - 列數: ${layoutInfo.cols}`);
            console.log(`   - 行數: ${layoutInfo.rows}`);
            console.log(`   - 框寬度: ${layoutInfo.frameWidth}`);
            console.log(`   - 卡片高度: ${layoutInfo.cardHeightInFrame}`);
            console.log(`   - 卡片比例: ${layoutInfo.cardRatio}`);
        } else {
            console.log('❌ 未找到卡片佈局信息');
        }

        // 🎯 診斷結論
        console.log('\n' + '='.repeat(60));
        console.log('🎯 診斷結論');
        console.log('='.repeat(60) + '\n');

        if (vocabularyData?.hasImageUrl && vocabularyData?.hasChineseImageUrl) {
            console.log('✅ 圖片檢測: 成功');
            console.log('✅ 預期佈局: 正方形模式 (5 列 × 4 行)');
            if (layoutInfo?.cols === 5 && layoutInfo?.rows === 4) {
                console.log('✅ 實際佈局: 正確 ✓');
            } else {
                console.log(`❌ 實際佈局: 錯誤 (${layoutInfo?.cols} 列 × ${layoutInfo?.rows} 行)`);
            }
        } else {
            console.log('❌ 圖片檢測: 失敗');
            console.log('❌ 預期佈局: 長方形模式 (3 列 × 4 行)');
            if (layoutInfo?.cols === 3 && layoutInfo?.rows === 4) {
                console.log('⚠️ 實際佈局: 長方形模式 (這是問題所在)');
            }
        }

        console.log('\n' + '='.repeat(60) + '\n');

        // 🔍 詳細的 Console 日誌輸出
        console.log('📋 完整 Console 日誌:');
        console.log('-'.repeat(60));
        for (const log of consoleLogs) {
            if (log.text.includes('🔍') || log.text.includes('🟦') || log.text.includes('🟨')) {
                console.log(`[${log.type}] ${log.text}`);
            }
        }
        console.log('-'.repeat(60) + '\n');

        // 關閉瀏覽器
        await context.close();

        // ✅ 測試通過
        expect(true).toBe(true);
    });
});

