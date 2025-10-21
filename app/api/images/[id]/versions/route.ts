import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/images/[id]/versions - 獲取圖片版本列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    const imageId = params.id;

    // 檢查圖片是否存在且屬於當前用戶
    const image = await prisma.userImage.findFirst({
      where: {
        id: imageId,
        userId: user.id,
      },
    });

    if (!image) {
      return NextResponse.json({ error: '圖片不存在' }, { status: 404 });
    }

    // 獲取版本列表
    const versions = await prisma.imageVersion.findMany({
      where: {
        imageId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        version: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      versions,
      total: versions.length,
    });
  } catch (error) {
    console.error('Error fetching image versions:', error);
    return NextResponse.json(
      { error: '獲取版本列表失敗' },
      { status: 500 }
    );
  }
}

// POST /api/images/[id]/versions - 創建新版本
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    const imageId = params.id;

    // 檢查圖片是否存在且屬於當前用戶
    const image = await prisma.userImage.findFirst({
      where: {
        id: imageId,
        userId: user.id,
      },
    });

    if (!image) {
      return NextResponse.json({ error: '圖片不存在' }, { status: 404 });
    }

    const body = await request.json();
    const { url, blobPath, changes } = body;

    if (!url || !blobPath || !changes) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    // 獲取當前最大版本號
    const latestVersion = await prisma.imageVersion.findFirst({
      where: { imageId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    // 創建新版本
    const version = await prisma.imageVersion.create({
      data: {
        imageId,
        version: newVersion,
        url,
        blobPath,
        changes,
        createdBy: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Auto-cleanup old versions if needed
    // Keep the most recent 10 versions by default
    const MAX_VERSIONS = 10;
    const versionCount = await prisma.imageVersion.count({
      where: { imageId },
    });

    if (versionCount > MAX_VERSIONS) {
      // Trigger cleanup in the background (don't wait for it)
      // This ensures version creation is fast
      fetch(`${request.nextUrl.origin}/api/images/${imageId}/versions/cleanup?maxVersions=${MAX_VERSIONS}`, {
        method: 'DELETE',
        headers: {
          'Cookie': request.headers.get('Cookie') || '',
        },
      }).catch(error => {
        console.error('Background version cleanup failed:', error);
        // Don't throw error - cleanup failure shouldn't affect version creation
      });
    }

    return NextResponse.json({
      success: true,
      version,
      versionCount,
      autoCleanupTriggered: versionCount > MAX_VERSIONS,
    });
  } catch (error) {
    console.error('Error creating image version:', error);
    return NextResponse.json(
      { error: '創建版本失敗' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

