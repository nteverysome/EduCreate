const { chromium } = require('playwright');

async function analyzeGameConfig() {
    try {
        console.log('🔗 正在連接到 Chrome 分析遊戲配置...');
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        
        const contexts = browser.contexts();
        const pages = [];
        for (const context of contexts) {
            pages.push(...context.pages());
        }
        
        const gamePage = pages.find(page => 
            page.url().includes('games/switcher') && 
            page.url().includes('match-up-game')
        );
        
        if (!gamePage) {
            console.log('❌ 未找到遊戲頁面');
            return;
        }
        
        console.log('✅ 開始分析遊戲配置...\n');
        
        // 1. 解析 URL 參數
        console.log('🔍 解析 URL 參數...');
        const urlAnalysis = await gamePage.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: 'iframe 未找到' };
            
            const url = new URL(iframe.src);
            const params = {};
            
            for (const [key, value] of url.searchParams) {
                try {
                    // 嘗試解析 JSON
                    if (value.startsWith('%7B') || value.startsWith('{')) {
                        params[key] = JSON.parse(decodeURIComponent(value));
                    } else {
                        params[key] = decodeURIComponent(value);
                    }
                } catch (e) {
                    params[key] = value;
                }
            }
            
            return {
                baseUrl: url.origin + url.pathname,
                params: params
            };
        });
        
        console.log('URL 分析結果:');
        console.log('基礎 URL:', urlAnalysis.baseUrl);
        console.log('參數:');
        Object.entries(urlAnalysis.params).forEach(([key, value]) => {
            console.log(`  ${key}:`, typeof value === 'object' ? JSON.stringify(value, null, 4) : value);
        });
        
        // 2. 檢查遊戲是否需要詞彙數據
        console.log('\n📚 檢查詞彙配置...');
        const vocabConfig = urlAnalysis.params;
        
        if (vocabConfig.customVocabulary === 'true') {
            console.log('✅ 遊戲配置為使用自定義詞彙');
            console.log('🔍 檢查是否有詞彙數據...');
            
            // 檢查主頁面是否有詞彙數據
            const vocabData = await gamePage.evaluate(() => {
                // 檢查各種可能的詞彙數據來源
                const sources = [
                    // localStorage
                    localStorage.getItem('vocabulary'),
                    localStorage.getItem('gameVocabulary'),
                    localStorage.getItem('customVocabulary'),
                    // sessionStorage
                    sessionStorage.getItem('vocabulary'),
                    sessionStorage.getItem('gameVocabulary'),
                    // window 變數
                    window.vocabulary,
                    window.gameVocabulary,
                    window.customVocabulary
                ];
                
                const foundData = sources.filter(Boolean);
                
                return {
                    localStorage: {
                        vocabulary: localStorage.getItem('vocabulary'),
                        gameVocabulary: localStorage.getItem('gameVocabulary'),
                        customVocabulary: localStorage.getItem('customVocabulary')
                    },
                    sessionStorage: {
                        vocabulary: sessionStorage.getItem('vocabulary'),
                        gameVocabulary: sessionStorage.getItem('gameVocabulary')
                    },
                    windowVars: {
                        hasVocabulary: typeof window.vocabulary !== 'undefined',
                        hasGameVocabulary: typeof window.gameVocabulary !== 'undefined'
                    },
                    foundDataCount: foundData.length
                };
            });
            
            console.log('詞彙數據檢查結果:', JSON.stringify(vocabData, null, 2));
            
            if (vocabData.foundDataCount === 0) {
                console.log('❌ 未找到詞彙數據！這可能是遊戲無法啟動的原因。');
                
                // 嘗試從活動 ID 獲取詞彙數據
                console.log('🔄 嘗試從 API 獲取詞彙數據...');
                const activityId = vocabConfig.activityId;
                
                if (activityId) {
                    console.log(`活動 ID: ${activityId}`);
                    
                    // 嘗試常見的 API 端點
                    const apiEndpoints = [
                        `/api/activities/${activityId}`,
                        `/api/vocabulary/${activityId}`,
                        `/api/games/${activityId}`,
                        `/api/activity/${activityId}/vocabulary`
                    ];
                    
                    for (const endpoint of apiEndpoints) {
                        try {
                            console.log(`嘗試: ${endpoint}`);
                            const response = await gamePage.evaluate(async (url) => {
                                try {
                                    const res = await fetch(url);
                                    return {
                                        status: res.status,
                                        ok: res.ok,
                                        data: res.ok ? await res.json() : null
                                    };
                                } catch (e) {
                                    return { error: e.message };
                                }
                            }, endpoint);
                            
                            console.log(`回應:`, JSON.stringify(response, null, 2));
                            
                            if (response.ok && response.data) {
                                console.log('✅ 找到詞彙數據！');
                                break;
                            }
                        } catch (e) {
                            console.log(`❌ ${endpoint} 失敗:`, e.message);
                        }
                    }
                }
            } else {
                console.log('✅ 找到詞彙數據');
            }
        }
        
        // 3. 檢查遊戲選項
        console.log('\n⚙️ 檢查遊戲選項...');
        const gameOptions = vocabConfig.gameOptions;
        if (gameOptions) {
            console.log('遊戲選項:', JSON.stringify(gameOptions, null, 2));
            
            // 檢查關鍵選項
            const criticalOptions = ['timer', 'lives', 'speed', 'random', 'showAnswers', 'visualStyle'];
            criticalOptions.forEach(option => {
                if (gameOptions[option] !== undefined) {
                    console.log(`✅ ${option}: ${JSON.stringify(gameOptions[option])}`);
                } else {
                    console.log(`❌ 缺少 ${option} 配置`);
                }
            });
        }
        
        // 4. 嘗試手動初始化遊戲
        console.log('\n🎮 嘗試手動初始化遊戲...');
        const initResult = await gamePage.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: 'iframe 未找到' };
            
            try {
                const iframeWindow = iframe.contentWindow;
                if (!iframeWindow) return { error: '無法訪問 iframe window' };
                
                // 嘗試各種初始化方法
                const initMethods = [
                    'init',
                    'initialize',
                    'start',
                    'startGame',
                    'initGame',
                    'loadGame',
                    'setup'
                ];
                
                const availableMethods = [];
                const results = [];
                
                for (const method of initMethods) {
                    if (typeof iframeWindow[method] === 'function') {
                        availableMethods.push(method);
                        try {
                            const result = iframeWindow[method]();
                            results.push({ method, result: 'success', return: result });
                        } catch (e) {
                            results.push({ method, result: 'error', error: e.message });
                        }
                    }
                }
                
                return {
                    availableMethods,
                    results,
                    allWindowMethods: Object.keys(iframeWindow).filter(key => 
                        typeof iframeWindow[key] === 'function'
                    ).slice(0, 20)
                };
            } catch (e) {
                return { error: e.message };
            }
        });
        
        console.log('初始化嘗試結果:', JSON.stringify(initResult, null, 2));
        
        await browser.close();
        console.log('\n✅ 遊戲配置分析完成');
        
    } catch (error) {
        console.error('❌ 配置分析失敗:', error.message);
    }
}

analyzeGameConfig();