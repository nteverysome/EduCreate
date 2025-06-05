import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useEditorStore } from '../../store/editorStore';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import VersionControl from './VersionControl';

interface EditorToolbarProps {
  activityTitle: string;
  activityType: 'matching' | 'flashcards' | 'quiz';
  isPreviewMode: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isPublished: boolean;
  showSavedMessage: boolean;
  onSave: () => void;
  onPublish: () => void;
  onTogglePreview: () => void;
  onTitleChange: (title: string) => void;
  onOpenVersionHistory?: () => void;
  onBack?: () => void;
}

export default function EditorToolbar({
  activityTitle,
  activityType,
  isPreviewMode,
  isSaving,
  isPublishing,
  isPublished,
  showSavedMessage,
  onSave,
  onPublish,
  onTogglePreview,
  onOpenVersionHistory,
  onBack
}: EditorToolbarProps) {
  const updateActivity = useEditorStore(state => state.updateActivity);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(activityTitle);

  // 處理標題變更
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // 處理標題編輯完成
  const handleTitleBlur = () => {
    if (title.trim() !== '') {
      updateActivity({ title: title.trim() });
    } else {
      setTitle(activityTitle);
    }
    setIsEditingTitle(false);
  };

  // 處理按Enter鍵
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  // 獲取活動類型的中文名稱
  const getActivityTypeName = (type: string) => {
    switch (type) {
      case 'matching': return '配對遊戲';
      case 'flashcards': return '單字卡片';
      case 'quiz': return '測驗問答';
      default: return '活動';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {onBack ? (
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        ) : (
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        )}

        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">{getActivityTypeName(activityType)}:</span>
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyDown}
              className="border-b border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 text-lg font-medium"
              autoFocus
            />
          ) : (
            <h1
              className="text-lg font-medium cursor-pointer hover:text-blue-600"
              onClick={() => setIsEditingTitle(true)}
            >
              {activityTitle || '未命名活動'}
            </h1>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* 版本控制組件 */}
        <VersionControl />
        
        {showSavedMessage && (
          <span className="text-green-600 text-sm animate-fade-out">已保存</span>
        )}

        <button
          onClick={onTogglePreview}
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${isPreviewMode ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          {isPreviewMode ? '編輯' : '預覽'}
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? '保存中...' : '保存'}
        </button>

        <button
          onClick={onPublish}
          disabled={isPublishing || isPublished}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? '發布中...' : isPublished ? '已發布' : '發布'}
        </button>
      </div>
    </div>
  );
}