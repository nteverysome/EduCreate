import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - 获取单个资料夹信息
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const folderId = params.id;

    // 获取资料夹信息
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: session.user.id,
        deletedAt: null
      }
    });

    if (!folder) {
      return NextResponse.json({ error: '资料夹不存在' }, { status: 404 });
    }

    // 计算资料夹中的结果数量
    const resultCount = await prisma.assignmentResult.count({
      where: {
        folderId: folderId,
        assignment: {
          activity: {
            userId: session.user.id
          }
        }
      }
    });

    const folderData = {
      id: folder.id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      icon: folder.icon,
      parentId: folder.parentId, // 🔧 添加 parentId 字段以支持層級導航
      depth: folder.depth, // 🔧 添加 depth 字段
      path: folder.path, // 🔧 添加 path 字段
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString(),
      resultCount: resultCount
    };

    return NextResponse.json(folderData);

  } catch (error) {
    console.error('获取资料夹失败:', error);
    return NextResponse.json(
      { error: '获取资料夹失败' },
      { status: 500 }
    );
  }
}

// PATCH - 更新资料夹（重命名或變更顏色）
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
    const { name, color } = body;

    // 檢查是否至少提供了一個要更新的字段
    if (!name && !color) {
      return NextResponse.json(
        { error: '請提供要更新的資料夾名稱或顏色' },
        { status: 400 }
      );
    }

    // 如果提供了名稱，驗證名稱
    if (name && (typeof name !== 'string' || !name.trim())) {
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

    // 如果提供了名稱，檢查同名資料夾
    if (name) {
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
    }

    // 準備更新數據
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name) {
      updateData.name = name.trim();
    }

    if (color) {
      updateData.color = color;
    }

    // 更新资料夹
    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      folder: updatedFolder
    });

  } catch (error) {
    console.error('更新资料夹失败:', error);
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
