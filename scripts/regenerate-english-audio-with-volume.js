/**
 * 重新生成英文音頻（增加音量）
 * 
 * 問題：英文音頻音量較小
 * 解決方案：重新生成所有英文音頻，使用 volumeGainDb: 6.0
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Google Cloud TTS 配置
const textToSpeech = require('@google-cloud/text-to-speech');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// 初始化 Google Cloud TTS 客戶端
let ttsClient;

if (process.env.GOOGLE_CLOUD_TTS_KEY_JSON) {
  const credentials = JSON.parse(process.env.GOOGLE_CLOUD_TTS_KEY_JSON);
  ttsClient = new textToSpeech.TextToSpeechClient({
    credentials,
    projectId: credentials.project_id,
  });
} else {
  ttsClient = new textToSpeech.TextToSpeechClient({
    keyFilename: './google-cloud-tts-key.json'
  });
}

// 初始化 Cloudflare R2 客戶端
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// TTS 配置（增加音量）
const TTS_CONFIG = {
  audioEncoding: 'MP3',
  speakingRate: 1.0,
  pitch: 0.0,
  volumeGainDb: 6.0, // 增加 6dB 音量
};

async function regenerateEnglishAudio() {
  try {
    console.log('=== 重新生成英文音頻（增加音量）===\n');

    // 1. 獲取所有英文音頻
    const englishAudios = await prisma.tTSCache.findMany({
      where: {
        language: 'en-US'
      },
      select: {
        id: true,
        hash: true,
        text: true,
        language: true,
        voice: true,
        geptLevel: true
      }
    });

    console.log(`📊 找到 ${englishAudios.length} 個英文音頻\n`);

    // 詢問用戶是否繼續
    console.log('⚠️  警告：這將重新生成所有英文音頻，可能需要較長時間');
    console.log('⚠️  預估時間：約 ${(englishAudios.length * 2.5 / 3600).toFixed(2)} 小時');
    console.log('⚠️  預估費用：約 $${(englishAudios.length * 0.000016).toFixed(2)} USD');
    console.log('\n是否繼續？(y/n)');

    // 由於是自動腳本，我們先生成一小部分作為測試
    console.log('\n🔧 測試模式：只重新生成前 10 個音頻\n');

    const testAudios = englishAudios.slice(0, 10);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < testAudios.length; i++) {
      const audio = testAudios[i];
      console.log(`\n[${i + 1}/${testAudios.length}] 重新生成: ${audio.text} [${audio.voice}]`);

      try {
        // 生成新音頻
        const request = {
          input: { text: audio.text },
          voice: {
            languageCode: audio.language,
            name: audio.voice
          },
          audioConfig: TTS_CONFIG
        };

        console.log(`  📡 調用 Google Cloud TTS API...`);
        const [response] = await ttsClient.synthesizeSpeech(request);

        // 上傳到 R2
        const key = `tts/${audio.hash}.mp3`;
        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: response.audioContent,
          ContentType: 'audio/mpeg',
        });

        console.log(`  ☁️  上傳到 R2...`);
        await r2Client.send(command);

        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        // 更新數據庫
        console.log(`  💾 更新數據庫...`);
        await prisma.tTSCache.update({
          where: { id: audio.id },
          data: {
            audioUrl: publicUrl,
            fileSize: response.audioContent.length,
            updatedAt: new Date()
          }
        });

        console.log(`  ✅ 重新生成成功`);
        console.log(`    - 文件大小: ${(response.audioContent.length / 1024).toFixed(2)} KB`);
        successCount++;

        // 等待 1 秒，避免 API 限制
        if (i < testAudios.length - 1) {
          console.log(`  ⏳ 等待 1 秒...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`  ❌ 重新生成失敗: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n\n=== 測試完成 ===');
    console.log(`✅ 成功: ${successCount} 個`);
    console.log(`❌ 失敗: ${failCount} 個`);

    if (successCount > 0) {
      console.log('\n🎉 測試成功！音量已增加');
      console.log('\n建議：');
      console.log('1. 在遊戲中測試新音頻的音量');
      console.log('2. 如果音量合適，可以運行完整版本重新生成所有英文音頻');
      console.log('3. 完整版本命令：node scripts/regenerate-all-english-audio.js');
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

regenerateEnglishAudio();

