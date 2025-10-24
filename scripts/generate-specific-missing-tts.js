/**
 * 生成特定缺失的 TTS 音頻
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Google Cloud TTS 配置
const textToSpeech = require('@google-cloud/text-to-speech');
const crypto = require('crypto');

const client = new textToSpeech.TextToSpeechClient();

// 缺失的音頻列表
const MISSING_AUDIOS = [
  { text: 'primary', language: 'en-US', voice: 'en-US-Neural2-D', geptLevel: 'ELEMENTARY' },
  { text: 'small', language: 'en-US', voice: 'en-US-Neural2-D', geptLevel: 'ELEMENTARY' },
  { text: 'test', language: 'en-US', voice: 'en-US-Neural2-F', geptLevel: 'ELEMENTARY' },
  { text: 'world', language: 'en-US', voice: 'en-US-Neural2-D', geptLevel: 'ELEMENTARY' },
  { text: 'secondary', language: 'en-US', voice: 'en-US-Neural2-D', geptLevel: 'INTERMEDIATE' }
];

async function generateTTS(text, language, voice, geptLevel) {
  try {
    console.log(`\n🔊 生成: ${text} [${language}/${voice}] - ${geptLevel}`);

    // 檢查是否已存在
    const existing = await prisma.tTSCache.findFirst({
      where: {
        text,
        language,
        voice,
        geptLevel
      }
    });

    if (existing) {
      console.log(`  ⚠️  音頻已存在，跳過`);
      return { success: true, skipped: true };
    }

    // 構建請求
    const request = {
      input: { text },
      voice: {
        languageCode: language,
        name: voice
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0
      }
    };

    console.log(`  📡 調用 Google Cloud TTS API...`);

    // 調用 Google Cloud TTS API
    const [response] = await client.synthesizeSpeech(request);

    // 將音頻轉換為 Base64
    const audioBase64 = response.audioContent.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    // 計算文件大小
    const fileSize = response.audioContent.length;

    // 生成 hash
    const hash = crypto
      .createHash('md5')
      .update(`${text}${language}${voice}`)
      .digest('hex');

    // 生成 R2 key（模擬）
    const r2Key = `tts/${geptLevel}/${language}/${hash}.mp3`;

    console.log(`  💾 保存到數據庫...`);

    // 保存到數據庫
    await prisma.tTSCache.create({
      data: {
        hash,
        text,
        language,
        voice,
        audioUrl,
        r2Key,
        fileSize,
        geptLevel
      }
    });

    console.log(`  ✅ 生成成功`);
    console.log(`    - 文件大小: ${(fileSize / 1024).toFixed(2)} KB`);
    console.log(`    - Hash: ${hash}`);

    return { success: true, skipped: false };

  } catch (error) {
    console.error(`  ❌ 生成失敗: ${error.message}`);
    return { success: false, skipped: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('=== 生成特定缺失的 TTS 音頻 ===\n');
    console.log(`📊 總共需要生成 ${MISSING_AUDIOS.length} 個音頻\n`);

    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;

    for (let i = 0; i < MISSING_AUDIOS.length; i++) {
      const audio = MISSING_AUDIOS[i];
      console.log(`\n[${i + 1}/${MISSING_AUDIOS.length}]`);

      const result = await generateTTS(
        audio.text,
        audio.language,
        audio.voice,
        audio.geptLevel
      );

      if (result.success) {
        if (result.skipped) {
          skippedCount++;
        } else {
          successCount++;
        }
      } else {
        failCount++;
      }

      // 每個音頻之間等待 1 秒，避免 API 限制
      if (i < MISSING_AUDIOS.length - 1) {
        console.log(`\n  ⏳ 等待 1 秒...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n\n=== 生成完成 ===');
    console.log(`✅ 成功生成: ${successCount} 個`);
    console.log(`⚠️  已存在跳過: ${skippedCount} 個`);
    console.log(`❌ 生成失敗: ${failCount} 個`);

    if (failCount === 0 && successCount > 0) {
      console.log('\n🎉 所有缺失的音頻都已成功生成！');
      console.log('\n建議：運行 `node scripts/monitor-tts-progress.js` 查看最新進度');
    } else if (skippedCount === MISSING_AUDIOS.length) {
      console.log('\n✅ 所有音頻都已存在，無需重新生成！');
    } else if (failCount > 0) {
      console.log('\n⚠️  部分音頻生成失敗，請檢查錯誤日誌');
    }

  } catch (error) {
    console.error('❌ 執行失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

