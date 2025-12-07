'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import InputWithImage from '../input-with-image';
import ImagePicker from '../image-picker';
import ImageEditor from '../image-editor';
import AddSoundDialog from '../tts/AddSoundDialog';
import AudioPreviewDialog from '../tts/AudioPreviewDialog';

// 答案項目接口
export interface AnswerItem {
  id: string;
  text: string;
  isCorrect: boolean;
  imageUrl?: string;
}

// 問題項目接口
export interface QuestionItem {
  id: string;
  question: string;
  questionImageUrl?: string;
  questionAudioUrl?: string;
  answers: AnswerItem[];
}

interface FlyingFruitEditorProps {
  questions: QuestionItem[];
  onChange: (questions: QuestionItem[]) => void;
  minQuestions?: number;
  maxQuestions?: number;
}

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function FlyingFruitEditor({
  questions,
  onChange,
  minQuestions = 1,
  maxQuestions = 100
}: FlyingFruitEditorProps) {
  const [showInstruction, setShowInstruction] = useState(false);

  // 拖拽排序
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over.id);
      onChange(arrayMove(questions, oldIndex, newIndex));
    }
  };

  // 添加新問題（默認 6 個答案）
  const addQuestion = () => {
    if (questions.length >= maxQuestions) return;
    const newQuestion: QuestionItem = {
      id: generateId(),
      question: '',
      answers: [
        { id: generateId(), text: '', isCorrect: true },
        { id: generateId(), text: '', isCorrect: false },
        { id: generateId(), text: '', isCorrect: false },
        { id: generateId(), text: '', isCorrect: false },
        { id: generateId(), text: '', isCorrect: false },
        { id: generateId(), text: '', isCorrect: false }
      ]
    };
    onChange([...questions, newQuestion]);
  };

  // 刪除問題
  const removeQuestion = (questionId: string) => {
    if (questions.length <= minQuestions) return;
    onChange(questions.filter(q => q.id !== questionId));
  };

  // 複製問題
  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = questions.find(q => q.id === questionId);
    if (!questionToDuplicate || questions.length >= maxQuestions) return;
    const newQuestion: QuestionItem = {
      ...questionToDuplicate,
      id: generateId(),
      answers: questionToDuplicate.answers.map(a => ({ ...a, id: generateId() }))
    };
    const index = questions.findIndex(q => q.id === questionId);
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    onChange(newQuestions);
  };

  // 更新問題文字
  const updateQuestionText = (questionId: string, text: string) => {
    onChange(questions.map(q => q.id === questionId ? { ...q, question: text } : q));
  };

  // 添加答案（最多 6 個）
  const addAnswer = (questionId: string) => {
    onChange(questions.map(q => {
      if (q.id !== questionId) return q;
      if (q.answers.length >= 6) return q; // 最多 6 個答案
      return {
        ...q,
        answers: [...q.answers, { id: generateId(), text: '', isCorrect: false }]
      };
    }));
  };

  // 刪除答案
  const removeAnswer = (questionId: string, answerId: string) => {
    onChange(questions.map(q => {
      if (q.id !== questionId) return q;
      if (q.answers.length <= 2) return q; // 至少保留2個答案
      return { ...q, answers: q.answers.filter(a => a.id !== answerId) };
    }));
  };

  // 更新答案
  const updateAnswer = (questionId: string, answerId: string, updates: Partial<AnswerItem>) => {
    onChange(questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        answers: q.answers.map(a => a.id === answerId ? { ...a, ...updates } : a)
      };
    }));
  };

  // 切換正確答案
  const toggleCorrectAnswer = (questionId: string, answerId: string) => {
    onChange(questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        answers: q.answers.map(a => ({
          ...a,
          isCorrect: a.id === answerId ? !a.isCorrect : a.isCorrect
        }))
      };
    }));
  };

  // 更新問題圖片
  const updateQuestionImage = (questionId: string, imageUrl?: string) => {
    onChange(questions.map(q => q.id === questionId ? { ...q, questionImageUrl: imageUrl } : q));
  };

  // 更新問題語音
  const updateQuestionAudio = (questionId: string, audioUrl?: string) => {
    onChange(questions.map(q => q.id === questionId ? { ...q, questionAudioUrl: audioUrl } : q));
  };

  return (
    <div className="space-y-2">
      {/* 操作說明 */}
      <div className="mb-4">
        <button
          onClick={() => setShowInstruction(!showInstruction)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          <span>📋</span>
          <span>操作說明</span>
        </button>
        {showInstruction && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs sm:text-sm text-gray-700 space-y-1">
            <p>1. 在「Question」欄位輸入題目（會顯示在遊戲中央）</p>
            <p>2. 在「Answers」欄位輸入選項（會顯示在飛行的水果上）</p>
            <p>3. 點擊 ✓/✗ 切換正確/錯誤答案</p>
            <p>4. 可拖動右上角圖標重新排序</p>
          </div>
        )}
      </div>

      {/* 問題列表 - 可拖拽排序 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questions}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {questions.map((question, qIndex) => (
              <SortableQuestionItem
                key={question.id}
                question={question}
                index={qIndex}
                onUpdateText={(text) => updateQuestionText(question.id, text)}
                onUpdateQuestionImage={(imageUrl) => updateQuestionImage(question.id, imageUrl)}
                onUpdateQuestionAudio={(audioUrl) => updateQuestionAudio(question.id, audioUrl)}
                onRemove={() => removeQuestion(question.id)}
                onDuplicate={() => duplicateQuestion(question.id)}
                onAddAnswer={() => addAnswer(question.id)}
                onRemoveAnswer={(answerId) => removeAnswer(question.id, answerId)}
                onUpdateAnswer={(answerId, updates) => updateAnswer(question.id, answerId, updates)}
                onToggleCorrect={(answerId) => toggleCorrectAnswer(question.id, answerId)}
                canRemove={questions.length > minQuestions}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 添加問題按鈕 */}
      <div className="mt-4">
        <button
          onClick={addQuestion}
          disabled={questions.length >= maxQuestions}
          className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
        >
          + Add a question
        </button>
      </div>
    </div>
  );
}

// 可排序的問題項目組件（Wordwall 風格）
interface SortableQuestionItemProps {
  question: QuestionItem;
  index: number;
  onUpdateText: (text: string) => void;
  onUpdateQuestionImage: (imageUrl?: string) => void;
  onUpdateQuestionAudio: (audioUrl?: string) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onAddAnswer: () => void;
  onRemoveAnswer: (answerId: string) => void;
  onUpdateAnswer: (answerId: string, updates: Partial<AnswerItem>) => void;
  onToggleCorrect: (answerId: string) => void;
  canRemove: boolean;
}

function SortableQuestionItem({
  question,
  index,
  onUpdateText,
  onUpdateQuestionImage,
  onUpdateQuestionAudio,
  onRemove,
  onDuplicate,
  onAddAnswer,
  onRemoveAnswer,
  onUpdateAnswer,
  onToggleCorrect,
  canRemove
}: SortableQuestionItemProps) {
  // 問題圖片相關狀態
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 語音相關狀態
  const [showAddSoundDialog, setShowAddSoundDialog] = useState(false);
  const [showAudioPreview, setShowAudioPreview] = useState(false);

  // 答案圖片相關狀態
  const [showAnswerImagePicker, setShowAnswerImagePicker] = useState<string | null>(null);
  const [showAnswerImageEditor, setShowAnswerImageEditor] = useState<string | null>(null);
  const [baseAnswerImageUrl, setBaseAnswerImageUrl] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 處理圖片選擇
  const handleImageSelect = async (images: any[]) => {
    if (images.length > 0) {
      const selectedImage = images[0];
      setShowImagePicker(false);

      // 使用圖片 URL（Unsplash 或上傳的圖片）
      const imageUrl = selectedImage.url;

      // 為了避免 CORS 問題，我們通過代理下載圖片
      try {
        const response = await fetch(imageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setBaseImageUrl(blobUrl);
        } else {
          // 如果代理失敗，直接使用原始 URL
          setBaseImageUrl(imageUrl);
        }
      } catch (error) {
        console.warn('圖片代理失敗，使用原始 URL:', error);
        setBaseImageUrl(imageUrl);
      }

      onUpdateQuestionImage(imageUrl);
    }
  };

  // 處理圖片編輯
  const handleImageEdit = async (editedBlob: Blob, editedUrl: string) => {
    setShowImageEditor(false);
    setIsGenerating(true);

    try {
      // 立即更新預覽
      onUpdateQuestionImage(editedUrl);

      // 上傳圖片到 Vercel Blob
      const formData = new FormData();
      formData.append('file', editedBlob, `flying-fruit-q-${question.id}-${Date.now()}.png`);

      const uploadResponse = await fetch('/api/images/upload-test', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json() as any;
        const imageData = uploadData.image || uploadData;
        console.log('✅ 圖片上傳成功:', imageData);
        onUpdateQuestionImage(imageData.url);
        URL.revokeObjectURL(editedUrl);
      } else {
        console.error('❌ 圖片上傳失敗:', uploadResponse.status);
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error('❌ 錯誤詳情:', errorData);
        alert(`圖片上傳失敗: ${(errorData as any).error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('❌ 圖片處理失敗:', error);
      alert('圖片處理失敗，請重試');
    } finally {
      setIsGenerating(false);
    }
  };

  // 處理圖片移除
  const handleImageRemove = () => {
    onUpdateQuestionImage(undefined);
    setShowImageEditor(false);
  };

  // 處理語音生成
  const handleSoundGenerated = (audioUrl: string) => {
    onUpdateQuestionAudio(audioUrl);
    setShowAddSoundDialog(false);
  };

  // 處理語音移除
  const handleAudioRemove = () => {
    onUpdateQuestionAudio(undefined);
    setShowAudioPreview(false);
  };

  // 處理答案圖片選擇
  const handleAnswerImageSelect = async (images: any[], answerId: string) => {
    if (images.length > 0) {
      const selectedImage = images[0];
      setShowAnswerImagePicker(null);

      const imageUrl = selectedImage.url;

      // 為了避免 CORS 問題，我們通過代理下載圖片
      try {
        const response = await fetch(imageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setBaseAnswerImageUrl(blobUrl);
        } else {
          setBaseAnswerImageUrl(imageUrl);
        }
      } catch (error) {
        console.warn('圖片代理失敗，使用原始 URL:', error);
        setBaseAnswerImageUrl(imageUrl);
      }

      onUpdateAnswer(answerId, { imageUrl });
    }
  };

  // 處理答案圖片編輯
  const handleAnswerImageEdit = async (editedBlob: Blob, editedUrl: string, answerId: string) => {
    setShowAnswerImageEditor(null);
    setIsGenerating(true);

    try {
      // 立即更新預覽
      onUpdateAnswer(answerId, { imageUrl: editedUrl });

      // 上傳圖片到 Vercel Blob
      const formData = new FormData();
      formData.append('file', editedBlob, `flying-fruit-a-${answerId}-${Date.now()}.png`);

      const uploadResponse = await fetch('/api/images/upload-test', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json() as any;
        const imageData = uploadData.image || uploadData;
        console.log('✅ 答案圖片上傳成功:', imageData);
        onUpdateAnswer(answerId, { imageUrl: imageData.url });
        URL.revokeObjectURL(editedUrl);
      } else {
        console.error('❌ 答案圖片上傳失敗:', uploadResponse.status);
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error('❌ 錯誤詳情:', errorData);
        alert(`圖片上傳失敗: ${(errorData as any).error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('❌ 答案圖片處理失敗:', error);
      alert('圖片處理失敗，請重試');
    } finally {
      setIsGenerating(false);
    }
  };

  // 處理答案圖片移除
  const handleAnswerImageRemove = (answerId: string) => {
    onUpdateAnswer(answerId, { imageUrl: undefined });
    setShowAnswerImageEditor(null);
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-6">
      {/* Question 標籤和操作按鈕 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Question</span>
        <div className="flex items-center gap-1">
          {/* 拖動手柄 */}
          <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-gray-100 rounded text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          {/* 複製按鈕 */}
          <button onClick={onDuplicate} className="p-1 hover:bg-gray-100 rounded text-gray-400" title="複製">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          {/* 刪除按鈕 */}
          <button
            onClick={onRemove}
            disabled={!canRemove}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30"
            title="刪除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 問題輸入框行 - 使用 InputWithImage 組件 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-600 font-medium w-6">{index + 1}.</span>
        <div className="flex-1">
          <InputWithImage
            value={question.question}
            onChange={onUpdateText}
            placeholder="輸入文字..."
            imageUrl={question.questionImageUrl}
            onImageIconClick={() => setShowImagePicker(true)}
            onThumbnailClick={() => setShowImageEditor(true)}
            onAddSoundClick={() => setShowAddSoundDialog(true)}
            hasAudio={!!question.questionAudioUrl}
            audioUrl={question.questionAudioUrl}
            onAudioThumbnailClick={() => setShowAudioPreview(true)}
            disabled={isGenerating}
          />
        </div>
      </div>

      {/* 圖片選擇器 */}
      {showImagePicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
          multiple={false}
          initialSearchQuery={question.question}
        />
      )}

      {/* 圖片編輯器 */}
      {showImageEditor && question.questionImageUrl && (
        <ImageEditor
          imageUrl={baseImageUrl || question.questionImageUrl}
          onSave={handleImageEdit}
          onClose={() => setShowImageEditor(false)}
          onRemove={handleImageRemove}
          enableTextOverlay={false}
          onTextOverlayChange={() => {}}
          textToOverlay=""
        />
      )}

      {/* 語音添加對話框 */}
      {showAddSoundDialog && (
        <AddSoundDialog
          isOpen={showAddSoundDialog}
          onClose={() => setShowAddSoundDialog(false)}
          text={question.question}
          onSoundGenerated={handleSoundGenerated}
        />
      )}

      {/* 語音預覽對話框 */}
      {showAudioPreview && question.questionAudioUrl && (
        <AudioPreviewDialog
          isOpen={showAudioPreview}
          onClose={() => setShowAudioPreview(false)}
          audioUrl={question.questionAudioUrl}
          text={question.question}
          onRemove={handleAudioRemove}
        />
      )}

      {/* Answers 標籤 */}
      <div className="ml-8 mb-2">
        <span className="text-sm text-gray-500">Answers</span>
      </div>

      {/* 答案網格 - 2 列 */}
      <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        {question.answers.map((answer, aIndex) => (
          <div key={answer.id} className="flex items-center gap-2">
            {/* 字母標籤 */}
            <span className="text-gray-500 text-sm w-4">{String.fromCharCode(97 + aIndex)}</span>
            {/* 正確/錯誤切換按鈕 */}
            <button
              onClick={() => onToggleCorrect(answer.id)}
              className={`w-7 h-7 flex items-center justify-center rounded border-2 font-bold transition-colors flex-shrink-0 ${
                answer.isCorrect
                  ? 'bg-green-100 border-green-500 text-green-600'
                  : 'bg-red-100 border-red-500 text-red-600'
              }`}
            >
              {answer.isCorrect ? '✓' : '✗'}
            </button>
            {/* 圖片縮圖 */}
            {answer.imageUrl && (
              <button
                onClick={() => {
                  setBaseAnswerImageUrl(answer.imageUrl || null);
                  setShowAnswerImageEditor(answer.id);
                }}
                className="relative w-8 h-8 rounded border border-gray-300 overflow-hidden hover:border-blue-500 transition-colors flex-shrink-0"
                title="編輯圖片"
              >
                <img src={answer.imageUrl} alt="answer" className="w-full h-full object-cover" />
              </button>
            )}
            {/* 答案輸入框 - 可選 */}
            <input
              type="text"
              value={answer.text}
              onChange={(e) => onUpdateAnswer(answer.id, { text: e.target.value })}
              placeholder={answer.imageUrl ? "可選文字..." : "輸入答案..."}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {/* 圖片按鈕 */}
            <button
              onClick={() => setShowAnswerImagePicker(answer.id)}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 flex-shrink-0"
              title="添加圖片"
              disabled={isGenerating}
            >
              🖼️
            </button>
            {/* 刪除答案按鈕 */}
            <button
              onClick={() => onRemoveAnswer(answer.id)}
              disabled={question.answers.length <= 2}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30 flex-shrink-0"
              title="刪除答案"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 添加更多答案按鈕 */}
      {question.answers.length < 6 && (
        <div className="ml-8 mt-2">
          <button
            onClick={onAddAnswer}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add more answers
          </button>
        </div>
      )}

      {/* 答案圖片選擇器 */}
      {showAnswerImagePicker && (
        <ImagePicker
          onSelect={(images) => handleAnswerImageSelect(images, showAnswerImagePicker)}
          onClose={() => setShowAnswerImagePicker(null)}
          multiple={false}
          initialSearchQuery={question.answers.find(a => a.id === showAnswerImagePicker)?.text || ''}
        />
      )}

      {/* 答案圖片編輯器 */}
      {showAnswerImageEditor && (
        <ImageEditor
          imageUrl={baseAnswerImageUrl || question.answers.find(a => a.id === showAnswerImageEditor)?.imageUrl || ''}
          onSave={(blob, url) => handleAnswerImageEdit(blob, url, showAnswerImageEditor)}
          onClose={() => setShowAnswerImageEditor(null)}
          onRemove={() => handleAnswerImageRemove(showAnswerImageEditor)}
          enableTextOverlay={false}
          onTextOverlayChange={() => {}}
          textToOverlay=""
        />
      )}
    </div>
  );
}

