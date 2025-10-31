# Match-up Game 音頻功能實現 - 交接文檔

## 🎯 當前任務狀態

### 已完成 ✅
1. **移除 "No audio" 標示** - 已推送到 GitHub (Commit: 665be3e)
2. **修復背景層渲染順序** - 英文單字和聲音按鈕現在可見
3. **允許公開訪問** - API 已修改允許所有用戶訪問活動

### 進行中 ⏳
**自動生成 TTS 音頻功能** - 需要完成

## 🔴 核心問題

### 問題描述
Match-up 遊戲中的聲音按鈕無法發音。原因是：
- 詞彙項目的 `audioUrl` 為 `null`
- 遊戲代碼中沒有為缺失的音頻自動生成 TTS

### 測試 URL
```
https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94
```

### 活動 ID
```
cmh93tjuh0001l404hszkdf94
```

## 🔧 解決方案

### 已實現的代碼修改

#### 1. 在 `public/games/match-up-game/scenes/game.js` 中添加：

**位置 1：第 349-350 行（詞彙加載後）**
```javascript
// 🔥 自動為缺失的音頻生成 TTS
await this.generateMissingAudioUrls();
```

**位置 2：第 2718-2764 行（新增函數）**
```javascript
// 🔥 輔助函數 - 為缺失的音頻生成 TTS
async generateMissingAudioUrls() {
    console.log('🎵 開始檢查並生成缺失的音頻...');
    
    const missingAudioPairs = this.pairs.filter(pair => !pair.audioUrl);
    
    if (missingAudioPairs.length === 0) {
        console.log('✅ 所有詞彙都有音頻，無需生成');
        return;
    }
    
    console.log(`⏳ 發現 ${missingAudioPairs.length} 個缺失音頻的詞彙，開始生成...`);
    
    try {
        for (const pair of missingAudioPairs) {
            try {
                // 調用 TTS API 生成音頻
                const response = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: pair.english,
                        language: 'en-US',
                        voice: 'en-US-Neural2-F'  // 女聲
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    pair.audioUrl = data.audioUrl;
                    console.log(`✅ 生成音頻: ${pair.english}`);
                } else {
                    console.warn(`⚠️ 生成音頻失敗: ${pair.english} (${response.status})`);
                }
            } catch (error) {
                console.error(`❌ 生成音頻異常: ${pair.english}`, error);
            }
            
            // 避免 API 限制，每個請求之間等待 200ms
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('✅ 音頻生成完成');
    } catch (error) {
        console.error('❌ 生成缺失音頻時出錯:', error);
    }
}
```

## 🚨 技術問題

### Git 同步問題
- IDE 的 `str-replace-editor` 工具報告編輯成功，但 Git 無法檢測到文件變更
- 文件哈希保持不變：`2584e59f2e95309349b2135209fd68d9d71c29d6`
- `view` 工具顯示文件已修改，但磁盤上的文件未更新

### 解決方案
需要使用 Node.js 腳本直接修改文件，而不是依賴 IDE 工具。

## 📋 下一步行動

### 1. 確認文件修改
```bash
# 檢查文件是否包含 generateMissingAudioUrls
grep -n "generateMissingAudioUrls" public/games/match-up-game/scenes/game.js
```

### 2. 提交並推送
```bash
cd C:\Users\Administrator\Desktop\EduCreate
git add public/games/match-up-game/scenes/game.js
git commit -m "Feature: Auto-generate TTS audio for vocabulary items without audioUrl"
git push
```

### 3. 驗證部署
- Vercel 會自動部署
- 等待約 2-3 分鐘
- 訪問測試 URL 並點擊聲音按鈕

### 4. 測試步驟
1. 打開遊戲頁面
2. 等待詞彙加載完成
3. 查看瀏覽器控制台，應該看到：
   - `🎵 開始檢查並生成缺失的音頻...`
   - `⏳ 發現 X 個缺失音頻的詞彙，開始生成...`
   - `✅ 生成音頻: [單字]` (多次)
   - `✅ 音頻生成完成`
4. 點擊卡片上的聲音按鈕 🔊
5. 應該能聽到英文單字的發音

## 📚 相關文件

### 核心文件
- `public/games/match-up-game/scenes/game.js` - 遊戲主邏輯
- `app/api/tts/route.ts` - TTS API 端點
- `app/api/activities/[id]/route.ts` - 活動 API 端點

### 已修改的文件
- `public/games/match-up-game/scenes/game.js` - 移除 "No audio" 標示 (Commit: 665be3e)
- `app/api/activities/[id]/route.ts` - 允許公開訪問 (Commit: 05c714a)

## 🔗 相關 API

### TTS API
```
POST /api/tts
Content-Type: application/json

{
  "text": "hello",
  "language": "en-US",
  "voice": "en-US-Neural2-F"
}

Response:
{
  "audioUrl": "https://...",
  "cached": false,
  "hash": "...",
  "fileSize": 12345,
  "hitCount": 0
}
```

### 活動 API
```
GET /api/activities/{activityId}

Response:
{
  "id": "...",
  "title": "...",
  "vocabularyItems": [
    {
      "id": "...",
      "english": "apple",
      "chinese": "蘋果",
      "audioUrl": null,  // 需要生成
      "imageUrl": "..."
    }
  ]
}
```

## 💡 關鍵信息

### TTS 系統
- 已實現完整的 TTS 系統（見 `/tts-demo` 頁面）
- 支持多語言和多種聲音
- 使用 Google Cloud TTS API
- 音頻存儲在 Cloudflare R2

### 遊戲架構
- 使用 Phaser 3 遊戲引擎
- 卡片佈局有 6 種變體（圖片+文字+音頻的不同組合）
- 背景層必須在最底層（已修復）

## ⚠️ 注意事項

1. **API 限制** - 每個請求間隔 200ms，避免 API 限制
2. **音頻格式** - 使用 MP3 格式
3. **語言設置** - 目前硬編碼為 en-US，可根據需要修改
4. **聲音選擇** - 使用女聲 (en-US-Neural2-F)，可根據需要修改

## 📞 聯繫信息

- 項目倉庫：https://github.com/nteverysome/EduCreate.git
- 部署平台：Vercel (前端) + Railway (後端)
- 數據庫：PostgreSQL (Railway)
- 文件存儲：Cloudflare R2

---

**最後更新時間**: 2025-11-01
**狀態**: 等待文件修改確認和推送

