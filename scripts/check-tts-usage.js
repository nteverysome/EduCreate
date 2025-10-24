/**
 * 檢查 TTS 音頻在專案中的使用情況
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTTSUsage() {
  try {
    console.log('=== 檢查 TTS 音頻使用情況 ===\n');

    // 1. 檢查 TTSCache 表結構
    console.log('📊 1. 檢查 TTSCache 表結構\n');
    
    const sampleAudio = await prisma.tTSCache.findFirst({
      take: 1
    });

    if (!sampleAudio) {
      console.log('❌ TTSCache 表中沒有數據');
      return;
    }

    console.log('✅ TTSCache 表結構:');
    console.log(`  - id: ${sampleAudio.id}`);
    console.log(`  - hash: ${sampleAudio.hash}`);
    console.log(`  - text: ${sampleAudio.text}`);
    console.log(`  - language: ${sampleAudio.language}`);
    console.log(`  - voice: ${sampleAudio.voice}`);
    console.log(`  - audioUrl: ${sampleAudio.audioUrl.substring(0, 50)}...`);
    console.log(`  - r2Key: ${sampleAudio.r2Key}`);
    console.log(`  - fileSize: ${sampleAudio.fileSize} bytes`);
    console.log(`  - duration: ${sampleAudio.duration}`);
    console.log(`  - geptLevel: ${sampleAudio.geptLevel}`);
    console.log(`  - hitCount: ${sampleAudio.hitCount}`);
    console.log(`  - lastHit: ${sampleAudio.lastHit}`);

    // 2. 檢查音頻 URL 格式
    console.log('\n\n📊 2. 檢查音頻 URL 格式\n');
    
    const isBase64 = sampleAudio.audioUrl.startsWith('data:audio/mp3;base64,');
    const isR2URL = sampleAudio.audioUrl.startsWith('http');

    if (isBase64) {
      console.log('✅ 音頻格式: Base64 編碼');
      console.log('  - 優點: 無需額外的 HTTP 請求，可以直接在瀏覽器中播放');
      console.log('  - 缺點: 數據庫體積較大，傳輸時間較長');
      console.log('  - 適用場景: 小型專案，音頻數量較少');
    } else if (isR2URL) {
      console.log('✅ 音頻格式: R2 公開 URL');
      console.log('  - 優點: 數據庫體積小，傳輸速度快');
      console.log('  - 缺點: 需要額外的 HTTP 請求');
      console.log('  - 適用場景: 大型專案，音頻數量較多');
    } else {
      console.log('⚠️  未知的音頻格式');
    }

    // 3. 檢查音頻大小分布
    console.log('\n\n📊 3. 檢查音頻大小分布\n');
    
    const audios = await prisma.tTSCache.findMany({
      select: {
        fileSize: true
      }
    });

    const fileSizes = audios.map(a => a.fileSize);
    const avgSize = fileSizes.reduce((a, b) => a + b, 0) / fileSizes.length;
    const minSize = Math.min(...fileSizes);
    const maxSize = Math.max(...fileSizes);
    const totalSize = fileSizes.reduce((a, b) => a + b, 0);

    console.log(`✅ 音頻大小統計:`);
    console.log(`  - 平均大小: ${(avgSize / 1024).toFixed(2)} KB`);
    console.log(`  - 最小大小: ${(minSize / 1024).toFixed(2)} KB`);
    console.log(`  - 最大大小: ${(maxSize / 1024).toFixed(2)} KB`);
    console.log(`  - 總大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // 4. 檢查 TTS API 端點
    console.log('\n\n📊 4. 檢查 TTS API 端點\n');
    
    console.log('✅ TTS API 端點應該在以下位置:');
    console.log('  - app/api/tts/route.ts');
    console.log('  - app/api/tts/[text]/route.ts');
    console.log('  - 或其他自定義端點');

    // 5. 檢查遊戲中的 TTS 使用
    console.log('\n\n📊 5. 檢查遊戲中的 TTS 使用\n');
    
    console.log('✅ 遊戲中應該通過以下方式使用 TTS:');
    console.log('  1. 調用 TTS API 獲取音頻 URL');
    console.log('  2. 使用 HTML5 Audio 或 Phaser 音頻系統播放');
    console.log('  3. 緩存音頻以避免重複請求');

    // 6. 檢查 VocabularyItem 的 audioUrl 字段
    console.log('\n\n📊 6. 檢查 VocabularyItem 的 audioUrl 字段\n');
    
    const wordsWithAudio = await prisma.vocabularyItem.count({
      where: {
        audioUrl: {
          not: null
        }
      }
    });

    const totalWords = await prisma.vocabularyItem.count();

    console.log(`✅ VocabularyItem 音頻統計:`);
    console.log(`  - 有音頻的單字: ${wordsWithAudio} 個`);
    console.log(`  - 總單字數: ${totalWords} 個`);
    console.log(`  - 覆蓋率: ${((wordsWithAudio / totalWords) * 100).toFixed(2)}%`);

    if (wordsWithAudio === 0) {
      console.log('\n⚠️  警告: VocabularyItem 表中沒有單字有 audioUrl');
      console.log('  - 這意味著單字的音頻 URL 沒有關聯到 VocabularyItem');
      console.log('  - 需要通過 TTS API 動態獲取音頻');
    }

    // 7. 測試音頻播放
    console.log('\n\n📊 7. 測試音頻播放\n');
    
    console.log('✅ 測試步驟:');
    console.log('  1. 在瀏覽器中打開遊戲');
    console.log('  2. 檢查瀏覽器控制台是否有 TTS 相關錯誤');
    console.log('  3. 測試單字發音是否正常');
    console.log('  4. 檢查網絡請求是否成功');

    // 8. 建議
    console.log('\n\n📊 8. 使用建議\n');
    
    if (isBase64) {
      console.log('✅ 當前使用 Base64 格式:');
      console.log('  - 優點: 可以直接在瀏覽器中播放，無需額外配置');
      console.log('  - 缺點: 數據庫體積較大（約 ${(totalSize / 1024 / 1024).toFixed(2)} MB）');
      console.log('  - 建議: 如果音頻數量較多，考慮遷移到 R2 存儲');
    }

    console.log('\n✅ TTS API 使用方式:');
    console.log('  1. 創建 TTS API 端點（如果還沒有）');
    console.log('  2. API 接收文本、語言、語音參數');
    console.log('  3. 查詢 TTSCache 表獲取緩存的音頻');
    console.log('  4. 如果沒有緩存，調用 Google Cloud TTS API 生成');
    console.log('  5. 返回音頻 URL 給前端');

    console.log('\n✅ 前端使用方式:');
    console.log('  1. 調用 TTS API 獲取音頻 URL');
    console.log('  2. 使用 HTML5 Audio 播放:');
    console.log('     const audio = new Audio(audioUrl);');
    console.log('     audio.play();');
    console.log('  3. 或使用 Phaser 音頻系統:');
    console.log('     this.sound.add(key, { url: audioUrl });');

    // 9. 檢查現有的 TTS API
    console.log('\n\n📊 9. 檢查現有的 TTS API\n');
    
    console.log('✅ 需要檢查以下文件是否存在:');
    console.log('  - app/api/tts/route.ts');
    console.log('  - app/api/tts/cache/route.ts');
    console.log('  - lib/tts.ts');

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTTSUsage();

