/**
 * 连接到 Responsively App 的开发者工具
 * 用于调试 1024×1366 的布局问题
 */

const { chromium } = require('playwright');
const http = require('http');

async function findResponsivelyDebugPort() {
    console.log('🔍 正在查找 Responsively App 的调试端口...');
    
    // 尝试常见的调试端口
    const ports = [9222, 9223, 9224, 9225, 9226, 9227, 9228, 9229];
    
    for (const port of ports) {
        try {
            const response = await new Promise((resolve, reject) => {
                const req = http.get(`http://localhost:${port}/json/version`, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve({ port, data }));
                });
                req.on('error', reject);
                req.setTimeout(1000);
            });
            
            console.log(`✅ 找到调试端口: ${response.port}`);
            console.log(`📋 版本信息:`, response.data);
            return response.port;
        } catch (error) {
            // 继续尝试下一个端口
        }
    }
    
    console.log('❌ 未找到 Responsively App 的调试端口');
    return null;
}

async function connectToResponsively() {
    try {
        // 查找调试端口
        const debugPort = await findResponsivelyDebugPort();
        
        if (!debugPort) {
            console.log('⚠️  无法找到调试端口，尝试直接连接...');
            // 尝试直接连接到 Responsively App
            const browser = await chromium.connectOverCDP('http://localhost:9222');
            console.log('✅ 已连接到 Responsively App');
            
            const contexts = browser.contexts();
            console.log(`📊 找到 ${contexts.length} 个浏览器上下文`);
            
            if (contexts.length > 0) {
                const pages = contexts[0].pages();
                console.log(`📄 找到 ${pages.length} 个页面`);
                
                if (pages.length > 0) {
                    const page = pages[0];
                    console.log(`🌐 当前页面 URL: ${page.url()}`);
                    
                    // 打开开发者工具
                    console.log('🔧 打开开发者工具...');
                    await page.evaluate(() => {
                        // 这会在浏览器中执行
                        console.log('📱 当前分辨率:', {
                            width: window.innerWidth,
                            height: window.innerHeight,
                            devicePixelRatio: window.devicePixelRatio
                        });
                    });
                }
            }
            
            return browser;
        }
        
        // 使用找到的调试端口连接
        const browser = await chromium.connectOverCDP(`http://localhost:${debugPort}`);
        console.log('✅ 已连接到 Responsively App');
        
        return browser;
    } catch (error) {
        console.error('❌ 连接失败:', error.message);
        return null;
    }
}

async function main() {
    console.log('🚀 启动 Responsively App 调试连接...\n');
    
    const browser = await connectToResponsively();
    
    if (browser) {
        console.log('\n✅ 连接成功！');
        console.log('📋 可用的浏览器上下文:');
        
        const contexts = browser.contexts();
        contexts.forEach((context, index) => {
            const pages = context.pages();
            console.log(`  上下文 ${index}: ${pages.length} 个页面`);
            pages.forEach((page, pageIndex) => {
                console.log(`    页面 ${pageIndex}: ${page.url()}`);
            });
        });
        
        console.log('\n💡 提示: 你现在可以在 Responsively App 中打开开发者工具');
        console.log('   快捷键: F12 或 Ctrl+Shift+I');
        
        // 保持连接打开
        console.log('\n⏳ 连接保持打开中... (按 Ctrl+C 退出)');
        
        // 定期检查页面信息
        setInterval(async () => {
            try {
                const contexts = browser.contexts();
                if (contexts.length > 0) {
                    const pages = contexts[0].pages();
                    if (pages.length > 0) {
                        const page = pages[0];
                        const viewport = page.viewportSize();
                        console.log(`\n📐 当前视口: ${viewport?.width}×${viewport?.height}`);
                    }
                }
            } catch (error) {
                // 忽略错误
            }
        }, 10000);
        
    } else {
        console.log('\n❌ 无法连接到 Responsively App');
        console.log('💡 请确保:');
        console.log('  1. Responsively App 已启动');
        console.log('  2. 已打开一个网页');
        console.log('  3. 尝试手动打开开发者工具 (F12)');
    }
}

main().catch(console.error);

