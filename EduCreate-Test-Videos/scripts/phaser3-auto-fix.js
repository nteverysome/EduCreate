#!/usr/bin/env node

/**
 * Phaser 3 自動錯誤檢測和修復腳本
 * 基於常見錯誤模式自動檢測和建議修復方案
 */

const fs = require('fs');
const path = require('path');

class Phaser3AutoFix {
  constructor() {
    this.projectRoot = path.join(__dirname, '../..');
    this.commonErrors = [
      {
        pattern: /this\.(add|physics)\./g,
        context: /constructor\s*\([^)]*\)\s*{[^}]*this\.(add|physics)\./s,
        error: 'early_scene_access',
        message: '在構造函數中過早訪問場景屬性',
        fix: '將場景屬性訪問移到 create() 方法中'
      },
      {
        pattern: /this\.physics\.add\./g,
        context: /(?!.*physics\s*:\s*{)/s,
        error: 'physics_not_enabled',
        message: '使用物理系統但未在配置中啟用',
        fix: '在場景配置中添加 physics: { default: "arcade", arcade: { gravity: { y: 0 } } }'
      },
      {
        pattern: /\.setVelocity/g,
        context: /(?!.*physics\.add\.sprite)/s,
        error: 'non_physics_sprite',
        message: '對非物理精靈使用物理方法',
        fix: '使用 this.physics.add.sprite() 創建物理精靈'
      },
      {
        pattern: /this\.load\./g,
        context: /create\s*\([^)]*\)\s*{[^}]*this\.load\./s,
        error: 'load_in_create',
        message: '在 create() 方法中載入資源',
        fix: '將資源載入移到 preload() 方法中'
      },
      {
        pattern: /new Phaser\.Scene/g,
        context: /(?!.*super\s*\()/s,
        error: 'missing_super_call',
        message: '場景類缺少 super() 調用',
        fix: '在構造函數中添加 super({ key: "SceneName" })'
      }
    ];
  }

  /**
   * 掃描項目中的 Phaser 3 文件
   */
  scanProject() {
    const phaserFiles = [];
    this.scanDirectory(this.projectRoot, phaserFiles);
    return phaserFiles.filter(file => this.isPhaserFile(file));
  }

  /**
   * 遞歸掃描目錄
   */
  scanDirectory(dir, files) {
    if (dir.includes('node_modules') || dir.includes('.git')) return;
    
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          this.scanDirectory(fullPath, files);
        } else if (item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // 忽略無法訪問的目錄
    }
  }

  /**
   * 檢查是否為 Phaser 文件
   */
  isPhaserFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes('Phaser') || content.includes('phaser');
    } catch (error) {
      return false;
    }
  }

  /**
   * 檢查單個文件的錯誤
   */
  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    for (const errorDef of this.commonErrors) {
      const matches = content.match(errorDef.pattern);
      if (matches) {
        // 檢查上下文是否匹配
        if (errorDef.context && !errorDef.context.test(content)) {
          continue;
        }

        errors.push({
          file: filePath,
          error: errorDef.error,
          message: errorDef.message,
          fix: errorDef.fix,
          matches: matches.length,
          line: this.getLineNumber(content, matches[0])
        });
      }
    }

    return errors;
  }

  /**
   * 獲取錯誤所在行號
   */
  getLineNumber(content, match) {
    const index = content.indexOf(match);
    if (index === -1) return 0;
    
    return content.substring(0, index).split('\n').length;
  }

  /**
   * 生成修復建議
   */
  generateFixSuggestions(errors) {
    const suggestions = {
      critical: [],
      warnings: [],
      improvements: []
    };

    for (const error of errors) {
      const suggestion = {
        file: path.relative(this.projectRoot, error.file),
        line: error.line,
        error: error.error,
        message: error.message,
        fix: error.fix
      };

      if (error.error === 'early_scene_access' || error.error === 'physics_not_enabled') {
        suggestions.critical.push(suggestion);
      } else if (error.error === 'non_physics_sprite' || error.error === 'load_in_create') {
        suggestions.warnings.push(suggestion);
      } else {
        suggestions.improvements.push(suggestion);
      }
    }

    return suggestions;
  }

  /**
   * 生成修復代碼
   */
  generateFixCode(error) {
    const templates = {
      early_scene_access: `
// ❌ 錯誤：在構造函數中訪問場景屬性
constructor() {
  super({ key: 'GameScene' });
  this.add.sprite(100, 100, 'player'); // 錯誤！
}

// ✅ 正確：在 create() 方法中訪問
create() {
  this.add.sprite(100, 100, 'player');
}`,
      
      physics_not_enabled: `
// ✅ 在場景配置中啟用物理系統
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};`,

      non_physics_sprite: `
// ❌ 錯誤：對普通精靈使用物理方法
const sprite = this.add.sprite(100, 100, 'player');
sprite.setVelocity(100, 0); // 錯誤！

// ✅ 正確：創建物理精靈
const sprite = this.physics.add.sprite(100, 100, 'player');
sprite.setVelocity(100, 0);`,

      load_in_create: `
// ❌ 錯誤：在 create() 中載入資源
create() {
  this.load.image('player', 'assets/player.png'); // 錯誤！
  this.add.sprite(100, 100, 'player');
}

// ✅ 正確：在 preload() 中載入資源
preload() {
  this.load.image('player', 'assets/player.png');
}
create() {
  this.add.sprite(100, 100, 'player');
}`
    };

    return templates[error.error] || '// 沒有可用的修復模板';
  }

  /**
   * 執行完整檢查
   */
  runFullCheck() {
    console.log('🔍 開始掃描 Phaser 3 文件...');
    
    const phaserFiles = this.scanProject();
    console.log(`📁 找到 ${phaserFiles.length} 個 Phaser 文件`);

    const allErrors = [];
    for (const file of phaserFiles) {
      const errors = this.checkFile(file);
      allErrors.push(...errors);
    }

    console.log(`⚠️ 發現 ${allErrors.length} 個潛在問題`);

    const suggestions = this.generateFixSuggestions(allErrors);
    
    return {
      scannedFiles: phaserFiles.length,
      totalErrors: allErrors.length,
      suggestions,
      detailedErrors: allErrors
    };
  }

  /**
   * 生成修復報告
   */
  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        scanned_files: results.scannedFiles,
        total_errors: results.totalErrors,
        critical_errors: results.suggestions.critical.length,
        warnings: results.suggestions.warnings.length,
        improvements: results.suggestions.improvements.length
      },
      critical_fixes: results.suggestions.critical,
      warning_fixes: results.suggestions.warnings,
      improvement_suggestions: results.suggestions.improvements
    };

    // 保存報告
    const reportPath = path.join(__dirname, '../local-memory/phaser3-auto-fix-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 報告已保存到: ${reportPath}`);
    return report;
  }
}

// 命令行接口
if (require.main === module) {
  const autoFix = new Phaser3AutoFix();
  const command = process.argv[2];

  switch (command) {
    case 'scan':
      const results = autoFix.runFullCheck();
      const report = autoFix.generateReport(results);
      
      console.log('\n📊 掃描結果:');
      console.log(`🔍 掃描文件: ${results.scannedFiles}`);
      console.log(`⚠️ 總問題數: ${results.totalErrors}`);
      console.log(`🚨 嚴重問題: ${results.suggestions.critical.length}`);
      console.log(`⚠️ 警告問題: ${results.suggestions.warnings.length}`);
      console.log(`💡 改進建議: ${results.suggestions.improvements.length}`);
      break;
      
    case 'check':
      const filePath = process.argv[3];
      if (filePath && fs.existsSync(filePath)) {
        const errors = autoFix.checkFile(filePath);
        console.log(`檢查文件: ${filePath}`);
        console.log(`發現問題: ${errors.length}`);
        errors.forEach(error => {
          console.log(`  - ${error.message} (行 ${error.line})`);
          console.log(`    修復: ${error.fix}`);
        });
      } else {
        console.log('請提供有效的文件路徑');
      }
      break;
      
    default:
      console.log('使用方法:');
      console.log('  node phaser3-auto-fix.js scan     # 掃描整個項目');
      console.log('  node phaser3-auto-fix.js check <file>  # 檢查單個文件');
  }
}

module.exports = Phaser3AutoFix;
