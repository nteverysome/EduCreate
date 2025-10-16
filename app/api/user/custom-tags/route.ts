import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - 獲取用戶的自訂標籤
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { customTags: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customTags: user.customTags || [],
    });
  } catch (error) {
    console.error('獲取自訂標籤失敗:', error);
    return NextResponse.json(
      { error: '獲取自訂標籤失敗' },
      { status: 500 }
    );
  }
}

// POST - 添加新的自訂標籤
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const body: { tag: string } = await request.json();
    const { tag } = body;

    if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
      return NextResponse.json(
        { error: '標籤不能為空' },
        { status: 400 }
      );
    }

    const trimmedTag = tag.trim();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { customTags: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 檢查標籤是否已存在
    if (user.customTags.includes(trimmedTag)) {
      return NextResponse.json(
        { error: '標籤已存在' },
        { status: 400 }
      );
    }

    // 添加新標籤
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        customTags: {
          push: trimmedTag,
        },
      },
      select: { customTags: true },
    });

    return NextResponse.json({
      customTags: updatedUser.customTags,
      message: '標籤添加成功',
    });
  } catch (error) {
    console.error('添加自訂標籤失敗:', error);
    return NextResponse.json(
      { error: '添加自訂標籤失敗' },
      { status: 500 }
    );
  }
}

// PUT - 更新自訂標籤（編輯）
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const body: { oldTag: string; newTag: string } = await request.json();
    const { oldTag, newTag } = body;

    if (!oldTag || !newTag || typeof oldTag !== 'string' || typeof newTag !== 'string') {
      return NextResponse.json(
        { error: '標籤不能為空' },
        { status: 400 }
      );
    }

    const trimmedNewTag = newTag.trim();

    if (trimmedNewTag.length === 0) {
      return NextResponse.json(
        { error: '新標籤不能為空' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { customTags: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 檢查舊標籤是否存在
    if (!user.customTags.includes(oldTag)) {
      return NextResponse.json(
        { error: '舊標籤不存在' },
        { status: 404 }
      );
    }

    // 檢查新標籤是否已存在（且不是舊標籤）
    if (trimmedNewTag !== oldTag && user.customTags.includes(trimmedNewTag)) {
      return NextResponse.json(
        { error: '新標籤已存在' },
        { status: 400 }
      );
    }

    // 更新標籤
    const updatedTags = user.customTags.map(t => t === oldTag ? trimmedNewTag : t);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        customTags: updatedTags,
      },
      select: { customTags: true },
    });

    return NextResponse.json({
      customTags: updatedUser.customTags,
      message: '標籤更新成功',
    });
  } catch (error) {
    console.error('更新自訂標籤失敗:', error);
    return NextResponse.json(
      { error: '更新自訂標籤失敗' },
      { status: 500 }
    );
  }
}

// DELETE - 刪除自訂標籤
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    if (!tag) {
      return NextResponse.json(
        { error: '標籤不能為空' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { customTags: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 檢查標籤是否存在
    if (!user.customTags.includes(tag)) {
      return NextResponse.json(
        { error: '標籤不存在' },
        { status: 404 }
      );
    }

    // 刪除標籤
    const updatedTags = user.customTags.filter(t => t !== tag);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        customTags: updatedTags,
      },
      select: { customTags: true },
    });

    return NextResponse.json({
      customTags: updatedUser.customTags,
      message: '標籤刪除成功',
    });
  } catch (error) {
    console.error('刪除自訂標籤失敗:', error);
    return NextResponse.json(
      { error: '刪除自訂標籤失敗' },
      { status: 500 }
    );
  }
}

