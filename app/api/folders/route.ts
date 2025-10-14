import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 獲取用戶的所有資料夾
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null // 只获取未删除的资料夹
      },
      include: {
        activities: {
          select: {
            id: true
          }
        },
        assignmentResults: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 計算每個資料夾的活動數量和結果數量
    const foldersWithCount = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      icon: folder.icon,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      activityCount: folder.activities.length,
      resultCount: folder.assignmentResults.length
    }));

    return NextResponse.json(foldersWithCount);
  } catch (error) {
    console.error('獲取資料夾失敗:', error);
    return NextResponse.json({ error: '獲取資料夾失敗' }, { status: 500 });
  }
}

// POST - 創建新資料夾
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '資料夾名稱不能為空' }, { status: 400 });
    }

    // 檢查是否已存在同名資料夾（未删除的）
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
        deletedAt: null
      }
    });

    if (existingFolder) {
      return NextResponse.json({ error: '資料夾名稱已存在' }, { status: 400 });
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6', // 默認藍色
        icon: icon || 'folder',
        userId: session.user.id
      }
    });

    return NextResponse.json({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      icon: folder.icon,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      activityCount: 0
    });
  } catch (error) {
    console.error('創建資料夾失敗:', error);
    return NextResponse.json({ error: '創建資料夾失敗' }, { status: 500 });
  }
}

// PUT - 更新資料夾
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, color, icon } = body;

    if (!id) {
      return NextResponse.json({ error: '資料夾 ID 不能為空' }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '資料夾名稱不能為空' }, { status: 400 });
    }

    // 檢查資料夾是否存在且屬於當前用戶（未删除的）
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: id,
        userId: session.user.id,
        deletedAt: null
      }
    });

    if (!existingFolder) {
      return NextResponse.json({ error: '資料夾不存在' }, { status: 404 });
    }

    // 檢查是否已存在同名資料夾（排除當前資料夾，未删除的）
    const duplicateFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
        deletedAt: null,
        id: {
          not: id
        }
      }
    });

    if (duplicateFolder) {
      return NextResponse.json({ error: '資料夾名稱已存在' }, { status: 400 });
    }

    const updatedFolder = await prisma.folder.update({
      where: {
        id: id
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || existingFolder.color,
        icon: icon || existingFolder.icon
      },
      include: {
        activities: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json({
      id: updatedFolder.id,
      name: updatedFolder.name,
      description: updatedFolder.description,
      color: updatedFolder.color,
      icon: updatedFolder.icon,
      createdAt: updatedFolder.createdAt,
      updatedAt: updatedFolder.updatedAt,
      activityCount: updatedFolder.activities.length
    });
  } catch (error) {
    console.error('更新資料夾失敗:', error);
    return NextResponse.json({ error: '更新資料夾失敗' }, { status: 500 });
  }
}

// DELETE - 刪除資料夾
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '資料夾 ID 不能為空' }, { status: 400 });
    }

    // 檢查資料夾是否存在且屬於當前用戶（未删除的）
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: id,
        userId: session.user.id,
        deletedAt: null
      },
      include: {
        activities: {
          where: {
            deletedAt: null // 只包含未删除的活动
          }
        }
      }
    });

    if (!existingFolder) {
      return NextResponse.json({ error: '資料夾不存在' }, { status: 404 });
    }

    // 软删除资料夹（设置 deletedAt）
    await prisma.folder.update({
      where: {
        id: id
      },
      data: {
        deletedAt: new Date()
      }
    });

    // 同时软删除资料夹内的所有活动
    if (existingFolder.activities.length > 0) {
      await prisma.activity.updateMany({
        where: {
          folderId: id,
          deletedAt: null
        },
        data: {
          deletedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      message: '資料夾已移至回收桶',
      deletedActivities: existingFolder.activities.length
    });
  } catch (error) {
    console.error('刪除資料夾失敗:', error);
    return NextResponse.json({ error: '刪除資料夾失敗' }, { status: 500 });
  }
}
