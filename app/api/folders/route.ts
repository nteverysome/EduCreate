import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
        userId: session.user.id
      },
      include: {
        activities: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 計算每個資料夾的活動數量
    const foldersWithCount = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      icon: folder.icon,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      activityCount: folder.activities.length
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

    // 檢查是否已存在同名資料夾
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim()
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

    // 檢查資料夾是否存在且屬於當前用戶
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!existingFolder) {
      return NextResponse.json({ error: '資料夾不存在' }, { status: 404 });
    }

    // 檢查是否已存在同名資料夾（排除當前資料夾）
    const duplicateFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
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

    // 檢查資料夾是否存在且屬於當前用戶
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        activities: true
      }
    });

    if (!existingFolder) {
      return NextResponse.json({ error: '資料夾不存在' }, { status: 404 });
    }

    // 將資料夾內的活動移至根目錄（設置 folderId 為 null）
    if (existingFolder.activities.length > 0) {
      await prisma.activity.updateMany({
        where: {
          folderId: id
        },
        data: {
          folderId: null
        }
      });
    }

    // 刪除資料夾
    await prisma.folder.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json({ 
      message: '資料夾已刪除',
      movedActivities: existingFolder.activities.length
    });
  } catch (error) {
    console.error('刪除資料夾失敗:', error);
    return NextResponse.json({ error: '刪除資料夾失敗' }, { status: 500 });
  }
}
