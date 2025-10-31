// 使用現有的 Chrome 連接來檢查詞彙數據
const CDP = require('chrome-remote-interface');

async function checkVocabularyData() {
    console.log('🔍 開始檢查詞彙數據...');
    
    let client;
    try {
        // 連接到現有的 Chrome 實例
        client = await CDP();
        const { Page, Runtime, DOM } = client;
        
        // 啟用必要的域
        await Page.enable();
        await Runtime.enable();
        await DOM.enable();

        console.log('📍 導航到遊戲頁面...');
        await Page.navigate({ url: 'https://edu-create.vercel.app/activities/cmh93tjuh0001l404hszkdf94' });
        
        // 等待頁面加載
        await Page.loadEventFired();
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 檢查詞彙數據
        console.log('📊 分析頁面內容...');
        
        const result = await Runtime.evaluate({
            expression: `
                (function() {
                    const analysis = {
                        timestamp: new Date().toISOString(),
                        pageTitle: document.title,
                        iframe: null,
                        urlParams: null,
                        gameOptions: null,
                        storage: {
                            localStorage: {},
                            sessionStorage: {}
                        },
                        errors: []
                    };

                    try {
                        // 檢查 iframe
                        const iframe = document.querySelector('iframe');
                        if (iframe) {
                            analysis.iframe = {
                                src: iframe.src,
                                loaded: iframe.contentDocument !== null
                            };

                            // 解析 URL 參數
                            if (iframe.src) {
                                const url = new URL(iframe.src);
                                analysis.urlParams = Object.fromEntries(url.searchParams);
                                
                                // 解析 gameOptions
                                const gameOptionsStr = url.searchParams.get('gameOptions');
                                if (gameOptionsStr) {
                                    try {
                                        analysis.gameOptions = JSON.parse(decodeURIComponent(gameOptionsStr));
                                    } catch (e) {
                                        analysis.errors.push('gameOptions 解析失敗: ' + e.message);
                                    }
                                }
                            }
                        } else {
                            analysis.errors.push('找不到 iframe 元素');
                        }

                        // 檢查存儲
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            analysis.storage.localStorage[key] = localStorage.getItem(key);
                        }

                        for (let i = 0; i < sessionStorage.length; i++) {
                            const key = sessionStorage.key(i);
                            analysis.storage.sessionStorage[key] = sessionStorage.getItem(key);
                        }

                    } catch (error) {
                        analysis.errors.push('分析過程出錯: ' + error.message);
                    }

                    return analysis;
                })()
            `
        });

        const analysis = result.result.value;
        
        console.log('📋 詞彙數據分析結果:');
        console.log('================================');
        console.log('頁面標題:', analysis.pageTitle);
        
        if (analysis.iframe) {
            console.log('✅ iframe 找到');
            console.log('🔗 iframe URL:', analysis.iframe.src);
            console.log('📡 iframe 已加載:', analysis.iframe.loaded);
        } else {
            console.log('❌ 找不到 iframe');
        }

        if (analysis.urlParams) {
            console.log('\n📋 URL 參數:');
            Object.entries(analysis.urlParams).forEach(([key, value]) => {
                console.log(`  ${key}: ${value}`);
            });

            // 檢查關鍵參數
            const requiredParams = ['activityId', 'customVocabulary', 'gameOptions'];
            const missingParams = requiredParams.filter(param => !analysis.urlParams[param]);
            
            if (missingParams.length === 0) {
                console.log('✅ 所有必要參數都存在');
            } else {
                console.log('❌ 缺失參數:', missingParams.join(', '));
            }
        }

        if (analysis.gameOptions) {
            console.log('\n🎮 遊戲選項:');
            console.log(JSON.stringify(analysis.gameOptions, null, 2));
        }

        console.log('\n💾 存儲檢查:');
        console.log('localStorage 項目數:', Object.keys(analysis.storage.localStorage).length);
        console.log('sessionStorage 項目數:', Object.keys(analysis.storage.sessionStorage).length);

        if (analysis.errors.length > 0) {
            console.log('\n❌ 錯誤:');
            analysis.errors.forEach(error => console.log('  -', error));
        }

        // 嘗試檢查 iframe 內容
        if (analysis.iframe && analysis.iframe.loaded) {
            console.log('\n🖼️ 檢查 iframe 內容...');
            
            const iframeAnalysis = await Runtime.evaluate({
                expression: `
                    (function() {
                        const iframe = document.querySelector('iframe');
                        if (!iframe || !iframe.contentWindow) {
                            return { error: '無法訪問 iframe 內容' };
                        }

                        try {
                            const iframeDoc = iframe.contentDocument;
                            const iframeWindow = iframe.contentWindow;
                            
                            return {
                                title: iframeDoc.title,
                                bodyText: iframeDoc.body ? iframeDoc.body.textContent.trim().substring(0, 100) : '',
                                scriptCount: iframeDoc.querySelectorAll('script').length,
                                canvasCount: iframeDoc.querySelectorAll('canvas').length,
                                buttonCount: iframeDoc.querySelectorAll('button').length,
                                hasGame: typeof iframeWindow.game !== 'undefined',
                                hasPhaser: typeof iframeWindow.Phaser !== 'undefined',
                                windowVars: Object.keys(iframeWindow).filter(key => 
                                    key.includes('game') || key.includes('phaser') || key.includes('vocabulary')
                                )
                            };
                        } catch (e) {
                            return { error: '訪問 iframe 內容時出錯: ' + e.message };
                        }
                    })()
                `
            });

            const iframeData = iframeAnalysis.result.value;
            
            if (iframeData.error) {
                console.log('❌', iframeData.error);
            } else {
                console.log('📄 iframe 標題:', iframeData.title);
                console.log('📝 iframe 內容預覽:', iframeData.bodyText);
                console.log('📜 腳本數量:', iframeData.scriptCount);
                console.log('🎨 Canvas 數量:', iframeData.canvasCount);
                console.log('🔘 按鈕數量:', iframeData.buttonCount);
                console.log('🎮 有遊戲對象:', iframeData.hasGame);
                console.log('⚡ 有 Phaser:', iframeData.hasPhaser);
                console.log('🔍 相關變量:', iframeData.windowVars);
            }
        }

        // 嘗試 API 請求
        if (analysis.urlParams && analysis.urlParams.activityId) {
            console.log('\n🌐 嘗試 API 請求...');
            
            const apiResult = await Runtime.evaluate({
                expression: `
                    (async function() {
                        const activityId = '${analysis.urlParams.activityId}';
                        const endpoints = [
                            \`https://edu-create.vercel.app/api/activities/\${activityId}\`,
                            \`https://edu-create.vercel.app/api/vocabulary/\${activityId}\`,
                            \`https://edu-create.vercel.app/api/activities/\${activityId}/vocabulary\`
                        ];

                        const results = [];
                        
                        for (const endpoint of endpoints) {
                            try {
                                const response = await fetch(endpoint);
                                results.push({
                                    endpoint,
                                    status: response.status,
                                    statusText: response.statusText,
                                    success: response.ok,
                                    data: response.ok ? await response.json() : await response.text()
                                });
                            } catch (error) {
                                results.push({
                                    endpoint,
                                    error: error.message
                                });
                            }
                        }

                        return results;
                    })()
                `,
                awaitPromise: true
            });

            const apiResults = apiResult.result.value;
            
            apiResults.forEach(result => {
                console.log(`📡 ${result.endpoint}`);
                if (result.error) {
                    console.log(`  ❌ 錯誤: ${result.error}`);
                } else {
                    console.log(`  📊 狀態: ${result.status} ${result.statusText}`);
                    if (result.success) {
                        console.log(`  ✅ 成功獲取數據`);
                        if (typeof result.data === 'object') {
                            console.log(`  📄 數據類型: ${Array.isArray(result.data) ? '數組' : '對象'}`);
                            if (Array.isArray(result.data)) {
                                console.log(`  📊 項目數量: ${result.data.length}`);
                            }
                        }
                    } else {
                        console.log(`  ❌ 失敗: ${result.data}`);
                    }
                }
            });
        }

        console.log('\n✅ 詞彙數據檢查完成');

    } catch (error) {
        console.error('❌ 檢查過程中出錯:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

checkVocabularyData().catch(console.error);