# 🎵 Match-up Game 音頻功能實現 - 完整交接文檔

## 📌 當前狀態

### ✅ 已完成
1. **API 公開訪問** - 所有用戶可訪問活動
2. **背景層修復** - 英文單字和聲音按鈕可見
3. **移除 "No audio" 標示** - 已推送到 GitHub
4. **代碼編寫** - TTS 自動生成函數已完成

### ⏳ 待完成
1. **文件提交** - 需要確認文件修改並推送到 GitHub
2. **部署驗證** - 需要在 Vercel 上驗證功能
3. **功能測試** - 需要測試音頻播放

## 🎯 核心問題和解決方案

### 問題
Match-up 遊戲中的聲音按鈕無法發音

### 根本原因
詞彙項目的 `audioUrl` 為 `null`，沒有音頻可播放

### 解決方案
在遊戲加載時自動調用 TTS API 生成缺失的音頻

## 🔧 實現細節

### 修改位置 1: 詞彙加載後 (第 349-350 行)
```javascript
// 🔥 自動為缺失的音頻生成 TTS
await this.generateMissingAudioUrls();
```

### 修改位置 2: 新增函數 (第 2718-2764 行)
```javascript
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
                const response = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: pair.english,
                        language: 'en-US',
                        voice: 'en-US-Neural2-F'
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
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('✅ 音頻生成完成');
    } catch (error) {
        console.error('❌ 生成缺失音頻時出錯:', error);
    }
}
```

## 🚀 立即行動清單

### 第 1 步: 驗證文件修改
```bash
cd C:\Users\Administrator\Desktop\EduCreate

# 檢查文件是否包含新函數
grep "generateMissingAudioUrls" public/games/match-up-game/scenes/game.js

# 如果沒有找到，執行修改腳本
node add-tts-generation.js
```

### 第 2 步: 提交並推送
```bash
git add public/games/match-up-game/scenes/game.js
git commit -m "Feature: Auto-generate TTS audio for vocabulary items without audioUrl"
git push
```

### 第 3 步: 驗證部署
- 等待 2-3 分鐘
- 訪問: https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94
- 打開開發者工具 (F12)
- 查看 Console 標籤

### 第 4 步: 測試功能
1. 應該看到控制台消息:
   - `🎵 開始檢查並生成缺失的音頻...`
   - `⏳ 發現 X 個缺失音頻的詞彙，開始生成...`
   - `✅ 生成音頻: [單字]` (多次)
   - `✅ 音頻生成完成`

2. 點擊卡片上的聲音按鈕 🔊
3. 應該能聽到英文發音

## 🐛 故障排除

### 文件未被修改
**症狀**: grep 找不到 `generateMissingAudioUrls`

**解決**:
```bash
# 使用 Node.js 腳本
node add-tts-generation.js

# 驗證
grep "generateMissingAudioUrls" public/games/match-up-game/scenes/game.js
```

### Git 無法檢測到變更
**症狀**: `git status` 中沒有 `game.js`

**解決**:
```bash
# 刷新 Git 索引
git update-index --refresh

# 強制添加
git add -f public/games/match-up-game/scenes/game.js

# 檢查
git status
```

### 音頻沒有生成
**症狀**: 控制台沒有 "生成音頻" 消息

**檢查**:
1. 打開 Network 標籤
2. 查找 `/api/tts` 請求
3. 檢查響應狀態碼
4. 查看響應內容

### 聲音按鈕無法點擊
**症狀**: 點擊沒有反應

**檢查**:
1. 確認 `audioUrl` 不為空
2. 檢查瀏覽器控制台錯誤
3. 驗證音頻 URL 有效性

## 📊 技術架構

### 數據流
```
遊戲加載詞彙
    ↓
檢查 audioUrl
    ↓
如果為 null，調用 TTS API
    ↓
API 生成音頻並返回 URL
    ↓
更新詞彙的 audioUrl
    ↓
創建卡片和聲音按鈕
    ↓
用戶點擊按鈕播放音頻
```

### 相關文件
- `public/games/match-up-game/scenes/game.js` - 遊戲主邏輯
- `app/api/tts/route.ts` - TTS API 端點
- `app/api/activities/[id]/route.ts` - 活動 API 端點

## 🔗 測試 URL
```
https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94
```

## 📞 相關信息

### 活動 ID
```
cmh93tjuh0001l404hszkdf94
```

### TTS API 參數
```json
{
  "text": "hello",
  "language": "en-US",
  "voice": "en-US-Neural2-F"
}
```

### 支持的聲音
- `en-US-Neural2-F` - 女聲 (當前使用)
- `en-US-Neural2-D` - 男聲
- `en-US-Neural2-A` - 男童聲
- `en-US-Neural2-C` - 女童聲

## ✅ 成功標誌

- [ ] 文件已修改並包含新函數
- [ ] Git 推送成功
- [ ] Vercel 部署完成
- [ ] 遊戲頁面可打開
- [ ] 控制台顯示音頻生成消息
- [ ] 聲音按鈕可見且可點擊
- [ ] 點擊按鈕時播放音頻
- [ ] 沒有 "No audio" 標示
- [ ] 瀏覽器控制台沒有錯誤

## 💡 關鍵要點

1. **自動生成** - 遊戲加載時自動生成缺失的音頻
2. **無縫集成** - 使用現有的 TTS API
3. **用戶友好** - 用戶無需手動操作
4. **性能優化** - 每個請求間隔 200ms，避免 API 限制
5. **錯誤處理** - 包含完整的錯誤處理和日誌

---

**文檔版本**: 1.0
**最後更新**: 2025-11-01
**狀態**: 準備部署

