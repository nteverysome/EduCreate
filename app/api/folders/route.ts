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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'activities' 或 'results'

    // 🔍 深度调试：记录所有请求
    console.log('🔍 [API DEBUG] GET /api/folders 被调用');
    console.log('🔍 [API DEBUG] type 参数:', type);
    console.log('🔍 [API DEBUG] 完整 URL:', request.url);
    console.log('🔍 [API DEBUG] 用户 ID:', session.user.id);

    // 🚨 临时调试：记录没有 type 参数的调用但不阻止
    if (!type) {
      console.error('🚨 [API WARNING] 没有 type 参数！这可能导致错误的资料夹类型');
      console.error('🚨 [API WARNING] 请求来源需要检查');
      console.error('🚨 [API WARNING] 调用堆栈:', new Error().stack);
      // 临时返回空数组而不是错误，以便调试
      return NextResponse.json([]);
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null, // 只获取未删除的资料夹
        type: type === 'results' ? 'RESULTS' : 'ACTIVITIES' // 根据类型过滤
      },
      include: {
        activities: {
          select: {
            id: true
          }
        },
        // 暂时不查询 results，因为可能导致 500 错误
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 計算每個資料夾的活動數量和結果數量
    const foldersWithCount = await Promise.all(folders.map(async folder => {
      // 手动查询每个资料夹的结果数量
      const resultCount = await prisma.assignmentResult.count({
        where: {
          folderId: folder.id
        }
      });

      return {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        color: folder.color,
        icon: folder.icon,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
        activityCount: folder.activities.length,
        resultCount: resultCount
      };
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
    const { name, description, color, icon, type } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '資料夾名稱不能為空' }, { status: 400 });
    }

    const folderType = type === 'results' ? 'RESULTS' : 'ACTIVITIES';

    // 檢查是否已存在同名同類型資料夾（未删除的）
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
        type: folderType,
        deletedAt: null
      }
    });

    if (existingFolder) {
      return NextResponse.json({ error: '資料夾名稱已存在' }, { status: 400 });
    }

    // 檢查是否已存在同顏色同類型資料夾（未删除的）
    const folderColor = color || '#3B82F6'; // 默認藍色
    const existingColorFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        color: folderColor,
        type: folderType,
        deletedAt: null
      }
    });

    if (existingColorFolder) {
      return NextResponse.json({ error: '該顏色的資料夾已存在，請選擇其他顏色' }, { status: 400 });
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: folderColor, // 使用已验证的颜色
        icon: icon || 'folder',
        type: folderType,
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
