const puppeteer = require('puppeteer');

async function checkVocabularyData() {
    console.log('🔍 開始檢查詞彙數據...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    try {
        const page = await browser.newPage();
        
        // 導航到遊戲頁面
        console.log('📍 導航到遊戲頁面...');
        await page.goto('https://edu-create.vercel.app/activities/cmh93tjuh0001l404hszkdf94', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // 等待頁面加載
        await page.waitForTimeout(3000);

        // 檢查詞彙數據
        const vocabularyAnalysis = await page.evaluate(() => {
            // 從 iframe URL 中提取參數
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: '找不到 iframe' };

            const iframeUrl = iframe.src;
            const url = new URL(iframeUrl);
            const params = new URLSearchParams(url.search);
            
            console.log('🔗 iframe URL:', iframeUrl);
            console.log('📋 URL 參數:', Object.fromEntries(params));

            // 檢查關鍵參數
            const analysis = {
                activityId: params.get('activityId'),
                customVocabulary: params.get('customVocabulary'),
                gameOptions: params.get('gameOptions'),
                visualStyle: params.get('visualStyle'),
                hasRequiredParams: false,
                missingParams: []
            };

            // 檢查必要參數
            const requiredParams = ['activityId', 'customVocabulary', 'gameOptions'];
            requiredParams.forEach(param => {
                if (!params.get(param)) {
                    analysis.missingParams.push(param);
                }
            });

            analysis.hasRequiredParams = analysis.missingParams.length === 0;

            // 解析 gameOptions
            try {
                const gameOptionsStr = params.get('gameOptions');
                if (gameOptionsStr) {
                    analysis.parsedGameOptions = JSON.parse(decodeURIComponent(gameOptionsStr));
                }
            } catch (e) {
                analysis.gameOptionsError = e.message;
            }

            return analysis;
        });

        console.log('📊 詞彙數據分析結果:');
        console.log(JSON.stringify(vocabularyAnalysis, null, 2));

        // 嘗試獲取實際的詞彙數據
        console.log('\n🌐 嘗試獲取詞彙數據...');
        
        // 檢查 localStorage 和 sessionStorage
        const storageData = await page.evaluate(() => {
            const storage = {
                localStorage: {},
                sessionStorage: {},
                windowVars: {}
            };

            // 檢查 localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                storage.localStorage[key] = localStorage.getItem(key);
            }

            // 檢查 sessionStorage
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                storage.sessionStorage[key] = sessionStorage.getItem(key);
            }

            // 檢查 window 變量
            const possibleVars = ['vocabularyData', 'gameData', 'activityData', 'customVocabulary'];
            possibleVars.forEach(varName => {
                if (window[varName]) {
                    storage.windowVars[varName] = window[varName];
                }
            });

            return storage;
        });

        console.log('💾 存儲數據檢查:');
        console.log('localStorage keys:', Object.keys(storageData.localStorage));
        console.log('sessionStorage keys:', Object.keys(storageData.sessionStorage));
        console.log('window variables:', Object.keys(storageData.windowVars));

        // 檢查 iframe 內的數據
        console.log('\n🖼️ 檢查 iframe 內的數據...');
        
        const iframeData = await page.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: '找不到 iframe' };

            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const iframeWindow = iframe.contentWindow;

                const data = {
                    title: iframeDoc.title,
                    bodyContent: iframeDoc.body ? iframeDoc.body.textContent.trim() : '',
                    scripts: Array.from(iframeDoc.querySelectorAll('script')).length,
                    windowVars: {},
                    phaserGame: null,
                    vocabularyData: null
                };

                // 檢查 iframe 內的 window 變量
                const possibleVars = ['vocabularyData', 'gameData', 'activityData', 'game', 'phaser'];
                possibleVars.forEach(varName => {
                    if (iframeWindow[varName]) {
                        data.windowVars[varName] = typeof iframeWindow[varName];
                    }
                });

                // 檢查 Phaser 遊戲實例
                if (iframeWindow.game) {
                    data.phaserGame = {
                        exists: true,
                        type: typeof iframeWindow.game,
                        config: iframeWindow.game.config ? 'exists' : 'missing',
                        scene: iframeWindow.game.scene ? 'exists' : 'missing'
                    };
                }

                return data;
            } catch (e) {
                return { error: '無法訪問 iframe 內容: ' + e.message };
            }
        });

        console.log('🎮 iframe 內容分析:');
        console.log(JSON.stringify(iframeData, null, 2));

        // 嘗試手動獲取詞彙數據
        console.log('\n🔄 嘗試手動獲取詞彙數據...');
        
        const activityId = vocabularyAnalysis.activityId;
        if (activityId) {
            try {
                // 嘗試不同的 API 端點
                const endpoints = [
                    `https://edu-create.vercel.app/api/activities/${activityId}`,
                    `https://edu-create.vercel.app/api/vocabulary/${activityId}`,
                    `https://edu-create.vercel.app/api/activities/${activityId}/vocabulary`,
                    `https://edu-create.vercel.app/api/activities/${activityId}/content`
                ];

                for (const endpoint of endpoints) {
                    console.log(`🌐 嘗試端點: ${endpoint}`);
                    
                    try {
                        const response = await page.evaluate(async (url) => {
                            const res = await fetch(url);
                            return {
                                status: res.status,
                                statusText: res.statusText,
                                headers: Object.fromEntries(res.headers.entries()),
                                data: res.ok ? await res.json() : await res.text()
                            };
                        }, endpoint);

                        console.log(`📡 響應狀態: ${response.status} ${response.statusText}`);
                        
                        if (response.status === 200) {
                            console.log('✅ 成功獲取數據!');
                            console.log('📄 數據內容:', JSON.stringify(response.data, null, 2));
                            break;
                        } else {
                            console.log('❌ 請求失敗:', response.data);
                        }
                    } catch (fetchError) {
                        console.log(`❌ 請求錯誤: ${fetchError.message}`);
                    }
                }
            } catch (error) {
                console.log('❌ API 請求過程中出錯:', error.message);
            }
        }

        // 生成總結報告
        console.log('\n📋 詞彙數據檢查總結:');
        console.log('================================');
        console.log(`✅ Activity ID: ${vocabularyAnalysis.activityId || '❌ 缺失'}`);
        console.log(`✅ Custom Vocabulary: ${vocabularyAnalysis.customVocabulary || '❌ 缺失'}`);
        console.log(`✅ Game Options: ${vocabularyAnalysis.gameOptions ? '存在' : '❌ 缺失'}`);
        console.log(`✅ 必要參數完整: ${vocabularyAnalysis.hasRequiredParams ? '是' : '❌ 否'}`);
        
        if (vocabularyAnalysis.missingParams.length > 0) {
            console.log(`❌ 缺失參數: ${vocabularyAnalysis.missingParams.join(', ')}`);
        }

        console.log(`✅ iframe 可訪問: ${iframeData.error ? '❌ 否' : '是'}`);
        console.log(`✅ Phaser 遊戲: ${iframeData.phaserGame?.exists ? '存在' : '❌ 不存在'}`);

    } catch (error) {
        console.error('❌ 檢查過程中出錯:', error);
    } finally {
        await browser.close();
    }
}

checkVocabularyData().catch(console.error);