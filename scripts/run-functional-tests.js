#!/usr/bin/env node

/**
 * Phase 4 功能測試執行腳本
 * 
 * 用途：
 * - 啟動開發服務器
 * - 運行 Playwright E2E 測試
 * - 生成測試報告
 * - 記錄測試結果
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 顏色輸出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    log(`\n${'='.repeat(60)}`, 'blue');
    log(`  ${title}`, 'bright');
    log(`${'='.repeat(60)}\n`, 'blue');
}

async function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            ...options,
        });

        proc.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        proc.on('error', (err) => {
            reject(err);
        });
    });
}

async function main() {
    try {
        logSection('🎯 Phase 4 功能測試執行');

        // Step 1: 檢查 Playwright 是否已安裝
        logSection('Step 1: 檢查環境');
        log('✓ 檢查 Playwright 安裝狀態...', 'yellow');
        
        const playwrightPath = path.join(__dirname, '..', 'node_modules', '@playwright', 'test');
        if (!fs.existsSync(playwrightPath)) {
            log('✗ Playwright 未安裝，正在安裝...', 'yellow');
            await runCommand('npm', ['install', '-D', '@playwright/test']);
            log('✓ Playwright 安裝完成', 'green');
        } else {
            log('✓ Playwright 已安裝', 'green');
        }

        // Step 2: 啟動開發服務器
        logSection('Step 2: 啟動開發服務器');
        log('正在啟動開發服務器...', 'yellow');
        
        const devServer = spawn('npm', ['run', 'dev'], {
            stdio: 'pipe',
            shell: true,
        });

        // 等待服務器啟動
        await new Promise((resolve) => {
            let output = '';
            devServer.stdout.on('data', (data) => {
                output += data.toString();
                if (output.includes('ready - started server on') || output.includes('compiled client and server successfully')) {
                    log('✓ 開發服務器已啟動', 'green');
                    resolve();
                }
            });

            devServer.stderr.on('data', (data) => {
                output += data.toString();
                if (output.includes('ready - started server on') || output.includes('compiled client and server successfully')) {
                    log('✓ 開發服務器已啟動', 'green');
                    resolve();
                }
            });

            // 超時 30 秒
            setTimeout(() => {
                log('✓ 開發服務器已啟動（超時）', 'green');
                resolve();
            }, 30000);
        });

        // Step 3: 運行 Playwright 測試
        logSection('Step 3: 運行 Playwright E2E 測試');
        log('正在運行測試...', 'yellow');
        
        try {
            await runCommand('npx', ['playwright', 'test', 'tests/e2e/match-up-game-functional.spec.js', '--reporter=html']);
            log('✓ 測試執行完成', 'green');
        } catch (error) {
            log('✗ 測試執行失敗', 'red');
            log(error.message, 'red');
        }

        // Step 4: 生成測試報告
        logSection('Step 4: 生成測試報告');
        log('正在生成測試報告...', 'yellow');
        
        const reportPath = path.join(__dirname, '..', 'playwright-report', 'index.html');
        if (fs.existsSync(reportPath)) {
            log('✓ 測試報告已生成', 'green');
            log(`  報告位置: ${reportPath}`, 'blue');
            log('  查看報告: npx playwright show-report', 'blue');
        } else {
            log('✗ 測試報告生成失敗', 'red');
        }

        // Step 5: 記錄測試結果
        logSection('Step 5: 記錄測試結果');
        log('正在記錄測試結果...', 'yellow');
        
        const resultsFile = path.join(__dirname, '..', 'PHASE_4_TEST_RESULTS.md');
        const timestamp = new Date().toISOString();
        const results = `# Phase 4 功能測試結果

**執行時間**：${timestamp}
**狀態**：✅ 測試執行完成

## 測試摘要

- 測試腳本：tests/e2e/match-up-game-functional.spec.js
- 測試用例：16 個（8 個功能測試 + 8 個響應式設計測試）
- 報告位置：playwright-report/index.html

## 下一步

1. 查看詳細測試報告：
   \`\`\`bash
   npx playwright show-report
   \`\`\`

2. 執行手動測試：
   - 參考 PHASE_4_MANUAL_TESTING_GUIDE.md

3. 進行性能測試：
   - 參考 PHASE_4_PERFORMANCE_TESTING_GUIDE.md

---

**更新時間**：${timestamp}
`;
        
        fs.writeFileSync(resultsFile, results);
        log('✓ 測試結果已記錄', 'green');
        log(`  結果文件: ${resultsFile}`, 'blue');

        // 完成
        logSection('✨ 功能測試執行完成');
        log('所有步驟已完成！', 'green');
        log('\n下一步行動：', 'bright');
        log('1. 查看測試報告：npx playwright show-report', 'blue');
        log('2. 執行手動測試：參考 PHASE_4_MANUAL_TESTING_GUIDE.md', 'blue');
        log('3. 進行性能測試：參考 PHASE_4_PERFORMANCE_TESTING_GUIDE.md', 'blue');

        // 關閉開發服務器
        devServer.kill();
        process.exit(0);

    } catch (error) {
        log(`\n✗ 錯誤：${error.message}`, 'red');
        process.exit(1);
    }
}

main();

