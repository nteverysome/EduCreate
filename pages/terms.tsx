import { NextPage } from 'next';
import Head from 'next/head';

const TermsOfService: NextPage = () => {
  return (
    <>
      <Head>
        <title>使用條款 - EduCreate</title>
        <meta name="description" content="EduCreate 使用條款" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">使用條款</h1>
            
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6">
                最後更新日期：2025年6月28日
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 服務條款接受</h2>
              <p className="text-gray-700 mb-4">
                歡迎使用 EduCreate（"服務"、"平台"）。通過訪問或使用我們的服務，您同意受本使用條款（"條款"）的約束。
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 服務描述</h2>
              <p className="text-gray-700 mb-4">
                EduCreate 是一個 AI 驅動的教育遊戲平台，提供：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>互動式教育遊戲創建工具</li>
                <li>多種教學模板（問答、配對、填字等）</li>
                <li>AI 輔助內容生成</li>
                <li>雲端存儲和分享功能</li>
                <li>Google OAuth 社交登入</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. 用戶帳戶</h2>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 帳戶創建</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>您可以通過電子郵件或 Google 帳戶註冊</li>
                <li>您必須提供準確、完整的信息</li>
                <li>您負責保護帳戶安全</li>
                <li>一人只能創建一個帳戶</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 Google OAuth 登入</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>我們僅訪問您的基本 Google 帳戶信息</li>
                <li>您可以隨時撤銷 Google 授權</li>
                <li>Google 登入受 Google 使用條款約束</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 使用規則</h2>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 允許的使用</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>創建教育內容和遊戲</li>
                <li>與學生分享教學資源</li>
                <li>個人和商業教育用途</li>
                <li>遵守適用法律法規</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 禁止的使用</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>上傳非法、有害或不當內容</li>
                <li>侵犯他人知識產權</li>
                <li>進行網絡攻擊或惡意活動</li>
                <li>濫用或過度使用服務資源</li>
                <li>創建多個帳戶</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. 內容所有權</h2>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 用戶內容</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>您保留對創建內容的所有權</li>
                <li>您授予我們使用內容提供服務的許可</li>
                <li>您負責確保內容不侵權</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 平台內容</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>平台設計、功能歸我們所有</li>
                <li>模板和工具受版權保護</li>
                <li>AI 生成內容的使用權歸您</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. 隱私保護</h2>
              <p className="text-gray-700 mb-4">
                您的隱私對我們很重要。請查看我們的
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">隱私政策</a>
                了解我們如何收集、使用和保護您的信息。
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. 服務可用性</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>我們努力保持服務 24/7 可用</li>
                <li>可能因維護或技術問題暫時中斷</li>
                <li>我們不保證 100% 的正常運行時間</li>
                <li>重要更新將提前通知</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. 免責聲明</h2>
              <p className="text-gray-700 mb-4">
                服務按"現狀"提供，我們不提供任何明示或暗示的保證，包括但不限於：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>服務的準確性、可靠性</li>
                <li>滿足特定需求</li>
                <li>無錯誤或不間斷運行</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. 責任限制</h2>
              <p className="text-gray-700 mb-4">
                在法律允許的最大範圍內，我們不對以下情況承擔責任：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>間接、偶然或後果性損害</li>
                <li>數據丟失或業務中斷</li>
                <li>第三方內容或服務</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. 條款修改</h2>
              <p className="text-gray-700 mb-4">
                我們可能會更新這些條款。重大變更將通過電子郵件或網站通知您。繼續使用服務表示您接受修改後的條款。
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. 聯繫信息</h2>
              <p className="text-gray-700 mb-4">
                如果您對這些條款有疑問，請聯繫我們：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>電子郵件：legal@educreate.com</li>
                <li>網站：https://edu-create-97tqxnaxl-minamisums-projects.vercel.app/contact</li>
              </ul>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                本使用條款受中華民國法律管轄。
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
