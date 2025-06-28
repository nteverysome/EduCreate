#!/usr/bin/env node

/**
 * 第一階段完成狀態檢查工具
 * 檢查所有第一階段功能是否正確實現
 */

import fs from 'fs';
import path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string[];
}

class Phase1CompletionChecker {
  private results: CheckResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  // 添加檢查結果
  private addResult(name: string, status: CheckResult['status'], message: string, details?: string[]) {
    this.results.push({ name, status, message, details });
  }

  // 檢查文件是否存在
  private checkFileExists(filePath: string): boolean {
    return fs.existsSync(path.join(this.projectRoot, filePath));
  }

  // 檢查文件內容
  private checkFileContent(filePath: string, searchText: string): boolean {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      if (!fs.existsSync(fullPath)) return false;
      
      const content = fs.readFileSync(fullPath, 'utf8');
      return content.includes(searchText);
    } catch {
      return false;
    }
  }

  // 檢查核心庫文件
  checkCoreLibraries() {
    console.log('🔍 檢查核心庫文件...');

    const coreFiles = [
      {
        path: 'lib/content/AutoSaveManager.ts',
        name: '自動保存管理器',
        requiredContent: ['class AutoSaveManager', 'triggerAutoSave', 'forceSave']
      },
      {
        path: 'lib/content/ContentValidator.ts',
        name: '內容驗證器',
        requiredContent: ['class ContentValidator', 'validateContent', 'validateGameCompatibility']
      },
      {
        path: 'lib/content/TemplateManager.ts',
        name: '模板管理器',
        requiredContent: ['class TemplateManager', 'getAllTemplates', 'getRecommendedTemplates']
      }
    ];

    coreFiles.forEach(file => {
      if (this.checkFileExists(file.path)) {
        const missingContent = file.requiredContent.filter(content => 
          !this.checkFileContent(file.path, content)
        );

        if (missingContent.length === 0) {
          this.addResult(file.name, 'pass', '✅ 文件存在且包含必要功能');
        } else {
          this.addResult(file.name, 'fail', '❌ 文件存在但缺少必要功能', missingContent);
        }
      } else {
        this.addResult(file.name, 'fail', '❌ 文件不存在');
      }
    });
  }

  // 檢查組件文件
  checkComponents() {
    console.log('🔍 檢查組件文件...');

    const components = [
      {
        path: 'components/content/ActivityManager.tsx',
        name: '活動管理組件',
        requiredContent: ['ActivityManager', 'useState', 'useEffect']
      },
      {
        path: 'components/content/EnhancedUniversalContentEditor.tsx',
        name: '增強內容編輯器',
        requiredContent: ['EnhancedUniversalContentEditor', 'AutoSaveManager', 'ContentValidator']
      },
      {
        path: 'components/demo/Phase1FeatureDemo.tsx',
        name: '功能演示組件',
        requiredContent: ['Phase1FeatureDemo', 'AutoSaveManager', 'TemplateManager']
      }
    ];

    components.forEach(component => {
      if (this.checkFileExists(component.path)) {
        const missingContent = component.requiredContent.filter(content => 
          !this.checkFileContent(component.path, content)
        );

        if (missingContent.length === 0) {
          this.addResult(component.name, 'pass', '✅ 組件存在且功能完整');
        } else {
          this.addResult(component.name, 'warning', '⚠️ 組件存在但可能缺少功能', missingContent);
        }
      } else {
        this.addResult(component.name, 'fail', '❌ 組件不存在');
      }
    });
  }

  // 檢查 API 端點
  checkAPIEndpoints() {
    console.log('🔍 檢查 API 端點...');

    const endpoints = [
      {
        path: 'pages/api/universal-content/[id]/autosave.ts',
        name: '自動保存 API',
        requiredContent: ['prisma', 'getServerSession', 'autoSave']
      },
      {
        path: 'pages/api/universal-content/[id]/switch-template.ts',
        name: '模板切換 API',
        requiredContent: ['TemplateManager', 'prisma', 'templateId']
      },
      {
        path: 'pages/api/universal-content/folders.ts',
        name: '文件夾管理 API',
        requiredContent: ['prisma.folder', 'handleGet', 'handlePost']
      }
    ];

    endpoints.forEach(endpoint => {
      if (this.checkFileExists(endpoint.path)) {
        const missingContent = endpoint.requiredContent.filter(content => 
          !this.checkFileContent(endpoint.path, content)
        );

        if (missingContent.length === 0) {
          this.addResult(endpoint.name, 'pass', '✅ API 端點存在且功能完整');
        } else {
          this.addResult(endpoint.name, 'warning', '⚠️ API 端點存在但可能缺少功能', missingContent);
        }
      } else {
        this.addResult(endpoint.name, 'fail', '❌ API 端點不存在');
      }
    });
  }

  // 檢查測試文件
  checkTestFiles() {
    console.log('🔍 檢查測試文件...');

    const testFiles = [
      '__tests__/phase1/AutoSaveManager.test.ts',
      '__tests__/phase1/ContentValidator.test.ts',
      '__tests__/phase1/TemplateManager.test.ts',
      '__tests__/phase1/api.test.ts'
    ];

    const existingTests = testFiles.filter(file => this.checkFileExists(file));
    
    if (existingTests.length === testFiles.length) {
      this.addResult('測試文件', 'pass', `✅ 所有 ${testFiles.length} 個測試文件都存在`);
    } else {
      const missingTests = testFiles.filter(file => !this.checkFileExists(file));
      this.addResult('測試文件', 'warning', 
        `⚠️ ${existingTests.length}/${testFiles.length} 個測試文件存在`, 
        missingTests.map(file => `缺少: ${file}`)
      );
    }
  }

  // 檢查數據庫模型
  checkDatabaseSchema() {
    console.log('🔍 檢查數據庫模型...');

    const schemaPath = 'prisma/schema.prisma';
    
    if (!this.checkFileExists(schemaPath)) {
      this.addResult('數據庫模型', 'fail', '❌ Prisma schema 文件不存在');
      return;
    }

    const requiredModels = [
      'model Activity',
      'model Folder',
      'templateType',
      'isDraft',
      'folderId',
      'lastPlayed',
      'playCount',
      'shareCount'
    ];

    const missingModels = requiredModels.filter(model => 
      !this.checkFileContent(schemaPath, model)
    );

    if (missingModels.length === 0) {
      this.addResult('數據庫模型', 'pass', '✅ 數據庫模型包含所有必要字段');
    } else {
      this.addResult('數據庫模型', 'warning', '⚠️ 數據庫模型可能缺少字段', missingModels);
    }
  }

  // 檢查演示頁面
  checkDemoPages() {
    console.log('🔍 檢查演示頁面...');

    const demoPages = [
      {
        path: 'pages/phase1-demo.tsx',
        name: '第一階段演示頁面',
        requiredContent: ['Phase1Demo', 'ActivityManager', 'EnhancedUniversalContentEditor']
      },
      {
        path: 'pages/test-coverage-demo.tsx',
        name: '測試覆蓋演示頁面',
        requiredContent: ['TestCoverageDemo', 'TestResultsDisplay']
      }
    ];

    demoPages.forEach(page => {
      if (this.checkFileExists(page.path)) {
        const missingContent = page.requiredContent.filter(content => 
          !this.checkFileContent(page.path, content)
        );

        if (missingContent.length === 0) {
          this.addResult(page.name, 'pass', '✅ 演示頁面存在且功能完整');
        } else {
          this.addResult(page.name, 'warning', '⚠️ 演示頁面存在但可能缺少功能', missingContent);
        }
      } else {
        this.addResult(page.name, 'fail', '❌ 演示頁面不存在');
      }
    });
  }

  // 檢查文檔文件
  checkDocumentation() {
    console.log('🔍 檢查文檔文件...');

    const docFiles = [
      'docs/PHASE1_IMPLEMENTATION.md',
      'docs/PHASE1_TEST_COVERAGE.md',
      'docs/PHASE1_COMPLETE_SUMMARY.md'
    ];

    const existingDocs = docFiles.filter(file => this.checkFileExists(file));
    
    if (existingDocs.length === docFiles.length) {
      this.addResult('文檔文件', 'pass', `✅ 所有 ${docFiles.length} 個文檔文件都存在`);
    } else {
      const missingDocs = docFiles.filter(file => !this.checkFileExists(file));
      this.addResult('文檔文件', 'warning', 
        `⚠️ ${existingDocs.length}/${docFiles.length} 個文檔文件存在`, 
        missingDocs.map(file => `缺少: ${file}`)
      );
    }
  }

  // 運行所有檢查
  async runAllChecks() {
    console.log('🚀 開始第一階段完成狀態檢查...\n');

    this.checkCoreLibraries();
    this.checkComponents();
    this.checkAPIEndpoints();
    this.checkTestFiles();
    this.checkDatabaseSchema();
    this.checkDemoPages();
    this.checkDocumentation();

    this.generateReport();
  }

  // 生成報告
  generateReport() {
    console.log('\n📊 第一階段完成狀態報告');
    console.log('='.repeat(50));

    const passCount = this.results.filter(r => r.status === 'pass').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const failCount = this.results.filter(r => r.status === 'fail').length;

    console.log(`\n📈 總體統計:`);
    console.log(`✅ 通過: ${passCount}`);
    console.log(`⚠️ 警告: ${warningCount}`);
    console.log(`❌ 失敗: ${failCount}`);
    console.log(`📝 總計: ${this.results.length}`);

    console.log(`\n📋 詳細結果:`);
    this.results.forEach(result => {
      console.log(`\n${result.message} - ${result.name}`);
      if (result.details && result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`  • ${detail}`);
        });
      }
    });

    // 計算完成度
    const completionRate = Math.round((passCount / this.results.length) * 100);
    
    console.log(`\n🎯 完成度評估:`);
    if (completionRate >= 90) {
      console.log(`🎉 優秀！完成度 ${completionRate}% - 第一階段基本完成`);
    } else if (completionRate >= 70) {
      console.log(`👍 良好！完成度 ${completionRate}% - 大部分功能已實現`);
    } else if (completionRate >= 50) {
      console.log(`⚠️ 一般！完成度 ${completionRate}% - 還需要更多工作`);
    } else {
      console.log(`❌ 需要改進！完成度 ${completionRate}% - 大量功能缺失`);
    }

    console.log(`\n🚀 下一步建議:`);
    if (failCount > 0) {
      console.log(`• 優先修復 ${failCount} 個失敗項目`);
    }
    if (warningCount > 0) {
      console.log(`• 檢查並完善 ${warningCount} 個警告項目`);
    }
    if (completionRate >= 90) {
      console.log(`• 運行完整測試套件`);
      console.log(`• 準備進入第二階段開發`);
    }

    console.log('\n' + '='.repeat(50));
    
    return {
      completionRate,
      passCount,
      warningCount,
      failCount,
      results: this.results
    };
  }
}

// 主函數
async function main() {
  const checker = new Phase1CompletionChecker();
  const report = await checker.runAllChecks();
  
  // 退出碼
  process.exit(report.failCount > 0 ? 1 : 0);
}

// 如果直接運行此腳本
if (require.main === module) {
  main().catch(console.error);
}

export default Phase1CompletionChecker;
