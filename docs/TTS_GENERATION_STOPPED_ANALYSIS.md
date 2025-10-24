# TTS 生成進程停止分析報告

## 問題描述
TTS 音頻生成進程在達到 29.22% 進度後停止,沒有繼續生成新的音頻文件。

## 調查結果

### 1. 進程狀態
- **Terminal ID**: 216
- **命令**: `node scripts/generate-tts-audio.js elementary`
- **進程 ID**: 8376
- **狀態**: 仍在運行 (但沒有輸出)
- **運行時間**: 14 小時 23 分鐘
- **CPU 使用率**: 3.95 (非常低)
- **內存使用**: 137 MB

### 2. 生成進度
```
📊 已生成音頻總數: 9433

📊 按 GEPT 級別統計:
  - ELEMENTARY: 9422/9424 (99.98%)
  - INTERMEDIATE: 0/10272 (0.00%)
  - HIGH_INTERMEDIATE: 0/12552 (0.00%)

📊 總進度: 9422/32248 (29.22%)
```

### 3. 最後生成的記錄
```
1. i want to play  [en-US/en-US-Neural2-F] - null - 2025/10/23 下午10:45:29
2. car [en-US/en-US-Neural2-C] - null - 2025/10/23 下午10:40:11
3. zoo [zh-TW/cmn-TW-Wavenet-A] - ELEMENTARY - 2025/10/23 下午10:04:09
```

**⚠️ 最後一條記錄是 591 分鐘前 (約 10 小時前)**

### 4. 問題分析

#### 可能原因 1: 腳本只處理了 ELEMENTARY 級別
- 命令: `node scripts/generate-tts-audio.js elementary`
- 腳本設計: 只處理指定的級別,處理完後就退出
- **結論**: 這是最可能的原因

#### 可能原因 2: API 配額限制
- Google Cloud TTS API 可能有每日配額限制
- 生成了 9433 個音頻後達到限制
- **需要驗證**: 檢查 Google Cloud Console 的配額使用情況

#### 可能原因 3: 網絡或 API 錯誤
- 可能遇到網絡錯誤或 API 錯誤後卡住
- 腳本沒有適當的錯誤處理和重試機制
- **需要改進**: 添加更好的錯誤處理

#### 可能原因 4: Cloudflare R2 上傳失敗
- R2 上傳可能失敗導致進程卡住
- **需要驗證**: 檢查 R2 存儲桶中的文件數量

### 5. 為什麼進程還在運行但沒有輸出?

查看腳本代碼發現:
```javascript
async function main() {
  // ...
  try {
    if (level === 'all') {
      for (const levelKey of Object.keys(GEPT_LEVELS)) {
        await processVocabulary(levelKey, { dryRun, limit });
      }
    } else {
      await processVocabulary(level, { dryRun, limit });
    }
  } catch (error) {
    console.error('執行錯誤:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
```

**問題**: 
- 腳本只處理了 `elementary` 級別
- 處理完後應該退出,但進程還在運行
- 可能是 Prisma 連接沒有正確關閉,導致進程掛起

## 解決方案

### 方案 1: 重新啟動生成進程 (推薦 ⭐)

**步驟**:
1. 殺掉當前進程 (Terminal 216, PID 8376)
2. 重新啟動,處理所有級別:
   ```bash
   node scripts/generate-tts-audio.js all
   ```
3. 或者分別處理剩餘的級別:
   ```bash
   node scripts/generate-tts-audio.js intermediate
   node scripts/generate-tts-audio.js high-intermediate
   ```

**優點**:
- 簡單直接
- 可以繼續從中斷的地方開始 (腳本會跳過已存在的記錄)

**缺點**:
- 需要手動監控

### 方案 2: 改進腳本並重新運行

**改進項目**:
1. **添加進度保存**: 定期保存進度到文件
2. **添加錯誤重試**: API 調用失敗時自動重試
3. **添加超時處理**: 避免進程卡住
4. **添加心跳日誌**: 定期輸出進度,即使沒有新記錄
5. **修復進程退出**: 確保 Prisma 連接正確關閉

**範例改進**:
```javascript
// 添加心跳日誌
let lastHeartbeat = Date.now();
setInterval(() => {
  const elapsed = Math.floor((Date.now() - lastHeartbeat) / 1000);
  console.log(`💓 心跳: 進程運行中 (${elapsed} 秒前有活動)`);
}, 60000); // 每分鐘輸出一次

// 添加錯誤重試
async function processWordWithRetry(word, language, voiceName, geptLevel, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await processWord(word, language, voiceName, geptLevel);
    } catch (error) {
      console.error(`❌ 嘗試 ${i+1}/${maxRetries} 失敗:`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000)); // 等待 5 秒後重試
    }
  }
}
```

### 方案 3: 使用批次處理

**策略**:
- 將詞彙分成小批次 (例如每批 100 個單字)
- 每批處理完後保存進度
- 如果失敗,可以從上次的批次繼續

**優點**:
- 更可靠
- 容易恢復
- 可以並行處理多個批次

**缺點**:
- 需要重寫腳本

## 立即行動建議

### 選項 1: 立即重啟生成 (最快)
```bash
# 1. 殺掉當前進程
taskkill /PID 8376 /F

# 2. 重新啟動處理剩餘級別
node scripts/generate-tts-audio.js intermediate
```

### 選項 2: 檢查 API 配額後再決定
1. 登入 Google Cloud Console
2. 檢查 TTS API 配額使用情況
3. 如果達到配額,等待重置或增加配額
4. 如果沒有達到配額,執行選項 1

### 選項 3: 改進腳本後再運行
1. 實施上述改進
2. 測試改進後的腳本
3. 重新啟動生成進程

## 預估時間

基於當前進度:
- **已完成**: 9,422 / 32,248 (29.22%)
- **剩餘**: 22,826 個音頻
- **平均速度**: 1.74 秒/音頻
- **預估剩餘時間**: 11.02 小時

**注意**: 這是理想情況下的估算,實際可能因 API 限制、網絡狀況等因素而變化。

## 建議

**我的建議是選項 1**:
1. 立即殺掉當前進程
2. 重新啟動處理 `intermediate` 級別
3. 完成後再處理 `high-intermediate` 級別
4. 同時監控進度,如果再次停止,考慮實施方案 2 的改進

這樣可以最快恢復生成進程,同時為未來的改進留下空間。

