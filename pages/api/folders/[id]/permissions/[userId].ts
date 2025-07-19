/**
 * 單個用戶檔案夾權限管理 API
 * PATCH: 更新用戶權限
 * DELETE: 撤銷用戶權限
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { FolderPermissionManager, FolderPermissionLevel } from '../../../../../lib/permissions/FolderPermissionManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: '未授權' });
  }

  const { id: folderId, userId } = req.query;

  if (typeof folderId !== 'string' || typeof userId !== 'string') {
    return res.status(400).json({ error: '無效的參數' });
  }

  try {
    if (req.method === 'PATCH') {
      // 更新用戶權限
      const { permissionLevel, expiresAt } = req.body;

      if (!permissionLevel) {
        return res.status(400).json({ error: '缺少權限級別參數' });
      }

      // 檢查權限級別是否有效
      if (!Object.values(FolderPermissionLevel).includes(permissionLevel)) {
        return res.status(400).json({ error: '無效的權限級別' });
      }

      // 檢查用戶是否有管理權限
      const canManage = await FolderPermissionManager.checkPermission(
        session.user.id,
        folderId,
        'manage_permissions'
      );

      if (!canManage) {
        return res.status(403).json({ error: '沒有權限管理此檔案夾的權限' });
      }

      // 先撤銷舊權限，再授予新權限
      await FolderPermissionManager.revokePermission(session.user.id, userId, folderId);
      
      const permission = await FolderPermissionManager.grantPermission(
        session.user.id,
        userId,
        folderId,
        permissionLevel,
        expiresAt ? new Date(expiresAt) : undefined
      );

      return res.status(200).json(permission);
    }

    if (req.method === 'DELETE') {
      // 撤銷用戶權限
      
      // 檢查用戶是否有管理權限
      const canManage = await FolderPermissionManager.checkPermission(
        session.user.id,
        folderId,
        'manage_permissions'
      );

      if (!canManage) {
        return res.status(403).json({ error: '沒有權限管理此檔案夾的權限' });
      }

      await FolderPermissionManager.revokePermission(session.user.id, userId, folderId);

      return res.status(200).json({ message: '權限已撤銷' });
    }

    return res.status(405).json({ error: '方法不允許' });
  } catch (error) {
    console.error('用戶權限API錯誤:', error);
    return res.status(500).json({ 
      error: '內部服務器錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}
