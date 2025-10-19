import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 檢查是否會造成循環嵌套
 * @param folderId 要移動的資料夾 ID
 * @param targetParentId 目標父資料夾 ID
 * @returns 如果會造成循環嵌套則返回 true
 */
async function wouldCreateCircularNesting(
  folderId: string,
  targetParentId: string | null
): Promise<boolean> {
  if (!targetParentId) {
    return false; // 移動到根目錄不會造成循環
  }

  if (folderId === targetParentId) {
    return true; // 不能移動到自己
  }

  // 檢查目標父資料夾是否是要移動的資料夾的子孫
  let currentFolder = await prisma.folder.findUnique({
    where: { id: targetParentId }
  });

  while (currentFolder) {
    if (currentFolder.id === folderId) {
      return true; // 目標父資料夾是要移動的資料夾的子孫
    }

    if (!currentFolder.parentId) {
      break; // 已經到達根目錄
    }

    currentFolder = await prisma.folder.findUnique({
      where: { id: currentFolder.parentId }
    });
  }

  return false;
}

/**
 * 更新資料夾及其所有子孫的 depth 和 path
 * @param folderId 資料夾 ID
 * @param newDepth 新的深度
 * @param newPath 新的路徑
 */
async function updateFolderHierarchy(
  folderId: string,
  newDepth: number,
  newPath: string
): Promise<void> {
  // 更新當前資料夾
  await prisma.folder.update({
    where: { id: folderId },
    data: {
      depth: newDepth,
      path: newPath
    }
  });

  // 獲取所有子資料夾
  const children = await prisma.folder.findMany({
    where: { parentId: folderId }
  });

  // 遞歸更新所有子資料夾
  for (const child of children) {
    const childDepth = newDepth + 1;
    const childPath = `${newPath}/${child.id}`;
    await updateFolderHierarchy(child.id, childDepth, childPath);
  }
}

// PATCH - 移動資料夾
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: folderId } = params;
    const body = await request.json() as {
      targetParentId?: string | null;
    };
    const { targetParentId } = body;

    console.log('🔍 [API DEBUG] PATCH /api/folders/[id]/move 被調用');
    console.log('🔍 [API DEBUG] folderId:', folderId);
    console.log('🔍 [API DEBUG] targetParentId:', targetParentId);

    // 獲取要移動的資料夾
    const folder = await prisma.folder.findUnique({
      where: { id: folderId }
    });

    if (!folder) {
      return NextResponse.json({ error: '資料夾不存在' }, { status: 404 });
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: '無權訪問此資料夾' }, { status: 403 });
    }

    // 檢查是否會造成循環嵌套
    const wouldCreateCircular = await wouldCreateCircularNesting(
      folderId,
      targetParentId || null
    );

    if (wouldCreateCircular) {
      return NextResponse.json(
        { error: '不能將資料夾移動到其子資料夾中' },
        { status: 400 }
      );
    }

    // 如果有目標父資料夾，驗證它
    let newDepth = 0;
    let newPath = `/${folderId}`;

    if (targetParentId) {
      const targetParent = await prisma.folder.findUnique({
        where: { id: targetParentId }
      });

      if (!targetParent) {
        return NextResponse.json({ error: '目標資料夾不存在' }, { status: 404 });
      }

      if (targetParent.userId !== session.user.id) {
        return NextResponse.json({ error: '無權訪問目標資料夾' }, { status: 403 });
      }

      if (targetParent.type !== folder.type) {
        return NextResponse.json({ error: '資料夾類型不匹配' }, { status: 400 });
      }

      // 檢查深度限制
      if (targetParent.depth >= 9) {
        return NextResponse.json(
          { error: '資料夾嵌套深度不能超過 10 層' },
          { status: 400 }
        );
      }

      newDepth = targetParent.depth + 1;
      newPath = `${targetParent.path}/${folderId}`;
    }

    // 檢查目標位置是否已有同名資料夾
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: folder.name,
        type: folder.type,
        parentId: targetParentId || null,
        deletedAt: null,
        id: { not: folderId } // 排除自己
      }
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: '目標位置已存在同名資料夾' },
        { status: 400 }
      );
    }

    // 更新資料夾的 parentId、depth 和 path
    await prisma.folder.update({
      where: { id: folderId },
      data: {
        parentId: targetParentId || null
      }
    });

    // 更新資料夾及其所有子孫的 depth 和 path
    await updateFolderHierarchy(folderId, newDepth, newPath);

    // 獲取更新後的資料夾
    const updatedFolder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      folder: updatedFolder
    });
  } catch (error) {
    console.error('移動資料夾失敗:', error);
    return NextResponse.json({ error: '移動資料夾失敗' }, { status: 500 });
  }
}

