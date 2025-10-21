/**
 * 圖片統計 API
 * GET /api/images/stats
 * 
 * 功能：
 * - 圖片總數統計
 * - 按來源統計
 * - 按標籤統計
 * - 存儲空間使用統計
 * - 最常用圖片
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 1. 驗證用戶登錄
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. 獲取所有圖片
    const images = await prisma.userImage.findMany({
      where: { userId },
      select: {
        id: true,
        source: true,
        fileSize: true,
        tags: true,
        usageCount: true,
        fileName: true,
        url: true,
        createdAt: true,
      },
    });

    // 3. 計算統計數據
    const stats = {
      // 總數統計
      total: images.length,
      
      // 按來源統計
      bySource: {
        upload: images.filter(img => img.source === 'upload').length,
        unsplash: images.filter(img => img.source === 'unsplash').length,
      },
      
      // 存儲空間統計（只計算上傳的圖片）
      storage: {
        totalBytes: images
          .filter(img => img.source === 'upload')
          .reduce((sum, img) => sum + img.fileSize, 0),
        totalMB: 0,
        totalGB: 0,
      },
      
      // 標籤統計
      tags: {} as Record<string, number>,
      
      // 使用統計
      usage: {
        totalUsage: images.reduce((sum, img) => sum + img.usageCount, 0),
        averageUsage: 0,
        mostUsed: [] as Array<{
          id: string;
          fileName: string;
          url: string;
          usageCount: number;
        }>,
      },
      
      // 時間統計
      time: {
        oldest: null as Date | null,
        newest: null as Date | null,
        last7Days: 0,
        last30Days: 0,
      },
    };

    // 計算存儲空間（MB 和 GB）
    stats.storage.totalMB = parseFloat((stats.storage.totalBytes / 1024 / 1024).toFixed(2));
    stats.storage.totalGB = parseFloat((stats.storage.totalBytes / 1024 / 1024 / 1024).toFixed(4));

    // 統計標籤
    images.forEach(img => {
      img.tags.forEach(tag => {
        stats.tags[tag] = (stats.tags[tag] || 0) + 1;
      });
    });

    // 計算平均使用次數
    if (images.length > 0) {
      stats.usage.averageUsage = parseFloat(
        (stats.usage.totalUsage / images.length).toFixed(2)
      );
    }

    // 找出最常用的圖片（前 10 張）
    stats.usage.mostUsed = images
      .filter(img => img.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map(img => ({
        id: img.id,
        fileName: img.fileName,
        url: img.url,
        usageCount: img.usageCount,
      }));

    // 時間統計
    if (images.length > 0) {
      const dates = images.map(img => img.createdAt).sort((a, b) => a.getTime() - b.getTime());
      stats.time.oldest = dates[0];
      stats.time.newest = dates[dates.length - 1];

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      stats.time.last7Days = images.filter(img => img.createdAt >= sevenDaysAgo).length;
      stats.time.last30Days = images.filter(img => img.createdAt >= thirtyDaysAgo).length;
    }

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('獲取圖片統計失敗:', error);
    return NextResponse.json(
      {
        error: '獲取圖片統計失敗',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// OPTIONS 處理（CORS）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

