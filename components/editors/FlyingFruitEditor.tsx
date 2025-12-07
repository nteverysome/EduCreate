'use client';

import React, { useState } from 'react';

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
    <div className="space-y-6">
      {/* + Instruction 按鈕 */}
      <button
        onClick={() => setShowInstruction(!showInstruction)}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        + Instruction
      </button>
      {showInstruction && (
        <div className="p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
          <p>1. 每個問題會顯示在遊戲中央（可以是圖片或文字）</p>
          <p>2. 答案會顯示在飛行的水果上</p>
          <p>3. 綠色勾 ✓ 表示正確答案，紅色叉 ✗ 表示錯誤答案</p>
          <p>4. 至少需要一個正確答案</p>
        </div>
      )}

      {/* 問題列表 */}
      {questions.map((question, qIndex) => (
        <QuestionCard
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

      {/* 添加問題按鈕 */}
      <button
        onClick={addQuestion}
        disabled={questions.length >= maxQuestions}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
      >
        + Add a question
        <span className="text-gray-400 ml-2">min {minQuestions} max {maxQuestions}</span>
      </button>
    </div>
  );
}

// 問題卡片組件
interface QuestionCardProps {
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

function QuestionCard({
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
}: QuestionCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* 問題頭部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Question</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">{index + 1}.</span>
            <input
              type="text"
              value={question.question}
              onChange={(e) => onUpdateText(e.target.value)}
              placeholder="輸入問題..."
              className="flex-1 px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button className="p-2 hover:bg-gray-100 rounded" title="語音">🎤</button>
            <button className="p-2 hover:bg-gray-100 rounded" title="圖片">🖼️</button>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button className="p-1 hover:bg-gray-100 rounded text-gray-400" title="移動">⇅</button>
          <button onClick={onDuplicate} className="p-1 hover:bg-gray-100 rounded text-gray-400" title="複製">📋</button>
          <button
            onClick={onRemove}
            disabled={!canRemove}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30"
            title="刪除"
          >🗑️</button>
        </div>
      </div>

      {/* 答案區域 */}
      <div className="ml-6">
        <label className="text-xs text-gray-500 mb-2 block">Answers</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {question.answers.map((answer, aIndex) => (
            <div key={answer.id} className="flex items-center gap-2">
              <span className="text-gray-500 text-sm w-4">{String.fromCharCode(97 + aIndex)}</span>
              <button
                onClick={() => onToggleCorrect(answer.id)}
                className={`w-6 h-6 flex items-center justify-center rounded border-2 ${
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
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button className="p-1 hover:bg-gray-100 rounded text-gray-400" title="圖片">🖼️</button>
              {question.answers.length > 2 && (
                <button
                  onClick={() => onRemoveAnswer(answer.id)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400"
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
            + Add more answers
          </button>
        )}
      </div>
    </div>
  );
}

