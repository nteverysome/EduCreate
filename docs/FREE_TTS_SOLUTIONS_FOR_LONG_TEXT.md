開始待完成任務 # 免費 TTS 方案：千字文章語音朗讀

## 📋 文檔概述

**創建日期**: 2025-10-23  
**目的**: 提供完全免費的方案來實現千字文章的語音朗讀  
**結論**: 有多種免費方案可選，無需任何成本

---

## 🆓 完全免費的 TTS 方案

### 方案 1: **Web Speech API**（推薦 ⭐⭐⭐⭐⭐）

#### 技術細節
這是瀏覽器原生支援的 API，完全免費，無需任何後端服務。

#### 完整實施代碼

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>千字文章語音朗讀</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    
    textarea {
      width: 100%;
      height: 300px;
      padding: 10px;
      font-size: 16px;
      border: 2px solid #ddd;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    button {
      padding: 12px 24px;
      font-size: 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .play-btn {
      background-color: #4CAF50;
      color: white;
    }
    
    .play-btn:hover {
      background-color: #45a049;
    }
    
    .pause-btn {
      background-color: #ff9800;
      color: white;
    }
    
    .stop-btn {
      background-color: #f44336;
      color: white;
    }
    
    .settings {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .setting-group {
      margin-bottom: 15px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    select, input[type="range"] {
      width: 100%;
      padding: 8px;
      font-size: 14px;
    }
    
    .progress {
      margin-top: 20px;
      padding: 10px;
      background-color: #e3f2fd;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <h1>🔊 千字文章語音朗讀器</h1>
  
  <div class="settings">
    <h3>語音設置</h3>
    
    <div class="setting-group">
      <label for="voiceSelect">選擇語音：</label>
      <select id="voiceSelect"></select>
    </div>
    
    <div class="setting-group">
      <label for="rateRange">語速：<span id="rateValue">1.0</span></label>
      <input type="range" id="rateRange" min="0.5" max="2.0" step="0.1" value="1.0">
    </div>
    
    <div class="setting-group">
      <label for="pitchRange">音調：<span id="pitchValue">1.0</span></label>
      <input type="range" id="pitchRange" min="0.5" max="2.0" step="0.1" value="1.0">
    </div>
    
    <div class="setting-group">
      <label for="volumeRange">音量：<span id="volumeValue">1.0</span></label>
      <input type="range" id="volumeRange" min="0" max="1" step="0.1" value="1.0">
    </div>
  </div>
  
  <textarea id="textInput" placeholder="在此輸入您的千字文章...">
這是一個測試文章。Web Speech API 是瀏覽器原生支援的語音合成技術，完全免費且無需任何後端服務。

它支援多種語言，包括繁體中文、簡體中文、英文、日文等。您可以調整語速、音調和音量來獲得最佳的朗讀效果。

這個方案特別適合教育應用，因為它不需要任何成本，而且可以即時生成語音，非常適合用於課文朗讀、單字發音等場景。
  </textarea>
  
  <div class="controls">
    <button class="play-btn" onclick="speakText()">▶️ 播放</button>
    <button class="pause-btn" onclick="pauseSpeech()">⏸️ 暫停</button>
    <button class="stop-btn" onclick="stopSpeech()">⏹️ 停止</button>
  </div>
  
  <div class="progress" id="progress">
    準備就緒
  </div>

  <script>
    let synth = window.speechSynthesis;
    let voices = [];
    let currentUtterance = null;
    
    // 載入可用語音
    function loadVoices() {
      voices = synth.getVoices();
      const voiceSelect = document.getElementById('voiceSelect');
      voiceSelect.innerHTML = '';
      
      // 優先顯示中文語音
      const chineseVoices = voices.filter(voice => 
        voice.lang.includes('zh') || voice.lang.includes('cmn')
      );
      
      const otherVoices = voices.filter(voice => 
        !voice.lang.includes('zh') && !voice.lang.includes('cmn')
      );
      
      // 添加中文語音
      if (chineseVoices.length > 0) {
        const chineseGroup = document.createElement('optgroup');
        chineseGroup.label = '中文語音';
        chineseVoices.forEach((voice, index) => {
          const option = document.createElement('option');
          option.value = index;
          option.textContent = `${voice.name} (${voice.lang})`;
          chineseGroup.appendChild(option);
        });
        voiceSelect.appendChild(chineseGroup);
      }
      
      // 添加其他語音
      if (otherVoices.length > 0) {
        const otherGroup = document.createElement('optgroup');
        otherGroup.label = '其他語音';
        otherVoices.forEach((voice, index) => {
          const option = document.createElement('option');
          option.value = chineseVoices.length + index;
          option.textContent = `${voice.name} (${voice.lang})`;
          otherGroup.appendChild(option);
        });
        voiceSelect.appendChild(otherGroup);
      }
    }
    
    // 初始化語音列表
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
    
    // 更新滑桿顯示值
    document.getElementById('rateRange').addEventListener('input', (e) => {
      document.getElementById('rateValue').textContent = e.target.value;
    });
    
    document.getElementById('pitchRange').addEventListener('input', (e) => {
      document.getElementById('pitchValue').textContent = e.target.value;
    });
    
    document.getElementById('volumeRange').addEventListener('input', (e) => {
      document.getElementById('volumeValue').textContent = e.target.value;
    });
    
    // 播放文字
    function speakText() {
      const text = document.getElementById('textInput').value;
      
      if (!text.trim()) {
        alert('請輸入要朗讀的文字');
        return;
      }
      
      // 停止當前播放
      synth.cancel();
      
      // 創建新的語音實例
      currentUtterance = new SpeechSynthesisUtterance(text);
      
      // 設置語音參數
      const voiceIndex = document.getElementById('voiceSelect').value;
      currentUtterance.voice = voices[voiceIndex];
      currentUtterance.rate = parseFloat(document.getElementById('rateRange').value);
      currentUtterance.pitch = parseFloat(document.getElementById('pitchRange').value);
      currentUtterance.volume = parseFloat(document.getElementById('volumeRange').value);
      
      // 事件監聽
      currentUtterance.onstart = () => {
        document.getElementById('progress').textContent = '正在播放...';
        document.getElementById('progress').style.backgroundColor = '#c8e6c9';
      };
      
      currentUtterance.onend = () => {
        document.getElementById('progress').textContent = '播放完成';
        document.getElementById('progress').style.backgroundColor = '#e3f2fd';
      };
      
      currentUtterance.onerror = (event) => {
        document.getElementById('progress').textContent = `錯誤: ${event.error}`;
        document.getElementById('progress').style.backgroundColor = '#ffcdd2';
      };
      
      // 開始播放
      synth.speak(currentUtterance);
    }
    
    // 暫停播放
    function pauseSpeech() {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        document.getElementById('progress').textContent = '已暫停';
        document.getElementById('progress').style.backgroundColor = '#fff9c4';
      } else if (synth.paused) {
        synth.resume();
        document.getElementById('progress').textContent = '繼續播放...';
        document.getElementById('progress').style.backgroundColor = '#c8e6c9';
      }
    }
    
    // 停止播放
    function stopSpeech() {
      synth.cancel();
      document.getElementById('progress').textContent = '已停止';
      document.getElementById('progress').style.backgroundColor = '#e3f2fd';
    }
  </script>
</body>
</html>
```

#### 優點
✅ **完全免費**，無任何成本  
✅ **無需後端服務**，純前端實現  
✅ **支援多種語言**（繁體中文、簡體中文、英文等）  
✅ **可調整語速、音調、音量**  
✅ **即時生成**，無延遲  
✅ **支援暫停/繼續**  
✅ **無字數限制**（可以朗讀千字以上的文章）

#### 缺點
❌ 語音質量取決於操作系統和瀏覽器  
❌ 不同設備的語音可能不一致  
❌ 無法保存為音頻文件（只能即時播放）

#### 瀏覽器支援
- ✅ Chrome/Edge: 完全支援
- ✅ Safari: 完全支援
- ✅ Firefox: 完全支援
- ✅ Opera: 完全支援

---

### 方案 2: **分段朗讀 + 免費 TTS API**

如果您需要更高質量的語音，可以使用免費額度的商業 TTS 服務。

#### Google Cloud TTS（每月 100 萬字符免費）

```javascript
// Node.js 後端範例
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');

const client = new textToSpeech.TextToSpeechClient();

async function generateSpeechForLongText(text, outputFile) {
  // 分段處理（每段 5000 字符）
  const maxChars = 5000;
  const segments = [];
  
  for (let i = 0; i < text.length; i += maxChars) {
    segments.push(text.substring(i, i + maxChars));
  }
  
  const audioSegments = [];
  
  for (const segment of segments) {
    const request = {
      input: { text: segment },
      voice: { 
        languageCode: 'zh-TW',
        name: 'zh-TW-Wavenet-A'
      },
      audioConfig: { audioEncoding: 'MP3' }
    };
    
    const [response] = await client.synthesizeSpeech(request);
    audioSegments.push(response.audioContent);
  }
  
  // 合併音頻片段
  const combinedAudio = Buffer.concat(audioSegments);
  fs.writeFileSync(outputFile, combinedAudio, 'binary');
  
  console.log(`音頻已保存到 ${outputFile}`);
}

// 使用範例
const longText = `您的千字文章內容...`;
generateSpeechForLongText(longText, 'output.mp3');
```

#### 成本分析
- **免費額度**: 每月 100 萬字符
- **千字文章**: 約 1,000 字符
- **可免費生成**: 每月 1,000 篇千字文章
- **超出後**: $16 USD / 100 萬字符

---

### 方案 3: **Coqui TTS（開源自建）**

完全免費的開源 TTS 解決方案，適合自己部署。

#### 安裝和使用

```bash
# 安裝 Coqui TTS
pip install TTS

# 列出可用模型
tts --list_models

# 生成語音（中文）
tts --text "您的千字文章內容" \
    --model_name "tts_models/zh-CN/baker/tacotron2-DDC-GST" \
    --out_path output.wav
```

#### Python 腳本範例

```python
from TTS.api import TTS
import os

# 初始化 TTS 模型
tts = TTS(model_name="tts_models/zh-CN/baker/tacotron2-DDC-GST")

def generate_speech_for_long_text(text, output_file):
    """
    為長文本生成語音
    """
    # 分段處理（每段 500 字符）
    max_chars = 500
    segments = [text[i:i+max_chars] for i in range(0, len(text), max_chars)]
    
    temp_files = []
    
    # 為每段生成音頻
    for i, segment in enumerate(segments):
        temp_file = f"temp_segment_{i}.wav"
        tts.tts_to_file(text=segment, file_path=temp_file)
        temp_files.append(temp_file)
    
    # 使用 pydub 合併音頻片段
    from pydub import AudioSegment
    
    combined = AudioSegment.empty()
    for temp_file in temp_files:
        audio = AudioSegment.from_wav(temp_file)
        combined += audio
        os.remove(temp_file)  # 刪除臨時文件
    
    # 導出最終音頻
    combined.export(output_file, format="mp3")
    print(f"音頻已保存到 {output_file}")

# 使用範例
long_text = """
您的千字文章內容...
"""

generate_speech_for_long_text(long_text, "output.mp3")
```

#### 優點
✅ **完全免費**  
✅ **可以保存為音頻文件**  
✅ **支援多種語言**  
✅ **可以自定義和訓練模型**  
✅ **無字數限制**

#### 缺點
❌ 需要自己的伺服器或本地運行  
❌ 需要一定的技術能力  
❌ 生成速度較慢（取決於硬件）

---

### 方案 4: **pyttsx3（離線 Python TTS）**

最簡單的離線 TTS 方案。

#### 安裝和使用

```bash
pip install pyttsx3
```

#### Python 腳本範例

```python
import pyttsx3

def read_long_text(text, save_to_file=None):
    """
    朗讀長文本或保存為音頻文件
    """
    engine = pyttsx3.init()
    
    # 設置語音參數
    engine.setProperty('rate', 150)  # 語速
    engine.setProperty('volume', 1.0)  # 音量
    
    # 獲取可用語音
    voices = engine.getProperty('voices')
    
    # 嘗試設置中文語音
    for voice in voices:
        if 'chinese' in voice.name.lower() or 'mandarin' in voice.name.lower():
            engine.setProperty('voice', voice.id)
            break
    
    if save_to_file:
        # 保存為文件
        engine.save_to_file(text, save_to_file)
        engine.runAndWait()
        print(f"音頻已保存到 {save_to_file}")
    else:
        # 即時播放
        engine.say(text)
        engine.runAndWait()

# 使用範例
long_text = """
您的千字文章內容...
"""

# 即時播放
read_long_text(long_text)

# 或保存為文件
read_long_text(long_text, save_to_file="output.mp3")
```

#### 優點
✅ **完全免費**  
✅ **離線運行**，無需網絡  
✅ **簡單易用**  
✅ **可以保存為音頻文件**  
✅ **無字數限制**

#### 缺點
❌ 語音質量較低  
❌ 中文支援取決於操作系統

---

## 📊 方案對比

| 方案 | 成本 | 語音質量 | 易用性 | 可保存文件 | 推薦度 |
|------|------|---------|--------|-----------|--------|
| **Web Speech API** | $0 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ |
| **Google Cloud TTS** | $0（免費額度內） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ |
| **Coqui TTS** | $0 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ |
| **pyttsx3** | $0 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐ |

---

## 🎯 推薦方案

### 如果您需要**即時朗讀**（不需要保存文件）
**推薦**: **Web Speech API** ⭐⭐⭐⭐⭐

**理由**:
- 完全免費
- 無需後端
- 實施簡單
- 支援千字以上的文章

### 如果您需要**保存為音頻文件**
**推薦**: **Google Cloud TTS（免費額度）** ⭐⭐⭐⭐

**理由**:
- 每月 100 萬字符免費
- 可以生成 1,000 篇千字文章
- 語音質量最高

### 如果您需要**完全離線**
**推薦**: **Coqui TTS** ⭐⭐⭐⭐

**理由**:
- 完全免費
- 無需網絡
- 語音質量較好

---

## 💡 實施建議

### 最佳實踐：混合方案

```javascript
// 前端：使用 Web Speech API 即時播放
function playTextImmediately(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';
  window.speechSynthesis.speak(utterance);
}

// 後端：使用 Google Cloud TTS 生成可下載的音頻文件
async function generateDownloadableAudio(text) {
  // 調用 Google Cloud TTS API
  const audioUrl = await generateSpeech(text);
  return audioUrl;
}

// 用戶可以選擇：
// 1. 即時播放（免費，Web Speech API）
// 2. 下載音頻（免費額度內，Google Cloud TTS）
```

---

## 📚 完整範例專案

我已經在上面提供了完整的 HTML 範例，您可以直接複製使用。這個範例包括：

1. ✅ 文字輸入區域
2. ✅ 語音選擇（自動偵測中文語音）
3. ✅ 語速、音調、音量調整
4. ✅ 播放、暫停、停止控制
5. ✅ 播放進度顯示
6. ✅ 完整的錯誤處理

---

## 🎓 總結

**最推薦的免費方案**: **Web Speech API**

**原因**:
- ✅ 完全免費，無任何成本
- ✅ 無需後端服務
- ✅ 支援千字以上的文章
- ✅ 實施簡單，只需前端代碼
- ✅ 支援多種語言
- ✅ 可調整語速、音調、音量

**唯一限制**: 無法保存為音頻文件（只能即時播放）

如果您需要保存音頻文件，可以使用 Google Cloud TTS 的免費額度（每月 100 萬字符），足夠生成 1,000 篇千字文章。

---

**文檔創建日期**: 2025-10-23  
**維護者**: EduCreate Development Team

