/**
 * TTS 統計 API 端點
 * 
 * 功能:
 * 提供 TTS 緩存的統計信息
 * 
 * 使用方法:
 * GET /api/tts/stats
 * 
 * Response: {
 *   total: number,
 *   byLanguage: Array<{ language: string, count: number }>,
 *   byVoice: Array<{ voice: string, count: number }>,
 *   byGeptLevel: Array<{ geptLevel: string, count: number }>,
 *   topHits: Array<{ text: string, hitCount: number, audioUrl: string }>,
 *   recentlyAdded: Array<{ text: string, createdAt: string, audioUrl: string }>,
 *   storageSize: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/tts/stats
 * 獲取 TTS 緩存統計信息
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 總記錄數
    const total = await prisma.tTSCache.count();

    // 2. 按語言統計
    const byLanguage = await prisma.tTSCache.groupBy({
      by: ['language'],
      _count: true,
      orderBy: {
        _count: {
          language: 'desc'
        }
      }
    });

    // 3. 按聲音統計
    const byVoice = await prisma.tTSCache.groupBy({
      by: ['voice'],
      _count: true,
      orderBy: {
        _count: {
          voice: 'desc'
        }
      }
    });

    // 4. 按 GEPT 級別統計
    const byGeptLevel = await prisma.tTSCache.groupBy({
      by: ['geptLevel'],
      _count: true,
      orderBy: {
        _count: {
          geptLevel: 'desc'
        }
      }
    });

    // 5. 最熱門的音頻 (命中次數最多)
    const topHits = await prisma.tTSCache.findMany({
      take: 10,
      orderBy: {
        hitCount: 'desc'
      },
      select: {
        text: true,
        language: true,
        voice: true,
        hitCount: true,
        audioUrl: true,
        lastHit: true
      }
    });

    // 6. 最近添加的音頻
    const recentlyAdded = await prisma.tTSCache.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        text: true,
        language: true,
        voice: true,
        audioUrl: true,
        createdAt: true
      }
    });

    // 7. 存儲大小統計
    const storageSizeResult = await prisma.tTSCache.aggregate({
      _sum: {
        fileSize: true
      }
    });

    const storageSize = storageSizeResult._sum.fileSize || 0;

    // 8. 緩存命中率統計
    const hitCountResult = await prisma.tTSCache.aggregate({
      _sum: {
        hitCount: true
      },
      _avg: {
        hitCount: true
      }
    });

    const totalHits = hitCountResult._sum.hitCount || 0;
    const avgHits = hitCountResult._avg.hitCount || 0;

    return NextResponse.json({
      total,
      byLanguage: byLanguage.map(item => ({
        language: item.language,
        count: item._count
      })),
      byVoice: byVoice.map(item => ({
        voice: item.voice,
        count: item._count
      })),
      byGeptLevel: byGeptLevel.map(item => ({
        geptLevel: item.geptLevel || 'UNKNOWN',
        count: item._count
      })),
      topHits,
      recentlyAdded,
      storage: {
        totalSize: storageSize,
        totalSizeMB: (storageSize / 1024 / 1024).toFixed(2),
        avgFileSize: total > 0 ? Math.round(storageSize / total) : 0
      },
      hits: {
        total: totalHits,
        average: avgHits.toFixed(2),
        cacheHitRate: total > 0 ? ((totalHits / total) * 100).toFixed(2) + '%' : '0%'
      }
    });

  } catch (error) {
    console.error('❌ TTS 統計查詢錯誤:', error);
    return NextResponse.json(
      { 
        error: 'TTS 統計查詢失敗', 
        details: error instanceof Error ? error.message : '未知錯誤' 
      },
      { status: 500 }
    );
  }
}

