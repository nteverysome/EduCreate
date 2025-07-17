import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
// 版本控制組件
export default function VersionControl() {
  const {
    currentActivity,
    isDirty,
    isVersionSaving,
    versionDescription,
    saveVersion,
    viewVersionHistory,
  } = useEditorStore();
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [description, setDescription] = useState('');
  // 打開版本保存對話框
  const handleOpenVersionDialog = () => {
    setDescription('');
    setShowVersionDialog(true);
  };
  // 保存新版本
  const handleSaveVersion = async () => {
    const success = await saveVersion(description);
    if (success) {
      setShowVersionDialog(false);
    }
  };
  // 如果沒有活動，不顯示組件
  if (!currentActivity) {
    return null;
  }
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleOpenVersionDialog}
        disabled={!currentActivity || isVersionSaving}
        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isVersionSaving ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            保存中...
          </>
        ) : (
          '保存版本'
        )}
      </button>
      <button
        onClick={viewVersionHistory}
        disabled={!currentActivity}
        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        版本歷史
      </button>
      {/* 版本保存對話框 */}
      {showVersionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">保存新版本</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                版本描述 (選填)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="描述這個版本的變更內容..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowVersionDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                取消
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={isVersionSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVersionSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
