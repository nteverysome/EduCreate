import { useRouter } from 'next/router';
import Link from 'next/link';
interface EditorNavigationProps {
  activityId?: string;
  templateId?: string;
  templateType?: string;
  currentEditor: 'standard' | 'improved';
}
export default function EditorNavigation({ 
  activityId, 
  templateId, 
  templateType, 
  currentEditor 
}: EditorNavigationProps) {
  const router = useRouter();
  // 構建編輯器URL
  const getEditorUrl = (editorType: 'standard' | 'improved') => {
    const basePath = editorType === 'standard' ? '/editor' : '/editor/improved';
    const queryParams = [];
    if (activityId) queryParams.push(`id=${activityId}`);
    if (templateId) queryParams.push(`template=${templateId}`);
    if (templateType) queryParams.push(`type=${templateType}`);
    return queryParams.length > 0 
      ? `${basePath}?${queryParams.join('&')}` 
      : basePath;
  };
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-lg font-medium">活動編輯器</h1>
      </div>
      <div className="flex items-center space-x-2 bg-gray-100 rounded-md p-1">
        <Link 
          href={getEditorUrl('standard')} 
          className={`px-3 py-1 rounded-md ${currentEditor === 'standard' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          標準編輯器
        </Link>
        <Link 
          href={getEditorUrl('improved')} 
          className={`px-3 py-1 rounded-md ${currentEditor === 'improved' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          增強拖放編輯器
        </Link>
      </div>
    </div>
  );
}
