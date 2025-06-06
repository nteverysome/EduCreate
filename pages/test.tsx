import Head from 'next/head';

export default function TestPage() {
  return (
    <>
      <Head>
        <title>EduCreate - Test Page</title>
        <meta name="description" content="EduCreate deployment test page" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎉 EduCreate
            </h1>
            <p className="text-xl text-gray-600">部署測試頁面</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-3">
                  <p className="text-lg font-medium">部署成功！</p>
                  <p className="text-sm">網站正在正常運行</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>部署時間:</strong></p>
                <p>{new Date().toLocaleString('zh-TW')}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>環境:</strong></p>
                <p>{process.env.NODE_ENV || 'development'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="/" 
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
              >
                🏠 首頁
              </a>
              <a 
                href="/mvp-games" 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
              >
                🎮 MVP 遊戲
              </a>
              <a 
                href="/api/health" 
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
              >
                🔍 健康檢查
              </a>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>如果您看到這個頁面，表示 EduCreate 已成功部署到 Vercel！</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}