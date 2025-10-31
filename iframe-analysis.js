const { chromium } = require('playwright');

async function analyzeIframes() {
    try {
        console.log('🔗 正在連接到 Chrome 分析 iframe 內容...');
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
        
        console.log('✅ 開始分析 iframe 內容...\n');
        
        // 檢查頁面中的所有 iframe
        const iframes = await gamePage.evaluate(() => {
            const iframeElements = document.querySelectorAll('iframe');
            const iframeInfo = [];
            
            iframeElements.forEach((iframe, index) => {
                iframeInfo.push({
                    index: index,
                    src: iframe.src || null,
                    id: iframe.id || null,
                    className: iframe.className || null,
                    width: iframe.width || iframe.style.width || null,
                    height: iframe.height || iframe.style.height || null,
                    title: iframe.title || null,
                    name: iframe.name || null,
                    sandbox: iframe.sandbox ? iframe.sandbox.toString() : null,
                    allowfullscreen: iframe.allowFullscreen || false
                });
            });
            
            return {
                count: iframeElements.length,
                iframes: iframeInfo
            };
        });
        
        console.log(`🖼️ 發現 ${iframes.count} 個 iframe:`);
        
        if (iframes.count === 0) {
            console.log('❌ 頁面中沒有找到 iframe 元素');
            
            // 檢查是否有其他嵌入內容
            const embeddedContent = await gamePage.evaluate(() => {
                const embedded = {
                    objects: document.querySelectorAll('object').length,
                    embeds: document.querySelectorAll('embed').length,
                    canvases: document.querySelectorAll('canvas').length,
                    webComponents: document.querySelectorAll('[is]').length,
                    shadowRoots: []
                };
                
                // 檢查 shadow DOM
                document.querySelectorAll('*').forEach(el => {
                    if (el.shadowRoot) {
                        embedded.shadowRoots.push({
                            tagName: el.tagName,
                            id: el.id || null,
                            className: el.className || null
                        });
                    }
                });
                
                return embedded;
            });
            
            console.log('\n🔍 其他嵌入內容檢查:');
            console.log(`Object 元素: ${embeddedContent.objects}`);
            console.log(`Embed 元素: ${embeddedContent.embeds}`);
            console.log(`Canvas 元素: ${embeddedContent.canvases}`);
            console.log(`Web Components: ${embeddedContent.webComponents}`);
            console.log(`Shadow DOM: ${embeddedContent.shadowRoots.length}`);
            
            if (embeddedContent.shadowRoots.length > 0) {
                console.log('Shadow DOM 元素:');
                embeddedContent.shadowRoots.forEach((sr, index) => {
                    console.log(`  ${index + 1}. ${sr.tagName} (id: ${sr.id}, class: ${sr.className})`);
                });
            }
            
        } else {
            // 分析每個 iframe
            for (let i = 0; i < iframes.iframes.length; i++) {
                const iframe = iframes.iframes[i];
                console.log(`\n📋 iframe ${i + 1}:`);
                console.log(`  來源: ${iframe.src || '無'}`);
                console.log(`  ID: ${iframe.id || '無'}`);
                console.log(`  類名: ${iframe.className || '無'}`);
                console.log(`  尺寸: ${iframe.width || '自動'} x ${iframe.height || '自動'}`);
                console.log(`  標題: ${iframe.title || '無'}`);
                console.log(`  沙盒: ${iframe.sandbox || '無'}`);
                console.log(`  全螢幕: ${iframe.allowfullscreen ? '支援' : '不支援'}`);
                
                // 嘗試訪問 iframe 內容
                try {
                    const iframeSelector = iframe.id ? `#${iframe.id}` : `iframe:nth-of-type(${i + 1})`;
                    
                    console.log(`\n🔍 嘗試分析 iframe 內容 (選擇器: ${iframeSelector})...`);
                    
                    const iframeContent = await gamePage.evaluate((selector) => {
                        const iframe = document.querySelector(selector);
                        if (!iframe) return { error: 'iframe 未找到' };
                        
                        try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            if (!iframeDoc) {
                                return { error: '無法訪問 iframe 內容 (可能是跨域限制)' };
                            }
                            
                            return {
                                title: iframeDoc.title || '無標題',
                                url: iframeDoc.URL || '無URL',
                                bodyText: iframeDoc.body ? iframeDoc.body.innerText.substring(0, 500) : '無內容',
                                elementCount: iframeDoc.querySelectorAll('*').length,
                                hasCanvas: iframeDoc.querySelectorAll('canvas').length > 0,
                                hasVideo: iframeDoc.querySelectorAll('video').length > 0,
                                hasAudio: iframeDoc.querySelectorAll('audio').length > 0,
                                scripts: iframeDoc.querySelectorAll('script').length,
                                forms: iframeDoc.querySelectorAll('form').length,
                                buttons: iframeDoc.querySelectorAll('button').length
                            };
                        } catch (e) {
                            return { error: `訪問錯誤: ${e.message}` };
                        }
                    }, iframeSelector);
                    
                    if (iframeContent.error) {
                        console.log(`  ❌ ${iframeContent.error}`);
                    } else {
                        console.log(`  ✅ iframe 內容分析:`);
                        console.log(`    標題: ${iframeContent.title}`);
                        console.log(`    URL: ${iframeContent.url}`);
                        console.log(`    元素數量: ${iframeContent.elementCount}`);
                        console.log(`    包含 Canvas: ${iframeContent.hasCanvas ? '是' : '否'}`);
                        console.log(`    包含 Video: ${iframeContent.hasVideo ? '是' : '否'}`);
                        console.log(`    包含 Audio: ${iframeContent.hasAudio ? '是' : '否'}`);
                        console.log(`    腳本數量: ${iframeContent.scripts}`);
                        console.log(`    表單數量: ${iframeContent.forms}`);
                        console.log(`    按鈕數量: ${iframeContent.buttons}`);
                        
                        if (iframeContent.bodyText && iframeContent.bodyText.trim()) {
                            console.log(`    內容預覽: ${iframeContent.bodyText.substring(0, 200)}...`);
                        }
                    }
                    
                } catch (error) {
                    console.log(`  ❌ 分析 iframe 內容時發生錯誤: ${error.message}`);
                }
            }
        }
        
        // 檢查是否有動態載入的 iframe
        console.log('\n🔄 檢查動態內容...');
        await gamePage.waitForTimeout(2000); // 等待可能的動態載入
        
        const dynamicIframes = await gamePage.evaluate(() => {
            return document.querySelectorAll('iframe').length;
        });
        
        if (dynamicIframes !== iframes.count) {
            console.log(`📈 檢測到動態載入的 iframe: ${dynamicIframes - iframes.count} 個新增`);
        } else {
            console.log('📊 沒有檢測到新的動態 iframe');
        }
        
        await browser.close();
        console.log('\n✅ iframe 分析完成');
        
    } catch (error) {
        console.error('❌ iframe 分析失敗:', error.message);
    }
}

analyzeIframes();