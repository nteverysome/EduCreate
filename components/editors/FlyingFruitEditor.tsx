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
import DragHandle from '../drag-handle';
import DuplicateButton from '../duplicate-button';

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

  return (
    <div className="space-y-4">
      {/* 操作說明 */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => setShowInstruction(!showInstruction)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
        >
          <span>📋</span>
          <span>操作說明</span>
        </button>
        {showInstruction && (
          <div className="mt-2 p-3 sm:p-4 bg-blue-50 rounded-lg text-xs sm:text-sm text-gray-700 space-y-1">
            <p>1. 在「問題」欄位輸入題目（會顯示在遊戲中央）</p>
            <p>2. 在「答案」欄位輸入選項（會顯示在飛行的水果上）</p>
            <p>3. 點擊 ✓/✗ 切換正確/錯誤答案</p>
            <p>4. 可拖動左側把手重新排序</p>
          </div>
        )}
      </div>

      {/* 欄位標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">問題 (Question)</h3>
          <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">顯示在遊戲中央</p>
        </div>
        <div className="flex-1 min-w-0 sm:ml-4">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">答案 (Answers)</h3>
          <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">顯示在飛行的水果上</p>
        </div>
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
          <div className="space-y-4">
            {questions.map((question, qIndex) => (
              <SortableQuestionItem
                key={question.id}
                question={question}
                index={qIndex}
                onUpdateText={(text) => updateQuestionText(question.id, text)}
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
      <div className="mt-6">
        <button
          onClick={addQuestion}
          disabled={questions.length >= maxQuestions}
          className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
        >
          <span className="text-lg">+</span>
          <span>新增問題</span>
          <span className="text-xs sm:text-sm text-gray-500">
            最小{minQuestions} 最大{maxQuestions}
          </span>
        </button>
      </div>
    </div>
  );
}

// 可排序的問題項目組件（類似 SortableVocabularyItem 風格）
interface SortableQuestionItemProps {
  question: QuestionItem;
  index: number;
  onUpdateText: (text: string) => void;
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
  onRemove,
  onDuplicate,
  onAddAnswer,
  onRemoveAnswer,
  onUpdateAnswer,
  onToggleCorrect,
  canRemove
}: SortableQuestionItemProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-1 sm:gap-2 relative"
    >
      {/* 項目編號 */}
      <div className="flex-shrink-0 w-6 sm:w-8 pt-2 text-gray-600 font-medium text-sm sm:text-base">
        {index + 1}.
      </div>

      {/* 問題與答案區域 */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white">
          {/* 問題輸入框 */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={question.question}
              onChange={(e) => onUpdateText(e.target.value)}
              placeholder="輸入問題..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 答案區域 */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 gap-2">
              {question.answers.map((answer, aIndex) => (
                <div key={answer.id} className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm w-4 flex-shrink-0">{String.fromCharCode(97 + aIndex)}</span>
                  <button
                    onClick={() => onToggleCorrect(answer.id)}
                    className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded border-2 transition-colors ${
                      answer.isCorrect
                        ? 'bg-green-100 border-green-500 text-green-600'
                        : 'bg-red-100 border-red-500 text-red-600'
                    }`}
                  >
                    {answer.isCorrect ? '✓' : '✗'}
                  </button>
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => onUpdateAnswer(answer.id, { text: e.target.value })}
                    placeholder="輸入答案..."
                    className="flex-1 min-w-0 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {question.answers.length > 2 && (
                    <button
                      onClick={() => onRemoveAnswer(answer.id)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-400 flex-shrink-0"
                      title="刪除答案"
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
            {/* 只有答案數少於 6 個時才顯示添加按鈕 */}
            {question.answers.length < 6 && (
              <button
                onClick={onAddAnswer}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                + 添加答案
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 操作按鈕區域 */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        {/* 拖動手柄 */}
        <DragHandle attributes={attributes} listeners={listeners} />

        {/* 複製按鈕 */}
        <DuplicateButton onClick={onDuplicate} />

        {/* 刪除按鈕 */}
        <button
          onClick={onRemove}
          disabled={!canRemove}
          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="刪除問題"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

