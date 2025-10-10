/**
 * 檔案夾視覺自定義 API
 * 處理檔案夾顏色、圖標、主題等自定義設定
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { 
  folderCustomizationManager,
  FolderCustomization,
  FolderTheme,
  FolderIconSet
} from '../../../lib/folder/FolderCustomizationManager';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // 檢查認證狀態
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: '請先登入'
      });
    }

    const { method } = req;
    const userId = session.user.id || session.user.email;

    switch (method) {
      case 'GET':
        return handleGet(req, res, userId);
      case 'POST':
        return handlePost(req, res, userId);
      case 'PUT':
        return handlePut(req, res, userId);
      case 'DELETE':
        return handleDelete(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: `方法 ${method} 不被支持`
        });
    }
  } catch (error) {
    console.error('Folder customization API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服務器內部錯誤'
    });
  }
}

/**
 * 處理 GET 請求 - 獲取檔案夾自定義設定
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  userId: string
) {
  const { folderId, type } = req.query;

  try {
    // 獲取特定檔案夾的自定義設定
    if (folderId && typeof folderId === 'string') {
      const customization = folderCustomizationManager.getFolderCustomization(folderId);
      
      return res.status(200).json({
        success: true,
        data: {
          customization,
          folderId
        },
        message: customization ? '獲取自定義設定成功' : '使用默認設定'
      });
    }

    // 獲取可用主題
    if (type === 'themes') {
      const themes = folderCustomizationManager.getAvailableThemes();
      
      return res.status(200).json({
        success: true,
        data: {
          themes,
          total: themes.length
        },
        message: '獲取主題列表成功'
      });
    }

    // 獲取可用圖標集
    if (type === 'icons') {
      const iconSets = folderCustomizationManager.getAvailableIconSets();
      
      return res.status(200).json({
        success: true,
        data: {
          iconSets,
          total: iconSets.length
        },
        message: '獲取圖標集列表成功'
      });
    }

    // 搜索圖標
    if (type === 'search-icons') {
      const { query, category } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: '請提供搜索關鍵字'
        });
      }

      const icons = folderCustomizationManager.searchIcons(
        query,
        typeof category === 'string' ? category : undefined
      );
      
      return res.status(200).json({
        success: true,
        data: {
          icons,
          query,
          category,
          total: icons.length
        },
        message: `找到 ${icons.length} 個圖標`
      });
    }

    // 獲取所有自定義設定（管理用途）
    return res.status(200).json({
      success: true,
      data: {
        themes: folderCustomizationManager.getAvailableThemes(),
        iconSets: folderCustomizationManager.getAvailableIconSets()
      },
      message: '獲取所有自定義選項成功'
    });

  } catch (error) {
    console.error('Get customization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '獲取自定義設定失敗'
    });
  }
}

/**
 * 處理 POST 請求 - 創建檔案夾自定義設定
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  userId: string
) {
  const { folderId, customization } = req.body;

  // 驗證請求數據
  if (!folderId || !customization) {
    return res.status(400).json({
      success: false,
      error: 'Bad request',
      message: '請提供檔案夾ID和自定義設定'
    });
  }

  try {
    // 驗證用戶權限（檢查是否有權限自定義該檔案夾）
    // 這裡應該檢查用戶是否擁有該檔案夾或有編輯權限
    
    // 創建自定義設定
    const newCustomization = await folderCustomizationManager.setFolderCustomization(
      folderId,
      userId,
      customization
    );

    // 生成CSS樣式
    const css = folderCustomizationManager.generateFolderCSS(newCustomization);

    return res.status(201).json({
      success: true,
      data: {
        customization: newCustomization,
        css,
        folderId
      },
      message: '檔案夾自定義設定創建成功'
    });

  } catch (error) {
    console.error('Create customization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '創建自定義設定失敗'
    });
  }
}

/**
 * 處理 PUT 請求 - 更新檔案夾自定義設定
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  userId: string
) {
  const { folderId, customization } = req.body;

  // 驗證請求數據
  if (!folderId || !customization) {
    return res.status(400).json({
      success: false,
      error: 'Bad request',
      message: '請提供檔案夾ID和自定義設定'
    });
  }

  try {
    // 檢查現有自定義設定
    const existing = folderCustomizationManager.getFolderCustomization(folderId);
    
    if (existing && existing.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '沒有權限修改此檔案夾的自定義設定'
      });
    }

    // 更新自定義設定
    const updatedCustomization = await folderCustomizationManager.setFolderCustomization(
      folderId,
      userId,
      customization
    );

    // 生成CSS樣式
    const css = folderCustomizationManager.generateFolderCSS(updatedCustomization);

    return res.status(200).json({
      success: true,
      data: {
        customization: updatedCustomization,
        css,
        folderId
      },
      message: '檔案夾自定義設定更新成功'
    });

  } catch (error) {
    console.error('Update customization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '更新自定義設定失敗'
    });
  }
}

/**
 * 處理 DELETE 請求 - 刪除檔案夾自定義設定（重置為默認）
 */
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  userId: string
) {
  const { folderId } = req.query;

  if (!folderId || typeof folderId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Bad request',
      message: '請提供檔案夾ID'
    });
  }

  try {
    // 檢查現有自定義設定
    const existing = folderCustomizationManager.getFolderCustomization(folderId);
    
    if (existing && existing.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '沒有權限重置此檔案夾的自定義設定'
      });
    }

    // 重置為默認設定
    const defaultCustomization = folderCustomizationManager.resetToDefault(folderId, userId);

    // 生成CSS樣式
    const css = folderCustomizationManager.generateFolderCSS(defaultCustomization);

    return res.status(200).json({
      success: true,
      data: {
        customization: defaultCustomization,
        css,
        folderId
      },
      message: '檔案夾自定義設定已重置為默認'
    });

  } catch (error) {
    console.error('Reset customization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '重置自定義設定失敗'
    });
  }
}

/**
 * 驗證顏色對比度
 */
function validateColorContrast(foreground: string, background: string): boolean {
  // 這裡應該實現 WCAG 對比度檢查算法
  // 簡化版本，實際應該使用專業的對比度計算
  return true;
}

/**
 * 驗證自定義設定數據
 */
function validateCustomizationData(customization: any): boolean {
  // 驗證必要欄位
  if (!customization.colorScheme) {
    return false;
  }

  // 驗證顏色格式
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const colors = customization.colorScheme;
  
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === 'string' && !colorRegex.test(value)) {
      return false;
    }
  }

  return true;
}

/**
 * 清理和標準化自定義設定數據
 */
function sanitizeCustomizationData(customization: any): any {
  // 移除不安全的內容
  if (customization.customIcon) {
    // 清理SVG內容，移除潛在的XSS攻擊
    customization.customIcon = customization.customIcon
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  }

  return customization;
}
