/**
 * 查找並生成缺失的 TTS 音頻
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Google Cloud TTS 配置
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');
const util = require('util');

const client = new textToSpeech.TextToSpeechClient();

// 語音配置
const VOICES = {
  'en-US': [
    { name: 'en-US-Neural2-D', gender: 'MALE' },
    { name: 'en-US-Neural2-F', gender: 'FEMALE' }
  ],
  'zh-TW': [
    { name: 'cmn-TW-Wavenet-C', gender: 'MALE' },
    { name: 'cmn-TW-Wavenet-A', gender: 'FEMALE' }
  ]
};

// GEPT 級別配置
const GEPT_LEVELS = {
  'ELEMENTARY': 2356,
  'INTERMEDIATE': 2568,
  'HIGH_INTERMEDIATE': 3138
};

async function findMissingAudios() {
  try {
    console.log('=== 查找缺失的 TTS 音頻 ===\n');

    const missingAudios = [];

    // 檢查每個 GEPT 級別
    for (const [level, expectedCount] of Object.entries(GEPT_LEVELS)) {
      console.log(`\n📊 檢查 ${level} 級別...`);
      console.log(`  - 預期單字數: ${expectedCount}`);
      console.log(`  - 預期音頻數: ${expectedCount * 4} (每個單字 4 個音頻)`);

      // 統計該級別已生成的音頻數量
      const existingCount = await prisma.tTSCache.count({
        where: {
          geptLevel: level
        }
      });

      console.log(`  - 已生成音頻數: ${existingCount}`);
      console.log(`  - 缺失音頻數: ${expectedCount * 4 - existingCount}`);

      // 如果缺失音頻數量為 0，跳過
      if (existingCount === expectedCount * 4) {
        console.log(`  ✅ ${level} 級別所有音頻都已生成`);
        continue;
      }

      // 獲取該級別已生成的音頻
      const existingAudios = await prisma.tTSCache.findMany({
        where: {
          geptLevel: level
        },
        select: {
          text: true,
          language: true,
          voice: true
        }
      });

      // 創建已存在音頻的 Set（用於快速查找）
      const existingSet = new Set(
        existingAudios.map(a => `${a.text}|${a.language}|${a.voice}`)
      );

      console.log(`  - 已生成音頻組合數: ${existingSet.size}`);

      // 獲取該級別的所有單字（從 UserWordProgress 表中獲取）
      const wordProgress = await prisma.userWordProgress.findMany({
        where: {
          word: {
            set: {
              geptLevel: level
            }
          }
        },
        select: {
          word: {
            select: {
              english: true,
              chinese: true
            }
          }
        },
        distinct: ['wordId']
      });

      console.log(`  - 找到 ${wordProgress.length} 個單字`);

      // 檢查每個單字的 4 個音頻
      for (const progress of wordProgress) {
        const word = progress.word;

        // 檢查英文音頻
        for (const voice of VOICES['en-US']) {
          const key = `${word.english}|en-US|${voice.name}`;
          if (!existingSet.has(key)) {
            missingAudios.push({
              text: word.english,
              language: 'en-US',
              voice: voice.name,
              geptLevel: level
            });
          }
        }

        // 檢查中文音頻
        for (const voice of VOICES['zh-TW']) {
          const key = `${word.chinese}|zh-TW|${voice.name}`;
          if (!existingSet.has(key)) {
            missingAudios.push({
              text: word.chinese,
              language: 'zh-TW',
              voice: voice.name,
              geptLevel: level
            });
          }
        }
      }
    }

    console.log(`\n\n📊 總共找到 ${missingAudios.length} 個缺失的音頻\n`);

    if (missingAudios.length === 0) {
      console.log('✅ 所有音頻都已生成！');
      return [];
    }

    // 顯示缺失的音頻
    console.log('📝 缺失的音頻列表:');
    missingAudios.forEach((audio, index) => {
      console.log(`  ${index + 1}. ${audio.text} [${audio.language}/${audio.voice}] - ${audio.geptLevel}`);
    });

    return missingAudios;

  } catch (error) {
    console.error('❌ 錯誤:', error);
    throw error;
  }
}

async function generateTTS(text, language, voice, geptLevel) {
  try {
    console.log(`  🔊 生成: ${text} [${language}/${voice}]`);

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

    // 調用 Google Cloud TTS API
    const [response] = await client.synthesizeSpeech(request);

    // 將音頻轉換為 Base64
    const audioBase64 = response.audioContent.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    // 保存到數據庫
    await prisma.tTSCache.create({
      data: {
        text,
        language,
        voice,
        audioUrl,
        geptLevel
      }
    });

    console.log(`    ✅ 生成成功`);
    return true;

  } catch (error) {
    console.error(`    ❌ 生成失敗: ${error.message}`);
    return false;
  }
}

async function generateMissingAudios(missingAudios) {
  try {
    console.log('\n\n=== 開始生成缺失的音頻 ===\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < missingAudios.length; i++) {
      const audio = missingAudios[i];
      console.log(`\n[${i + 1}/${missingAudios.length}]`);

      const success = await generateTTS(
        audio.text,
        audio.language,
        audio.voice,
        audio.geptLevel
      );

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // 每個音頻之間等待 1 秒，避免 API 限制
      if (i < missingAudios.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n\n=== 生成完成 ===');
    console.log(`✅ 成功: ${successCount} 個`);
    console.log(`❌ 失敗: ${failCount} 個`);

    return { successCount, failCount };

  } catch (error) {
    console.error('❌ 錯誤:', error);
    throw error;
  }
}

async function main() {
  try {
    // 1. 查找缺失的音頻
    const missingAudios = await findMissingAudios();

    if (missingAudios.length === 0) {
      console.log('\n✅ 所有音頻都已生成，無需重新生成！');
      return;
    }

    // 2. 生成缺失的音頻
    const result = await generateMissingAudios(missingAudios);

    // 3. 顯示最終結果
    console.log('\n\n=== 最終結果 ===');
    console.log(`📊 缺失音頻數量: ${missingAudios.length}`);
    console.log(`✅ 成功生成: ${result.successCount}`);
    console.log(`❌ 生成失敗: ${result.failCount}`);

    if (result.failCount === 0) {
      console.log('\n🎉 所有缺失的音頻都已成功生成！');
    } else {
      console.log('\n⚠️  部分音頻生成失敗，請檢查錯誤日誌');
    }

  } catch (error) {
    console.error('❌ 執行失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

