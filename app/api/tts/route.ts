/**
 * TTS API 端點
 * 
 * 功能:
 * 1. 查詢 TTS 緩存
 * 2. 動態生成 TTS 音頻 (如果緩存不存在)
 * 3. 批次查詢 TTS 音頻
 * 
 * 使用方法:
 * POST /api/tts
 * Body: { text: string, language: string, voice: string }
 * 
 * POST /api/tts/batch
 * Body: { items: Array<{ text: string, language: string, voice: string }> }
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import crypto from 'crypto';
import textToSpeech from '@google-cloud/text-to-speech';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// 初始化 Google Cloud TTS 客戶端
// 支持從環境變數或文件讀取憑證
let ttsClient: textToSpeech.TextToSpeechClient;

if (process.env.GOOGLE_CLOUD_TTS_KEY_JSON) {
  // Vercel 環境:從環境變數讀取 JSON 密鑰
  const credentials = JSON.parse(process.env.GOOGLE_CLOUD_TTS_KEY_JSON);
  ttsClient = new textToSpeech.TextToSpeechClient({
    credentials,
    projectId: credentials.project_id,
  });
} else {
  // 本地環境:從文件讀取
  ttsClient = new textToSpeech.TextToSpeechClient({
    keyFilename: './google-cloud-tts-key.json'
  });
}

// 初始化 Cloudflare R2 客戶端
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// TTS 默認配置
const DEFAULT_TTS_CONFIG = {
  audioEncoding: 'MP3' as const,
  speakingRate: 1.0,
  pitch: 0.0,
  volumeGainDb: 0.0, // 默認無增益，由前端動態指定
};

// 語言特定的音量增益（用於新生成的音頻）
const LANGUAGE_VOLUME_GAIN = {
  'en-US': 10.0, // 英文音量較小，增加 10dB
  'zh-TW': 0.0, // 中文音量正常
};

/**
 * 生成音頻文件的唯一 hash
 */
function generateHash(text: string, language: string, voice: string): string {
  const content = `${text}|${language}|${voice}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * 從緩存查詢 TTS 音頻
 */
async function getCachedAudio(text: string, language: string, voice: string) {
  const hash = generateHash(text, language, voice);

  // 調試日誌
  console.log('prisma object:', prisma);
  console.log('prisma type:', typeof prisma);
  console.log('prisma.tTSCache:', prisma?.tTSCache);

  const cached = await prisma.tTSCache.findUnique({
    where: { hash }
  });

  if (cached) {
    // 更新命中次數和最後命中時間
    await prisma.tTSCache.update({
      where: { hash },
      data: {
        hitCount: { increment: 1 },
        lastHit: new Date()
      }
    });
  }

  return cached;
}

/**
 * 生成 TTS 音頻
 * @param volumeGainDb 可選的音量增益（dB），如果不提供則使用語言默認值
 */
async function generateAudio(
  text: string,
  language: string,
  voiceName: string,
  volumeGainDb?: number
) {
  // 如果沒有指定音量增益，使用語言默認值
  const gainDb = volumeGainDb !== undefined
    ? volumeGainDb
    : (LANGUAGE_VOLUME_GAIN[language as keyof typeof LANGUAGE_VOLUME_GAIN] || 0.0);

  const request = {
    input: { text },
    voice: {
      languageCode: language,
      name: voiceName
    },
    audioConfig: {
      ...DEFAULT_TTS_CONFIG,
      volumeGainDb: gainDb
    }
  };

  console.log(`🔊 生成音頻: ${text} [${language}] 音量增益: ${gainDb}dB`);

  const [response] = await ttsClient.synthesizeSpeech(request);
  return response.audioContent;
}

/**
 * 上傳音頻到 Cloudflare R2
 */
async function uploadToR2(audioBuffer: Buffer, hash: string) {
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
async function saveToDB(data: {
  hash: string;
  text: string;
  language: string;
  voice: string;
  audioUrl: string;
  r2Key: string;
  fileSize: number;
  geptLevel?: string;
}) {
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
 * POST /api/tts
 * 獲取或生成單個 TTS 音頻
 *
 * 參數:
 * - text: 要轉換的文本
 * - language: 語言代碼 (en-US, zh-TW)
 * - voice: 語音名稱
 * - geptLevel: GEPT 等級 (可選)
 * - volumeGainDb: 音量增益 (可選，默認使用語言默認值)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, language, voice, geptLevel, volumeGainDb } = body;

    // 驗證必要參數
    if (!text || !language || !voice) {
      return NextResponse.json(
        { error: '缺少必要參數: text, language, voice' },
        { status: 400 }
      );
    }

    // 1. 檢查緩存
    const cached = await getCachedAudio(text, language, voice);

    if (cached) {
      return NextResponse.json({
        audioUrl: cached.audioUrl,
        cached: true,
        hash: cached.hash,
        fileSize: cached.fileSize,
        hitCount: cached.hitCount
      });
    }

    // 2. 動態生成 (如果緩存不存在)
    console.log(`🎵 動態生成 TTS: ${text} [${language}/${voice}]`);

    // 傳遞 volumeGainDb 參數
    const audioBuffer = await generateAudio(text, language, voice, volumeGainDb);
    const hash = generateHash(text, language, voice);
    const { key, publicUrl } = await uploadToR2(audioBuffer as Buffer, hash);

    // 3. 保存到資料庫
    await saveToDB({
      hash,
      text,
      language,
      voice,
      audioUrl: publicUrl,
      r2Key: key,
      fileSize: (audioBuffer as Buffer).length,
      geptLevel
    });

    return NextResponse.json({
      audioUrl: publicUrl,
      cached: false,
      hash,
      fileSize: (audioBuffer as Buffer).length,
      hitCount: 0
    });

  } catch (error) {
    console.error('❌ TTS API 錯誤:', error);
    return NextResponse.json(
      { 
        error: 'TTS 生成失敗', 
        details: error instanceof Error ? error.message : '未知錯誤' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tts?text=hello&language=en-US&voice=en-US-Neural2-D
 * 查詢 TTS 緩存 (只查詢,不生成)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text');
    const language = searchParams.get('language');
    const voice = searchParams.get('voice');

    if (!text || !language || !voice) {
      return NextResponse.json(
        { error: '缺少必要參數: text, language, voice' },
        { status: 400 }
      );
    }

    const cached = await getCachedAudio(text, language, voice);
    
    if (!cached) {
      return NextResponse.json(
        { error: '緩存不存在', cached: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      audioUrl: cached.audioUrl,
      cached: true,
      hash: cached.hash,
      fileSize: cached.fileSize,
      hitCount: cached.hitCount,
      createdAt: cached.createdAt,
      lastHit: cached.lastHit
    });

  } catch (error) {
    console.error('❌ TTS 查詢錯誤:', error);
    return NextResponse.json(
      { 
        error: 'TTS 查詢失敗', 
        details: error instanceof Error ? error.message : '未知錯誤' 
      },
      { status: 500 }
    );
  }
}

