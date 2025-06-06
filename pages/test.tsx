import Head from 'next/head';

export default function TestPage() {
  return (
    <>
      <Head>
        <title>EduCreate - Test Page</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            🎉 EduCreate Test Page
          </h1>
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✅ 部署成功！
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>時間:</strong> {new Date().toLocaleString()}</p>
              <p><strong>環境:</strong> {process.env.NODE_ENV}</p>
            </div>
            <div className="flex space-x-4">
              <a 
                href="/" 
                className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
              >
                回到首頁
              </a>
              <a 
                href="/mvp-games" 
                className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center"
              >
                MVP 遊戲
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}