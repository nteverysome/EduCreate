import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
// framer-motion 已移除，使用 CSS 動畫替代
// Simple diff viewer component to replace react-diff-viewer-2
const SimpleDiffViewer = ({ oldValue, newValue }: { oldValue: string; newValue: string }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-2 gap-0">
        <div className="bg-red-50 p-4 border-r">
          <div className="text-sm font-medium text-red-700 mb-2">舊版本</div>
          <pre className="text-sm whitespace-pre-wrap text-red-800">{oldValue}</pre>
        </div>
        <div className="bg-green-50 p-4">
          <div className="text-sm font-medium text-green-700 mb-2">新版本</div>
          <pre className="text-sm whitespace-pre-wrap text-green-800">{newValue}</pre>
        </div>
      </div>
    </div>
  );
};

interface VersionCompareProps {
  versionA: any;
  versionB: any;
  differences: any[];
  onClose: () => void;
  onRestore?: (versionId: string) => Promise<boolean>;
}

/**
 * 版本比較組件
 * 用於顯示兩個活動版本之間的差異
 */
const VersionCompare = ({ versionA, versionB, differences, onClose, onRestore }: VersionCompareProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'visual'>('summary');
  const [groupedDifferences, setGroupedDifferences] = useState<Record<string, any[]>>({});
  const [selectedDiff, setSelectedDiff] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  // 將差異按類型分組
  useEffect(() => {
    if (!differences || !differences.length) return;

    const grouped: Record<string, any[]> = {};
    
    differences.forEach(diff => {
      const field = diff.field;
      const category = field.split('.')[0] || '其他';
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      grouped[category].push(diff);
    });
    
    setGroupedDifferences(grouped);
  }, [differences]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: zhTW });
  };

  // 獲取差異類型的顯示名稱
  const getDiffTypeName = (category: string) => {
    const typeMap: Record<string, string> = {
      'content': '內容',
      'elements': '元素',
      'title': '標題',
      'description': '描述',
      'published': '發布狀態',
      'tags': '標籤',
      'settings': '設置',
      'metadata': '元數據'
    };
    
    return typeMap[category] || category;
  };

  // 渲染差異摘要
  const renderSummary = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">版本 {versionA.versionName}</h3>
            <p className="text-sm text-gray-500 mb-1">創建於: {formatDate(versionA.createdAt)}</p>
            <p className="text-sm text-gray-500 mb-1">創建者: {versionA.createdByUser?.name || '未知'}</p>
            <p className="text-sm text-gray-500">描述: {versionA.description || '無描述'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">版本 {versionB.versionName}</h3>
            <p className="text-sm text-gray-500 mb-1">創建於: {formatDate(versionB.createdAt)}</p>
            <p className="text-sm text-gray-500 mb-1">創建者: {versionB.createdByUser?.name || '未知'}</p>
            <p className="text-sm text-gray-500">描述: {versionB.description || '無描述'}</p>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">變更摘要</h3>
            
            {Object.keys(groupedDifferences).length === 0 ? (
              <p className="text-gray-500">這兩個版本沒有差異</p>
            ) : (
              <ul className="space-y-4">
                {Object.entries(groupedDifferences).map(([category, diffs]) => (
                  <li key={category} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <h4 className="text-md font-medium text-gray-700 mb-2">{getDiffTypeName(category)} 變更</h4>
                    <p className="text-sm text-gray-600">{diffs.length} 處差異</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 處理版本恢復
  const handleRestore = async (versionId: string) => {
    if (!onRestore) {
      toast.error('恢復功能不可用');
      return;
    }
    
    setIsRestoring(true);
    try {
      const success = await onRestore(versionId);
      if (success) {
        toast.success('成功恢復到選定版本');
        onClose();
      } else {
        toast.error('恢復版本失敗');
      }
    } catch (error) {
      console.error('恢復版本失敗:', error);
      toast.error('恢復版本失敗');
    } finally {
      setIsRestoring(false);
      setConfirmRestore(null);
    }
  };

  // 渲染差異詳情
  const renderDetails = () => {
    return (
      <div className="space-y-6">
        {Object.keys(groupedDifferences).length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <p className="text-gray-500">這兩個版本沒有差異</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedDifferences).map(([category, diffs]) => (
            <motion.div 
              key={category} 
              className="bg-white shadow overflow-hidden sm:rounded-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{getDiffTypeName(category)} 變更</h3>
                
                <ul className="space-y-6">
                  {diffs.map((diff, index) => {
                    const fieldName = diff.field.split('.').slice(1).join('.') || diff.field;
                    const isSelected = selectedDiff === `${category}-${index}`;
                    
                    return (
                      <motion.li 
                        key={index} 
                        className={`border-b border-gray-200 pb-4 last:border-b-0 last:pb-0 ${isSelected ? 'ring-2 ring-indigo-500 rounded-md' : ''}`}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedDiff(isSelected ? null : `${category}-${index}`)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-md font-medium text-gray-700">{fieldName}</h4>
                          <button 
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDiff(isSelected ? null : `${category}-${index}`);
                            }}
                          >
                            {isSelected ? '收起' : '展開詳情'}
                          </button>
                        </div>
                        
                        {isSelected && (
                          <div
                            className="grid grid-cols-2 gap-4 transition-all duration-300"
                          >
                              <div className="bg-red-50 p-3 rounded-md">
                                <h5 className="text-sm font-medium text-red-800 mb-1">版本 {versionA.versionName}</h5>
                                <pre className="text-sm text-red-700 whitespace-pre-wrap overflow-auto max-h-60">
                                  {JSON.stringify(diff.valueA, null, 2)}
                                </pre>
                              </div>
                              
                              <div className="bg-green-50 p-3 rounded-md">
                                <h5 className="text-sm font-medium text-green-800 mb-1">版本 {versionB.versionName}</h5>
                                <pre className="text-sm text-green-700 whitespace-pre-wrap overflow-auto max-h-60">
                                  {JSON.stringify(diff.valueB, null, 2)}
                                </pre>
                              </div>
                          </div>
                        )}
                        
                        {!isSelected && (
                          <div className="text-sm text-gray-500">
                            {typeof diff.valueA === 'string' && typeof diff.valueB === 'string' && diff.valueA.length < 50 && diff.valueB.length < 50 ? (
                              <div className="flex items-center space-x-2">
                                <span className="line-through text-red-600">{String(diff.valueA)}</span>
                                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-green-600">{String(diff.valueB)}</span>
                              </div>
                            ) : (
                              <span>點擊查看詳細變更</span>
                            )}
                          </div>
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          ))
        )}
      </div>
    );
  };

  // 渲染視覺化差異
  const renderVisualDiff = () => {
    if (Object.keys(groupedDifferences).length === 0) {
      return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-gray-500">這兩個版本沒有差異</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(groupedDifferences).map(([category, diffs]) => (
          <motion.div 
            key={category} 
            className="bg-white shadow overflow-hidden sm:rounded-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{getDiffTypeName(category)} 變更</h3>
              
              <ul className="space-y-6">
                {diffs.map((diff, index) => {
                  const fieldName = diff.field.split('.').slice(1).join('.') || diff.field;
                  const oldValue = typeof diff.valueA === 'string' ? diff.valueA : JSON.stringify(diff.valueA, null, 2);
                  const newValue = typeof diff.valueB === 'string' ? diff.valueB : JSON.stringify(diff.valueB, null, 2);
                  
                  return (
                    <li key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <h4 className="text-md font-medium text-gray-700 mb-2">{fieldName}</h4>
                      
                      <SimpleDiffViewer
                        oldValue={oldValue}
                        newValue={newValue}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              返回
            </button>
            
            <h1 className="text-2xl font-bold text-gray-900">版本比較</h1>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-md ${activeTab === 'summary' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
            >
              摘要
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-md ${activeTab === 'details' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
            >
              詳細差異
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-4 py-2 rounded-md ${activeTab === 'visual' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
            >
              視覺化比較
            </button>
          </div>
        </div>
        
        <div className="mb-6 flex justify-end space-x-4">
          {onRestore && (
            <div className="flex space-x-2">
              {confirmRestore ? (
                <>
                  <button
                    onClick={() => setConfirmRestore(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={isRestoring}
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleRestore(confirmRestore)}
                    className="px-4 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700 flex items-center"
                    disabled={isRestoring}
                  >
                    {isRestoring ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        處理中...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        確認恢復
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setConfirmRestore(versionA.id)}
                    className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    恢復到舊版本
                  </button>
                  <button
                    onClick={() => setConfirmRestore(versionB.id)}
                    className="px-4 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    恢復到新版本
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'details' && renderDetails()}
        {activeTab === 'visual' && renderVisualDiff()}
      </div>
    </div>
  );
}

export default SimpleDiffViewer;