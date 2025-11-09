#!/usr/bin/env node

/**
 * 日志收集脚本 - 通过 Responsively App 的 DevTools Protocol
 * 
 * 用途：收集 1024×1366 设备的调试日志
 */

const WebSocket = require('ws');
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
                        console.log(`✅ 找到游戏页面: ${gamePage.url}`);
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
    console.log('🚀 启动日志收集脚本 (iPad Pro 1024×1366)');
    console.log(`📱 设备: iPad Pro 12.9" (1024×1366)`);
    
    // 创建输出目录
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
        fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    }
    
    const consoleLogs = [];
    let ws;
    let messageId = 1;
    
    try {
        // 获取游戏页面的 WebSocket 端点
        console.log('\n📡 获取游戏页面 WebSocket 端点...');
        const wsEndpoint = await getGamePageWebSocket();
        console.log(`📡 WebSocket 端点: ${wsEndpoint}`);
        
        // 连接到 CDP
        console.log('\n📡 连接到 CDP...');
        ws = new WebSocket(wsEndpoint);
        
        await new Promise((resolve, reject) => {
            ws.on('open', () => {
                console.log('✅ 已连接到 CDP');
                resolve();
            });
            ws.on('error', reject);
        });
        
        // 启用 Runtime 域
        console.log('\n📝 启用 Runtime 域...');
        await sendCommand(ws, messageId++, 'Runtime.enable', {});
        
        // 启用 Console 域
        console.log('📝 启用 Console 域...');
        await sendCommand(ws, messageId++, 'Console.enable', {});
        
        // 监听控制台消息
        console.log('\n📝 开始收集控制台日志...');
        
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                
                // 处理 Console.messageAdded 事件
                if (message.method === 'Console.messageAdded') {
                    const msg = message.params.message;
                    const logEntry = {
                        type: msg.level,
                        text: msg.text,
                        timestamp: new Date().toISOString()
                    };
                    consoleLogs.push(logEntry);
                    
                    // 打印关键日志
                    if (msg.text.includes('[v57') || msg.text.includes('[v58') || msg.text.includes('平板直向')) {
                        console.log(`  📌 ${msg.text}`);
                    }
                }
            } catch (e) {
                // 忽略解析错误
            }
        });
        
        // 等待日志收集
        console.log('\n⏳ 等待日志收集 (10 秒)...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // 获取游戏信息
        console.log('\n📊 收集游戏信息...');
        const gameInfo = await evaluateInPage(ws, messageId++, () => {
            return {
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                screenAvailWidth: window.screen.availWidth,
                screenAvailHeight: window.screen.availHeight,
                userAgent: navigator.userAgent,
                title: document.title,
                url: window.location.href
            };
        });

        console.log('✅ 游戏信息:');
        console.log(`  - 窗口大小: ${gameInfo.windowWidth}×${gameInfo.windowHeight}`);
        console.log(`  - 屏幕大小: ${gameInfo.screenWidth}×${gameInfo.screenHeight}`);
        console.log(`  - 可用屏幕: ${gameInfo.screenAvailWidth}×${gameInfo.screenAvailHeight}`);
        console.log(`  - DPR: ${gameInfo.devicePixelRatio}`);
        console.log(`  - 标题: ${gameInfo.title}`);
        
        // 获取关键日志
        console.log('\n🔍 提取关键日志...');
        const keyLogs = consoleLogs.filter(log => 
            log.text.includes('[v57') || 
            log.text.includes('[v58') ||
            log.text.includes('平板直向列數計算')
        );
        
        console.log(`✅ 找到 ${keyLogs.length} 条关键日志`);
        
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
        console.log(`  - v57.0 日志: ${consoleLogs.filter(l => l.text.includes('[v57')).length}`);
        console.log(`  - v58.0 日志: ${consoleLogs.filter(l => l.text.includes('[v58')).length}`);
        
        // 显示完整的关键日志
        console.log('\n📋 完整关键日志内容:');
        console.log('='.repeat(80));
        keyLogs.forEach((log, idx) => {
            console.log(`\n[${idx + 1}] ${log.timestamp}`);
            console.log(log.text);
        });
        console.log('='.repeat(80));
        
        console.log(`\n✅ 完成！`);
        console.log(`📁 输出目录: ${CONFIG.OUTPUT_DIR}`);
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    } finally {
        if (ws) {
            ws.close();
        }
    }
}

function sendCommand(ws, id, method, params) {
    return new Promise((resolve, reject) => {
        const command = { id, method, params };
        ws.send(JSON.stringify(command), (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function evaluateInPage(ws, id, fn) {
    return new Promise((resolve, reject) => {
        const expression = `(${fn.toString()})()`;
        const command = {
            id,
            method: 'Runtime.evaluate',
            params: { expression, returnByValue: true }
        };
        
        const handler = (data) => {
            try {
                const message = JSON.parse(data);
                if (message.id === id) {
                    ws.removeListener('message', handler);
                    if (message.result && message.result.result) {
                        resolve(message.result.result.value);
                    } else {
                        reject(new Error('Evaluation failed'));
                    }
                }
            } catch (e) {
                // 忽略
            }
        };
        
        ws.on('message', handler);
        ws.send(JSON.stringify(command), (err) => {
            if (err) reject(err);
        });
    });
}

main();

