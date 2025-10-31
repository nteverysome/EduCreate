# Match-up Game 音頻功能 - 技術詳情

## 🏗️ 系統架構

### 數據流
```
1. 遊戲加載詞彙
   ↓
2. 檢查每個詞彙的 audioUrl
   ↓
3. 如果 audioUrl 為 null，調用 TTS API
   ↓
4. TTS API 生成音頻並返回 URL
   ↓
5. 更新詞彙的 audioUrl
   ↓
6. 創建卡片時使用 audioUrl 創建聲音按鈕
   ↓
7. 用戶點擊按鈕時播放音頻
```

## 🎮 遊戲代碼流程

### 詞彙加載流程
```javascript
// 1. 在 create() 方法中
await this.loadVocabularyFromAPI();

// 2. loadVocabularyFromAPI() 中
const activity = await fetch(`/api/activities/${activityId}`);
this.pairs = activity.vocabularyItems.map(item => ({
    english: item.english,
    audioUrl: item.audioUrl || null  // 可能為 null
}));

// 3. 新增：自動生成缺失的音頻
await this.generateMissingAudioUrls();

// 4. 構建音頻診斷信息
this.audioDiagnostics = this.buildAudioDiagnostics(this.pairs);
```

### 音頻生成函數
```javascript
async generateMissingAudioUrls() {
    // 1. 過濾出沒有 audioUrl 的詞彙
    const missingAudioPairs = this.pairs.filter(pair => !pair.audioUrl);
    
    // 2. 如果都有音頻，直接返回
    if (missingAudioPairs.length === 0) return;
    
    // 3. 遍歷每個缺失音頻的詞彙
    for (const pair of missingAudioPairs) {
        try {
            // 4. 調用 TTS API
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: pair.english,
                    language: 'en-US',
                    voice: 'en-US-Neural2-F'
                })
            });
            
            // 5. 如果成功，更新 audioUrl
            if (response.ok) {
                const data = await response.json();
                pair.audioUrl = data.audioUrl;
            }
        } catch (error) {
            console.error(`生成音頻失敗: ${pair.english}`, error);
        }
        
        // 6. 等待 200ms 避免 API 限制
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}
```

### 聲音按鈕創建
```javascript
createAudioButton(container, audioUrl, x, y, size, pairId) {
    // 1. 創建按鈕背景
    const buttonBg = this.add.rectangle(0, 0, size, size, 0x4CAF50);
    
    // 2. 創建喇叭圖標
    const speakerIcon = this.add.text(0, 0, '🔊', {...});
    
    // 3. 創建容器
    const buttonContainer = this.add.container(0, 0, [buttonBg, speakerIcon]);
    
    // 4. 保存 audioUrl
    buttonContainer.setData('audioUrl', audioUrl);
    
    // 5. 添加點擊事件
    buttonContainer.on('pointerdown', (pointer, localX, localY, event) => {
        event.stopPropagation();
        this.playAudio(audioUrl, buttonContainer, buttonBg);
    });
    
    return buttonContainer;
}
```

### 音頻播放
```javascript
playAudio(audioUrl, buttonContainer, buttonBg) {
    // 1. 驗證 audioUrl
    if (!audioUrl || audioUrl.trim() === '') {
        console.warn('⚠️ 音頻 URL 為空');
        return;
    }
    
    // 2. 防止重複點擊
    if (buttonContainer.getData('isPlaying')) return;
    
    // 3. 生成音頻 key
    const audioKey = `audio-${audioUrl.split('/').pop().split('?')[0].replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // 4. 檢查是否已載入
    if (!this.cache.audio.exists(audioKey)) {
        // 5. 載入音頻
        this.load.audio(audioKey, audioUrl);
        
        // 6. 監聽載入完成
        this.load.once('complete', () => {
            const audio = this.sound.add(audioKey, { volume: 0.8 });
            audio.play();
            
            // 7. 監聽播放完成
            audio.once('complete', () => {
                buttonContainer.setData('isPlaying', false);
                buttonBg.setFillStyle(0x4CAF50);
            });
        });
        
        this.load.start();
    } else {
        // 8. 直接播放已載入的音頻
        const audio = this.sound.add(audioKey, { volume: 0.8 });
        audio.play();
    }
}
```

## 🔊 TTS API 詳情

### 端點
```
POST /api/tts
```

### 請求
```json
{
  "text": "hello",
  "language": "en-US",
  "voice": "en-US-Neural2-F",
  "geptLevel": "ELEMENTARY"  // 可選
}
```

### 響應
```json
{
  "audioUrl": "https://r2-bucket.example.com/tts/hash.mp3",
  "cached": false,
  "hash": "abc123def456",
  "fileSize": 12345,
  "hitCount": 0
}
```

### 支持的語言和聲音
```javascript
{
  'en-US': {
    'male-adult': 'en-US-Neural2-D',
    'female-adult': 'en-US-Neural2-F',
    'male-child': 'en-US-Neural2-A',
    'female-child': 'en-US-Neural2-C'
  },
  'zh-TW': {
    'male-adult': 'cmn-TW-Wavenet-C',
    'female-adult': 'cmn-TW-Wavenet-A'
  }
}
```

## 📊 卡片佈局

### 6 種佈局類型
1. **Layout A**: 圖片 + 文字 + 音頻
2. **Layout B**: 音頻 (僅)
3. **Layout C**: 文字 (僅)
4. **Layout D**: 圖片 + 文字
5. **Layout E**: 音頻 + 文字
6. **Layout ImageAudio**: 圖片 + 音頻

### 關鍵修復
- **背景層必須在最底層** - 在 `container.add()` 時首先添加背景
- 其他元素（文字、音頻按鈕）在背景之後添加

## 🐛 已知問題和解決方案

### 問題 1: 音頻 URL 為 null
**原因**: 詞彙項目在創建時沒有生成 TTS 音頻
**解決**: 在遊戲加載時自動生成

### 問題 2: 背景覆蓋文字
**原因**: 背景在容器中最後添加，導致在最上層
**解決**: 修改所有 6 個佈局函數，將背景移到最前面

### 問題 3: "No audio" 標示顯示
**原因**: 代碼中有 `addAudioStatusBadge` 調用
**解決**: 註釋掉該調用

## 🔐 安全考慮

1. **API 認證** - TTS API 需要後端認證
2. **速率限制** - 每個請求間隔 200ms
3. **CORS** - 音頻 URL 必須支持 CORS
4. **音頻格式** - 使用 MP3 格式確保兼容性

## 📈 性能優化

1. **音頻緩存** - Phaser 會緩存已加載的音頻
2. **批量生成** - 可以批量生成多個音頻
3. **預加載** - 可以在遊戲開始前預加載所有音頻

## 🧪 測試清單

- [ ] 詞彙加載成功
- [ ] 缺失音頻被檢測到
- [ ] TTS API 被調用
- [ ] 音頻 URL 被更新
- [ ] 聲音按鈕可見
- [ ] 點擊按鈕時播放音頻
- [ ] 音頻播放完成後按鈕恢復狀態
- [ ] 多個詞彙的音頻都能播放
- [ ] 瀏覽器控制台沒有錯誤

---

**最後更新**: 2025-11-01

