# Wordwall TTS vs Web Speech API 對比分析

## 📋 文檔概述

**創建日期**: 2025-10-23  
**目的**: 分析 Wordwall 的 TTS 實現與 Web Speech API 的差異  
**結論**: Wordwall 使用 Azure Neural TTS，但我們可以用 Web Speech API 實現類似功能

---

## 🔍 Wordwall 的 TTS 實現

### 技術棧
根據我們的深度分析，Wordwall 使用的是：

1. **TTS 引擎**: **Azure Neural TTS**（商業服務）
2. **API 調用**: 後端調用 Azure API
3. **音頻存儲**: Azure Blob Storage
4. **音頻格式**: MP3
5. **成本**: 付費服務（$16 USD / 100 萬字符）

### 工作流程
```
用戶輸入文字 
  → 前端發送請求到 Wordwall 後端
    → 後端調用 Azure TTS API
      → Azure 生成 MP3 文件
        → 上傳到 Azure Blob Storage
          → 返回音頻 URL 給前端
            → 前端播放音頻
```

### 關鍵特點
- ✅ 高質量 Neural 語音
- ✅ 可以保存音頻文件
- ✅ 語音一致性高（所有用戶聽到相同的語音）
- ✅ 支援 60+ 種語言
- ❌ 需要後端服務
- ❌ 需要付費（超出免費額度）
- ❌ 需要網絡連接

---

## 🆓 Web Speech API 的實現

### 技術棧
Web Speech API 是瀏覽器原生支援的 TTS 技術：

1. **TTS 引擎**: 瀏覽器和操作系統內建
2. **API 調用**: 純前端，無需後端
3. **音頻存儲**: 無（即時生成）
4. **音頻格式**: 無（直接播放）
5. **成本**: **完全免費**

### 工作流程
```
用戶輸入文字 
  → 前端調用 Web Speech API
    → 瀏覽器/操作系統生成語音
      → 即時播放
```

### 關鍵特點
- ✅ **完全免費**
- ✅ 無需後端服務
- ✅ 即時生成，無延遲
- ✅ 支援多種語言
- ❌ 語音質量取決於設備
- ❌ 無法保存音頻文件
- ❌ 不同設備的語音可能不一致

---

## 📊 詳細對比

| 特性 | Wordwall（Azure TTS） | Web Speech API |
|------|----------------------|----------------|
| **成本** | $16/100萬字符 | **完全免費** |
| **語音質量** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **語音一致性** | ✅ 所有用戶相同 | ❌ 取決於設備 |
| **需要後端** | ✅ 需要 | ❌ 不需要 |
| **需要網絡** | ✅ 需要 | ❌ 不需要（離線可用） |
| **可保存文件** | ✅ 可以 | ❌ 不可以 |
| **生成速度** | 較慢（需要 API 調用） | **即時** |
| **語言支援** | 60+ 種 | 取決於瀏覽器/操作系統 |
| **實施難度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **維護成本** | 需要維護後端 | **無需維護** |

---

## 🎯 我們可以用 Web Speech API 嗎？

### 答案：**可以！而且有很多優勢！**

### 適用場景

#### ✅ 非常適合的場景
1. **即時語音播放**（不需要保存文件）
2. **單字發音**（教育應用）
3. **課文朗讀**（即時播放）
4. **語音提示**（UI 反饋）
5. **預算有限的初期開發**

#### ⚠️ 需要考慮的場景
1. **需要保存音頻文件**（Web Speech API 無法保存）
2. **需要語音一致性**（不同設備可能不同）
3. **需要最高語音質量**（商業 TTS 更好）

---

## 💡 混合方案：最佳實踐

### 推薦策略：**Web Speech API + 商業 TTS**

```javascript
// 混合方案實施
class HybridTTS {
  constructor() {
    this.useWebSpeechAPI = true; // 預設使用免費方案
  }
  
  // 即時播放（使用 Web Speech API）
  async playImmediately(text, language = 'zh-TW') {
    if (this.useWebSpeechAPI && 'speechSynthesis' in window) {
      // 使用 Web Speech API（免費）
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      window.speechSynthesis.speak(utterance);
      return { success: true, method: 'Web Speech API' };
    } else {
      // 降級到商業 TTS
      return await this.useCommercialTTS(text, language);
    }
  }
  
  // 生成可下載的音頻文件（使用商業 TTS）
  async generateDownloadableAudio(text, language = 'zh-TW') {
    // 調用後端 API（Google Cloud TTS 或 Azure TTS）
    const response = await fetch('/api/tts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language })
    });
    
    const data = await response.json();
    return data.audioUrl;
  }
  
  // 商業 TTS 備用方案
  async useCommercialTTS(text, language) {
    const audioUrl = await this.generateDownloadableAudio(text, language);
    const audio = new Audio(audioUrl);
    audio.play();
    return { success: true, method: 'Commercial TTS' };
  }
}

// 使用範例
const tts = new HybridTTS();

// 即時播放（免費）
tts.playImmediately('Hello world', 'en-US');

// 生成可下載文件（使用免費額度或付費）
const audioUrl = await tts.generateDownloadableAudio('Hello world', 'en-US');
```

---

## 🎨 UI 設計建議

### 給用戶選擇權

```jsx
// React 組件範例
const SoundOptions = ({ text, language }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  
  // 即時播放（免費）
  const playImmediately = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };
  
  // 生成高質量音頻（使用免費額度或付費）
  const generateHighQuality = async () => {
    const response = await fetch('/api/tts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language })
    });
    const data = await response.json();
    setAudioUrl(data.audioUrl);
  };
  
  return (
    <div className="sound-options">
      <h3>選擇語音選項</h3>
      
      {/* 選項 1: 即時播放（免費） */}
      <button onClick={playImmediately} className="free-option">
        🔊 即時播放（免費）
        <small>使用您的設備語音</small>
      </button>
      
      {/* 選項 2: 高質量音頻（免費額度或付費） */}
      <button onClick={generateHighQuality} className="premium-option">
        ⭐ 生成高質量音頻
        <small>可下載，語音更自然</small>
      </button>
      
      {audioUrl && (
        <div className="audio-preview">
          <audio src={audioUrl} controls />
          <a href={audioUrl} download>下載音頻</a>
        </div>
      )}
    </div>
  );
};
```

---

## 📈 成本對比

### 假設：每月 10,000 個遊戲創建

| 方案 | 月成本 | 年成本 | 語音質量 |
|------|--------|--------|---------|
| **100% Web Speech API** | $0 | $0 | ⭐⭐⭐ |
| **100% Azure TTS** | $17.6 | $211.2 | ⭐⭐⭐⭐⭐ |
| **混合方案（80% Web Speech + 20% Azure）** | $3.5 | $42 | ⭐⭐⭐⭐ |

### 混合方案的優勢
- ✅ 節省 **80%** 的成本
- ✅ 大部分用戶使用免費的 Web Speech API
- ✅ 需要高質量音頻的用戶可以選擇商業 TTS
- ✅ 靈活性高

---

## 🔧 實施建議

### 階段 1: MVP（最小可行產品）
**使用 100% Web Speech API**

```javascript
// 簡單實施
function addSound(text, language = 'zh-TW') {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  window.speechSynthesis.speak(utterance);
}
```

**優點**:
- ✅ 完全免費
- ✅ 快速實施（幾行代碼）
- ✅ 無需後端

---

### 階段 2: 成長期
**使用混合方案**

```javascript
// 提供兩種選項
class SoundManager {
  // 選項 1: 即時播放（免費）
  playImmediately(text, language) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  }
  
  // 選項 2: 生成高質量音頻（使用免費額度）
  async generateHighQuality(text, language) {
    const response = await fetch('/api/tts/generate', {
      method: 'POST',
      body: JSON.stringify({ text, language })
    });
    return await response.json();
  }
}
```

**優點**:
- ✅ 大部分用戶使用免費方案
- ✅ 提供高質量選項
- ✅ 成本可控

---

### 階段 3: 規模化
**使用智能路由**

```javascript
// 智能選擇 TTS 方案
class SmartTTS {
  async generateSound(text, language, options = {}) {
    const { 
      needDownload = false,  // 是否需要下載
      highQuality = false,   // 是否需要高質量
      userPreference = 'auto' // 用戶偏好
    } = options;
    
    // 如果需要下載或高質量，使用商業 TTS
    if (needDownload || highQuality) {
      return await this.useCommercialTTS(text, language);
    }
    
    // 如果用戶偏好免費方案，使用 Web Speech API
    if (userPreference === 'free' && 'speechSynthesis' in window) {
      return this.useWebSpeechAPI(text, language);
    }
    
    // 自動選擇（預設使用免費方案）
    if ('speechSynthesis' in window) {
      return this.useWebSpeechAPI(text, language);
    } else {
      return await this.useCommercialTTS(text, language);
    }
  }
  
  useWebSpeechAPI(text, language) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
    return { method: 'Web Speech API', cost: 0 };
  }
  
  async useCommercialTTS(text, language) {
    // 調用商業 TTS API
    const response = await fetch('/api/tts/generate', {
      method: 'POST',
      body: JSON.stringify({ text, language })
    });
    const data = await response.json();
    return { method: 'Commercial TTS', audioUrl: data.audioUrl };
  }
}
```

---

## 🎓 結論

### Wordwall 使用 Azure Neural TTS 的原因
1. **語音質量最高**（商業級）
2. **語音一致性**（所有用戶相同）
3. **可以保存音頻文件**
4. **支援 60+ 種語言**

### 我們可以用 Web Speech API 的原因
1. **完全免費**（無任何成本）
2. **實施簡單**（幾行代碼）
3. **無需後端**（降低維護成本）
4. **即時生成**（無延遲）
5. **適合大部分教育場景**

---

## 💡 最終建議

### 推薦策略：**混合方案**

1. **預設使用 Web Speech API**（免費）
   - 適合 80% 的用戶需求
   - 即時播放，無延遲
   - 無成本

2. **提供商業 TTS 選項**（使用免費額度）
   - 適合需要高質量音頻的用戶
   - 可以下載和保存
   - 使用 Google Cloud TTS 免費額度（每月 100 萬字符）

3. **智能路由**
   - 根據用戶需求自動選擇
   - 最大化免費資源利用
   - 成本可控

### 預估成本
- **第一年**: $0-$60（大部分用戶使用免費方案）
- **第二年**: $0-$200（根據用戶增長調整）

---

## 📚 參考資源

- **Web Speech API 文檔**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Azure TTS 定價**: https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/
- **Google Cloud TTS 定價**: https://cloud.google.com/text-to-speech/pricing

---

**文檔創建日期**: 2025-10-23  
**維護者**: EduCreate Development Team

