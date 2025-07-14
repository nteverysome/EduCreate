/**
 * 內容編輯器頁面
 * 提供富文本編輯和內容管理功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

interface Document {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'game' | 'activity' | 'lesson';
  lastModified: Date;
  wordCount: number;
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  tags: string[];
}

export default function ContentEditorPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // 模擬文檔數據
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: 'doc_1',
        title: '基礎英語單字教學',
        content: '這是一個基礎英語單字教學內容...',
        type: 'lesson',
        lastModified: new Date(Date.now() - 300000), // 5分鐘前
        wordCount: 245,
        geptLevel: 'elementary',
        tags: ['英語', '單字', '基礎']
      },
      {
        id: 'doc_2',
        title: '配對遊戲設計',
        content: '配對遊戲的設計理念和實現方法...',
        type: 'game',
        lastModified: new Date(Date.now() - 600000), // 10分鐘前
        wordCount: 189,
        geptLevel: 'intermediate',
        tags: ['遊戲', '配對', '設計']
      },
      {
        id: 'doc_3',
        title: '學習活動規劃',
        content: '如何規劃有效的學習活動...',
        type: 'activity',
        lastModified: new Date(Date.now() - 900000), // 15分鐘前
        wordCount: 312,
        geptLevel: 'high-intermediate',
        tags: ['活動', '規劃', '學習']
      }
    ];
    
    setDocuments(mockDocuments);
  }, []);

  // 模擬自動保存
  useEffect(() => {
    if (isEditing && content) {
      setAutoSaveStatus('saving');
      const timer = setTimeout(() => {
        setAutoSaveStatus('saved');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [content, isEditing]);

  // 創建新文檔
  const createNewDocument = () => {
    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      title: '新文檔',
      content: '',
      type: 'text',
      lastModified: new Date(),
      wordCount: 0,
      tags: []
    };
    
    setDocuments([newDoc, ...documents]);
    setSelectedDoc(newDoc);
    setTitle(newDoc.title);
    setContent(newDoc.content);
    setIsEditing(true);
  };

  // 選擇文檔
  const selectDocument = (doc: Document) => {
    setSelectedDoc(doc);
    setTitle(doc.title);
    setContent(doc.content);
    setIsEditing(false);
  };

  // 開始編輯
  const startEditing = () => {
    setIsEditing(true);
  };

  // 保存文檔
  const saveDocument = () => {
    if (selectedDoc) {
      const updatedDoc = {
        ...selectedDoc,
        title,
        content,
        lastModified: new Date(),
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length
      };
      
      setDocuments(docs => docs.map(doc => 
        doc.id === selectedDoc.id ? updatedDoc : doc
      ));
      
      setSelectedDoc(updatedDoc);
      setIsEditing(false);
      setAutoSaveStatus('saved');
    }
  };

  // 格式化時間
  const formatTime = (date: Date): string => {
    return date.toLocaleString('zh-TW');
  };

  // 獲取類型標籤顏色
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'game': return 'bg-green-100 text-green-800';
      case 'activity': return 'bg-purple-100 text-purple-800';
      case 'text': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取 GEPT 等級顏色
  const getGeptColor = (level?: string): string => {
    switch (level) {
      case 'elementary': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'high-intermediate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 統一導航系統 */}
      <UnifiedNavigation variant="header" />

      <div className="flex h-screen pt-16">
        {/* 文檔列表側邊欄 */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto" data-testid="document-sidebar">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">我的文檔</h2>
              <button
                onClick={createNewDocument}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                data-testid="create-document-button"
              >
                新建
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              共 {documents.length} 個文檔
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => selectDocument(doc)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedDoc?.id === doc.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                }`}
                data-testid={`document-item-${doc.id}`}
              >
                <h3 className="font-medium text-gray-900 mb-2">{doc.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.content || '空白文檔'}</p>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(doc.type)}`}>
                    {doc.type}
                  </span>
                  {doc.geptLevel && (
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getGeptColor(doc.geptLevel)}`}>
                      {doc.geptLevel}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  <div>{doc.wordCount} 字 • {formatTime(doc.lastModified)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 編輯器主區域 */}
        <div className="flex-1 flex flex-col">
          {selectedDoc ? (
            <>
              {/* 編輯器工具欄 */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-xl font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                        data-testid="document-title-input"
                      />
                    ) : (
                      <h1 className="text-xl font-semibold text-gray-900" data-testid="document-title">
                        {selectedDoc.title}
                      </h1>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(selectedDoc.type)}`}>
                        {selectedDoc.type}
                      </span>
                      {selectedDoc.geptLevel && (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getGeptColor(selectedDoc.geptLevel)}`}>
                          {selectedDoc.geptLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* 自動保存狀態 */}
                    <div className="flex items-center space-x-2 text-sm">
                      {autoSaveStatus === 'saved' && (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600">已保存</span>
                        </>
                      )}
                      {autoSaveStatus === 'saving' && (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-yellow-600">保存中...</span>
                        </>
                      )}
                      {autoSaveStatus === 'error' && (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-600">保存失敗</span>
                        </>
                      )}
                    </div>

                    {/* 編輯按鈕 */}
                    {isEditing ? (
                      <button
                        onClick={saveDocument}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        data-testid="save-document-button"
                      >
                        保存
                      </button>
                    ) : (
                      <button
                        onClick={startEditing}
                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                        data-testid="edit-document-button"
                      >
                        編輯
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 編輯器內容區域 */}
              <div className="flex-1 p-6">
                {isEditing ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="開始輸入您的內容..."
                    className="w-full h-full resize-none border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    data-testid="content-editor"
                  />
                ) : (
                  <div className="w-full h-full bg-white border border-gray-300 rounded-lg p-4" data-testid="content-preview">
                    {selectedDoc.content ? (
                      <div className="whitespace-pre-wrap">{selectedDoc.content}</div>
                    ) : (
                      <div className="text-gray-500 italic">此文檔為空白，點擊編輯開始創作</div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* 空狀態 */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2" data-testid="empty-state-title">
                  選擇一個文檔開始編輯
                </h2>
                <p className="text-gray-600 mb-6">
                  從左側選擇現有文檔，或創建新文檔開始您的創作
                </p>
                <button
                  onClick={createNewDocument}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  data-testid="empty-state-create-button"
                >
                  創建新文檔
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 返回導航 */}
      <div className="fixed bottom-6 right-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors shadow-lg"
          data-testid="back-to-dashboard-float"
        >
          <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          儀表板
        </Link>
      </div>
    </div>
  );
}
