# TTS（Text-to-Speech）成本分析與替代方案

## 📋 文檔概述

**創建日期**: 2025-10-23  
**目的**: 分析 EduCreate 實施 TTS 功能的成本和替代方案  
**結論**: 提供多種方案，從免費到付費，滿足不同需求

---

## 💰 商業 TTS 服務成本分析

### 1. **Azure Cognitive Services TTS**（Wordwall 使用）

#### 定價結構（2024-2025）

| 功能類型 | 免費額度 | 付費價格 |
|---------|---------|---------|
| **標準語音** | 每月 500 萬字符免費 | $4 USD / 100 萬字符 |
| **Neural 語音** | 每月 50 萬字符免費 | $16 USD / 100 萬字符 |
| **自定義 Neural 語音** | 無免費額度 | $24 USD / 100 萬字符 |

#### 使用場景估算

**假設 EduCreate 每月使用量**:
- 每個遊戲平均 20 個單字
- 每個單字平均 8 個字符
- 每月 10,000 個遊戲創建

**計算**:
```
10,000 遊戲 × 20 單字 × 8 字符 = 1,600,000 字符/月
```

**成本**:
- **免費額度內**: $0（前 50 萬字符）
- **超出部分**: 1,100,000 字符 × $16 / 1,000,000 = **$17.6 USD/月**

#### 優點
✅ 高質量 Neural 語音  
✅ 支援 60+ 種語言  
✅ 每月 50 萬字符免費額度  
✅ 與 Wordwall 相同技術  
✅ 穩定可靠

#### 缺點
❌ 超出免費額度後成本較高  
❌ 需要 Azure 帳戶  
❌ 需要網絡連接

---

### 2. **Google Cloud Text-to-Speech**

#### 定價結構（2024-2025）

| 功能類型 | 免費額度 | 付費價格 |
|---------|---------|---------|
| **標準語音** | 每月 400 萬字符免費 | $4 USD / 100 萬字符 |
| **WaveNet 語音** | 每月 100 萬字符免費 | $16 USD / 100 萬字符 |
| **Neural2 語音** | 每月 100 萬字符免費 | $16 USD / 100 萬字符 |

#### 使用場景估算

**相同假設**（每月 1,600,000 字符）:

**成本**:
- **免費額度內**: $0（前 100 萬字符）
- **超出部分**: 600,000 字符 × $16 / 1,000,000 = **$9.6 USD/月**

#### 優點
✅ 高質量 WaveNet/Neural2 語音  
✅ 支援 40+ 種語言  
✅ 每月 100 萬字符免費額度（比 Azure 多）  
✅ Google Cloud 生態系統整合

#### 缺點
❌ 超出免費額度後成本較高  
❌ 需要 Google Cloud 帳戶  
❌ 需要網絡連接

---

### 3. **Amazon Polly**

#### 定價結構（2024-2025）

| 功能類型 | 免費額度 | 付費價格 |
|---------|---------|---------|
| **標準語音** | 每月 500 萬字符免費（首 12 個月） | $4 USD / 100 萬字符 |
| **Neural 語音** | 每月 100 萬字符免費（首 12 個月） | $16 USD / 100 萬字符 |

#### 使用場景估算

**相同假設**（每月 1,600,000 字符）:

**成本**:
- **首 12 個月**: $0（前 100 萬字符）+ 600,000 × $16 / 1,000,000 = **$9.6 USD/月**
- **12 個月後**: 1,600,000 × $16 / 1,000,000 = **$25.6 USD/月**

#### 優點
✅ 首 12 個月有免費額度  
✅ 支援 30+ 種語言  
✅ AWS 生態系統整合

#### 缺點
❌ 12 個月後無免費額度  
❌ 需要 AWS 帳戶  
❌ 需要網絡連接

---

## 🆓 免費和開源替代方案

### 1. **Web Speech API**（瀏覽器原生）

#### 技術細節
```javascript
// 使用瀏覽器原生 TTS
const speak = (text, lang = 'en-US') => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
};

// 獲取可用語音
const getVoices = () => {
  return window.speechSynthesis.getVoices();
};
```

#### 成本
**完全免費** - $0

#### 優點
✅ **完全免費**  
✅ 無需 API 金鑰  
✅ 無需後端服務  
✅ 支援多種語言（取決於瀏覽器和操作系統）  
✅ 即時生成，無延遲

#### 缺點
❌ 語音質量較低（機械感較重）  
❌ 不同瀏覽器和操作系統的語音不一致  
❌ 無法保存音頻文件（只能即時播放）  
❌ 部分瀏覽器支援有限

#### 適用場景
- 預算有限的初期開發
- 即時語音播放（不需要保存）
- 簡單的教育應用

---

### 2. **Coqui TTS**（開源）

#### 技術細節
```python
# 安裝 Coqui TTS
pip install TTS

# 使用範例
from TTS.api import TTS

# 初始化模型
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False)

# 生成語音
tts.tts_to_file(text="Hello world", file_path="output.wav")
```

#### 成本
**完全免費** - $0（需要自己的伺服器）

#### 優點
✅ **完全免費和開源**  
✅ 可以自行部署（無 API 限制）  
✅ 支援多種語言和模型  
✅ 可以保存音頻文件  
✅ 可以自定義和訓練模型

#### 缺點
❌ 需要自己的伺服器（運算成本）  
❌ 需要技術能力部署和維護  
❌ 語音質量可能不如商業服務  
❌ 生成速度較慢（取決於硬件）

#### 適用場景
- 有自己的伺服器
- 需要完全控制和自定義
- 長期大量使用（攤平成本）

---

### 3. **Mozilla TTS**（開源）

#### 技術細節
```python
# 安裝 Mozilla TTS
pip install mozilla-tts

# 使用範例
from TTS.utils.synthesizer import Synthesizer

synthesizer = Synthesizer(
    tts_checkpoint="path/to/checkpoint.pth",
    tts_config_path="path/to/config.json"
)

wav = synthesizer.tts("Hello world")
```

#### 成本
**完全免費** - $0（需要自己的伺服器）

#### 優點
✅ **完全免費和開源**  
✅ Mozilla 支援，社群活躍  
✅ 支援多種語言  
✅ 可以自行部署

#### 缺點
❌ 需要自己的伺服器  
❌ 需要技術能力部署  
❌ 生成速度較慢

---

### 4. **pyttsx3**（離線 Python TTS）

#### 技術細節
```python
# 安裝 pyttsx3
pip install pyttsx3

# 使用範例
import pyttsx3

engine = pyttsx3.init()
engine.setProperty('rate', 150)  # 語速
engine.setProperty('volume', 1.0)  # 音量

# 即時播放
engine.say("Hello world")
engine.runAndWait()

# 保存為文件
engine.save_to_file("Hello world", "output.mp3")
engine.runAndWait()
```

#### 成本
**完全免費** - $0

#### 優點
✅ **完全免費**  
✅ 離線運行（無需網絡）  
✅ 簡單易用  
✅ 跨平台（Windows, macOS, Linux）

#### 缺點
❌ 語音質量較低  
❌ 語言支援有限  
❌ 依賴操作系統的 TTS 引擎

---

## 📊 成本對比總結

### 每月 1,600,000 字符使用量

| 方案 | 月成本 | 年成本 | 語音質量 | 語言支援 |
|------|--------|--------|---------|---------|
| **Azure Neural TTS** | $17.6 | $211.2 | ⭐⭐⭐⭐⭐ | 60+ |
| **Google Cloud TTS** | $9.6 | $115.2 | ⭐⭐⭐⭐⭐ | 40+ |
| **Amazon Polly** | $9.6 (首年) | $115.2 (首年) | ⭐⭐⭐⭐⭐ | 30+ |
| **Web Speech API** | $0 | $0 | ⭐⭐⭐ | 取決於瀏覽器 |
| **Coqui TTS** | $0 + 伺服器成本 | $0 + 伺服器成本 | ⭐⭐⭐⭐ | 多種 |
| **Mozilla TTS** | $0 + 伺服器成本 | $0 + 伺服器成本 | ⭐⭐⭐⭐ | 多種 |
| **pyttsx3** | $0 | $0 | ⭐⭐ | 有限 |

---

## 💡 EduCreate 推薦方案

### 階段 1: MVP（最小可行產品）
**推薦**: **Web Speech API**

**理由**:
- ✅ 完全免費
- ✅ 快速實施
- ✅ 無需後端服務
- ✅ 適合驗證產品概念

**實施代碼**:
```javascript
// React 組件範例
const TextToSpeech = ({ text, language = 'en-US' }) => {
  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  return <button onClick={speak}>🔊 Play Sound</button>;
};
```

---

### 階段 2: 成長期（有付費用戶）
**推薦**: **Google Cloud TTS**

**理由**:
- ✅ 每月 100 萬字符免費（比 Azure 多）
- ✅ 高質量 Neural 語音
- ✅ 超出免費額度後成本較低（$9.6/月）
- ✅ 可以保存音頻文件

**實施代碼**:
```javascript
// Node.js 後端範例
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');

const client = new textToSpeech.TextToSpeechClient();

async function generateSpeech(text, languageCode, voiceName) {
  const request = {
    input: { text },
    voice: { languageCode, name: voiceName },
    audioConfig: { audioEncoding: 'MP3' }
  };

  const [response] = await client.synthesizeSpeech(request);
  
  // 保存到文件或上傳到 CDN
  fs.writeFileSync('output.mp3', response.audioContent, 'binary');
  
  return 'output.mp3';
}
```

---

### 階段 3: 規模化（大量用戶）
**推薦**: **Coqui TTS（自建）+ Google Cloud TTS（備用）**

**理由**:
- ✅ 自建 TTS 降低長期成本
- ✅ Google Cloud TTS 作為備用（高峰期或特殊語言）
- ✅ 完全控制和自定義
- ✅ 可以針對教育場景優化

**架構**:
```
用戶請求 → 檢查緩存 → 
  ├─ 有緩存 → 直接返回
  └─ 無緩存 → 
      ├─ 優先使用 Coqui TTS（自建）
      └─ 失敗或特殊需求 → Google Cloud TTS
```

---

## 🎯 成本優化策略

### 1. **音頻緩存**
```javascript
// 使用 MD5 哈希緩存音頻文件
const crypto = require('crypto');

function getCacheKey(text, language, voice) {
  const hash = crypto.createHash('md5')
    .update(`${text}-${language}-${voice}`)
    .digest('hex');
  return `tts-${hash}.mp3`;
}

// 檢查緩存
const cacheKey = getCacheKey(text, language, voice);
if (await fileExists(cacheKey)) {
  return cacheKey; // 直接返回緩存
}

// 生成新音頻
const audioUrl = await generateSpeech(text, language, voice);
await saveToCache(cacheKey, audioUrl);
```

**節省成本**: 重複內容不需要重新生成，可節省 **50-80%** 的 API 調用

---

### 2. **批量生成**
```javascript
// 批量生成常用單字的音頻
const commonWords = ['apple', 'banana', 'cat', 'dog', ...];

async function preGenerateCommonWords() {
  for (const word of commonWords) {
    await generateAndCache(word, 'en-US', 'female');
  }
}
```

**節省成本**: 預先生成常用內容，減少即時 API 調用

---

### 3. **使用免費額度**
- Azure: 每月 50 萬字符免費
- Google: 每月 100 萬字符免費
- **策略**: 同時使用兩個服務，最大化免費額度

**節省成本**: 每月可免費使用 **150 萬字符**

---

## 📈 成本預測

### 不同用戶規模的月成本

| 每月遊戲創建數 | 字符數 | Web Speech API | Google Cloud TTS | Azure TTS |
|--------------|--------|----------------|------------------|-----------|
| 1,000 | 160,000 | $0 | $0（免費額度內） | $0（免費額度內） |
| 5,000 | 800,000 | $0 | $0（免費額度內） | $0（免費額度內） |
| 10,000 | 1,600,000 | $0 | $9.6 | $17.6 |
| 50,000 | 8,000,000 | $0 | $112 | $120 |
| 100,000 | 16,000,000 | $0 | $240 | $248 |

---

## 🎓 結論與建議

### 最佳策略：**混合方案**

1. **初期（0-1,000 用戶）**: 使用 **Web Speech API**（$0）
2. **成長期（1,000-10,000 用戶）**: 使用 **Google Cloud TTS**（$0-$10/月）
3. **規模化（10,000+ 用戶）**: 
   - 自建 **Coqui TTS** 處理 80% 請求
   - **Google Cloud TTS** 處理 20% 特殊需求
   - 實施音頻緩存策略

### 預估總成本

**第一年**:
- 前 6 個月: $0（Web Speech API）
- 後 6 個月: $60（Google Cloud TTS，平均 $10/月）
- **總計**: **$60/年**

**第二年**（假設用戶增長 5 倍）:
- Google Cloud TTS: $600/年
- 或自建 Coqui TTS: $200/年（伺服器成本）
- **總計**: **$200-$600/年**

---

## 📚 參考資源

- **Azure TTS 定價**: https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/
- **Google Cloud TTS 定價**: https://cloud.google.com/text-to-speech/pricing
- **Amazon Polly 定價**: https://aws.amazon.com/polly/pricing/
- **Coqui TTS**: https://github.com/coqui-ai/TTS
- **Mozilla TTS**: https://github.com/mozilla/TTS
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

---

**文檔創建日期**: 2025-10-23  
**維護者**: EduCreate Development Team

