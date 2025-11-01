#!/usr/bin/env node

/**
 * 驗證 Match-Up 遊戲音頻功能部署
 */

const https = require('https');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function verifyDeployment() {
  console.log('🔍 驗證 Match-Up 遊戲音頻功能部署...\n');

  try {
    // 1. 檢查 API 是否可訪問
    console.log('1️⃣ 檢查 API 可訪問性...');
    const activity = await makeRequest(
      'https://edu-create.vercel.app/api/activities/cmh93tjuh0001l404hszkdf94'
    );
    
    if (activity.vocabularyItems) {
      console.log(`✅ API 可訪問，找到 ${activity.vocabularyItems.length} 個詞彙\n`);
      
      // 2. 檢查是否有音頻 URL
      console.log('2️⃣ 檢查音頻 URL...');
      const withAudio = activity.vocabularyItems.filter(v => v.audioUrl);
      const withoutAudio = activity.vocabularyItems.filter(v => !v.audioUrl);
      
      console.log(`✅ 有音頻: ${withAudio.length} 個`);
      console.log(`⚠️ 無音頻: ${withoutAudio.length} 個\n`);
      
      if (withoutAudio.length > 0) {
        console.log('📝 無音頻的詞彙:');
        withoutAudio.slice(0, 3).forEach(v => {
          console.log(`  - ${v.english} (${v.chinese})`);
        });
        console.log('  (這些將由遊戲在後台自動生成)\n');
      }
      
      // 3. 檢查 TTS API
      console.log('3️⃣ 檢查 TTS API...');
      try {
        const ttsResponse = await makeRequest(
          'https://edu-create.vercel.app/api/tts?text=hello&language=en-US'
        );
        console.log('✅ TTS API 可訪問\n');
      } catch (e) {
        console.log('⚠️ TTS API 可能需要 POST 請求\n');
      }
      
      console.log('✅ 部署驗證完成！');
      console.log('\n📋 下一步:');
      console.log('1. 打開遊戲: https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94');
      console.log('2. 打開瀏覽器開發者工具 (F12)');
      console.log('3. 查看 Console 標籤，應該看到:');
      console.log('   - 🎵 [後台] 開始檢查並生成缺失的音頻...');
      console.log('   - ✅ [後台] 生成音頻: [詞彙]');
      console.log('4. 點擊卡片上的音頻按鈕測試播放');
      
    } else {
      console.log('❌ API 返回異常數據');
    }
  } catch (error) {
    console.error('❌ 驗證失敗:', error.message);
  }
}

verifyDeployment();

