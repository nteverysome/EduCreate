import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Playwright 全局清理
 * 在所有測試運行後執行
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 開始 Playwright 測試清理...');

  const testResultsDir = path.join(process.cwd(), 'test-results');

  // 讀取測試開始時間
  const startTimeFile = path.join(testResultsDir, 'test-start-time.txt');
  let testStartTime = 'Unknown';
  if (fs.existsSync(startTimeFile)) {
    testStartTime = fs.readFileSync(startTimeFile, 'utf-8');
  }

  const testEndTime = new Date().toISOString();
  const duration = new Date(testEndTime).getTime() - new Date(testStartTime).getTime();

  // 生成測試摘要
  const summary = {
    startTime: testStartTime,
    endTime: testEndTime,
    duration: `${Math.round(duration / 1000)}秒`,
    testResultsDir: testResultsDir,
    screenshots: [],
    videos: [],
    reports: []
  };

  // 收集生成的文件
  if (fs.existsSync(testResultsDir)) {
    const files = fs.readdirSync(testResultsDir, { recursive: true });
    
    files.forEach(file => {
      const filePath = path.join(testResultsDir, file.toString());
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        const ext = path.extname(file.toString()).toLowerCase();
        const relativePath = path.relative(process.cwd(), filePath);
        
        if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
          summary.screenshots.push(relativePath);
        } else if (ext === '.webm' || ext === '.mp4') {
          summary.videos.push(relativePath);
        } else if (ext === '.html' || ext === '.json' || ext === '.xml') {
          summary.reports.push(relativePath);
        }
      }
    });
  }

  // 保存測試摘要
  const summaryFile = path.join(testResultsDir, 'test-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  // 輸出測試結果摘要
  console.log('📊 測試完成摘要:');
  console.log('├── 開始時間:', testStartTime);
  console.log('├── 結束時間:', testEndTime);
  console.log('├── 總耗時:', summary.duration);
  console.log('├── 截圖數量:', summary.screenshots.length);
  console.log('├── 視頻數量:', summary.videos.length);
  console.log('└── 報告數量:', summary.reports.length);

  // 輸出重要文件路徑
  if (summary.reports.length > 0) {
    console.log('\n📋 生成的報告:');
    summary.reports.forEach(report => {
      console.log(`   ${report}`);
    });
  }

  if (summary.screenshots.length > 0) {
    console.log('\n📸 截圖文件:');
    summary.screenshots.slice(0, 5).forEach(screenshot => {
      console.log(`   ${screenshot}`);
    });
    if (summary.screenshots.length > 5) {
      console.log(`   ... 還有 ${summary.screenshots.length - 5} 個截圖`);
    }
  }

  // 檢查是否有失敗的測試
  const htmlReportPath = path.join(testResultsDir, 'html-report', 'index.html');
  if (fs.existsSync(htmlReportPath)) {
    console.log('\n🌐 HTML 報告已生成:');
    console.log(`   file://${htmlReportPath}`);
  }

  // 清理臨時文件
  const tempFiles = [
    path.join(testResultsDir, 'test-start-time.txt')
  ];

  tempFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });

  console.log('✅ 測試清理完成');
}

export default globalTeardown;
