const { chromium } = require('playwright');

/**
 * Chrome 控制器 - 統一的 DevTools Protocol 操作介面
 * 使用方法：node chrome-controller.js [action] [params...]
 */
class ChromeController {
    constructor() {
        this.browser = null;
        this.pages = [];
    }

    async connect() {
        try {
            console.log('🔗 正在連接到 Chrome (DevTools Protocol)...');
            this.browser = await chromium.connectOverCDP('http://localhost:9222');
            
            // 獲取所有頁面
            const contexts = this.browser.contexts();
            this.pages = [];
            for (const context of contexts) {
                this.pages.push(...context.pages());
            }
            
            console.log(`✅ 成功連接！找到 ${this.pages.length} 個頁面`);
            return true;
        } catch (error) {
            console.error('❌ 連接失敗:', error.message);
            console.log('\n💡 請確保 Chrome 已啟動並開啟 DevTools Protocol');
            console.log('   啟動命令: chrome --remote-debugging-port=9222');
            return false;
        }
    }

    async listPages() {
        console.log('\n📄 當前頁面列表:');
        for (let i = 0; i < this.pages.length; i++) {
            const page = this.pages[i];
            const title = await page.title();
            const url = page.url();
            console.log(`  ${i + 1}. ${title}`);
            console.log(`     ${url}\n`);
        }
    }

    async navigateToUrl(url) {
        const eduPage = this.pages.find(page => 
            page.url().includes('edu-create.vercel.app')
        );
        
        if (eduPage) {
            console.log(`🎯 導航到: ${url}`);
            await eduPage.goto(url);
            console.log('✅ 導航完成');
            return eduPage;
        } else {
            console.log('❌ 未找到 EduCreate 頁面');
            return null;
        }
    }

    async getPageInfo(page = null) {
        if (!page) {
            page = this.pages.find(p => p.url().includes('edu-create.vercel.app'));
        }
        
        if (page) {
            const title = await page.title();
            const url = page.url();
            const textContent = await page.evaluate(() => {
                return document.body.innerText.substring(0, 300);
            });
            
            console.log('\n📋 頁面資訊:');
            console.log(`標題: ${title}`);
            console.log(`URL: ${url}`);
            console.log(`內容預覽: ${textContent}...`);
            
            return { title, url, textContent };
        }
        return null;
    }

    async takeScreenshot(filename = 'chrome-screenshot.png') {
        const eduPage = this.pages.find(page => 
            page.url().includes('edu-create.vercel.app')
        );
        
        if (eduPage) {
            await eduPage.screenshot({ 
                path: filename,
                fullPage: true 
            });
            console.log(`📸 截圖已保存: ${filename}`);
            return filename;
        }
        return null;
    }

    async clickElement(selector) {
        const eduPage = this.pages.find(page => 
            page.url().includes('edu-create.vercel.app')
        );
        
        if (eduPage) {
            try {
                await eduPage.click(selector);
                console.log(`✅ 點擊成功: ${selector}`);
                return true;
            } catch (error) {
                console.log(`❌ 點擊失敗: ${selector} - ${error.message}`);
                return false;
            }
        }
        return false;
    }

    async disconnect() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔄 已斷開連接，Chrome 保持開啟');
        }
    }
}

// 命令行介面
async function main() {
    const controller = new ChromeController();
    const action = process.argv[2] || 'status';
    
    if (!await controller.connect()) {
        return;
    }

    switch (action) {
        case 'status':
            await controller.listPages();
            await controller.getPageInfo();
            break;
            
        case 'navigate':
            const url = process.argv[3] || 'https://edu-create.vercel.app';
            await controller.navigateToUrl(url);
            await controller.getPageInfo();
            break;
            
        case 'screenshot':
            const filename = process.argv[3] || 'chrome-screenshot.png';
            await controller.takeScreenshot(filename);
            break;
            
        case 'click':
            const selector = process.argv[3];
            if (selector) {
                await controller.clickElement(selector);
            } else {
                console.log('❌ 請提供 CSS 選擇器');
            }
            break;
            
        default:
            console.log('📖 使用方法:');
            console.log('  node chrome-controller.js status      # 查看狀態');
            console.log('  node chrome-controller.js navigate [url]  # 導航');
            console.log('  node chrome-controller.js screenshot [filename]  # 截圖');
            console.log('  node chrome-controller.js click [selector]  # 點擊元素');
    }
    
    await controller.disconnect();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ChromeController;