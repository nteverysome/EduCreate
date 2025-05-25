import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { DragEndEvent } from '@dnd-kit/core';
import { useEditorStore, EditorElement } from '../../store/editorStore';
import EditorToolbar from './EditorToolbar';
import EditorSidebar from './EditorSidebar';
import EditorPreview from './EditorPreview';
import EnhancedDragDropEditor from './EnhancedDragDropEditor';

interface ImprovedActivityEditorProps {
  activityId?: string;
  templateId?: string;
  templateType?: 'matching' | 'flashcards' | 'quiz';
}

export default function ImprovedActivityEditor({ activityId, templateId, templateType }: ImprovedActivityEditorProps) {
  const router = useRouter();
  const [
    currentActivity,
    selectedElementId,
    previewMode,
    createActivity,
    loadActivity,
    saveActivity,
    publishActivity,
    selectElement,
    moveElement,
    togglePreviewMode,
    isDirty
  ] = useEditorStore(state => [
    state.currentActivity,
    state.selectedElementId,
    state.previewMode,
    state.createActivity,
    state.loadActivity,
    state.saveActivity,
    state.publishActivity,
    state.selectElement,
    state.moveElement,
    state.togglePreviewMode,
    state.isDirty
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [showPublishedMessage, setShowPublishedMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 初始化編輯器
  useEffect(() => {
    const initEditor = async () => {
      try {
        if (activityId) {
          // 加載現有活動
          const success = await loadActivity(activityId);
          if (!success) {
            setErrorMessage('無法加載活動，請稍後再試');
          }
        } else if (templateType) {
          // 基於模板創建新活動
          createActivity(templateType, templateId);
        }
      } catch (error) {
        console.error('初始化編輯器失敗:', error);
        setErrorMessage('初始化編輯器失敗，請稍後再試');
      }
    };

    initEditor();
  }, [activityId, templateId, templateType, createActivity, loadActivity]);

  // 處理拖動結束
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    
    // 獲取當前選中元素
    const element = currentActivity?.elements.find(el => el.id === active.id);
    if (!element) return;
    
    // 計算新位置
    const newPosition = {
      x: element.position.x + delta.x,
      y: element.position.y + delta.y
    };
    
    // 更新元素位置
    moveElement(element.id, newPosition);
  }, [currentActivity, moveElement]);

  // 處理保存
  const handleSave = async () => {
    if (!currentActivity) return;
    
    setIsSaving(true);
    setErrorMessage(null);
    
    try {
      const success = await saveActivity();
      
      if (success) {
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 3000);
      } else {
        setErrorMessage('保存失敗，請稍後再試');
      }
    } catch (error) {
      console.error('保存活動失敗:', error);
      setErrorMessage('保存失敗，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  };

  // 處理發布
  const handlePublish = async () => {
    if (!currentActivity) return;
    
    setIsPublishing(true);
    setErrorMessage(null);
    
    try {
      const success = await publishActivity();
      
      if (success) {
        setShowPublishedMessage(true);
        setTimeout(() => setShowPublishedMessage(false), 3000);
        
        // 發布成功後跳轉到活動頁面
        router.push(`/activity/${currentActivity.id}`);
      } else {
        setErrorMessage('發布失敗，請稍後再試');
      }
    } catch (error) {
      console.error('發布活動失敗:', error);
      setErrorMessage('發布失敗，請稍後再試');
    } finally {
      setIsPublishing(false);
    }
  };

  // 處理預覽切換
  const handleTogglePreview = () => {
    togglePreviewMode();
  };

  // 處理返回
  const handleBack = () => {
    if (isDirty) {
      if (confirm('您有未保存的更改，確定要離開嗎？')) {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  };

  if (!currentActivity) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 工具欄 */}
      <EditorToolbar
        activityTitle={currentActivity.title}
        isPreviewMode={previewMode}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSave={handleSave}
        onPublish={handlePublish}
        onTogglePreview={handleTogglePreview}
        onBack={handleBack}
      />
      
      {/* 主要編輯區域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 側邊欄 */}
        {!previewMode && (
          <EditorSidebar activityType={currentActivity.type} />
        )}
        
        {/* 編輯器/預覽 */}
        <div className="flex-1 overflow-auto">
          {previewMode ? (
            <EditorPreview activity={currentActivity} />
          ) : (
            <EnhancedDragDropEditor
              elements={currentActivity.elements}
              selectedElementId={selectedElementId}
              onDragEnd={handleDragEnd}
              layout={currentActivity.type === 'matching' ? 'horizontal' : 'vertical'}
            />
          )}
        </div>
      </div>
      
      {/* 通知消息 */}
      {showSavedMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
          活動已保存
        </div>
      )}
      
      {showPublishedMessage && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
          活動已發布
        </div>
      )}
      
      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
}