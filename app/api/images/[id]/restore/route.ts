import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/images/[id]/restore - 恢復到指定版本
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
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json(
        { error: '缺少版本 ID' },
        { status: 400 }
      );
    }

    // 獲取指定版本
    const version = await prisma.imageVersion.findFirst({
      where: {
        id: versionId,
        imageId,
      },
    });

    if (!version) {
      return NextResponse.json({ error: '版本不存在' }, { status: 404 });
    }

    // 更新圖片為指定版本
    const updatedImage = await prisma.userImage.update({
      where: { id: imageId },
      data: {
        url: version.url,
        blobPath: version.blobPath,
        updatedAt: new Date(),
      },
    });

    // 創建新版本記錄（恢復操作）
    const latestVersion = await prisma.imageVersion.findFirst({
      where: { imageId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    await prisma.imageVersion.create({
      data: {
        imageId,
        version: newVersion,
        url: version.url,
        blobPath: version.blobPath,
        changes: {
          type: 'restore',
          fromVersion: version.version,
          timestamp: new Date().toISOString(),
        },
        createdBy: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      image: updatedImage,
      restoredFrom: version.version,
    });
  } catch (error) {
    console.error('Error restoring image version:', error);
    return NextResponse.json(
      { error: '恢復版本失敗' },
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

