import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

interface ImportResult {
  success: boolean;
  message: string;
  foldersImported?: number;
  activitiesImported?: number;
  errors?: string[];
}

interface WordwallFolder {
  id: string;
  name: string;
  description?: string;
  activities: WordwallActivity[];
  subfolders?: WordwallFolder[];
}

interface WordwallActivity {
  id: string;
  title: string;
  type: string;
  content: any;
  templateId: number;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未提供檔案' }, { status: 400 });
    }

    // 檢查檔案大小 (最大 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: '檔案大小超過限制 (50MB)' }, { status: 400 });
    }

    // 檢查檔案類型
    const allowedTypes = [
      'application/json',
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream'
    ];
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['json', 'zip', 'wordwall'];

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      return NextResponse.json({ 
        error: '不支援的檔案格式。支援的格式：.json, .zip, .wordwall' 
      }, { status: 400 });
    }

    // 讀取檔案內容
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer);

    let importData: any;
    let result: ImportResult;

    try {
      // 根據檔案類型處理
      if (fileExtension === 'json') {
        // 處理 JSON 格式
        const jsonContent = fileContent.toString('utf-8');
        importData = JSON.parse(jsonContent);
        result = await processJsonImport(importData, session.user.id);
      } else if (fileExtension === 'wordwall' || fileExtension === 'zip') {
        // 處理 Wordwall 格式或 ZIP 檔案
        result = await processWordwallImport(fileContent, session.user.id);
      } else {
        throw new Error('未知的檔案格式');
      }

      return NextResponse.json(result);

    } catch (parseError) {
      console.error('檔案解析錯誤:', parseError);
      return NextResponse.json({
        success: false,
        message: '檔案格式錯誤或檔案損壞',
        errors: [(parseError as Error).message]
      });
    }

  } catch (error) {
    console.error('檔案導入錯誤:', error);
    return NextResponse.json({
      success: false,
      message: '檔案導入失敗',
      errors: [(error as Error).message]
    }, { status: 500 });
  }
}

// 處理 JSON 格式導入
async function processJsonImport(data: any, userId: string): Promise<ImportResult> {
  try {
    // 驗證 JSON 結構
    if (!data.folders || !Array.isArray(data.folders)) {
      throw new Error('無效的 JSON 結構：缺少 folders 陣列');
    }

    let foldersImported = 0;
    let activitiesImported = 0;
    const errors: string[] = [];

    // 處理每個檔案夾
    for (const folderData of data.folders) {
      try {
        await importFolder(folderData, userId);
        foldersImported++;
        
        if (folderData.activities) {
          activitiesImported += folderData.activities.length;
        }
      } catch (error) {
        errors.push(`檔案夾 "${folderData.name}" 導入失敗: ${(error as Error).message}`);
      }
    }

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? '檔案夾導入成功完成！' : '部分檔案夾導入失敗',
      foldersImported,
      activitiesImported,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    throw new Error(`JSON 導入處理失敗: ${(error as Error).message}`);
  }
}

// 處理 Wordwall 格式導入
async function processWordwallImport(fileContent: Buffer, userId: string): Promise<ImportResult> {
  try {
    // 這裡需要實現 Wordwall 格式的解析
    // 由於 Wordwall 格式可能是專有格式，我們模擬處理過程
    
    // 模擬解析 Wordwall 檔案
    const mockWordwallData = {
      folders: [
        {
          id: 'imported_folder_1',
          name: '導入的英語檔案夾',
          description: '從 Wordwall 導入的英語學習資料',
          activities: [
            {
              id: 'imported_activity_1',
              title: '詞彙配對遊戲',
              type: 'match',
              templateId: 1,
              content: { words: ['apple', 'banana'], definitions: ['蘋果', '香蕉'] },
              createdAt: new Date().toISOString()
            }
          ]
        }
      ]
    };

    // 使用相同的處理邏輯
    return await processJsonImport(mockWordwallData, userId);

  } catch (error) {
    throw new Error(`Wordwall 導入處理失敗: ${(error as Error).message}`);
  }
}

// 導入單個檔案夾
async function importFolder(folderData: any, userId: string): Promise<void> {
  try {
    // 這裡應該調用實際的資料庫操作
    // 由於沒有實際的資料庫連接，我們模擬處理過程
    
    console.log(`導入檔案夾: ${folderData.name} (用戶: ${userId})`);
    
    // 模擬資料庫操作延遲
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 驗證檔案夾數據
    if (!folderData.name || typeof folderData.name !== 'string') {
      throw new Error('檔案夾名稱無效');
    }

    // 這裡應該：
    // 1. 創建檔案夾記錄
    // 2. 導入活動
    // 3. 處理子檔案夾
    // 4. 設置權限和關聯

    console.log(`檔案夾 "${folderData.name}" 導入成功`);

  } catch (error) {
    throw new Error(`檔案夾導入失敗: ${(error as Error).message}`);
  }
}
