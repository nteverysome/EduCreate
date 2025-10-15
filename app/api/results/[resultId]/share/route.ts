import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

// 设置分享状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { resultId } = params;
    const { isPublic } = await request.json();

    // 验证结果是否存在且属于当前用户
    const result = await prisma.assignmentResult.findFirst({
      where: {
        id: resultId,
        assignment: {
          userId: session.user.id
        }
      }
    });

    if (!result) {
      return NextResponse.json(
        { error: '結果不存在或無權限' },
        { status: 404 }
      );
    }

    let shareToken = result.shareToken;

    if (isPublic) {
      // 如果要公开分享，生成或保持现有的 shareToken
      // 检查现有 shareToken 是否为正确格式（纯 nanoid，不包含 - 符号）
      if (!shareToken || shareToken.includes('-')) {
        shareToken = nanoid(16); // 生成16位随机字符串
      }
    } else {
      // 如果要取消分享，清除 shareToken
      shareToken = null;
    }

    // 更新数据库
    const updatedResult = await prisma.assignmentResult.update({
      where: { id: resultId },
      data: { shareToken }
    });

    // 构建分享链接
    const baseUrl = process.env.NEXTAUTH_URL || 'https://edu-create.vercel.app';
    const shareUrl = shareToken ? `${baseUrl}/shared/results/${shareToken}` : null;

    return NextResponse.json({
      success: true,
      isPublic: !!shareToken,
      shareUrl,
      shareToken
    });

  } catch (error) {
    console.error('設置分享狀態失敗:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

// 获取分享状态
export async function GET(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { resultId } = params;

    // 验证结果是否存在且属于当前用户
    const result = await prisma.assignmentResult.findFirst({
      where: {
        id: resultId,
        assignment: {
          userId: session.user.id
        }
      }
    });

    if (!result) {
      return NextResponse.json(
        { error: '結果不存在或無權限' },
        { status: 404 }
      );
    }

    // 构建分享链接
    const baseUrl = process.env.NEXTAUTH_URL || 'https://edu-create.vercel.app';
    const shareUrl = result.shareToken ? `${baseUrl}/shared/results/${result.shareToken}` : null;

    return NextResponse.json({
      isPublic: !!result.shareToken,
      shareUrl,
      shareToken: result.shareToken
    });

  } catch (error) {
    console.error('獲取分享狀態失敗:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}
