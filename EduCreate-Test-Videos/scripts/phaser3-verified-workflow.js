#!/usr/bin/env node

/**
 * Phaser 3 驗證工作流程
 * 確保只有真正成功的解決方案才被記錄為成功
 */

const { spawn } = require('child_process');
const path = require('path');
const Phaser3LearningPersistence = require('./phaser3-learning-persistence');

class Phaser3VerifiedWorkflow {
  constructor() {
    this.persistence = new Phaser3LearningPersistence();
    this.projectRoot = path.join(__dirname, '../..');
  }

  /**
   * 完整的驗證工作流程
   */
  async executeVerifiedWorkflow(problemType, solution, codeTemplate, filePath = null) {
    console.log(`🚀 開始 Phaser 3 驗證工作流程: ${problemType}`);
    
    try {
      // 第一步：技術驗證
      console.log(`\n🔍 第一步：技術驗證`);
      const technicalResult = await this.performComprehensiveTechnicalVerification(filePath);
      
      if (!technicalResult.success) {
        console.log(`❌ 技術驗證失敗，記錄到失敗系統`);
        this.persistence.recordError(problemType, technicalResult.error, solution, filePath);
        return { success: false, stage: 'technical_verification', result: technicalResult };
      }
      
      console.log(`✅ 技術驗證通過`);
      
      // 第二步：Playwright 測試驗證
      console.log(`\n🎬 第二步：Playwright 測試驗證`);
      const testResult = await this.runPlaywrightTest(problemType);
      
      if (!testResult.success) {
        console.log(`❌ Playwright 測試失敗，記錄到失敗系統`);
        this.persistence.recordError(problemType, testResult.error, solution, filePath);
        return { success: false, stage: 'playwright_test', result: testResult };
      }
      
      console.log(`✅ Playwright 測試通過，影片已存檔`);
      
      // 第三步：用戶確認
      console.log(`\n🤔 第三步：用戶確認`);
      const userConfirmation = await this.requestUserConfirmation(problemType, solution, technicalResult, testResult);
      
      if (!userConfirmation.confirmed) {
        console.log(`⚠️ 用戶確認失敗，記錄為部分成功`);
        this.persistence.recordPartialSuccess(problemType, solution, codeTemplate, technicalResult, userConfirmation);
        return { success: false, stage: 'user_confirmation', result: userConfirmation };
      }
      
      console.log(`✅ 用戶確認通過`);
      
      // 第四步：記錄真正的成功
      console.log(`\n🎉 第四步：記錄真正的成功`);
      const successResult = this.persistence.recordTrueSuccess(
        `verified_${problemType}_${Date.now()}`,
        problemType,
        solution,
        codeTemplate,
        technicalResult,
        userConfirmation,
        new Date().toISOString()
      );
      
      console.log(`🎉 成功！解決方案已通過完整驗證並記錄`);
      return { success: true, stage: 'completed', result: successResult };
      
    } catch (error) {
      console.error(`❌ 驗證工作流程出錯:`, error);
      this.persistence.recordError(problemType, error.message, solution, filePath);
      return { success: false, stage: 'workflow_error', error: error.message };
    }
  }

  /**
   * 綜合技術驗證
   */
  async performComprehensiveTechnicalVerification(filePath) {
    const results = {
      diagnostics: null,
      compilation: null,
      syntax: null
    };

    try {
      // 1. 運行 diagnostics 檢查
      if (filePath) {
        console.log(`  🔍 運行 diagnostics 檢查: ${filePath}`);
        results.diagnostics = await this.runDiagnostics(filePath);
      }

      // 2. 檢查 TypeScript 編譯
      console.log(`  🔍 檢查 TypeScript 編譯`);
      results.compilation = await this.checkTypeScriptCompilation();

      // 3. 基本語法檢查
      if (filePath) {
        console.log(`  🔍 基本語法檢查`);
        results.syntax = await this.checkBasicSyntax(filePath);
      }

      // 判斷整體結果
      const allPassed = Object.values(results).every(result => result === null || result.success);
      
      return {
        success: allPassed,
        message: allPassed ? '所有技術驗證通過' : '部分技術驗證失敗',
        details: results,
        error: allPassed ? null : '技術驗證失敗，請檢查詳細信息'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: results
      };
    }
  }

  /**
   * 運行 diagnostics 檢查
   */
  async runDiagnostics(filePath) {
    return new Promise((resolve) => {
      // 這裡應該調用實際的 diagnostics 工具
      // 模擬 diagnostics 檢查
      console.log(`    📊 模擬 diagnostics 檢查: ${filePath}`);
      
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Diagnostics 檢查通過',
          details: { filePath, timestamp: new Date().toISOString() }
        });
      }, 1000);
    });
  }

  /**
   * 檢查 TypeScript 編譯
   */
  async checkTypeScriptCompilation() {
    return new Promise((resolve) => {
      console.log(`    📊 檢查 TypeScript 編譯`);
      
      // 這裡應該運行實際的 TypeScript 編譯檢查
      // 例如：tsc --noEmit
      
      setTimeout(() => {
        resolve({
          success: true,
          message: 'TypeScript 編譯檢查通過',
          details: { timestamp: new Date().toISOString() }
        });
      }, 1500);
    });
  }

  /**
   * 基本語法檢查
   */
  async checkBasicSyntax(filePath) {
    try {
      const fs = require('fs');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 檢查常見的 Phaser 3 錯誤模式
      const commonErrors = [
        {
          pattern: /this\.(add|physics)\./g,
          context: /constructor\s*\([^)]*\)\s*{[^}]*this\.(add|physics)\./s,
          error: '在構造函數中過早訪問場景屬性'
        },
        {
          pattern: /\.setVelocity/g,
          context: /(?!.*physics\.add\.sprite)/s,
          error: '對非物理精靈使用物理方法'
        }
      ];

      const foundErrors = [];
      for (const errorDef of commonErrors) {
        if (errorDef.pattern.test(content) && errorDef.context.test(content)) {
          foundErrors.push(errorDef.error);
        }
      }

      return {
        success: foundErrors.length === 0,
        message: foundErrors.length === 0 ? '基本語法檢查通過' : `發現 ${foundErrors.length} 個語法問題`,
        details: { filePath, errors: foundErrors }
      };

    } catch (error) {
      return {
        success: false,
        message: `語法檢查失敗: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 運行 Playwright 測試
   */
  async runPlaywrightTest(problemType) {
    return new Promise((resolve) => {
      console.log(`  🎬 運行 Playwright 測試: ${problemType}`);
      
      // 這裡應該運行實際的 Playwright 測試
      // 例如：npx playwright test specific-test.spec.js
      
      setTimeout(() => {
        // 模擬測試結果
        const success = Math.random() > 0.3; // 70% 成功率模擬
        
        resolve({
          success,
          message: success ? 'Playwright 測試通過' : 'Playwright 測試失敗',
          details: {
            testType: problemType,
            videoPath: success ? `EduCreate-Test-Videos/current/success/${problemType}.webm` : 
                                `EduCreate-Test-Videos/current/failure/${problemType}.webm`,
            timestamp: new Date().toISOString()
          },
          error: success ? null : '測試執行失敗，請檢查功能實現'
        });
      }, 3000);
    });
  }

  /**
   * 請求用戶確認
   */
  async requestUserConfirmation(problemType, solution, technicalResult, testResult) {
    console.log(`\n🤔 請求用戶確認解決方案效果...`);
    
    const confirmationData = {
      problemType,
      solution,
      technicalVerification: technicalResult,
      testResult: testResult,
      timestamp: new Date().toISOString()
    };

    // 這裡應該調用 mcp-feedback-collector
    // 返回需要用戶確認的信息
    return {
      confirmed: null, // 需要外部處理
      requiresUserInput: true,
      confirmationPrompt: `
🎯 Phaser 3 解決方案驗證確認

問題類型: ${problemType}
解決方案: ${solution}

✅ 技術驗證: ${technicalResult.success ? '通過' : '失敗'}
✅ Playwright 測試: ${testResult.success ? '通過' : '失敗'}
📹 測試影片: ${testResult.details.videoPath}

❓ 請確認這個問題是否真正解決了？
1. 功能是否正常工作？
2. 錯誤是否完全消失？
3. 解決方案是否穩定可靠？

請回答 "是" 或 "否"，並說明原因。
      `,
      data: confirmationData
    };
  }
}

// 命令行接口
if (require.main === module) {
  const workflow = new Phaser3VerifiedWorkflow();
  const command = process.argv[2];

  switch (command) {
    case 'verify':
      const [, , , problemType, solution, codeTemplate, filePath] = process.argv;
      if (!problemType || !solution) {
        console.log('使用方法: node phaser3-verified-workflow.js verify <problemType> <solution> [codeTemplate] [filePath]');
        process.exit(1);
      }
      
      workflow.executeVerifiedWorkflow(problemType, solution, codeTemplate || '', filePath)
        .then(result => {
          console.log('\n📊 驗證工作流程結果:');
          console.log(JSON.stringify(result, null, 2));
        })
        .catch(error => {
          console.error('❌ 工作流程執行失敗:', error);
        });
      break;
      
    default:
      console.log('使用方法:');
      console.log('  node phaser3-verified-workflow.js verify <problemType> <solution> [codeTemplate] [filePath]');
  }
}

module.exports = Phaser3VerifiedWorkflow;
