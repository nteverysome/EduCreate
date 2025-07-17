import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
interface MatchingItem {
  id: string;
  content: string;
}
interface MatchingTemplateProps {
  initialData?: {
    questions: MatchingItem[];
    answers: MatchingItem[];
    title?: string;
    description?: string;
    instructions?: string;
  };
  onSave?: (data: any) => void;
  previewMode?: boolean;
}
export default function MatchingTemplate({
  initialData,
  onSave,
  previewMode = false
}: MatchingTemplateProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '配對遊戲');
  const [description, setDescription] = useState(initialData?.description || '創建一個互動式配對遊戲，幫助學生建立概念聯繫');
  const [instructions, setInstructions] = useState(initialData?.instructions || '將左側的問題與右側的答案進行配對');
  const [questions, setQuestions] = useState<MatchingItem[]>(initialData?.questions || []);
  const [answers, setAnswers] = useState<MatchingItem[]>(initialData?.answers || []);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  // 處理保存
  const handleSave = () => {
    if (onSave) {
      onSave({
        title,
        description,
        instructions,
        questions,
        answers,
        type: 'matching'
      });
    }
  };
  // 處理取消
  const handleCancel = () => {
    router.back();
  };
  // 添加配對項
  const handleAddPair = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      const questionId = uuidv4();
      const answerId = uuidv4();
      setQuestions([...questions, { id: questionId, content: newQuestion.trim() }]);
      setAnswers([...answers, { id: answerId, content: newAnswer.trim() }]);
      setNewQuestion('');
      setNewAnswer('');
    }
  };
  // 刪除配對項
  const handleDeletePair = (index: number) => {
    const updatedQuestions = [...questions];
    const updatedAnswers = [...answers];
    updatedQuestions.splice(index, 1);
    updatedAnswers.splice(index, 1);
    setQuestions(updatedQuestions);
    setAnswers(updatedAnswers);
  };
  // 更新問題
  const handleUpdateQuestion = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], content: value };
    setQuestions(updatedQuestions);
  };
  // 更新答案
  const handleUpdateAnswer = (index: number, value: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = { ...updatedAnswers[index], content: value };
    setAnswers(updatedAnswers);
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      {!previewMode && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">配置配對遊戲模板</h2>
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
          <h3 className="text-lg font-medium text-gray-900 mb-3">配對項目</h3>
          {questions.map((question, index) => (
            <div key={question.id} className="flex items-center space-x-4 mb-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={question.content}
                  onChange={(e) => handleUpdateQuestion(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="問題"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={answers[index]?.content || ''}
                  onChange={(e) => handleUpdateAnswer(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="答案"
                />
              </div>
              <button
                onClick={() => handleDeletePair(index)}
                className="text-red-500 hover:text-red-700"
                aria-label="刪除配對項"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex-1">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="新問題"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="新答案"
              />
            </div>
            <button
              onClick={handleAddPair}
              className="text-blue-500 hover:text-blue-700"
              aria-label="添加配對項"
              disabled={!newQuestion.trim() || !newAnswer.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {previewMode && questions.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">問題</h3>
            <div className="space-y-2">
              {questions.map((question) => (
                <div key={question.id} className="p-3 bg-gray-100 rounded-md">
                  {question.content}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">答案</h3>
            <div className="space-y-2">
              {answers.map((answer) => (
                <div key={answer.id} className="p-3 bg-gray-100 rounded-md">
                  {answer.content}
                </div>
              ))}
            </div>
          </div>
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
