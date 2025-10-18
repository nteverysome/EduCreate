/**
 * 檢查 Railway 截圖服務狀態
 */

const RAILWAY_URL = 'https://educreate-production.up.railway.app';

async function checkRailwayService() {
  console.log('🔍 檢查 Railway 截圖服務狀態...\n');
  console.log(`Railway URL: ${RAILWAY_URL}\n`);

  try {
    // 1. 檢查健康狀態
    console.log('1️⃣ 檢查健康端點 /health...');
    const healthResponse = await fetch(`${RAILWAY_URL}/health`);
    const healthData = await healthResponse.json();
    
    console.log(`   狀態: ${healthResponse.status} ${healthResponse.statusText}`);
    console.log(`   響應:`, healthData);
    console.log('');

    // 2. 檢查截圖端點
    console.log('2️⃣ 測試截圖端點 /screenshot...');
    const testUrl = 'https://edu-create.vercel.app';
    const screenshotResponse = await fetch(`${RAILWAY_URL}/screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: testUrl,
        width: 400,
        height: 300,
        waitTime: 2000,
      }),
    });

    console.log(`   狀態: ${screenshotResponse.status} ${screenshotResponse.statusText}`);
    
    if (screenshotResponse.ok) {
      const buffer = await screenshotResponse.arrayBuffer();
      console.log(`   截圖大小: ${buffer.byteLength} bytes`);
      console.log('   ✅ 截圖服務正常工作！');
    } else {
      const errorData = await screenshotResponse.text();
      console.log(`   ❌ 截圖服務失敗: ${errorData}`);
    }

  } catch (error) {
    console.error('\n❌ 檢查失敗:', error.message);
  }
}

checkRailwayService();

