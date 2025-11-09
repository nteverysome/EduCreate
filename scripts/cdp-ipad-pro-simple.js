#!/usr/bin/env node

/**
 * 简化版 CDP 控制器 - 直接连接到 Responsively App 中的游戏页面
 * 
 * 用途：收集 1024×1366 设备的调试日志
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CONFIG = {
    CDP_ENDPOINT: 'http://127.0.0.1:9222',
    OUTPUT_DIR: 'reports/cdp-logs',
    LOG_FILE: 'ipad-pro-1024x1366-debug.json'
};

async function getGamePageWebSocket() {
    return new Promise((resolve, reject) => {
        http.get(`${CONFIG.CDP_ENDPOINT}/json`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const pages = JSON.parse(data);
                    const gamePage = pages.find(p => p.url && p.url.includes('match-up-game'));
                    if (gamePage) {
                        resolve(gamePage.webSocketDebuggerUrl);
                    } else {
                        reject(new Error('找不到游戏页面'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log('🚀 启动简化版 CDP 控制器 (iPad Pro 1024×1366)');
    console.log(`📱 设备: iPad Pro 12.9" (1024×1366)`);
    
    // 创建输出目录
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
        fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    }
    
    const consoleLogs = [];
    let browser;
    let context;
    let page;
    
    try {
        // 获取游戏页面的 WebSocket 端点
        console.log('\n📡 获取游戏页面 WebSocket 端点...');
        const wsEndpoint = await getGamePageWebSocket();
        console.log(`✅ WebSocket 端点: ${wsEndpoint}`);
        
        // 连接到 Responsively App
        console.log('\n📡 连接到 Responsively App...');
        browser = await chromium.connectOverCDP(wsEndpoint);
        console.log('✅ 已连接到 Responsively App');
        
        // 获取上下文和页面
        const contexts = browser.contexts();
        context = contexts[0];
        const pages = context.pages();
        page = pages[0];
        
        console.log(`✅ 已获取页面: ${page.url()}`);
        
        // 监听控制台日志
        console.log('\n📝 开始收集控制台日志...');
        page.on('console', msg => {
            const logEntry = {
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString()
            };
            consoleLogs.push(logEntry);
            
            // 打印关键日志
            if (msg.text().includes('[v') || msg.text().includes('🔥') || msg.text().includes('📱')) {
                console.log(`  📌 ${msg.text()}`);
            }
        });
        
        // 等待游戏加载和初始化
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
                title: document.title,
                url: window.location.href
            };
        });
        
        console.log('✅ 游戏信息:');
        console.log(`  - 窗口大小: ${gameInfo.windowWidth}×${gameInfo.windowHeight}`);
        console.log(`  - DPR: ${gameInfo.devicePixelRatio}`);
        console.log(`  - 标题: ${gameInfo.title}`);
        
        // 获取关键日志
        console.log('\n🔍 提取关键日志...');
        const keyLogs = consoleLogs.filter(log => 
            log.text.includes('[v57.0]') || 
            log.text.includes('[v58.0]') ||
            log.text.includes('平板直向列數計算')
        );
        
        console.log(`✅ 找到 ${keyLogs.length} 条关键日志:`);
        keyLogs.forEach((log, idx) => {
            console.log(`\n  ${idx + 1}. ${log.text}`);
        });
        
        // 保存日志
        console.log('\n💾 保存日志...');
        const logPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.LOG_FILE);
        fs.writeFileSync(logPath, JSON.stringify({
            device: {
                name: 'iPad Pro 12.9"',
                width: 1024,
                height: 1366,
                dpr: 2
            },
            gameInfo: gameInfo,
            consoleLogs: consoleLogs,
            keyLogs: keyLogs,
            timestamp: new Date().toISOString(),
            totalLogs: consoleLogs.length,
            keyLogsCount: keyLogs.length
        }, null, 2));
        console.log(`✅ 日志已保存: ${logPath}`);
        
        // 打印统计信息
        console.log('\n📈 统计信息:');
        console.log(`  - 总日志数: ${consoleLogs.length}`);
        console.log(`  - 关键日志数: ${keyLogs.length}`);
        console.log(`  - v57.0 日志: ${consoleLogs.filter(l => l.text.includes('[v57.0]')).length}`);
        console.log(`  - v58.0 日志: ${consoleLogs.filter(l => l.text.includes('[v58.0]')).length}`);
        
        console.log(`\n✅ 完成！`);
        console.log(`📁 输出目录: ${CONFIG.OUTPUT_DIR}`);
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

main();

