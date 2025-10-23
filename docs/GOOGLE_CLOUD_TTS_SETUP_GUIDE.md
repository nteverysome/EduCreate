# Google Cloud TTS 設置指南

## 📋 文檔概述

**創建日期**: 2025-10-23  
**目的**: 為 EduCreate 專案設置 Google Cloud Text-to-Speech API  
**預計時間**: 30-60 分鐘

---

## 🎯 設置目標

1. ✅ 創建 Google Cloud 帳號
2. ✅ 啟用 Text-to-Speech API
3. ✅ 創建服務帳號和 API 金鑰
4. ✅ 配置環境變數
5. ✅ 測試 API 調用

---

## 📝 前置要求

### 必需項目
- Google 帳號（Gmail）
- 信用卡（用於驗證，免費額度內不會收費）
- Node.js >= 18.0.0
- EduCreate 專案已克隆到本地

### 可選項目
- Google Cloud 控制台經驗
- 基本的 API 使用知識

---

## 🚀 步驟 1: 創建 Google Cloud 帳號

### 1.1 訪問 Google Cloud Console

1. 打開瀏覽器，訪問：https://console.cloud.google.com
2. 使用您的 Google 帳號登入
3. 如果是第一次使用，會看到歡迎頁面

### 1.2 接受服務條款

1. 閱讀並接受 Google Cloud 服務條款
2. 選擇您的國家/地區
3. 同意接收產品更新（可選）

### 1.3 設置付款方式

**重要**: Google Cloud 需要信用卡驗證，但免費額度內不會收費

1. 點擊「啟用免費試用」或「設置付款方式」
2. 輸入信用卡信息
3. 確認付款方式

**免費額度**:
- 新用戶：$300 美元免費額度（90 天）
- Text-to-Speech API：每月 100 萬字符免費（Neural 語音）

---

## 🔧 步驟 2: 創建專案

### 2.1 創建新專案

1. 點擊頂部導航欄的「選擇專案」下拉菜單
2. 點擊「新增專案」
3. 輸入專案名稱：`EduCreate-TTS`
4. 選擇組織（如果有）
5. 點擊「創建」

### 2.2 確認專案已創建

1. 等待專案創建完成（約 10-30 秒）
2. 確認頂部導航欄顯示「EduCreate-TTS」
3. 記下專案 ID（例如：`educreate-tts-123456`）

---

## 🎤 步驟 3: 啟用 Text-to-Speech API

### 3.1 搜索 API

1. 在 Google Cloud Console 頂部搜索欄輸入：`Text-to-Speech API`
2. 點擊搜索結果中的「Cloud Text-to-Speech API」
3. 或直接訪問：https://console.cloud.google.com/apis/library/texttospeech.googleapis.com

### 3.2 啟用 API

1. 點擊「啟用」按鈕
2. 等待 API 啟用完成（約 10-30 秒）
3. 確認看到「API 已啟用」的消息

### 3.3 驗證 API 已啟用

1. 訪問：https://console.cloud.google.com/apis/dashboard
2. 確認「Cloud Text-to-Speech API」在已啟用的 API 列表中

---

## 🔑 步驟 4: 創建服務帳號

### 4.1 訪問服務帳號頁面

1. 在左側導航欄點擊「IAM 與管理」
2. 點擊「服務帳號」
3. 或直接訪問：https://console.cloud.google.com/iam-admin/serviceaccounts

### 4.2 創建服務帳號

1. 點擊「+ 創建服務帳號」
2. 輸入服務帳號詳細信息：
   - **服務帳號名稱**: `educreate-tts-service`
   - **服務帳號 ID**: `educreate-tts-service`（自動生成）
   - **服務帳號說明**: `EduCreate TTS API 服務帳號`
3. 點擊「創建並繼續」

### 4.3 授予權限

1. 在「授予此服務帳號存取專案的權限」部分
2. 選擇角色：`Cloud Text-to-Speech API 使用者`
3. 點擊「繼續」
4. 點擊「完成」

---

## 📥 步驟 5: 創建 API 金鑰

### 5.1 生成金鑰

1. 在服務帳號列表中，找到剛創建的 `educreate-tts-service`
2. 點擊服務帳號名稱進入詳細頁面
3. 點擊「金鑰」標籤
4. 點擊「新增金鑰」→「創建新金鑰」

### 5.2 下載金鑰文件

1. 選擇金鑰類型：`JSON`
2. 點擊「創建」
3. 金鑰文件會自動下載到您的電腦
4. 文件名類似：`educreate-tts-123456-a1b2c3d4e5f6.json`

### 5.3 保存金鑰文件

**重要**: 金鑰文件包含敏感信息，請妥善保管

1. 將下載的 JSON 文件重命名為：`google-cloud-tts-key.json`
2. 移動文件到 EduCreate 專案根目錄
3. 確保文件不會被提交到 Git（已在 `.gitignore` 中）

**金鑰文件結構**:
```json
{
  "type": "service_account",
  "project_id": "educreate-tts-123456",
  "private_key_id": "a1b2c3d4e5f6...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "educreate-tts-service@educreate-tts-123456.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## ⚙️ 步驟 6: 配置環境變數

### 6.1 更新 `.env` 文件

在 EduCreate 專案根目錄創建或更新 `.env` 文件：

```bash
# Google Cloud TTS 配置
GOOGLE_CLOUD_PROJECT_ID=educreate-tts-123456
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-tts-key.json

# 或者直接使用 JSON 內容（推薦用於 Vercel 部署）
GOOGLE_CLOUD_TTS_KEY_JSON={"type":"service_account","project_id":"educreate-tts-123456",...}
```

### 6.2 更新 `.env.example` 文件

```bash
# Google Cloud TTS 配置
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-tts-key.json
```

### 6.3 更新 `.gitignore` 文件

確保金鑰文件不會被提交到 Git：

```bash
# Google Cloud TTS 金鑰
google-cloud-tts-key.json
*.json
!package.json
!package-lock.json
!tsconfig.json
```

---

## 🧪 步驟 7: 測試 API 調用

### 7.1 安裝 Google Cloud TTS SDK

```bash
npm install @google-cloud/text-to-speech
```

### 7.2 創建測試腳本

創建文件：`scripts/test-google-cloud-tts.js`

```javascript
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

async function testGoogleCloudTTS() {
  console.log('🧪 測試 Google Cloud TTS API...\n');

  try {
    // 創建客戶端
    const client = new textToSpeech.TextToSpeechClient();

    // 測試文本
    const text = 'Hello, this is a test of Google Cloud Text-to-Speech API.';

    // 構建請求
    const request = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-A',
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0
      }
    };

    console.log('📝 請求參數:');
    console.log(`   文本: "${text}"`);
    console.log(`   語言: en-US`);
    console.log(`   語音: en-US-Neural2-A (Female)`);
    console.log(`   格式: MP3\n`);

    // 調用 API
    console.log('🔄 調用 Google Cloud TTS API...');
    const [response] = await client.synthesizeSpeech(request);

    // 保存音頻文件
    const outputFile = 'test-tts-output.mp3';
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputFile, response.audioContent, 'binary');

    console.log('✅ API 調用成功！');
    console.log(`📁 音頻文件已保存: ${outputFile}`);
    console.log(`📊 文件大小: ${response.audioContent.length} bytes\n`);

    // 顯示使用量
    console.log('💰 使用量統計:');
    console.log(`   字符數: ${text.length}`);
    console.log(`   成本: $0 (在免費額度內)\n`);

    console.log('🎉 測試完成！Google Cloud TTS API 配置正確。');
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.error('\n🔍 可能的原因:');
    console.error('   1. API 金鑰文件路徑不正確');
    console.error('   2. API 未啟用');
    console.error('   3. 服務帳號權限不足');
    console.error('   4. 網絡連接問題\n');
    process.exit(1);
  }
}

testGoogleCloudTTS();
```

### 7.3 運行測試

```bash
node scripts/test-google-cloud-tts.js
```

### 7.4 預期輸出

```
🧪 測試 Google Cloud TTS API...

📝 請求參數:
   文本: "Hello, this is a test of Google Cloud Text-to-Speech API."
   語言: en-US
   語音: en-US-Neural2-A (Female)
   格式: MP3

🔄 調用 Google Cloud TTS API...
✅ API 調用成功！
📁 音頻文件已保存: test-tts-output.mp3
📊 文件大小: 12345 bytes

💰 使用量統計:
   字符數: 60
   成本: $0 (在免費額度內)

🎉 測試完成！Google Cloud TTS API 配置正確。
```

---

## 📊 步驟 8: 驗證免費額度

### 8.1 查看使用量

1. 訪問：https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas
2. 查看「每月免費額度」部分
3. 確認顯示：`1,000,000 字符/月（Neural 語音）`

### 8.2 設置預算警報（可選）

1. 訪問：https://console.cloud.google.com/billing/budgets
2. 點擊「創建預算」
3. 設置預算金額：`$1 USD`
4. 設置警報閾值：`50%, 90%, 100%`
5. 輸入通知郵箱
6. 點擊「完成」

---

## ✅ 完成檢查清單

### 必需項目
- [ ] Google Cloud 帳號已創建
- [ ] 專案 `EduCreate-TTS` 已創建
- [ ] Text-to-Speech API 已啟用
- [ ] 服務帳號 `educreate-tts-service` 已創建
- [ ] API 金鑰文件已下載並保存
- [ ] 環境變數已配置
- [ ] 測試腳本運行成功

### 可選項目
- [ ] 預算警報已設置
- [ ] 使用量監控已配置
- [ ] 團隊成員已添加到專案

---

## 🚨 常見問題

### Q1: API 調用失敗，顯示「Permission denied」

**原因**: 服務帳號權限不足

**解決方案**:
1. 訪問：https://console.cloud.google.com/iam-admin/iam
2. 找到服務帳號 `educreate-tts-service`
3. 點擊「編輯」
4. 添加角色：`Cloud Text-to-Speech API 使用者`
5. 保存更改

---

### Q2: 金鑰文件路徑錯誤

**原因**: `GOOGLE_APPLICATION_CREDENTIALS` 環境變數路徑不正確

**解決方案**:
```bash
# 使用絕對路徑
GOOGLE_APPLICATION_CREDENTIALS=/path/to/educreate/google-cloud-tts-key.json

# 或使用相對路徑
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-tts-key.json
```

---

### Q3: 超過免費額度怎麼辦？

**免費額度**: 每月 100 萬字符（Neural 語音）

**我們的預生成需求**: 192,000 字符（一次性）

**結論**: 完全在免費額度內，不會產生費用

**如果超過**:
- 成本：$16 USD / 100 萬字符
- 例如：200 萬字符 = $32 USD

---

## 📚 下一步

完成 Google Cloud TTS 設置後，繼續執行：

1. **任務 1.2**: Cloudflare R2 設置
2. **任務 1.3**: 資料庫設置
3. **階段 2**: GEPT 詞庫準備

---

## 📞 支援資源

### Google Cloud 文檔
- Text-to-Speech API 文檔：https://cloud.google.com/text-to-speech/docs
- 快速入門指南：https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries
- 定價說明：https://cloud.google.com/text-to-speech/pricing

### EduCreate 文檔
- TTS 實施計畫：`docs/EDUCREATE_TTS_IMPLEMENTATION_PLAN.md`
- 成本分析：`docs/GOOGLE_CLOUD_TTS_DEEP_ANALYSIS_FOR_EDUCREATE.md`

---

**文檔創建日期**: 2025-10-23  
**維護者**: EduCreate Development Team  
**狀態**: ✅ 完成  
**下一步**: Cloudflare R2 設置

