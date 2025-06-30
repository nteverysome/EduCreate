import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function TestCreatePage() {
  const router = useRouter();
  const { template } = router.query;
  const [templateInfo, setTemplateInfo] = useState<any>(null);

  useEffect(() => {
    if (template) {
      // 簡單的模板映射
      const templates: Record<string, any> = {
        '1': { id: '1', name: '配對遊戲', icon: '🎯' },
        '2': { id: '2', name: '問答遊戲', icon: '❓' },
        '3': { id: '3', name: '單字遊戲', icon: '📚' },
        '4': { id: '4', name: '隨機輪盤', icon: '🎡' },
        '5': { id: '5', name: '迷宮遊戲', icon: '🌟' },
        '6': { id: '6', name: '排序遊戲', icon: '🔢' },
        '7': { id: '7', name: '記憶遊戲', icon: '🧠' },
        '8': { id: '8', name: '填字遊戲', icon: '✏️' }
      };
      
      setTemplateInfo(templates[template as string] || null);
    }
  }, [template]);

  return (
    <>
      <Head>
        <title>測試創建頁面 | EduCreate</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">🎉 路由修復成功！</h1>
          
          {templateInfo ? (
            <div className="text-center">
              <div className="text-4xl mb-4">{templateInfo.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{templateInfo.name}</h2>
              <p className="text-gray-600 mb-4">模板 ID: {templateInfo.id}</p>
              <p className="text-sm text-green-600 mb-4">
                ✅ /editor/create 路由現在可以正常工作了！
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">沒有選擇模板</p>
              <p className="text-sm text-blue-600">
                請從主頁選擇一個模板來測試
              </p>
            </div>
          )}
          
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              返回首頁
            </button>
            
            {templateInfo && (
              <button
                onClick={() => alert('模板信息已正確加載！')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                測試成功
              </button>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">調試信息:</h3>
            <p className="text-sm text-gray-600">
              當前 URL: {router.asPath}
            </p>
            <p className="text-sm text-gray-600">
              模板參數: {template || '無'}
            </p>
            <p className="text-sm text-gray-600">
              模板信息: {templateInfo ? '已加載' : '未加載'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
