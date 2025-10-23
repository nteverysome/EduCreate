/**
 * TTS 批次查詢 API 端點
 * 
 * 功能:
 * 批次查詢多個 TTS 音頻的緩存狀態
 * 
 * 使用方法:
 * POST /api/tts/batch
 * Body: { 
 *   items: Array<{ 
 *     text: string, 
 *     language: string, 
 *     voice: string 
 *   }> 
 * }
 * 
 * Response: {
 *   results: Array<{
 *     text: string,
 *     language: string,
 *     voice: string,
 *     audioUrl: string | null,
 *     cached: boolean,
 *     hash: string
 *   }>,
 *   stats: {
 *     total: number,
 *     cached: number,
 *     missing: number
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * 生成音頻文件的唯一 hash
 */
function generateHash(text: string, language: string, voice: string): string {
  const content = `${text}|${language}|${voice}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * POST /api/tts/batch
 * 批次查詢 TTS 音頻緩存
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    // 驗證參數
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '缺少必要參數: items (必須是非空數組)' },
        { status: 400 }
      );
    }

    // 驗證每個項目
    for (const item of items) {
      if (!item.text || !item.language || !item.voice) {
        return NextResponse.json(
          { error: '每個項目必須包含 text, language, voice' },
          { status: 400 }
        );
      }
    }

    // 生成所有 hash
    const hashes = items.map(item => 
      generateHash(item.text, item.language, item.voice)
    );

    // 批次查詢資料庫
    const cachedItems = await prisma.tTSCache.findMany({
      where: {
        hash: {
          in: hashes
        }
      }
    });

    // 創建 hash 到緩存項目的映射
    const cacheMap = new Map(
      cachedItems.map(item => [item.hash, item])
    );

    // 構建結果
    const results = items.map(item => {
      const hash = generateHash(item.text, item.language, item.voice);
      const cached = cacheMap.get(hash);

      return {
        text: item.text,
        language: item.language,
        voice: item.voice,
        audioUrl: cached?.audioUrl || null,
        cached: !!cached,
        hash,
        fileSize: cached?.fileSize || null,
        hitCount: cached?.hitCount || 0
      };
    });

    // 統計
    const stats = {
      total: items.length,
      cached: results.filter(r => r.cached).length,
      missing: results.filter(r => !r.cached).length
    };

    // 更新命中次數 (異步,不等待)
    const cachedHashes = results.filter(r => r.cached).map(r => r.hash);
    if (cachedHashes.length > 0) {
      prisma.tTSCache.updateMany({
        where: {
          hash: {
            in: cachedHashes
          }
        },
        data: {
          hitCount: { increment: 1 },
          lastHit: new Date()
        }
      }).catch(error => {
        console.error('❌ 更新命中次數失敗:', error);
      });
    }

    return NextResponse.json({
      results,
      stats
    });

  } catch (error) {
    console.error('❌ TTS 批次查詢錯誤:', error);
    return NextResponse.json(
      { 
        error: 'TTS 批次查詢失敗', 
        details: error instanceof Error ? error.message : '未知錯誤' 
      },
      { status: 500 }
    );
  }
}

