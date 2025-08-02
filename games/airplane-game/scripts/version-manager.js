#!/usr/bin/env node

/**
 * 版本管理腳本
 * 功能：
 * 1. 自動版本號管理
 * 2. 生成變更日誌
 * 3. Git 標籤管理
 * 4. 版本回滾功能
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  packageJsonPath: path.resolve(__dirname, '../package.json'),
  changelogPath: path.resolve(__dirname, '../CHANGELOG.md'),
  versionsDir: path.resolve(__dirname, '../versions'),
};

/**
 * 日誌工具
 */
class Logger {
  static info(message, ...args) {
    console.log(`ℹ️  ${message}`, ...args);
  }
  
  static success(message, ...args) {
    console.log(`✅ ${message}`, ...args);
  }
  
  static warn(message, ...args) {
    console.warn(`⚠️  ${message}`, ...args);
  }
  
  static error(message, ...args) {
    console.error(`❌ ${message}`, ...args);
  }
}

/**
 * 執行 Git 命令
 */
function execGit(command) {
  try {
    return execSync(`git ${command}`, { encoding: 'utf8' }).trim();
  } catch (error) {
    Logger.error(`Git 命令失敗: git ${command}`);
    throw error;
  }
}

/**
 * 讀取 package.json
 */
function readPackageJson() {
  if (!fs.existsSync(CONFIG.packageJsonPath)) {
    throw new Error('package.json 文件不存在');
  }
  
  const content = fs.readFileSync(CONFIG.packageJsonPath, 'utf8');
  return JSON.parse(content);
}

/**
 * 寫入 package.json
 */
function writePackageJson(packageData) {
  const content = JSON.stringify(packageData, null, 2) + '\n';
  fs.writeFileSync(CONFIG.packageJsonPath, content);
}

/**
 * 解析版本號
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`無效的版本號格式: ${version}`);
  }
  
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null,
    original: version,
  };
}

/**
 * 格式化版本號
 */
function formatVersion(versionObj) {
  let version = `${versionObj.major}.${versionObj.minor}.${versionObj.patch}`;
  if (versionObj.prerelease) {
    version += `-${versionObj.prerelease}`;
  }
  return version;
}

/**
 * 增加版本號
 */
function bumpVersion(currentVersion, type) {
  const version = parseVersion(currentVersion);
  
  switch (type) {
    case 'major':
      version.major++;
      version.minor = 0;
      version.patch = 0;
      version.prerelease = null;
      break;
    case 'minor':
      version.minor++;
      version.patch = 0;
      version.prerelease = null;
      break;
    case 'patch':
      version.patch++;
      version.prerelease = null;
      break;
    case 'prerelease':
      if (version.prerelease) {
        const match = version.prerelease.match(/^(.+)\.(\d+)$/);
        if (match) {
          version.prerelease = `${match[1]}.${parseInt(match[2]) + 1}`;
        } else {
          version.prerelease = `${version.prerelease}.1`;
        }
      } else {
        version.patch++;
        version.prerelease = 'alpha.0';
      }
      break;
    default:
      throw new Error(`未知的版本類型: ${type}`);
  }
  
  return formatVersion(version);
}

/**
 * 獲取 Git 變更
 */
function getGitChanges(fromTag = null) {
  let command = 'log --oneline --no-merges';
  
  if (fromTag) {
    // 檢查標籤是否存在
    try {
      execGit(`rev-parse ${fromTag}`);
      command += ` ${fromTag}..HEAD`;
    } catch (error) {
      Logger.warn(`標籤 ${fromTag} 不存在，獲取所有提交`);
    }
  }
  
  const output = execGit(command);
  if (!output) return [];
  
  return output.split('\n').map(line => {
    const match = line.match(/^([a-f0-9]+)\s+(.+)$/);
    return match ? { hash: match[1], message: match[2] } : null;
  }).filter(Boolean);
}

/**
 * 生成變更日誌
 */
function generateChangelog(version, changes) {
  const date = new Date().toISOString().split('T')[0];
  
  let changelog = `## [${version}] - ${date}\n\n`;
  
  if (changes.length === 0) {
    changelog += '- 無變更記錄\n\n';
    return changelog;
  }
  
  // 分類變更
  const categories = {
    feat: { title: '新功能', items: [] },
    fix: { title: '錯誤修復', items: [] },
    docs: { title: '文檔', items: [] },
    style: { title: '樣式', items: [] },
    refactor: { title: '重構', items: [] },
    perf: { title: '性能優化', items: [] },
    test: { title: '測試', items: [] },
    chore: { title: '其他', items: [] },
  };
  
  changes.forEach(change => {
    const message = change.message;
    let category = 'chore';
    
    // 檢測提交類型
    const match = message.match(/^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?\s*:\s*(.+)$/);
    if (match) {
      category = match[1];
      change.cleanMessage = match[3];
    } else {
      change.cleanMessage = message;
    }
    
    categories[category].items.push(change);
  });
  
  // 生成變更日誌內容
  Object.entries(categories).forEach(([key, category]) => {
    if (category.items.length > 0) {
      changelog += `### ${category.title}\n\n`;
      category.items.forEach(item => {
        changelog += `- ${item.cleanMessage} (${item.hash})\n`;
      });
      changelog += '\n';
    }
  });
  
  return changelog;
}

/**
 * 更新變更日誌文件
 */
function updateChangelogFile(newContent) {
  let existingContent = '';
  
  if (fs.existsSync(CONFIG.changelogPath)) {
    existingContent = fs.readFileSync(CONFIG.changelogPath, 'utf8');
  } else {
    existingContent = '# 變更日誌\n\n所有重要變更都會記錄在此文件中。\n\n';
  }
  
  // 在現有內容前插入新的變更日誌
  const lines = existingContent.split('\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## [')) || lines.length;
  
  lines.splice(insertIndex, 0, newContent);
  
  const updatedContent = lines.join('\n');
  fs.writeFileSync(CONFIG.changelogPath, updatedContent);
}

/**
 * 創建版本備份
 */
function createVersionBackup(version, packageData) {
  if (!fs.existsSync(CONFIG.versionsDir)) {
    fs.mkdirSync(CONFIG.versionsDir, { recursive: true });
  }
  
  const backupData = {
    version,
    timestamp: new Date().toISOString(),
    packageJson: packageData,
    git: {
      branch: execGit('rev-parse --abbrev-ref HEAD'),
      commit: execGit('rev-parse HEAD'),
      tag: `v${version}`,
    },
  };
  
  const backupPath = path.join(CONFIG.versionsDir, `${version}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  
  Logger.info(`版本備份已創建: ${backupPath}`);
}

/**
 * 發布版本
 */
function releaseVersion(type = 'patch', message = null) {
  try {
    Logger.info(`🚀 開始發布 ${type} 版本...`);
    
    // 檢查 Git 狀態
    const status = execGit('status --porcelain');
    if (status) {
      Logger.warn('工作目錄有未提交的變更:');
      console.log(status);
      
      const answer = process.argv.includes('--force') ? 'y' : 'n';
      if (answer !== 'y') {
        Logger.error('請先提交或暫存變更，或使用 --force 強制發布');
        process.exit(1);
      }
    }
    
    // 讀取當前版本
    const packageData = readPackageJson();
    const currentVersion = packageData.version;
    const newVersion = bumpVersion(currentVersion, type);
    
    Logger.info(`版本號: ${currentVersion} -> ${newVersion}`);
    
    // 獲取變更
    const lastTag = `v${currentVersion}`;
    const changes = getGitChanges(lastTag);
    Logger.info(`發現 ${changes.length} 個變更`);
    
    // 更新 package.json
    packageData.version = newVersion;
    writePackageJson(packageData);
    Logger.success('package.json 已更新');
    
    // 生成變更日誌
    const changelogContent = generateChangelog(newVersion, changes);
    updateChangelogFile(changelogContent);
    Logger.success('變更日誌已更新');
    
    // 創建版本備份
    createVersionBackup(newVersion, packageData);
    
    // Git 提交和標籤
    const commitMessage = message || `chore: release v${newVersion}`;
    execGit('add .');
    execGit(`commit -m "${commitMessage}"`);
    execGit(`tag -a v${newVersion} -m "Release v${newVersion}"`);
    
    Logger.success(`✨ 版本 v${newVersion} 發布成功！`);
    Logger.info('下一步:');
    Logger.info('  git push origin main');
    Logger.info(`  git push origin v${newVersion}`);
    
    return newVersion;
    
  } catch (error) {
    Logger.error('版本發布失敗:', error.message);
    process.exit(1);
  }
}

/**
 * 主函數
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'release':
      const type = args[1] || 'patch';
      const message = args.find(arg => arg.startsWith('--message='))?.split('=')[1];
      releaseVersion(type, message);
      break;
      
    case 'current':
      const packageData = readPackageJson();
      console.log(packageData.version);
      break;
      
    case 'changelog':
      const version = args[1] || readPackageJson().version;
      const changes = getGitChanges(`v${version}`);
      const changelog = generateChangelog(version, changes);
      console.log(changelog);
      break;
      
    default:
      console.log('用法:');
      console.log('  node version-manager.js release [major|minor|patch|prerelease] [--message="提交信息"] [--force]');
      console.log('  node version-manager.js current');
      console.log('  node version-manager.js changelog [version]');
      break;
  }
}

// 執行主函數
const isMainModule = process.argv[1] && process.argv[1].endsWith('version-manager.js');
if (isMainModule) {
  main();
}

export { releaseVersion, bumpVersion, generateChangelog };
