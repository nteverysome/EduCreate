#!/usr/bin/env node

const { chromium } = require('playwright');

async function runMobileDebug() {
    console.log('\n' + '='.repeat(70));
    console.log('📱 手機直向佈局診斷 v9.0 - Playwright 自動化');
    console.log('='.repeat(70) + '\n');

    let browser;
    try {
        // 🔧 啟動瀏覽器
        console.log('🚀 啟動 Chromium 瀏覽器...');
        browser = await chromium.launch({
            headless: false,  // 顯示瀏覽器窗口
            args: ['--disable-blink-features=AutomationControlled']
        });

        // 📱 創建手機直向上下文
        console.log('📱 創建手機直向上下文 (375×667)...\n');
        const context = await browser.createContext({
            viewport: { width: 375, height: 667 },
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true,
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        });

        const page = await context.newPage();

        // 📋 收集 console 日誌
        const consoleLogs = [];
        page.on('console', msg => {
            const text = msg.text();
            consoleLogs.push({
                type: msg.type(),
                text: text
            });
            console.log(`[${msg.type().toUpperCase()}] ${text}`);
        });

        // 🎮 訪問遊戲頁面
        const gameUrl = 'https://edu-create.vercel.app/games/match-up-game/?activityId=cmh93tjuh0001l404hszkdf94&customVocabulary=true';
        console.log(`🎮 訪問遊戲頁面: ${gameUrl}\n`);
        
        try {
            await page.goto(gameUrl, { waitUntil: 'networkidle', timeout: 30000 });
        } catch (e) {
            console.log('⚠️ 頁面加載超時，繼續等待...');
        }

        // ⏳ 等待遊戲加載
        console.log('\n⏳ 等待遊戲加載 (5 秒)...\n');
        await page.waitForTimeout(5000);

        // 🔍 從 console 日誌中提取調試信息
        console.log('\n' + '='.repeat(70));
        console.log('📊 分析結果');
        console.log('='.repeat(70) + '\n');

        let vocabularyData = null;
        let layoutInfo = null;

        for (const log of consoleLogs) {
            const text = log.text;

            // 查找原始詞彙數據結構檢查
            if (text.includes('[v9.0] 原始詞彙數據結構檢查')) {
                console.log('✅ 找到詞彙數據結構檢查日誌\n');
                try {
                    // 提取 JSON 部分
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        vocabularyData = JSON.parse(jsonMatch[0]);
                        console.log('📋 詞彙數據:');
                        console.log(`   - 總項目數: ${vocabularyData.totalItems}`);
                        console.log(`   - 第一項字段: ${vocabularyData.firstItemKeys?.join(', ')}`);
                        console.log(`   - 有 imageUrl: ${vocabularyData.hasImageUrl}`);
                        console.log(`   - 有 chineseImageUrl: ${vocabularyData.hasChineseImageUrl}`);
                        console.log(`   - imageUrl 值: ${vocabularyData.imageUrlValue || 'null'}`);
                        console.log(`   - chineseImageUrl 值: ${vocabularyData.chineseImageUrlValue || 'null'}\n`);
                    }
                } catch (e) {
                    console.log('⚠️ 無法解析詞彙數據 JSON\n');
                }
            }

            // 查找卡片佈局信息
            if (text.includes('正方形卡片佈局') || text.includes('長方形卡片佈局')) {
                console.log('✅ 找到卡片佈局日誌\n');
                try {
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        layoutInfo = JSON.parse(jsonMatch[0]);
                        console.log('📐 佈局信息:');
                        console.log(`   - 列數: ${layoutInfo.cols}`);
                        console.log(`   - 行數: ${layoutInfo.rows}`);
                        console.log(`   - 框寬度: ${layoutInfo.frameWidth}`);
                        console.log(`   - 卡片高度: ${layoutInfo.cardHeightInFrame}`);
                        console.log(`   - 卡片比例: ${layoutInfo.cardRatio}\n`);
                    }
                } catch (e) {
                    console.log('⚠️ 無法解析佈局信息 JSON\n');
                }
            }
        }

        // 🎯 診斷結論
        console.log('='.repeat(70));
        console.log('🎯 診斷結論');
        console.log('='.repeat(70) + '\n');

        if (vocabularyData) {
            if (vocabularyData.hasImageUrl && vocabularyData.hasChineseImageUrl) {
                console.log('✅ 圖片檢測: 成功');
                console.log('✅ 預期佈局: 正方形模式 (5 列 × 4 行)');
                if (layoutInfo?.cols === 5 && layoutInfo?.rows === 4) {
                    console.log('✅ 實際佈局: 正確 ✓\n');
                } else {
                    console.log(`❌ 實際佈局: 錯誤 (${layoutInfo?.cols} 列 × ${layoutInfo?.rows} 行)\n`);
                }
            } else {
                console.log('❌ 圖片檢測: 失敗');
                console.log('❌ 預期佈局: 長方形模式 (3 列 × 4 行)');
                if (layoutInfo?.cols === 3 && layoutInfo?.rows === 4) {
                    console.log('⚠️ 實際佈局: 長方形模式 (這是問題所在)\n');
                } else {
                    console.log(`⚠️ 實際佈局: ${layoutInfo?.cols} 列 × ${layoutInfo?.rows} 行\n`);
                }
            }
        } else {
            console.log('❌ 未找到詞彙數據結構信息\n');
        }

        console.log('='.repeat(70) + '\n');

        // 關閉瀏覽器
        await context.close();
        await browser.close();

        console.log('✅ 診斷完成！\n');

    } catch (error) {
        console.error('❌ 錯誤:', error.message);
        if (browser) {
            await browser.close();
        }
        process.exit(1);
    }
}

// 運行診斷
runMobileDebug();

