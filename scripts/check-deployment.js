#!/usr/bin/env node

const https = require('https');
const http = require('http');

const urls = [
  'https://edu-create-mzy0xc7lb-minamisums-projects.vercel.app',
  'https://edu-create-mzy0xc7lb-minamisums-projects.vercel.app/test',
  'https://edu-create-mzy0xc7lb-minamisums-projects.vercel.app/api/health'
];

console.log('🔍 檢查部署狀態...\n');

function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      const status = res.statusCode;
      const statusText = status === 200 ? '✅ 正常' : 
                        status === 401 ? '❌ 需要認證' :
                        status === 404 ? '❌ 找不到' :
                        `❌ 錯誤 (${status})`;
      
      console.log(`${statusText} - ${url}`);
      resolve({ url, status, ok: status === 200 });
    });
    
    req.on('error', (error) => {
      console.log(`❌ 連接失敗 - ${url} (${error.message})`);
      resolve({ url, status: 0, ok: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`⏰ 超時 - ${url}`);
      resolve({ url, status: 0, ok: false, error: 'timeout' });
    });
  });
}

async function checkAllUrls() {
  const results = [];
  
  for (const url of urls) {
    const result = await checkUrl(url);
    results.push(result);
  }
  
  console.log('\n📊 檢查結果總結:');
  const successCount = results.filter(r => r.ok).length;
  const totalCount = results.length;
  
  if (successCount === totalCount) {
    console.log('🎉 所有服務正常運行！');
  } else if (successCount === 0) {
    console.log('🚨 所有服務都無法訪問 - 需要修復 Vercel 設置');
    console.log('\n🔧 建議解決步驟:');
    console.log('1. 登錄 Vercel Dashboard');
    console.log('2. 檢查項目的 Password Protection 設置');
    console.log('3. 確認環境變量配置正確');
    console.log('4. 重新部署項目');
    console.log('\n📖 詳細指南請查看: VERCEL_ACCESS_FIX_STEPS.md');
  } else {
    console.log(`⚠️ 部分服務可用 (${successCount}/${totalCount})`);
  }
  
  return results;
}

checkAllUrls().catch(console.error);