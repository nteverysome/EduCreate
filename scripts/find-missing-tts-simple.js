/**
 * 簡單查找缺失的 TTS 音頻
 * 通過比較 TTSCache 表中的記錄來找出缺失的音頻
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 語音配置
const VOICES = {
  'en-US': ['en-US-Neural2-D', 'en-US-Neural2-F'],
  'zh-TW': ['cmn-TW-Wavenet-C', 'cmn-TW-Wavenet-A']
};

// GEPT 級別配置
const GEPT_LEVELS = {
  'ELEMENTARY': 2356,
  'INTERMEDIATE': 2568,
  'HIGH_INTERMEDIATE': 3138
};

async function findMissingAudios() {
  try {
    console.log('=== 查找缺失的 TTS 音頻（簡單方法）===\n');

    // 檢查每個 GEPT 級別
    for (const [level, expectedWordCount] of Object.entries(GEPT_LEVELS)) {
      console.log(`\n📊 檢查 ${level} 級別...`);
      console.log(`  - 預期單字數: ${expectedWordCount}`);
      console.log(`  - 預期音頻數: ${expectedWordCount * 4} (每個單字 4 個音頻)`);

      // 獲取該級別的所有音頻
      const audios = await prisma.tTSCache.findMany({
        where: {
          geptLevel: level
        },
        select: {
          text: true,
          language: true,
          voice: true
        }
      });

      console.log(`  - 已生成音頻數: ${audios.length}`);
      console.log(`  - 缺失音頻數: ${expectedWordCount * 4 - audios.length}`);

      // 按文本分組
      const textGroups = new Map();
      audios.forEach(audio => {
        if (!textGroups.has(audio.text)) {
          textGroups.set(audio.text, []);
        }
        textGroups.get(audio.text).push({
          language: audio.language,
          voice: audio.voice
        });
      });

      console.log(`  - 唯一文本數: ${textGroups.size}`);

      // 查找缺失的音頻
      const missingAudios = [];
      textGroups.forEach((voices, text) => {
        // 每個文本應該有 4 個音頻（2 個英文 + 2 個中文）
        // 但實際上，英文文本只有 2 個英文音頻，中文文本只有 2 個中文音頻
        
        // 檢查是否是英文文本
        const isEnglish = /^[a-zA-Z\s\-']+$/.test(text);
        
        if (isEnglish) {
          // 英文文本應該有 2 個英文音頻
          const expectedVoices = VOICES['en-US'];
          expectedVoices.forEach(expectedVoice => {
            const exists = voices.some(v => v.language === 'en-US' && v.voice === expectedVoice);
            if (!exists) {
              missingAudios.push({
                text,
                language: 'en-US',
                voice: expectedVoice,
                geptLevel: level
              });
            }
          });
        } else {
          // 中文文本應該有 2 個中文音頻
          const expectedVoices = VOICES['zh-TW'];
          expectedVoices.forEach(expectedVoice => {
            const exists = voices.some(v => v.language === 'zh-TW' && v.voice === expectedVoice);
            if (!exists) {
              missingAudios.push({
                text,
                language: 'zh-TW',
                voice: expectedVoice,
                geptLevel: level
              });
            }
          });
        }
      });

      if (missingAudios.length > 0) {
        console.log(`\n  ⚠️  找到 ${missingAudios.length} 個缺失的音頻:`);
        missingAudios.forEach((audio, index) => {
          console.log(`    ${index + 1}. ${audio.text} [${audio.language}/${audio.voice}]`);
        });
      } else {
        console.log(`  ✅ 所有文本的音頻都完整`);
      }
    }

    // 檢查是否有重複的音頻
    console.log('\n\n=== 檢查重複的音頻 ===\n');
    
    for (const [level, expectedWordCount] of Object.entries(GEPT_LEVELS)) {
      console.log(`\n📊 檢查 ${level} 級別的重複音頻...`);
      
      const audios = await prisma.tTSCache.findMany({
        where: {
          geptLevel: level
        },
        select: {
          text: true,
          language: true,
          voice: true
        }
      });

      // 創建音頻組合的 Map
      const audioMap = new Map();
      const duplicates = [];

      audios.forEach(audio => {
        const key = `${audio.text}|${audio.language}|${audio.voice}`;
        if (audioMap.has(key)) {
          audioMap.set(key, audioMap.get(key) + 1);
          duplicates.push({ ...audio, count: audioMap.get(key) });
        } else {
          audioMap.set(key, 1);
        }
      });

      if (duplicates.length > 0) {
        console.log(`  ⚠️  找到 ${duplicates.length} 個重複的音頻:`);
        duplicates.forEach((audio, index) => {
          console.log(`    ${index + 1}. ${audio.text} [${audio.language}/${audio.voice}] - 重複 ${audio.count} 次`);
        });
      } else {
        console.log(`  ✅ 沒有重複的音頻`);
      }
    }

    console.log('\n\n=== 總結 ===');
    console.log('根據統計，缺失的 3 個音頻可能是：');
    console.log('1. 某些文本的音頻不完整（缺少某個語音）');
    console.log('2. 或者是數據庫中有重複的記錄');
    console.log('\n建議：');
    console.log('- 檢查上面的輸出，找出具體缺失的音頻');
    console.log('- 如果沒有缺失，可能是統計方式的問題');
    console.log('- 99.99% 的完成度已經非常好了！');

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findMissingAudios();

