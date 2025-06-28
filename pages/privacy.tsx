import { NextPage } from 'next';
import Head from 'next/head';

const PrivacyPolicy: NextPage = () => {
  return (
    <>
      <Head>
        <title>隱私政策 - EduCreate</title>
        <meta name="description" content="EduCreate 隱私政策" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">隱私政策</h1>
            
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6">
                最後更新日期：2025年6月28日
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 信息收集</h2>
              <p className="text-gray-700 mb-4">
                EduCreate（"我們"、"我們的"或"平台"）致力於保護您的隱私。本隱私政策說明我們如何收集、使用和保護您的個人信息。
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.1 我們收集的信息</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>帳戶信息：姓名、電子郵件地址</li>
                <li>Google OAuth 信息：Google 帳戶的基本資料信息</li>
                <li>使用數據：您創建的教育資源和活動</li>
                <li>技術信息：IP 地址、瀏覽器類型、設備信息</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 信息使用</h2>
              <p className="text-gray-700 mb-4">我們使用收集的信息來：</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>提供和改進我們的教育平台服務</li>
                <li>創建和管理您的用戶帳戶</li>
                <li>保存您創建的教育資源</li>
                <li>提供客戶支持</li>
                <li>發送重要的服務通知</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Google OAuth 集成</h2>
              <p className="text-gray-700 mb-4">
                當您選擇使用 Google 帳戶登入時，我們會：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>僅訪問您的基本 Google 帳戶信息（姓名、電子郵件）</li>
                <li>不會訪問您的 Google Drive、Gmail 或其他 Google 服務</li>
                <li>使用 Google 的安全 OAuth 2.0 協議</li>
                <li>您可以隨時撤銷授權</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 信息保護</h2>
              <p className="text-gray-700 mb-4">
                我們採用行業標準的安全措施來保護您的個人信息：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>HTTPS 加密傳輸</li>
                <li>安全的數據庫存儲</li>
                <li>定期安全審計</li>
                <li>限制員工訪問權限</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. 信息共享</h2>
              <p className="text-gray-700 mb-4">
                我們不會出售、交易或轉讓您的個人信息給第三方，除非：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>獲得您的明確同意</li>
                <li>法律要求或法院命令</li>
                <li>保護我們的權利和安全</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. 您的權利</h2>
              <p className="text-gray-700 mb-4">您有權：</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>訪問您的個人信息</li>
                <li>更正不準確的信息</li>
                <li>刪除您的帳戶和數據</li>
                <li>撤銷 Google OAuth 授權</li>
                <li>導出您的數據</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Cookie 使用</h2>
              <p className="text-gray-700 mb-4">
                我們使用 Cookie 來改善用戶體驗，包括：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>保持登入狀態</li>
                <li>記住用戶偏好</li>
                <li>分析網站使用情況</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. 聯繫我們</h2>
              <p className="text-gray-700 mb-4">
                如果您對本隱私政策有任何疑問，請聯繫我們：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>電子郵件：privacy@educreate.com</li>
                <li>網站：https://edu-create-97tqxnaxl-minamisums-projects.vercel.app/contact</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. 政策更新</h2>
              <p className="text-gray-700 mb-4">
                我們可能會不時更新本隱私政策。重大變更將通過電子郵件或網站通知您。
              </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                本隱私政策符合 GDPR、CCPA 等國際隱私法規要求。
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
