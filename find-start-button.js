const ChromeController = require('./chrome-controller.js');

async function findStartButton() {
    const controller = new ChromeController();
    
    try {
        console.log('🔗 正在連接到 Chrome...');
        await controller.connect();
        
        console.log('🔍 查找開始遊戲按鈕...');
        
        // 獲取頁面信息
        const pageInfo = await controller.getPageInfo();
        console.log('📊 頁面信息:');
        console.log(`   URL: ${pageInfo.url}`);
        console.log(`   標題: ${pageInfo.title}`);
        
        // 執行JavaScript來查找所有可能的開始按鈕
        const result = await controller.cdp.Runtime.evaluate({
            expression: `
            (() => {
                const buttons = [];
                
                // 查找所有按鈕元素
                const allButtons = document.querySelectorAll('button, .btn, [role="button"], a[href*="game"]');
                
                allButtons.forEach((btn, index) => {
                    const text = btn.textContent?.trim() || '';
                    const className = btn.className || '';
                    const id = btn.id || '';
                    const href = btn.href || '';
                    
                    // 檢查是否包含開始遊戲相關的文字
                    if (text.includes('開始') || text.includes('遊戲') || text.includes('Start') || 
                        className.includes('start') || className.includes('game') ||
                        href.includes('game')) {
                        
                        buttons.push({
                            index,
                            text,
                            className,
                            id,
                            href,
                            tagName: btn.tagName,
                            selector: btn.tagName.toLowerCase() + 
                                     (id ? '#' + id : '') + 
                                     (className ? '.' + className.split(' ').join('.') : '')
                        });
                    }
                });
                
                return {
                    totalButtons: allButtons.length,
                    startButtons: buttons,
                    url: window.location.href,
                    title: document.title
                };
            })()
            `
        });
        
        const data = result.result.value;
        
        console.log(`   總按鈕數: ${data.totalButtons}`);
        console.log(`   開始遊戲相關按鈕: ${data.startButtons.length}`);
        
        if (data.startButtons.length > 0) {
            console.log('\n🎯 找到的開始遊戲按鈕:');
            data.startButtons.forEach((btn, i) => {
                console.log(`   ${i + 1}. 文字: "${btn.text}"`);
                console.log(`      類名: ${btn.className}`);
                console.log(`      ID: ${btn.id}`);
                console.log(`      標籤: ${btn.tagName}`);
                console.log(`      選擇器: ${btn.selector}`);
                if (btn.href) console.log(`      鏈接: ${btn.href}`);
                console.log('');
            });
        } else {
            console.log('❌ 未找到開始遊戲按鈕');
        }
        
    } catch (error) {
        console.error('❌ 錯誤:', error.message);
    } finally {
        await controller.disconnect();
        console.log('🔄 已斷開連接');
    }
}

findStartButton();