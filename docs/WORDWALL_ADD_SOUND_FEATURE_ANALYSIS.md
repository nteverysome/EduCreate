# Wordwall「加入聲音」功能深度分析報告

## 📋 分析概述

**分析日期**: 2025-10-23  
**分析目標**: https://wordwall.net/create/entercontent?templateId=3&folderId=0  
**功能**: Add Sound（加入聲音）  
**分析工具**: Playwright Browser Automation

---

## 🎯 核心功能發現

### 1. **雙重音頻來源**

Wordwall 的「加入聲音」功能提供兩種方式：

#### A. **TTS（Text-to-Speech）生成**
- 用戶輸入文字
- 選擇語言和性別
- 系統自動生成語音

#### B. **上傳音頻文件**
- 用戶可以上傳自己的音頻文件
- 支援本地文件選擇

---

## 🔧 技術實現細節

### 1. **TTS API 調用**

#### API 端點
```
POST https://wordwall.net/createajax/generatespeech
```

#### 音頻存儲
```
GET https://wordwalluser.blob.core.windows.net/content-sounds/tts/en-gb-sonianeural/5eb63bbbe01eeed093cb22bb8f5acdc3.mp3
```

**關鍵發現**:
- 使用 **Azure Blob Storage** 存儲生成的音頻文件
- 音頻文件格式: **MP3**
- 文件命名: 使用 **MD5 哈希值**（`5eb63bbbe01eeed093cb22bb8f5acdc3.mp3`）
- TTS 引擎: **Azure Neural TTS**（例如 `en-gb-sonianeural`）

---

### 2. **支援的語言和語音**

#### 語言選項（部分列表）
```javascript
// 從 HTML select 元素提取的語言選項
const languages = [
  "en-GB-RyanNeural#en-GB-SoniaNeural#2057#0",  // English (GB)
  "en-US-AndrewNeural#en-US-AvaNeural#1033#0",  // English (US)
  "zh-CN-YunxiNeural#zh-CN-XiaoxiaoNeural#2052#2052",  // 简体字 (CN)
  "zh-TW-YunJheNeural#zh-TW-HsiaoChenNeural#1028#1028",  // 繁體字 (TW)
  "ja-JP-KeitaNeural#ja-JP-NanamiNeural#1041#1041",  // 日本語 (JP)
  "ko-KR-InJoonNeural#ko-KR-SunHiNeural#1042#1042",  // 한국어 (KR)
  // ... 總共支援 60+ 種語言和方言
];
```

#### 語音選項格式解析
```
格式: "男聲Neural名稱#女聲Neural名稱#語言ID#地區ID"
例如: "en-GB-RyanNeural#en-GB-SoniaNeural#2057#0"
```

**支援的性別**:
- Male（男聲）
- Female（女聲）

---

### 3. **前端 UI 結構**

#### HTML 結構
```html
<div class="modal-content js-modal-content media-modal">
  <div class="sound-modal-header js-sound-modal-header media-modal-header">
    <a href="#" class="upload-sound-button js-sound-upload">
      <span class="fa fa-upload"></span>
      <span> Upload</span>
    </a>
    <div class="sound-add-modal-title">Add Sound</div>
  </div>

  <div class="sound-tts-wrapper">
    <div class="create-top-label">Text</div>
    <input type="text" 
           placeholder="Enter text to read aloud..." 
           class="sound-tts-input js-sound-tts-input" 
           maxlength="300">
    
    <div class="create-top-label">Language</div>
    <select class="sound-tts-language js-sound-tts-language">
      <!-- 60+ 語言選項 -->
    </select>
    
    <div class="create-top-label">Voice</div>
    <select class="sound-tts-voice js-sound-tts-voice">
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select>
    
    <button class="default-btn large js-sound-tts-generate">
      <span>Generate</span>
    </button>
  </div>
</div>
```

---

### 4. **音頻播放和波形顯示**

#### 播放界面結構
```html
<div class="sound-play-wrapper clearfix">
  <button class="sound-play default-btn white js-sound-play">
    <span class="fa fa-play js-fa-play"></span>
    <span class="fa fa-stop js-fa-stop hidden"></span>
  </button>
  
  <div class="sound-visual-wrapper">
    <canvas class="sound-cursor js-sound-cursor"></canvas>
    <canvas class="sound-waveform js-sound-waveform" width="330" height="140"></canvas>
    <img src="loading_bar_grey.gif" class="hidden sound-loading js-sound-loading">
  </div>
</div>
```

**關鍵技術**:
- 使用 **Canvas** 繪製波形圖
- 波形尺寸: 330x140 像素
- 游標 Canvas 用於顯示播放進度
- 支援播放/停止控制

---

### 5. **CSS 樣式設計**

#### 關鍵 CSS 類
```css
/* 音頻圖標樣式 */
.item-media-holder.has-sound .item-media-icon {
  background-color: #d0d0d0;
  border-radius: 6px;
  color: #000;
  margin-top: 3px;
  height: 30px;
  line-height: 29px;
}

/* TTS 輸入包裝器 */
.sound-tts-wrapper {
  text-align: start;
  padding: 27px 25px 25px 25px;
}

/* 波形顯示 */
.sound-visual-wrapper {
  display: inline-block;
  position: relative;
  width: calc(100% - 150px);
  height: 140px;
}

/* 播放按鈕 */
.sound-play {
  width: 140px;
  height: 140px;
  float: left;
}
```

---

### 6. **LocalStorage 設置**

Wordwall 使用 LocalStorage 保存用戶的音頻偏好設置：

```javascript
{
  "soundadd.speedvalue": "normal",      // 播放速度
  "soundadd.voiceid": "female",         // 語音性別
  "soundadd.languageid": "0",           // 語言 ID
  "soundadd.localeid": "2057"           // 地區 ID (2057 = English GB)
}
```

---

## 🎨 UI/UX 設計特點

### 1. **簡潔的兩步流程**
1. **輸入階段**: 輸入文字 → 選擇語言 → 選擇性別 → 生成
2. **預覽階段**: 播放音頻 → 查看波形 → 確認或返回

### 2. **視覺反饋**
- 載入動畫（GIF）
- 波形可視化（Canvas）
- 播放進度游標
- 圖標狀態變化（播放/停止）

### 3. **用戶友好功能**
- 文字輸入限制 300 字符
- 支援 60+ 種語言和方言
- 男女聲選擇
- 上傳自定義音頻選項

---

## 🔍 技術架構分析

### 1. **前端框架**
- **Saltarelle C# to JavaScript Compiler**
  - 使用 C# 編寫前端邏輯，編譯為 JavaScript
  - 文件: `vel-wordwall-create.js`, `vel-wordwall-core.js`

### 2. **音頻處理**
- **Web Audio API**: 支援（瀏覽器原生）
- **HTML5 Audio**: 支援
- **Canvas API**: 用於波形繪製

### 3. **後端服務**
- **TTS 服務**: Azure Neural TTS
- **存儲**: Azure Blob Storage
- **CDN**: Cloudflare + 自定義 CDN (`app.cdn.wordwall.net`)

---

## 📊 網絡請求分析

### 關鍵 API 調用順序

1. **列出語音選項**
   ```
   GET https://wordwall.net/createajax/listspeechoptions
   ```

2. **生成語音**
   ```
   POST https://wordwall.net/createajax/generatespeech
   請求體: {
     text: "Hello world",
     language: "en-GB-SoniaNeural",
     voice: "female"
   }
   ```

3. **獲取音頻文件**
   ```
   GET https://wordwalluser.blob.core.windows.net/content-sounds/tts/en-gb-sonianeural/5eb63bbbe01eeed093cb22bb8f5acdc3.mp3
   ```

---

## 💡 EduCreate 實施建議

### 1. **TTS 整合方案**

#### 選項 A: Azure Cognitive Services（推薦）
```javascript
// 使用 Azure TTS API
const azureTTS = {
  endpoint: 'https://YOUR_REGION.tts.speech.microsoft.com/cognitiveservices/v1',
  apiKey: 'YOUR_API_KEY',
  
  async generateSpeech(text, language, voice) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
      },
      body: `
        <speak version='1.0' xml:lang='${language}'>
          <voice name='${voice}'>${text}</voice>
        </speak>
      `
    });
    
    return await response.blob();
  }
};
```

#### 選項 B: Google Cloud TTS
```javascript
// 使用 Google Cloud TTS API
const googleTTS = {
  apiKey: 'YOUR_API_KEY',
  endpoint: 'https://texttospeech.googleapis.com/v1/text:synthesize',
  
  async generateSpeech(text, languageCode, voiceName) {
    const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode, name: voiceName },
        audioConfig: { audioEncoding: 'MP3' }
      })
    });
    
    const data = await response.json();
    return data.audioContent; // Base64 編碼的音頻
  }
};
```

---

### 2. **前端 UI 實施**

#### React 組件範例
```jsx
import React, { useState } from 'react';

const AddSoundModal = ({ onSave, onClose }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en-GB');
  const [voice, setVoice] = useState('female');
  const [audioUrl, setAudioUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, voice })
      });
      
      const data = await response.json();
      setAudioUrl(data.audioUrl);
    } catch (error) {
      console.error('TTS generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Sound</h2>
        
        <div className="form-group">
          <label>Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to read aloud..."
            maxLength={300}
          />
        </div>
        
        <div className="form-group">
          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en-GB">English (GB)</option>
            <option value="en-US">English (US)</option>
            <option value="zh-TW">繁體字 (TW)</option>
            {/* 更多語言選項 */}
          </select>
        </div>
        
        <div className="form-group">
          <label>Voice</label>
          <select value={voice} onChange={(e) => setVoice(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        
        <button onClick={handleGenerate} disabled={isGenerating || !text}>
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
        
        {audioUrl && (
          <div className="audio-preview">
            <audio src={audioUrl} controls />
            <button onClick={() => onSave(audioUrl)}>OK</button>
          </div>
        )}
        
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AddSoundModal;
```

---

## 🎯 總結與建議

### Wordwall 的優勢
1. ✅ 使用 **Azure Neural TTS**，語音質量高
2. ✅ 支援 **60+ 種語言**，覆蓋全球市場
3. ✅ **波形可視化**，提升用戶體驗
4. ✅ **雙重音頻來源**（TTS + 上傳），靈活性高
5. ✅ **LocalStorage 保存偏好**，提升用戶體驗

### EduCreate 實施建議
1. **優先使用 Azure TTS**（與 Wordwall 相同）
2. **實施波形可視化**（使用 Canvas 或 WaveSurfer.js）
3. **支援多語言**（至少支援英文、繁體中文、簡體中文）
4. **添加上傳功能**（支援 MP3、WAV 格式）
5. **保存用戶偏好**（使用 LocalStorage 或資料庫）

---

## 📚 參考資源

- **Azure Cognitive Services TTS**: https://azure.microsoft.com/en-us/services/cognitive-services/text-to-speech/
- **Google Cloud TTS**: https://cloud.google.com/text-to-speech
- **WaveSurfer.js**（波形可視化庫）: https://wavesurfer-js.org/
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

**分析完成日期**: 2025-10-23  
**分析者**: EduCreate Development Team

