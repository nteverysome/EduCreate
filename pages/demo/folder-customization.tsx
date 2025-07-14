/**
 * 檔案夾視覺自定義演示頁面
 * 展示檔案夾顏色、圖標、主題等自定義功能
 */

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Layout from '../../components/Layout';
import FolderCustomizationPanel from '../../components/folder/FolderCustomizationPanel';
import { 
  folderCustomizationManager,
  FolderCustomization,
  FolderTheme,
  FolderIconSet
} from '../../lib/folder/FolderCustomizationManager';

interface DemoFolder {
  id: string;
  name: string;
  type: 'folder' | 'activity';
  itemCount: number;
  lastModified: Date;
  customization?: FolderCustomization;
}

interface FolderCustomizationDemoProps {
  availableThemes: FolderTheme[];
  availableIconSets: FolderIconSet[];
}

export default function FolderCustomizationDemo({
  availableThemes,
  availableIconSets
}: FolderCustomizationDemoProps) {
  const [demoFolders, setDemoFolders] = useState<DemoFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<DemoFolder | null>(null);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const [customStyles, setCustomStyles] = useState<{ [folderId: string]: string }>({});

  // 初始化演示檔案夾
  useEffect(() => {
    const folders: DemoFolder[] = [
      {
        id: 'folder-1',
        name: '英語學習',
        type: 'folder',
        itemCount: 15,
        lastModified: new Date('2024-01-15')
      },
      {
        id: 'folder-2',
        name: 'GEPT 初級',
        type: 'folder',
        itemCount: 8,
        lastModified: new Date('2024-01-10')
      },
      {
        id: 'folder-3',
        name: '單字練習',
        type: 'activity',
        itemCount: 25,
        lastModified: new Date('2024-01-12')
      },
      {
        id: 'folder-4',
        name: '文法練習',
        type: 'activity',
        itemCount: 12,
        lastModified: new Date('2024-01-08')
      },
      {
        id: 'folder-5',
        name: '聽力訓練',
        type: 'folder',
        itemCount: 6,
        lastModified: new Date('2024-01-14')
      },
      {
        id: 'folder-6',
        name: '口說練習',
        type: 'activity',
        itemCount: 18,
        lastModified: new Date('2024-01-11')
      }
    ];

    setDemoFolders(folders);
  }, []);

  // 處理檔案夾自定義
  const handleFolderCustomization = (folderId: string) => {
    const folder = demoFolders.find(f => f.id === folderId);
    if (folder) {
      setSelectedFolder(folder);
      setShowCustomizationPanel(true);
    }
  };

  // 處理自定義設定變更
  const handleCustomizationChange = async (customization: FolderCustomization) => {
    try {
      // 生成CSS樣式
      const css = folderCustomizationManager.generateFolderCSS(customization);
      
      // 更新樣式
      setCustomStyles(prev => ({
        ...prev,
        [customization.folderId]: css
      }));

      // 更新檔案夾自定義設定
      setDemoFolders(prev => prev.map(folder => 
        folder.id === customization.folderId
          ? { ...folder, customization }
          : folder
      ));

      // 關閉面板
      setShowCustomizationPanel(false);
      setSelectedFolder(null);

      console.log('檔案夾自定義設定已更新:', customization);
    } catch (error) {
      console.error('更新檔案夾自定義設定失敗:', error);
    }
  };

  // 獲取檔案夾圖標
  const getFolderIcon = (folder: DemoFolder) => {
    if (folder.customization?.customIcon) {
      return (
        <div 
          className="w-6 h-6"
          dangerouslySetInnerHTML={{ __html: folder.customization.customIcon }}
        />
      );
    }

    // 默認圖標
    if (folder.type === 'folder') {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      );
    }
  };

  return (
    <>
      <Head>
        <title>檔案夾視覺自定義演示 - EduCreate</title>
        <meta name="description" content="展示檔案夾顏色、圖標、主題等視覺自定義功能" />
      </Head>

      {/* 動態樣式 */}
      <style jsx global>{`
        ${Object.values(customStyles).join('\n')}
      `}</style>

      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 頁面標題 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="page-title">
                檔案夾視覺自定義演示
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto" data-testid="page-description">
                展示檔案夾顏色、圖標、主題等視覺自定義功能：基於Wordwall視覺系統設計，
                支持多種主題、自定義顏色、圖標選擇和無障礙設定
              </p>
            </div>

            {/* 功能說明 */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8" data-testid="feature-description">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">功能特色</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">🎨</span>
                  <span>多種預設主題</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">🌈</span>
                  <span>自定義顏色方案</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">📁</span>
                  <span>豐富圖標庫</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">♿</span>
                  <span>無障礙支持</span>
                </div>
              </div>
            </div>

            {/* 檔案夾網格 */}
            <div className="bg-white rounded-lg shadow-sm border p-6" data-testid="folders-container">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">我的檔案夾</h2>
                <p className="text-sm text-gray-600">
                  點擊檔案夾右上角的設定按鈕進行自定義
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="folders-grid">
                {demoFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md group ${
                      folder.customization 
                        ? `folder-${folder.id}` 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid={`folder-${folder.id}`}
                  >
                    {/* 自定義按鈕 */}
                    <button
                      onClick={() => handleFolderCustomization(folder.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="自定義外觀"
                      data-testid={`customize-${folder.id}`}
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>

                    {/* 檔案夾內容 */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="flex-shrink-0"
                        style={{ 
                          color: folder.customization?.colorScheme.primary || '#4A90E2' 
                        }}
                        data-testid={`folder-icon-${folder.id}`}
                      >
                        {getFolderIcon(folder)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate" data-testid={`folder-name-${folder.id}`}>
                          {folder.name}
                        </h3>
                        <p className="text-sm text-gray-500" data-testid={`folder-type-${folder.id}`}>
                          {folder.type === 'folder' ? '檔案夾' : '活動'}
                        </p>
                      </div>
                    </div>

                    {/* 檔案夾統計 */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span data-testid={`folder-count-${folder.id}`}>
                        {folder.itemCount} 個項目
                      </span>
                      <span data-testid={`folder-date-${folder.id}`}>
                        {folder.lastModified.toLocaleDateString()}
                      </span>
                    </div>

                    {/* 自定義指示器 */}
                    {folder.customization && (
                      <div className="absolute bottom-2 left-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="已自定義"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 主題預覽 */}
            <div className="mt-12 bg-white rounded-lg shadow-sm border p-6" data-testid="themes-preview">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">可用主題預覽</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: theme.colorSchemes[0].background,
                      borderColor: theme.colorSchemes[0].border
                    }}
                    data-testid={`theme-preview-${theme.id}`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.colorSchemes[0].primary }}
                      />
                      <h3 
                        className="font-medium"
                        style={{ color: theme.colorSchemes[0].text }}
                      >
                        {theme.name}
                      </h3>
                    </div>
                    <p 
                      className="text-sm"
                      style={{ color: theme.colorSchemes[0].text }}
                    >
                      {theme.description}
                    </p>
                    
                    {/* 主題標籤 */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {theme.category}
                      </span>
                      {theme.accessibility.highContrast && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          高對比
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 技術特色 */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8" data-testid="technical-features">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">技術特色</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-3">🎨</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Wordwall 風格設計</h3>
                  <p className="text-sm text-gray-600">
                    基於 Wordwall 視覺系統設計，提供一致的用戶體驗
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-3">🌈</div>
                  <h3 className="font-semibold text-gray-900 mb-2">動態CSS生成</h3>
                  <p className="text-sm text-gray-600">
                    實時生成CSS樣式，支持漸變、陰影等高級效果
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-3">♿</div>
                  <h3 className="font-semibold text-gray-900 mb-2">無障礙優先</h3>
                  <p className="text-sm text-gray-600">
                    符合 WCAG 2.1 AA 標準，支持高對比度和螢幕閱讀器
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-3">📁</div>
                  <h3 className="font-semibold text-gray-900 mb-2">豐富圖標庫</h3>
                  <p className="text-sm text-gray-600">
                    提供學術、科目、等級等多種分類的圖標選擇
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-3">🔍</div>
                  <h3 className="font-semibold text-gray-900 mb-2">智能搜索</h3>
                  <p className="text-sm text-gray-600">
                    支持關鍵字和語義搜索，快速找到合適的圖標
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-3">💾</div>
                  <h3 className="font-semibold text-gray-900 mb-2">設定持久化</h3>
                  <p className="text-sm text-gray-600">
                    自動保存用戶自定義設定，支持導入導出功能
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 自定義面板 */}
        {selectedFolder && (
          <FolderCustomizationPanel
            folderId={selectedFolder.id}
            folderName={selectedFolder.name}
            currentCustomization={selectedFolder.customization}
            availableThemes={availableThemes}
            availableIconSets={availableIconSets}
            onCustomizationChange={handleCustomizationChange}
            onClose={() => {
              setShowCustomizationPanel(false);
              setSelectedFolder(null);
            }}
            isVisible={showCustomizationPanel}
          />
        )}
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // 獲取可用主題和圖標集
  const availableThemes = folderCustomizationManager.getAvailableThemes();
  const availableIconSets = folderCustomizationManager.getAvailableIconSets();

  return {
    props: {
      availableThemes: JSON.parse(JSON.stringify(availableThemes)),
      availableIconSets: JSON.parse(JSON.stringify(availableIconSets))
    }
  };
};
