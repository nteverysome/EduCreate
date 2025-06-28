# 🔧 Google OAuth 修復指南

## 🎯 問題診斷結果

### ❌ 發現的問題
1. **Google 登入失敗** - `redirect_uri_mismatch` 錯誤
2. **註冊頁面缺少 Google 註冊選項**
3. **生產環境重定向 URI 未配置**

### 🔍 MCP 測試結果
- ✅ Playwright MCP 成功測試登入/註冊頁面
- ✅ Sequential Thinking MCP 分析出根本原因
- ❌ Google OAuth 配置不完整

## 🛠️ 修復步驟

### 步驟 1: Google Cloud Console 配置

1. **訪問 Google Cloud Console**
   - 前往: https://console.cloud.google.com/
   - 選擇您的項目

2. **配置 OAuth 同意畫面**
   - 導航到: APIs & Services > OAuth consent screen
   - 確保應用狀態為 "In production" 或 "Testing"

3. **添加授權重定向 URI**
   - 導航到: APIs & Services > Credentials
   - 選擇您的 OAuth 2.0 客戶端 ID
   - 在 "Authorized redirect URIs" 中添加:
     ```
     https://edu-create-pvkr8o9eu-minamisums-projects.vercel.app/api/auth/callback/google
     ```

### 步驟 2: Vercel 環境變量配置

在 Vercel 項目設置中添加/檢查以下環境變量:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=https://edu-create-pvkr8o9eu-minamisums-projects.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
```

### 步驟 3: 修復註冊頁面

需要在註冊頁面添加 Google 註冊選項。

#### 修改 `pages/register.tsx`

在註冊表單後添加社交登入選項:

```tsx
// 在註冊按鈕後添加
<div className="mt-6">
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-gray-500">或使用社交媒體註冊</span>
    </div>
  </div>
  
  <div className="mt-6 grid grid-cols-2 gap-3">
    <button
      onClick={() => signIn('google', { callbackUrl: '/' })}
      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
    >
      <img className="h-5 w-5 mr-2" src="/icons/google.svg" alt="Google" />
      Google
    </button>
    
    <button
      onClick={() => signIn('github', { callbackUrl: '/' })}
      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
    >
      <img className="h-5 w-5 mr-2" src="/icons/github.svg" alt="GitHub" />
      GitHub
    </button>
  </div>
</div>
```

### 步驟 4: 測試修復

1. **重新部署應用**
   ```bash
   vercel --prod
   ```

2. **測試 Google 登入**
   - 訪問: https://edu-create-pvkr8o9eu-minamisums-projects.vercel.app/login
   - 點擊 Google 登入按鈕
   - 確認重定向正常

3. **測試 Google 註冊**
   - 訪問: https://edu-create-pvkr8o9eu-minamisums-projects.vercel.app/register
   - 確認有 Google 註冊選項

## 🔍 故障排除

### 常見問題

1. **仍然出現 redirect_uri_mismatch**
   - 檢查 Google Cloud Console 中的重定向 URI 是否完全匹配
   - 確認沒有多餘的斜杠或字符

2. **環境變量未生效**
   - 在 Vercel 中重新部署
   - 檢查環境變量名稱是否正確

3. **Google 按鈕不工作**
   - 檢查 NextAuth.js 配置
   - 確認 signIn 函數已正確導入

### 驗證清單

- [ ] Google Cloud Console 重定向 URI 已添加
- [ ] Vercel 環境變量已設置
- [ ] 註冊頁面已添加 Google 選項
- [ ] 應用已重新部署
- [ ] Google 登入測試通過
- [ ] Google 註冊測試通過

## 📞 需要幫助？

如果問題仍然存在，請提供:
1. Google Cloud Console 截圖
2. Vercel 環境變量截圖
3. 具體的錯誤信息

---

**修復完成後，用戶將能夠使用 Google 帳戶進行登入和註冊！** 🎉
