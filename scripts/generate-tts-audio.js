/**
 * TTS 音頻預生成腳本
 * 
 * 功能:
 * 1. 讀取 GEPT 詞彙表
 * 2. 調用 Google Cloud TTS API 生成音頻
 * 3. 上傳到 Cloudflare R2
 * 4. 記錄到資料庫
 * 
 * 使用方法:
 * node scripts/generate-tts-audio.js <level> [--dry-run] [--limit=N]
 * 
 * 範例:
 * node scripts/generate-tts-audio.js elementary --dry-run
 * node scripts/generate-tts-audio.js elementary --limit=10
 * node scripts/generate-tts-audio.js all
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const textToSpeech = require('@google-cloud/text-to-speech');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { PrismaClient } = require('@prisma/client');

// 初始化客戶端
const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: './google-cloud-tts-key.json'
});

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const prisma = new PrismaClient();

// TTS 配置
const TTS_CONFIG = {
  languages: {
    'en-US': {
      voices: {
        male: 'en-US-Neural2-D',
        female: 'en-US-Neural2-F'
      }
    },
    'zh-TW': {
      voices: {
        male: 'cmn-TW-Wavenet-C',
        female: 'cmn-TW-Wavenet-A'
      }
    }
  },
  audioConfig: {
    audioEncoding: 'MP3',
    speakingRate: 1.0,
    pitch: 0.0,
    volumeGainDb: 0.0,
  }
};

// GEPT 級別配置
const GEPT_LEVELS = {
  elementary: {
    name: 'GEPT Elementary',
    file: 'data/word-lists/gept-elementary-unique.txt',
    level: 'ELEMENTARY'
  },
  intermediate: {
    name: 'GEPT Intermediate',
    file: 'data/word-lists/gept-intermediate-unique.txt',
    level: 'INTERMEDIATE'
  },
  'high-intermediate': {
    name: 'GEPT High-Intermediate',
    file: 'data/word-lists/gept-high-intermediate-unique.txt',
    level: 'HIGH_INTERMEDIATE'
  }
};

/**
 * 生成音頻文件的唯一 hash
 */
function generateHash(text, language, voice) {
  const content = `${text}|${language}|${voice}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * 讀取詞彙表
 */
function loadVocabulary(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * 調用 Google Cloud TTS API 生成音頻
 */
async function generateAudio(text, language, voiceName) {
  const request = {
    input: { text },
    voice: {
      languageCode: language,
      name: voiceName
    },
    audioConfig: TTS_CONFIG.audioConfig
  };

  const [response] = await ttsClient.synthesizeSpeech(request);
  return response.audioContent;
}

/**
 * 上傳音頻到 Cloudflare R2
 */
async function uploadToR2(audioBuffer, hash) {
  const key = `tts/${hash}.mp3`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: audioBuffer,
    ContentType: 'audio/mpeg',
  });

  await r2Client.send(command);

  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
  return { key, publicUrl };
}

/**
 * 保存到資料庫
 */
async function saveToDB(data) {
  return await prisma.tTSCache.create({
    data: {
      hash: data.hash,
      text: data.text,
      language: data.language,
      voice: data.voice,
      audioUrl: data.audioUrl,
      r2Key: data.r2Key,
      fileSize: data.fileSize,
      geptLevel: data.geptLevel,
    }
  });
}

/**
 * 處理單個單字
 */
async function processWord(word, language, voiceName, geptLevel, dryRun = false) {
  const hash = generateHash(word, language, voiceName);
  
  // 檢查是否已存在
  const existing = await prisma.tTSCache.findUnique({
    where: { hash }
  });

  if (existing) {
    console.log(`⏭️  跳過 (已存在): ${word} [${language}/${voiceName}]`);
    return { skipped: true, existing: true };
  }

  if (dryRun) {
    console.log(`🔍 [DRY RUN] 將生成: ${word} [${language}/${voiceName}]`);
    return { skipped: true, dryRun: true };
  }

  try {
    // 生成音頻
    console.log(`🎵 生成音頻: ${word} [${language}/${voiceName}]`);
    const audioBuffer = await generateAudio(word, language, voiceName);
    
    // 上傳到 R2
    console.log(`☁️  上傳到 R2: ${word}`);
    const { key, publicUrl } = await uploadToR2(audioBuffer, hash);
    
    // 保存到資料庫
    console.log(`💾 保存到資料庫: ${word}`);
    await saveToDB({
      hash,
      text: word,
      language,
      voice: voiceName,
      audioUrl: publicUrl,
      r2Key: key,
      fileSize: audioBuffer.length,
      geptLevel
    });

    console.log(`✅ 完成: ${word} [${language}/${voiceName}]`);
    return { success: true };
    
  } catch (error) {
    console.error(`❌ 錯誤: ${word} [${language}/${voiceName}]`, error.message);
    return { error: true, message: error.message };
  }
}

/**
 * 處理詞彙表
 */
async function processVocabulary(level, options = {}) {
  const { dryRun = false, limit = null } = options;
  
  const config = GEPT_LEVELS[level];
  if (!config) {
    throw new Error(`未知的 GEPT 級別: ${level}`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`開始處理: ${config.name}`);
  console.log(`文件: ${config.file}`);
  console.log(`Dry Run: ${dryRun ? '是' : '否'}`);
  console.log(`限制: ${limit || '無'}`);
  console.log(`${'='.repeat(60)}\n`);

  // 讀取詞彙
  const words = loadVocabulary(config.file);
  const wordsToProcess = limit ? words.slice(0, limit) : words;
  
  console.log(`總單字數: ${words.length}`);
  console.log(`將處理: ${wordsToProcess.length}\n`);

  const stats = {
    total: 0,
    success: 0,
    skipped: 0,
    errors: 0
  };

  // 處理每個單字的所有語言和聲音組合
  for (const word of wordsToProcess) {
    for (const [lang, langConfig] of Object.entries(TTS_CONFIG.languages)) {
      for (const [gender, voiceName] of Object.entries(langConfig.voices)) {
        stats.total++;
        const result = await processWord(word, lang, voiceName, config.level, dryRun);
        
        if (result.success) stats.success++;
        else if (result.skipped) stats.skipped++;
        else if (result.error) stats.errors++;
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`處理完成: ${config.name}`);
  console.log(`總計: ${stats.total}`);
  console.log(`成功: ${stats.success}`);
  console.log(`跳過: ${stats.skipped}`);
  console.log(`錯誤: ${stats.errors}`);
  console.log(`${'='.repeat(60)}\n`);

  return stats;
}

/**
 * 主函數
 */
async function main() {
  const args = process.argv.slice(2);
  const level = args[0];
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

  if (!level) {
    console.error('請指定 GEPT 級別: elementary, intermediate, high-intermediate, 或 all');
    process.exit(1);
  }

  try {
    if (level === 'all') {
      for (const levelKey of Object.keys(GEPT_LEVELS)) {
        await processVocabulary(levelKey, { dryRun, limit });
      }
    } else {
      await processVocabulary(level, { dryRun, limit });
    }
  } catch (error) {
    console.error('執行錯誤:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 執行
if (require.main === module) {
  main();
}

module.exports = { processWord, processVocabulary };

