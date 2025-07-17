import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}
interface QuizTemplateProps {
  initialData?: {
    questions: QuizQuestion[];
    title?: string;
    description?: string;
    instructions?: string;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showExplanation?: boolean;
  };
  onSave?: (data: any) => void;
  previewMode?: boolean;
}
export default function QuizTemplate({
  initialData,
  onSave,
  previewMode = false
}: QuizTemplateProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '測驗問答');
  const [description, setDescription] = useState(initialData?.description || '創建互動式測驗問答，檢驗學習成果');
  const [instructions, setInstructions] = useState(initialData?.instructions || '選擇每個問題的正確答案，完成後查看您的得分');
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialData?.questions || []);
  const [shuffleQuestions, setShuffleQuestions] = useState(initialData?.shuffleQuestions ?? true);
  const [shuffleOptions, setShuffleOptions] = useState(initialData?.shuffleOptions ?? true);
  const [showExplanation, setShowExplanation] = useState(initialData?.showExplanation ?? true);
  // 新問題表單狀態
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState<number>(0);
  const [newExplanation, setNewExplanation] = useState('');
  // 處理保存
  const handleSave = () => {
    if (onSave) {
      onSave({
        title,
        description,
        instructions,
        questions,
        shuffleQuestions,
        shuffleOptions,
        showExplanation,
        type: 'quiz'
      });
    }
  };
  // 處理取消
  const handleCancel = () => {
    router.back();
  };
  // 添加問題
  const handleAddQuestion = () => {
    if (newQuestion.trim() && newOptions.filter(opt => opt.trim()).length >= 2) {
      const questionId = uuidv4();
      setQuestions([...questions, { 
        id: questionId, 
        question: newQuestion.trim(), 
        options: newOptions.filter(opt => opt.trim()),
        correctAnswer: newCorrectAnswer,
        explanation: newExplanation.trim() || undefined
      }]);
      // 重置表單
      setNewQuestion('');
      setNewOptions(['', '', '', '']);
      setNewCorrectAnswer(0);
      setNewExplanation('');
    }
  };
  // 刪除問題
  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };
  // 更新問題
  const handleUpdateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };
  // 更新選項
  const handleUpdateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };
  // 添加選項
  const handleAddOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, ''] };
      }
      return q;
    }));
  };
  // 刪除選項
  const handleDeleteOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        // 確保至少保留兩個選項
        if (q.options.length <= 2) return q;
        const newOptions = q.options.filter((_, index) => index !== optionIndex);
        // 如果刪除的是正確答案或正確答案在刪除的選項之後，需要調整正確答案索引
        let newCorrectAnswer = q.correctAnswer;
        if (optionIndex === q.correctAnswer) {
          newCorrectAnswer = 0; // 默認選擇第一個選項作為正確答案
        } else if (optionIndex < q.correctAnswer) {
          newCorrectAnswer = q.correctAnswer - 1;
        }
        return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
      }
      return q;
    }));
  };
  // 更新新問題的選項
  const handleUpdateNewOption = (index: number, value: string) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  };
  // 添加新問題的選項
  const handleAddNewOption = () => {
    if (newOptions.length < 8) { // 限制最多8個選項
      setNewOptions([...newOptions, '']);
    }
  };
  // 刪除新問題的選項
  const handleDeleteNewOption = (index: number) => {
    if (newOptions.length <= 2) return; // 至少保留兩個選項
    const updatedOptions = newOptions.filter((_, i) => i !== index);
    setNewOptions(updatedOptions);
    // 如果刪除的是正確答案或正確答案在刪除的選項之後，需要調整正確答案索引
    if (index === newCorrectAnswer) {
      setNewCorrectAnswer(0);
    } else if (index < newCorrectAnswer) {
      setNewCorrectAnswer(newCorrectAnswer - 1);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      {!previewMode && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">配置測驗問答模板</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                標題
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                使用說明
              </label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shuffleQuestions"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="shuffleQuestions" className="ml-2 block text-sm text-gray-700">
                  隨機排序問題
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shuffleOptions"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="shuffleOptions" className="ml-2 block text-sm text-gray-700">
                  隨機排序選項
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showExplanation"
                  checked={showExplanation}
                  onChange={(e) => setShowExplanation(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showExplanation" className="ml-2 block text-sm text-gray-700">
                  顯示答案解釋
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      {previewMode && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {description && <p className="text-gray-600 mb-4">{description}</p>}
          {instructions && (
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <p className="text-blue-700">{instructions}</p>
            </div>
          )}
        </div>
      )}
      {!previewMode && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">問題列表</h3>
          {questions.map((question, qIndex) => (
            <div key={question.id} className="border border-gray-200 rounded-md p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    問題 {qIndex + 1}
                  </label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => handleUpdateQuestion(question.id, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入問題"
                  />
                </div>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                  aria-label="刪除問題"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  選項
                </label>
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center mb-2">
                    <div className="flex-none mr-2">
                      <input
                        type="radio"
                        checked={question.correctAnswer === optIndex}
                        onChange={() => handleUpdateQuestion(question.id, 'correctAnswer', optIndex)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleUpdateOption(question.id, optIndex, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`選項 ${optIndex + 1}`}
                      />
                    </div>
                    {question.options.length > 2 && (
                      <button
                        onClick={() => handleDeleteOption(question.id, optIndex)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        aria-label="刪除選項"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {question.options.length < 8 && (
                  <button
                    onClick={() => handleAddOption(question.id)}
                    className="text-blue-500 hover:text-blue-700 flex items-center mt-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    添加選項
                  </button>
                )}
              </div>
              {showExplanation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    答案解釋 (可選)
                  </label>
                  <textarea
                    value={question.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(question.id, 'explanation', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="解釋為什麼這是正確答案"
                  />
                </div>
              )}
            </div>
          ))}
          <div className="border border-dashed border-gray-300 rounded-md p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">添加新問題</h4>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                問題
              </label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="輸入問題"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                選項 (選擇正確答案)
              </label>
              {newOptions.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center mb-2">
                  <div className="flex-none mr-2">
                    <input
                      type="radio"
                      checked={newCorrectAnswer === optIndex}
                      onChange={() => setNewCorrectAnswer(optIndex)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleUpdateNewOption(optIndex, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`選項 ${optIndex + 1}`}
                    />
                  </div>
                  {newOptions.length > 2 && (
                    <button
                      onClick={() => handleDeleteNewOption(optIndex)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      aria-label="刪除選項"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {newOptions.length < 8 && (
                <button
                  onClick={handleAddNewOption}
                  className="text-blue-500 hover:text-blue-700 flex items-center mt-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  添加選項
                </button>
              )}
            </div>
            {showExplanation && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  答案解釋 (可選)
                </label>
                <textarea
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="解釋為什麼這是正確答案"
                />
              </div>
            )}
            <div className="mt-3">
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!newQuestion.trim() || newOptions.filter(opt => opt.trim()).length < 2}
              >
                添加問題
              </button>
            </div>
          </div>
        </div>
      )}
      {previewMode && questions.length > 0 && (
        <div className="space-y-4">
          {questions.slice(0, 3).map((question, qIndex) => (
            <div key={question.id} className="border border-gray-200 rounded-md p-4">
              <div className="font-medium mb-2">{qIndex + 1}. {question.question}</div>
              <div className="ml-4 space-y-1">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      disabled
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2">{option}</span>
                    {optIndex === question.correctAnswer && previewMode && (
                      <span className="ml-2 text-green-600">(正確答案)</span>
                    )}
                  </div>
                ))}
              </div>
              {question.explanation && previewMode && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <span className="font-medium">解釋：</span> {question.explanation}
                </div>
              )}
            </div>
          ))}
          {questions.length > 3 && (
            <div className="text-center text-gray-500">
              預覽模式僅顯示前3個問題...
            </div>
          )}
        </div>
      )}
      {!previewMode && (
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={questions.length === 0}
          >
            保存模板
          </button>
        </div>
      )}
    </div>
  );
}
