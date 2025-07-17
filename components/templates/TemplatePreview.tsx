import { useState } from 'react';
import { useRouter } from 'next/router';
import MatchingGame from '../games/MatchingGame';
import FlashcardGame from '../games/FlashcardGame';
import QuizGame from '../games/QuizGame';

interface TemplatePreviewProps {
  templateType: string;
  previewData: any;
  onSave: () => void;
  onEdit: () => void;
}

const TemplatePreview = ({ templateType, previewData, onSave, onEdit }: TemplatePreviewProps) {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState<'student' | 'teacher'>('student');

  // 渲染預覽內容
  const renderPreview = () => {
    if (!previewData) return null;

    switch (templateType) {
      case 'matching':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{previewData.title}</h2>
            {previewData.description && (
              <p className="text-gray-600 mb-4">{previewData.description}</p>
            )}
            {previewData.instructions && (
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <p className="text-blue-700">{previewData.instructions}</p>
              </div>
            )}
            <MatchingGame items={{
              questions: previewData.questions,
              answers: previewData.answers
            }} />
          </div>
        );
      
      case 'flashcards':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{previewData.title}</h2>
            {previewData.description && (
              <p className="text-gray-600 mb-4">{previewData.description}</p>
            )}
            {previewData.instructions && (
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <p className="text-blue-700">{previewData.instructions}</p>
              </div>
            )}
            <FlashcardGame cards={previewData.cards} />
          </div>
        );
      
      case 'quiz':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{previewData.title}</h2>
            {previewData.description && (
              <p className="text-gray-600 mb-4">{previewData.description}</p>
            )}
            {previewData.instructions && (
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <p className="text-blue-700">{previewData.instructions}</p>
              </div>
            )}
            <QuizGame questions={previewData.questions} />
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">無法預覽此模板類型</h3>
            <p className="mt-1 text-gray-500">請選擇其他模板或聯繫管理員</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">活動預覽</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setPreviewMode('student')}
              className={`px-4 py-2 rounded-lg ${previewMode === 'student' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              學生視圖
            </button>
            <button
              onClick={() => setPreviewMode('teacher')}
              className={`px-4 py-2 rounded-lg ${previewMode === 'teacher' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              教師視圖
            </button>
          </div>
        </div>

        {previewMode === 'teacher' && (
          <div className="bg-yellow-50 p-4 rounded-md mb-6">
            <div className="flex">
              <svg className="h-6 w-6 text-yellow-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-yellow-700">教師視圖：這是學生將看到的活動內容。在發布前，您可以編輯或調整活動設置。</p>
            </div>
          </div>
        )}

        {renderPreview()}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onEdit}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          返回編輯
        </button>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            取消
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            保存活動
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplatePreview;