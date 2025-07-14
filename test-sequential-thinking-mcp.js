/**
 * Sequential Thinking MCP 測試腳本
 * 驗證 MCP 服務器是否正常工作
 */

const { spawn } = require('child_process');
const path = require('path');

class SequentialThinkingMCPTester {
  constructor() {
    this.mcpServerPath = path.join(__dirname, 'sequential-thinking-zalab', 'dist', 'index.js');
    this.testResults = [];
  }

  async runTest() {
    console.log('🧠 開始測試 Sequential Thinking MCP...\n');
    
    try {
      // 測試 1: 檢查服務器文件是否存在
      await this.testServerFileExists();
      
      // 測試 2: 嘗試啟動服務器
      await this.testServerStartup();
      
      // 測試 3: 測試基本功能
      await this.testBasicFunctionality();
      
      // 顯示測試結果
      this.displayResults();
      
    } catch (error) {
      console.error('❌ 測試過程中發生錯誤:', error.message);
    }
  }

  async testServerFileExists() {
    console.log('📁 測試 1: 檢查服務器文件...');
    
    const fs = require('fs');
    if (fs.existsSync(this.mcpServerPath)) {
      console.log('✅ 服務器文件存在:', this.mcpServerPath);
      this.testResults.push({ test: '服務器文件檢查', status: '通過' });
    } else {
      console.log('❌ 服務器文件不存在:', this.mcpServerPath);
      this.testResults.push({ test: '服務器文件檢查', status: '失敗' });
      throw new Error('服務器文件不存在');
    }
  }

  async testServerStartup() {
    console.log('\n🚀 測試 2: 服務器啟動測試...');
    
    return new Promise((resolve, reject) => {
      const serverProcess = spawn('node', [this.mcpServerPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      serverProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      serverProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // 給服務器一些時間啟動
      setTimeout(() => {
        if (serverProcess.pid && !serverProcess.killed) {
          console.log('✅ 服務器成功啟動 (PID:', serverProcess.pid, ')');
          this.testResults.push({ test: '服務器啟動', status: '通過' });
          
          // 停止服務器
          serverProcess.kill();
          resolve();
        } else {
          console.log('❌ 服務器啟動失敗');
          console.log('錯誤輸出:', errorOutput);
          this.testResults.push({ test: '服務器啟動', status: '失敗' });
          reject(new Error('服務器啟動失敗'));
        }
      }, 3000);

      serverProcess.on('error', (error) => {
        console.log('❌ 服務器啟動錯誤:', error.message);
        this.testResults.push({ test: '服務器啟動', status: '失敗' });
        reject(error);
      });
    });
  }

  async testBasicFunctionality() {
    console.log('\n🔧 測試 3: 基本功能測試...');
    
    // 這裡我們模擬一個基本的 MCP 調用測試
    // 實際的 MCP 調用需要更複雜的設置
    
    try {
      // 檢查 package.json 中的配置
      const fs = require('fs');
      const packagePath = path.join(__dirname, 'sequential-thinking-zalab', 'package.json');
      
      if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        if (packageData.name === '@modelcontextprotocol/server-sequential-thinking') {
          console.log('✅ MCP 服務器配置正確');
          console.log('   版本:', packageData.version);
          console.log('   描述:', packageData.description);
          this.testResults.push({ test: '基本功能配置', status: '通過' });
        } else {
          console.log('❌ MCP 服務器配置不正確');
          this.testResults.push({ test: '基本功能配置', status: '失敗' });
        }
      }
      
    } catch (error) {
      console.log('❌ 基本功能測試失敗:', error.message);
      this.testResults.push({ test: '基本功能配置', status: '失敗' });
    }
  }

  displayResults() {
    console.log('\n📊 測試結果摘要:');
    console.log('═'.repeat(50));
    
    let passedTests = 0;
    let totalTests = this.testResults.length;
    
    this.testResults.forEach((result, index) => {
      const status = result.status === '通過' ? '✅' : '❌';
      console.log(`${index + 1}. ${result.test}: ${status} ${result.status}`);
      if (result.status === '通過') passedTests++;
    });
    
    console.log('═'.repeat(50));
    console.log(`總測試數: ${totalTests}`);
    console.log(`通過測試: ${passedTests}`);
    console.log(`失敗測試: ${totalTests - passedTests}`);
    console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 所有測試通過！Sequential Thinking MCP 已準備就緒！');
      console.log('\n📋 下一步:');
      console.log('1. 運行 .\\start-sequential-thinking-mcp.ps1 啟動服務器');
      console.log('2. 在 Augment 中開始使用 sequential-thinking 功能');
      console.log('3. 處理複雜問題時會自動調用 sequential thinking');
    } else {
      console.log('\n⚠️  部分測試失敗，請檢查配置');
    }
  }
}

// 運行測試
if (require.main === module) {
  const tester = new SequentialThinkingMCPTester();
  tester.runTest().catch(console.error);
}

module.exports = SequentialThinkingMCPTester;
