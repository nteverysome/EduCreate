import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '社區 - EduCreate',
  description: 'EduCreate 教育社區 - 分享學習資源和經驗',
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 頁面標題 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              👥 EduCreate 社區
            </h1>
            <p className="text-xl text-gray-600">
              連接教育者，分享學習資源，共同成長
            </p>
          </div>

          {/* 功能卡片 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* 分享資源 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">分享資源</h3>
              <p className="text-gray-600 mb-4">
                分享您的教學活動和學習材料，幫助其他教育者
              </p>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                即將推出
              </button>
            </div>

            {/* 討論區 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">討論區</h3>
              <p className="text-gray-600 mb-4">
                與其他教育者交流教學經驗和最佳實踐
              </p>
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                即將推出
              </button>
            </div>

            {/* 活動模板庫 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">模板庫</h3>
              <p className="text-gray-600 mb-4">
                瀏覽和下載社區貢獻的活動模板
              </p>
              <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors">
                即將推出
              </button>
            </div>

            {/* 學習分析 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">學習分析</h3>
              <p className="text-gray-600 mb-4">
                查看社區學習數據和趨勢分析
              </p>
              <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors">
                即將推出
              </button>
            </div>

            {/* 專家指導 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-semibold mb-2">專家指導</h3>
              <p className="text-gray-600 mb-4">
                獲得教育專家的指導和建議
              </p>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
                即將推出
              </button>
            </div>

            {/* 成就系統 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">成就系統</h3>
              <p className="text-gray-600 mb-4">
                通過參與社區活動獲得成就和認證
              </p>
              <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors">
                即將推出
              </button>
            </div>
          </div>

          {/* 社區統計 */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">社區統計</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">1,000+</div>
                <div className="text-gray-600">註冊教師</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">5,000+</div>
                <div className="text-gray-600">學習活動</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">10,000+</div>
                <div className="text-gray-600">學生參與</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">50+</div>
                <div className="text-gray-600">學校合作</div>
              </div>
            </div>
          </div>

          {/* 加入社區 */}
          <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">加入 EduCreate 社區</h2>
            <p className="text-lg mb-6">
              與全球教育者連接，共同創造更好的學習體驗
            </p>
            <div className="space-x-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                立即加入
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
