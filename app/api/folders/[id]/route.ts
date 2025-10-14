import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PATCH - 更新资料夹（重命名）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: '资料夹名称不能为空' },
        { status: 400 }
      );
    }

    // 检查资料夹是否存在且属于当前用户
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null
      }
    });

    if (!existingFolder) {
      return NextResponse.json(
        { error: '资料夹不存在' },
        { status: 404 }
      );
    }

    // 检查同名资料夹
    const duplicateFolder = await prisma.folder.findFirst({
      where: {
        name: name.trim(),
        userId: session.user.id,
        deletedAt: null,
        id: { not: id }
      }
    });

    if (duplicateFolder) {
      return NextResponse.json(
        { error: '已存在同名资料夹' },
        { status: 409 }
      );
    }

    // 更新资料夹名称
    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: {
        name: name.trim(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      folder: updatedFolder
    });

  } catch (error) {
    console.error('重命名资料夹失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// DELETE - 删除资料夹（软删除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id } = params;

    // 检查资料夹是否存在且属于当前用户
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null
      }
    });

    if (!existingFolder) {
      return NextResponse.json(
        { error: '资料夹不存在' },
        { status: 404 }
      );
    }

    // 软删除资料夹
    await prisma.folder.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: '资料夹已删除'
    });

  } catch (error) {
    console.error('删除资料夹失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
