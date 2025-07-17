import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import H5PSelector from './H5PSelector';

interface EditorSidebarProps {
  activityType: 'matching' | 'flashcards' | 'quiz';
}

const EditorSidebar = ({ activityType }: EditorSidebarProps) {
  const addElement = useEditorStore(state => state.addElement);
  const updateActivity = useEditorStore(state => state.updateActivity);
  const [showH5PSelector, setShowH5PSelector] = useState(false);

  // 添加新元素
  const handleAddElement = (type: string) => {
    // 默認位置在畫布中間
    const position = { x: 100, y: 100 };
    
    // 如果是H5P類型，顯示選擇器
    if (type === 'h5p') {
      setShowH5PSelector(true);
      return;
    }
    
    // 根據元素類型設置不同的默認屬性
    switch (type) {
      case 'text':
        addElement({
          type: 'text',
          content: '',
          position,
          size: { width: 300, height: 100 }
        });
        break;
      
      case 'question':
        addElement({
          type: 'question',
          content: '',
          position,
          size: { width: 250, height: 60 }
        });
        break;
      
      case 'answer':
        addElement({
          type: 'answer',
          content: '',
          position,
          size: { width: 250, height: 60 }
        });
        break;
      
      case 'card':
        addElement({
          type: 'card',
          content: '',
          position,
          size: { width: 300, height: 200 },
          properties: { back: '', tags: [] }
        });
        break;
      
      case 'quiz-item':
        addElement({
          type: 'quiz-item',
          content: '',
          position,
          size: { width: 350, height: 250 },
          properties: { options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
        });
        break;
    }
  };

  // 更新活動描述
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateActivity({ description: e.target.value });
  };

  // 根據活動類型渲染不同的元素選項
  const renderElementOptions = () => {
    switch (activityType) {
      case 'matching':
        return (
          <>
            <button
              onClick={() => handleAddElement('question')}
              className="flex items-center p-2 rounded-md hover:bg-blue-50 text-left w-full"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">Q</span>
              </div>
              <span>添加問題</span>
            </button>
            
            <button
              onClick={() => handleAddElement('answer')}
              className="flex items-center p-2 rounded-md hover:bg-green-50 text-left w-full"
            >
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center mr-3">
                <span className="text-green-600 font-medium">A</span>
              </div>
              <span>添加答案</span>
            </button>
          </>
        );
      
      case 'flashcards':
        return (
          <button
            onClick={() => handleAddElement('card')}
            className="flex items-center p-2 rounded-md hover:bg-purple-50 text-left w-full"
          >
            <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span>添加卡片</span>
          </button>
        );
      
      case 'quiz':
        return (
          <button
            onClick={() => handleAddElement('quiz-item')}
            className="flex items-center p-2 rounded-md hover:bg-yellow-50 text-left w-full"
          >
            <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>添加問題</span>
          </button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-full overflow-y-auto">
      <h2 className="font-medium text-gray-900 mb-4">活動設置</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">活動描述</label>
        <textarea
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="輸入活動描述..."
          onChange={handleDescriptionChange}
        />
      </div>
      
      <h2 className="font-medium text-gray-900 mb-2">添加元素</h2>
      <div className="space-y-2">
        <button
          onClick={() => handleAddElement('text')}
          className="flex items-center p-2 rounded-md hover:bg-gray-50 text-left w-full"
        >
          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
          <span>添加文字</span>
        </button>
        
        <button
          onClick={() => handleAddElement('h5p')}
          className="flex items-center p-2 rounded-md hover:bg-indigo-50 text-left w-full"
        >
          <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>添加H5P內容</span>
        </button>
        
        {renderElementOptions()}
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <h2 className="font-medium text-gray-900 mb-2">提示</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 點擊元素進行編輯</li>
          <li>• 拖動元素調整位置</li>
          <li>• 點擊預覽查看效果</li>
          <li>• 記得保存您的更改</li>
        </ul>
      </div>

      {/* H5P選擇器模態框 */}
      {showH5PSelector && (
        <H5PSelector
          onSelect={(h5pContent) => {
            // 添加H5P元素
            addElement({
              type: 'h5p',
              content: h5pContent.title,
              position: { x: 100, y: 100 },
              size: { width: 600, height: 400 },
              properties: {
                contentId: h5pContent.id,
                contentType: h5pContent.contentType,
                description: h5pContent.description || ''
              }
            });
            setShowH5PSelector(false);
          }}
          onCancel={() => setShowH5PSelector(false)}
        />
      )}
    </div>
  );
}

export default EditorSidebar;