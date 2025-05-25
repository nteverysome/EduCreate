import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useEditorStore, EditorElement } from '../../store/editorStore';
import EditorToolbar from './EditorToolbar';
import EditorCanvas from './EditorCanvas';
import EditorSidebar from './EditorSidebar';
import EditorPreview from './EditorPreview';
import VersionHistory from './VersionHistory';
import { toast } from 'react-hot-toast';

interface ActivityEditorProps {
  activityId?: string;
  templateId?: string;
  templateType?: 'matching' | 'flashcards' | 'quiz';
}

export default function ActivityEditor({ activityId, templateId, templateType }: ActivityEditorProps) {
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
    togglePreviewMode
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
    state.togglePreviewMode
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // 監聽未保存更改
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // 初始化編輯器
  useEffect(() => {
    const initEditor = async () => {
      if (activityId) {
        // 加載現有活動
        await loadActivity(activityId);
      } else if (templateType) {
        // 基於模板創建新活動
        createActivity(templateType, templateId);
      }
    };

    initEditor();
  }, [activityId, templateId, templateType, createActivity, loadActivity]);

  // 配置拖放感應器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 需要移動5像素才會觸發拖動
      },
    })
  );

  // 處理拖動開始
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    selectElement(active.id as string);
  }, [selectElement]);

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
    try {
      const success = await saveActivity();
      if (success) {
        setShowSavedMessage(true);
        setLastSaveTime(new Date());
        setTimeout(() => setShowSavedMessage(false), 2000);
      } else {
        toast.error('保存失敗');
      }
    } catch (error) {
      console.error('保存失敗:', error);
      toast.error('保存失敗');
    } finally {
      setIsSaving(false);
    }
  };

  // 處理發布
  const handlePublish = async () => {
    if (!currentActivity) return;
    
    setIsPublishing(true);
    try {
      const success = await publishActivity();
      if (success) {
        router.push(`/activity/${currentActivity.id}`);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // 處理預覽切換
  const handleTogglePreview = () => {
    togglePreviewMode();
  };
  
  // 處理版本恢復後的操作
  const handleVersionRestore = async () => {
    // 重新加載活動
    if (activityId) {
      await loadActivity(activityId);
      toast.success('已成功恢復到選定版本');
    }
  };
  
  // 打開版本歷史對話框
  const openVersionHistory = () => {
    setShowVersionHistory(true);
  };
  
  // 關閉版本歷史對話框
  const closeVersionHistory = () => {
    setShowVersionHistory(false);
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
      {/* 編輯器工具欄 */}
        <EditorToolbar
          activityTitle={currentActivity?.title || ''}
          activityType={currentActivity?.type || 'matching'}
          isPreviewMode={previewMode}
          isSaving={isSaving}
          isPublishing={isPublishing}
          showSavedMessage={showSavedMessage}
          onSave={handleSave}
          onPublish={() => {}}
          onTogglePreview={togglePreviewMode}
          onTitleChange={handleTitleChange}
          onOpenVersionHistory={openVersionHistory}
        />

      <div className="flex flex-1 overflow-hidden">
        {previewMode ? (
          <EditorPreview />
        ) : (
          <>
            {/* 左側工具欄 */}
            <EditorSidebar activityType={currentActivity.type} />

            {/* 主編輯區域 */}
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <EditorCanvas
                elements={currentActivity.elements}
                selectedElementId={selectedElementId}
              />
            </DndContext>
          </>
        )}
      </div>
      
      {/* 版本歷史對話框 */}
      {activityId && (
        <VersionHistory
          activityId={activityId}
          onVersionRestore={handleVersionRestore}
          isOpen={showVersionHistory}
          onClose={closeVersionHistory}
        />
      )}
    </div>
  );
}