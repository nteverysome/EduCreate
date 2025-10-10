import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

interface ExportOptions {
  format: 'wordwall' | 'json' | 'zip';
  includeActivities: boolean;
  includeSubfolders: boolean;
  folderIds: string[];
}

interface ExportedFolder {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  activities?: ExportedActivity[];
  subfolders?: ExportedFolder[];
}

interface ExportedActivity {
  id: string;
  title: string;
  type: string;
  templateId: number;
  content: any;
  createdAt: string;
  updatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }

    const body = await request.json();
    const options: ExportOptions = {
      format: body.format || 'json',
      includeActivities: body.includeActivities !== false,
      includeSubfolders: body.includeSubfolders !== false,
      folderIds: body.folderIds || []
    };

    if (!options.folderIds || options.folderIds.length === 0) {
      return NextResponse.json({ error: '未指定要導出的檔案夾' }, { status: 400 });
    }

    // 獲取用戶的檔案夾數據
    const foldersData = await getUserFolders(session.user.id, options);

    // 根據格式生成導出文件
    let exportContent: Buffer;
    let contentType: string;
    let filename: string;

    switch (options.format) {
      case 'json':
        exportContent = await generateJsonExport(foldersData);
        contentType = 'application/json';
        filename = `folders-export-${Date.now()}.json`;
        break;
      
      case 'wordwall':
        exportContent = await generateWordwallExport(foldersData);
        contentType = 'application/octet-stream';
        filename = `folders-export-${Date.now()}.wordwall`;
        break;
      
      case 'zip':
        exportContent = await generateZipExport(foldersData);
        contentType = 'application/zip';
        filename = `folders-export-${Date.now()}.zip`;
        break;
      
      default:
        return NextResponse.json({ error: '不支援的導出格式' }, { status: 400 });
    }

    // 設置響應頭
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Length', exportContent.length.toString());

    return new NextResponse(exportContent, { headers });

  } catch (error) {
    console.error('檔案夾導出錯誤:', error);
    return NextResponse.json({
      error: '檔案夾導出失敗',
      details: (error as Error).message
    }, { status: 500 });
  }
}

// 獲取用戶檔案夾數據
async function getUserFolders(userId: string, options: ExportOptions): Promise<ExportedFolder[]> {
  try {
    // 這裡應該從資料庫獲取實際數據
    // 目前使用模擬數據
    
    const mockFolders: ExportedFolder[] = [
      {
        id: 'folder_1',
        name: '英語學習資料',
        description: '英語學習相關的活動和資源',
        createdAt: '2024-01-15T10:00:00Z',
        activities: options.includeActivities ? [
          {
            id: 'activity_1',
            title: '基礎詞彙練習',
            type: 'vocabulary',
            templateId: 1,
            content: {
              words: ['apple', 'banana', 'orange'],
              definitions: ['蘋果', '香蕉', '橘子']
            },
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T11:00:00Z'
          },
          {
            id: 'activity_2',
            title: '語法填空',
            type: 'fill-blank',
            templateId: 2,
            content: {
              sentences: ['I ___ an apple', 'She ___ to school'],
              answers: ['eat', 'goes']
            },
            createdAt: '2024-01-15T12:00:00Z',
            updatedAt: '2024-01-15T12:30:00Z'
          }
        ] : undefined,
        subfolders: options.includeSubfolders ? [
          {
            id: 'subfolder_1',
            name: '進階練習',
            description: '進階英語練習',
            createdAt: '2024-01-16T09:00:00Z',
            activities: options.includeActivities ? [
              {
                id: 'activity_3',
                title: '閱讀理解',
                type: 'reading',
                templateId: 3,
                content: {
                  passage: 'This is a sample passage...',
                  questions: ['What is the main idea?']
                },
                createdAt: '2024-01-16T10:00:00Z',
                updatedAt: '2024-01-16T10:30:00Z'
              }
            ] : undefined
          }
        ] : undefined
      },
      {
        id: 'folder_2',
        name: '數學練習',
        description: '數學相關的練習活動',
        createdAt: '2024-01-20T14:00:00Z',
        activities: options.includeActivities ? [
          {
            id: 'activity_4',
            title: '加法練習',
            type: 'math',
            templateId: 4,
            content: {
              problems: ['2 + 3 = ?', '5 + 7 = ?'],
              answers: [5, 12]
            },
            createdAt: '2024-01-20T15:00:00Z',
            updatedAt: '2024-01-20T15:30:00Z'
          }
        ] : undefined
      }
    ];

    // 過濾指定的檔案夾
    return mockFolders.filter(folder => options.folderIds.includes(folder.id));

  } catch (error) {
    throw new Error(`獲取檔案夾數據失敗: ${(error as Error).message}`);
  }
}

// 生成 JSON 格式導出
async function generateJsonExport(folders: ExportedFolder[]): Promise<Buffer> {
  try {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      format: 'EduCreate',
      folders: folders
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    return Buffer.from(jsonString, 'utf-8');

  } catch (error) {
    throw new Error(`JSON 導出生成失敗: ${(error as Error).message}`);
  }
}

// 生成 Wordwall 格式導出
async function generateWordwallExport(folders: ExportedFolder[]): Promise<Buffer> {
  try {
    // 這裡需要實現 Wordwall 格式的生成
    // 由於 Wordwall 格式可能是專有格式，我們模擬生成過程
    
    const wordwallData = {
      version: '2.0',
      type: 'wordwall-export',
      exportedAt: new Date().toISOString(),
      folders: folders.map(folder => ({
        ...folder,
        format: 'wordwall',
        activities: folder.activities?.map(activity => ({
          ...activity,
          wordwallTemplateId: getWordwallTemplateId(activity.type),
          wordwallFormat: convertToWordwallFormat(activity.content)
        }))
      }))
    };

    const jsonString = JSON.stringify(wordwallData, null, 2);
    return Buffer.from(jsonString, 'utf-8');

  } catch (error) {
    throw new Error(`Wordwall 導出生成失敗: ${(error as Error).message}`);
  }
}

// 生成 ZIP 格式導出
async function generateZipExport(folders: ExportedFolder[]): Promise<Buffer> {
  try {
    // 這裡需要使用 ZIP 庫來創建壓縮檔案
    // 目前模擬 ZIP 文件生成
    
    const zipContent = {
      'folders.json': JSON.stringify(folders, null, 2),
      'metadata.json': JSON.stringify({
        exportedAt: new Date().toISOString(),
        format: 'zip',
        folderCount: folders.length,
        activityCount: folders.reduce((sum, folder) => 
          sum + (folder.activities?.length || 0), 0
        )
      }, null, 2)
    };

    // 模擬 ZIP 文件內容
    const mockZipContent = JSON.stringify(zipContent, null, 2);
    return Buffer.from(mockZipContent, 'utf-8');

  } catch (error) {
    throw new Error(`ZIP 導出生成失敗: ${(error as Error).message}`);
  }
}

// 獲取 Wordwall 模板 ID
function getWordwallTemplateId(activityType: string): number {
  const templateMap: { [key: string]: number } = {
    'vocabulary': 1,
    'fill-blank': 2,
    'reading': 3,
    'math': 4,
    'quiz': 5,
    'match': 6
  };
  
  return templateMap[activityType] || 1;
}

// 轉換為 Wordwall 格式
function convertToWordwallFormat(content: any): any {
  // 這裡實現內容格式轉換邏輯
  // 將 EduCreate 格式轉換為 Wordwall 格式
  
  return {
    ...content,
    wordwallVersion: '2.0',
    convertedAt: new Date().toISOString()
  };
}
