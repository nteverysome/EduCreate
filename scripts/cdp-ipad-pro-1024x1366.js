#!/usr/bin/env node

/**
 * CDP + Responsively App 控制器 - iPad Pro 1024×1366
 * 
 * 用途：连接到 Responsively App 中的 1024×1366 设备，打开开发者工具并收集日志
 * 
 * 快速开始：
 * 1. 启动 Responsively App: powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-with-cdp.ps1
 * 2. 在 Responsively App 中添加 iPad Pro 12.9" 设备 (1024×1366px)
 * 3. 运行此脚本: node scripts/cdp-ipad-pro-1024x1366.js
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    // Responsively App 的 Chrome 调试端口
    CDP_ENDPOINT: 'ws://127.0.0.1:9222',
    
    // 游戏 URL
    GAME_URL: 'https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20',
    
    // 设备配置
    DEVICE: {
        name: 'iPad Pro 12.9"',
        width: 1024,
        height: 1366,
        dpr: 2
    },
    
    // 输出文件
    OUTPUT_DIR: 'reports/cdp-logs',
    LOG_FILE: 'ipad-pro-1024x1366-logs.json',
    SCREENSHOT_FILE: 'ipad-pro-1024x1366-screenshot.png'
};

async function main() {
    console.log('🚀 启动 CDP + Responsively App 控制器 (iPad Pro 1024×1366)');
    console.log(`📱 设备: ${CONFIG.DEVICE.name} (${CONFIG.DEVICE.width}×${CONFIG.DEVICE.height})`);
    console.log(`🔗 CDP 端点: ${CONFIG.CDP_ENDPOINT}`);
    
    // 创建输出目录
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
        fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    }
    
    let browser;
    let page;
    const consoleLogs = [];

    try {
        // 连接到 Responsively App
        console.log('\n📡 连接到 Responsively App...');

        // 首先获取可用的页面列表
        console.log('📋 获取可用页面列表...');
        const http = require('http');
        const pages = await new Promise((resolve, reject) => {
            http.get('http://127.0.0.1:9222/json', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });

        // 找到游戏页面
        const gamePage = pages.find(p => p.url && p.url.includes('match-up-game'));
        if (!gamePage) {
            throw new Error('❌ 没有找到游戏页面，请在 Responsively App 中打开游戏');
        }

        console.log(`✅ 找到游戏页面: ${gamePage.url}`);
        console.log(`📡 WebSocket 端点: ${gamePage.webSocketDebuggerUrl}`);

        // 使用正确的 WebSocket 端点连接
        browser = await puppeteer.connect({
            browserWSEndpoint: gamePage.webSocketDebuggerUrl,
            defaultViewport: null
        });
        console.log('✅ 已连接到 Responsively App');

        // 获取页面
        const allPages = await browser.pages();
        page = allPages[0];
        console.log(`✅ 已获取页面`);
        
        // 设置视口大小
        console.log(`\n📐 设置视口大小: ${CONFIG.DEVICE.width}×${CONFIG.DEVICE.height}`);
        await page.setViewport({
            width: CONFIG.DEVICE.width,
            height: CONFIG.DEVICE.height,
            deviceScaleFactor: CONFIG.DEVICE.dpr
        });
        console.log('✅ 视口大小已设置');
        
        // 监听控制台日志
        console.log('\n📝 开始收集控制台日志...');
        page.on('console', msg => {
            const logEntry = {
                type: msg.type(),
                text: msg.text(),
                location: msg.location(),
                timestamp: new Date().toISOString()
            };
            consoleLogs.push(logEntry);
            
            // 打印关键日志
            if (msg.text().includes('[v') || msg.text().includes('🔥') || msg.text().includes('📱')) {
                console.log(`  📌 ${msg.text()}`);
            }
        });
        
        // 导航到游戏
        console.log(`\n🎮 导航到游戏: ${CONFIG.GAME_URL}`);
        await page.goto(CONFIG.GAME_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('✅ 游戏已加载');
        
        // 等待游戏初始化
        console.log('\n⏳ 等待游戏初始化...');
        await page.waitForTimeout(3000);
        
        // 获取游戏信息
        console.log('\n📊 收集游戏信息...');
        const gameInfo = await page.evaluate(() => {
            return {
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                userAgent: navigator.userAgent,
                title: document.title
            };
        });
        console.log('✅ 游戏信息:');
        console.log(`  - 窗口大小: ${gameInfo.windowWidth}×${gameInfo.windowHeight}`);
        console.log(`  - DPR: ${gameInfo.devicePixelRatio}`);
        console.log(`  - 标题: ${gameInfo.title}`);
        
        // 打开开发者工具
        console.log('\n🛠️ 打开开发者工具...');
        await page.keyboard.press('F12');
        await page.waitForTimeout(1000);
        console.log('✅ 开发者工具已打开');
        
        // 截图
        console.log('\n📸 截图...');
        const screenshotPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.SCREENSHOT_FILE);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`✅ 截图已保存: ${screenshotPath}`);
        
        // 保存日志
        console.log('\n💾 保存日志...');
        const logPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.LOG_FILE);
        fs.writeFileSync(logPath, JSON.stringify({
            device: CONFIG.DEVICE,
            gameInfo: gameInfo,
            consoleLogs: consoleLogs,
            timestamp: new Date().toISOString(),
            totalLogs: consoleLogs.length
        }, null, 2));
        console.log(`✅ 日志已保存: ${logPath}`);
        
        // 打印关键日志
        console.log('\n🔍 关键日志摘要:');
        const keyLogs = consoleLogs.filter(log => 
            log.text.includes('[v') || 
            log.text.includes('🔥') || 
            log.text.includes('📱') ||
            log.text.includes('平板直向')
        );
        keyLogs.forEach((log, idx) => {
            console.log(`  ${idx + 1}. ${log.text}`);
        });
        
        console.log(`\n✅ 完成！共收集 ${consoleLogs.length} 条日志，${keyLogs.length} 条关键日志`);
        console.log(`📁 输出目录: ${CONFIG.OUTPUT_DIR}`);
        
        // 保持连接打开，让用户可以继续使用开发者工具
        console.log('\n💡 提示: 开发者工具已打开，你可以继续在 Responsively App 中调试');
        console.log('按 Ctrl+C 退出脚本');
        
        // 等待用户中断
        await new Promise(resolve => {
            process.on('SIGINT', () => {
                console.log('\n👋 再见！');
                resolve();
            });
        });
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.disconnect();
        }
    }
}

main();

