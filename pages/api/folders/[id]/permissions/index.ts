/**
 * 檔案夾權限管理 API
 * GET: 獲取檔案夾權限列表
 * POST: 授予檔案夾權限
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import { FolderPermissionManager, FolderPermissionLevel } from '../../../../../lib/permissions/FolderPermissionManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: '未授權' });
  }

  const { id: folderId } = req.query;

  if (typeof folderId !== 'string') {
    return res.status(400).json({ error: '無效的檔案夾ID' });
  }

  try {
    if (req.method === 'GET') {
      // 獲取檔案夾權限列表
      
      // 檢查用戶是否有查看權限
      const canView = await FolderPermissionManager.checkPermission(
        session.user.id,
        folderId,
        'read'
      );

      if (!canView) {
        return res.status(403).json({ error: '沒有權限查看此檔案夾的權限設置' });
      }

      const permissions = await FolderPermissionManager.getFolderPermissions(folderId);
      return res.status(200).json(permissions);
    }

    if (req.method === 'POST') {
      // 授予檔案夾權限
      const { userId, permissionLevel, expiresAt } = req.body;

      if (!userId || !permissionLevel) {
        return res.status(400).json({ error: '缺少必要參數' });
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

      const permission = await FolderPermissionManager.grantPermission(
        session.user.id,
        userId,
        folderId,
        permissionLevel,
        expiresAt ? new Date(expiresAt) : undefined
      );

      return res.status(201).json(permission);
    }

    return res.status(405).json({ error: '方法不允許' });
  } catch (error) {
    console.error('檔案夾權限API錯誤:', error);
    return res.status(500).json({ 
      error: '內部服務器錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}
