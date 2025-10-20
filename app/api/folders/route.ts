import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 遞歸計算資料夾中的活動數量（包括所有子資料夾）
async function getRecursiveActivityCount(folderId: string, type: 'activities' | 'results'): Promise<number> {
  // 計算直接在該資料夾中的活動/結果數量
  const directCount = type === 'activities'
    ? await prisma.activity.count({
        where: {
          folderId: folderId,
          deletedAt: null,
        },
      })
    : await prisma.assignmentResult.count({
        where: {
          folderId: folderId,
        },
      });

  // 獲取所有子資料夾
  const subfolders = await prisma.folder.findMany({
    where: {
      parentId: folderId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  // 遞歸計算所有子資料夾的活動/結果數量
  let totalCount = directCount;
  for (const subfolder of subfolders) {
    totalCount += await getRecursiveActivityCount(subfolder.id, type);
  }

  return totalCount;
}

// GET - 獲取用戶的所有資料夾
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'activities' 或 'results'
    const parentId = searchParams.get('parentId'); // 父資料夾 ID（null 表示根目錄）
    const includeBreadcrumbs = searchParams.get('includeBreadcrumbs') === 'true'; // 是否包含麵包屑導航

    // 🔍 深度调试：记录所有请求
    console.log('🔍 [API DEBUG] GET /api/folders 被调用');
    console.log('🔍 [API DEBUG] type 参数:', type);
    console.log('🔍 [API DEBUG] parentId 参数:', parentId);
    console.log('🔍 [API DEBUG] includeBreadcrumbs 参数:', includeBreadcrumbs);
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

    // 構建查詢條件
    const whereCondition: any = {
      userId: session.user.id,
      deletedAt: null, // 只获取未删除的资料夹
      type: type === 'results' ? 'RESULTS' : 'ACTIVITIES', // 根据类型过滤
    };

    // 🔍 調試日誌
    console.log('🔍 [API DEBUG] parentId 參數:', parentId);
    console.log('🔍 [API DEBUG] parentId === null:', parentId === null);
    console.log('🔍 [API DEBUG] typeof parentId:', typeof parentId);

    // 只有當 parentId 參數存在時才過濾
    // 如果 parentId 不存在（null），返回所有資料夾（用於移動資料夾模態框）
    // 注意：searchParams.get() 返回 null（不是 undefined）當參數不存在時
    if (parentId !== null) {
      console.log('✅ [API DEBUG] parentId 參數存在，添加過濾條件');
      whereCondition.parentId = parentId || null;
    } else {
      console.log('✅ [API DEBUG] parentId 參數不存在（null），不過濾 parentId');
    }

    console.log('🔍 [API DEBUG] 最終查詢條件:', JSON.stringify(whereCondition, null, 2));

    const folders = await prisma.folder.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        parentId: true,
        depth: true,
        path: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 計算每個資料夾的活動數量和結果數量（遞歸計算包括所有子資料夾）
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const activityCount = type === 'activities'
          ? await getRecursiveActivityCount(folder.id, 'activities')
          : 0;
        const resultCount = type === 'results'
          ? await getRecursiveActivityCount(folder.id, 'results')
          : 0;

        return {
          id: folder.id,
          name: folder.name,
          description: folder.description,
          color: folder.color,
          icon: folder.icon,
          parentId: folder.parentId,
          depth: folder.depth,
          path: folder.path,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          activityCount: activityCount,
          resultCount: resultCount,
          _count: {
            activities: activityCount,
            results: resultCount,
          },
        };
      })
    );

    // 如果需要包含麵包屑導航，構建麵包屑路徑
    if (includeBreadcrumbs && parentId) {
      const breadcrumbs: Array<{ id: string; name: string }> = [];

      // 獲取當前資料夾信息
      const currentFolder = await prisma.folder.findUnique({
        where: { id: parentId },
        select: {
          id: true,
          name: true,
          parentId: true,
        },
      });

      if (currentFolder) {
        let folder: { id: string; name: string; parentId: string | null } = currentFolder;
        breadcrumbs.unshift({ id: folder.id, name: folder.name });

        // 遞歸構建麵包屑路徑
        while (folder.parentId) {
          const parentFolder = await prisma.folder.findUnique({
            where: { id: folder.parentId },
            select: {
              id: true,
              name: true,
              parentId: true,
            },
          });

          if (parentFolder) {
            breadcrumbs.unshift({ id: parentFolder.id, name: parentFolder.name });
            folder = parentFolder;
          } else {
            break;
          }
        }
      }

      // 返回包含麵包屑的對象
      return NextResponse.json({
        folders: foldersWithCount,
        breadcrumbs,
        currentFolder: currentFolder ? {
          id: currentFolder.id,
          name: currentFolder.name,
          parentId: currentFolder.parentId,
        } : null,
      });
    }

    return NextResponse.json(foldersWithCount);
  } catch (error) {
    console.error('獲取資料夾失敗:', error);
    // 返回詳細錯誤信息以便調試
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    const errorStack = error instanceof Error ? error.stack : '';
    return NextResponse.json({
      error: '獲取資料夾失敗',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}

// POST - 創建新資料夾
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json() as {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      type?: string;
      parentId?: string;
    };
    const { name, description, color, icon, type, parentId } = body;

    // 🔍 調試日誌
    console.log('🔍 [API DEBUG] POST /api/folders 被調用');
    console.log('🔍 [API DEBUG] 請求 body:', body);
    console.log('🔍 [API DEBUG] 用戶 ID:', session.user.id);
    console.log('🔍 [API DEBUG] 資料夾名稱:', name);
    console.log('🔍 [API DEBUG] 資料夾類型:', type);
    console.log('🔍 [API DEBUG] 父資料夾 ID:', parentId);

    if (!name || !name.trim()) {
      console.error('❌ [API ERROR] 資料夾名稱為空');
      return NextResponse.json({ error: '資料夾名稱不能為空' }, { status: 400 });
    }

    const folderType = type === 'results' ? 'RESULTS' : 'ACTIVITIES';
    console.log('🔍 [API DEBUG] 轉換後的資料夾類型:', folderType);

    // 如果有 parentId，驗證父資料夾
    let parentFolder = null;
    let depth = 0;
    let path = '/';

    if (parentId) {
      parentFolder = await prisma.folder.findUnique({
        where: { id: parentId }
      });

      if (!parentFolder) {
        return NextResponse.json({ error: '父資料夾不存在' }, { status: 404 });
      }

      if (parentFolder.userId !== session.user.id) {
        return NextResponse.json({ error: '無權訪問此資料夾' }, { status: 403 });
      }

      if (parentFolder.type !== folderType) {
        return NextResponse.json({ error: '資料夾類型不匹配' }, { status: 400 });
      }

      // 檢查深度限制
      if (parentFolder.depth >= 9) { // 最大深度 10 層（0-9）
        return NextResponse.json({ error: '資料夾嵌套深度不能超過 10 層' }, { status: 400 });
      }

      depth = parentFolder.depth + 1;
      path = `${parentFolder.path}/${parentId}`;
    }

    // 檢查是否已存在同名同類型資料夾（在同一父資料夾下）
    const normalizedParentId = parentId || null;

    console.log('🔍 [API DEBUG] 準備查詢現有資料夾');
    console.log('🔍 [API DEBUG] 查詢條件:', {
      userId: session.user.id,
      name: name.trim(),
      type: folderType,
      parentId: normalizedParentId,
      deletedAt: null
    });

    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
        type: folderType,
        parentId: normalizedParentId,
        deletedAt: null
      }
    });

    console.log('🔍 [API DEBUG] 查詢現有資料夾結果:', existingFolder);

    if (existingFolder) {
      console.error('❌ [API ERROR] 資料夾名稱已存在');
      console.error('❌ [API ERROR] 現有資料夾詳情:', {
        id: existingFolder.id,
        name: existingFolder.name,
        type: existingFolder.type,
        parentId: existingFolder.parentId,
        depth: existingFolder.depth,
        path: existingFolder.path
      });
      console.error('❌ [API ERROR] 嘗試創建的資料夾:', {
        name: name.trim(),
        type: folderType,
        parentId: normalizedParentId,
        depth,
        path
      });
      return NextResponse.json({
        error: '資料夾名稱已存在',
        existingFolder: {
          id: existingFolder.id,
          name: existingFolder.name,
          type: existingFolder.type,
          parentId: existingFolder.parentId
        }
      }, { status: 400 });
    }

    // 用户反馈：希望可以同颜色重复创建，所以移除颜色重复检查
    const folderColor = color || '#3B82F6'; // 默認藍色

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: folderColor, // 使用已验证的颜色
        icon: icon || 'folder',
        type: folderType,
        parentId: parentId || null,
        depth,
        path,
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

    const body = await request.json() as {
      id?: string;
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
    };
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
