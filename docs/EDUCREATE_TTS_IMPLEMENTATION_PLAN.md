# EduCreate TTS 實施計畫

## 📋 文檔概述

**創建日期**: 2025-10-23  
**版本**: v1.0  
**策略**: 預生成 GEPT 詞庫 + 全局緩存 + Cloudflare R2  
**預期成本**: $0.216/年（幾乎免費）

---

## 🎯 專案目標

### 核心目標
1. ✅ 為 EduCreate 的 25 種遊戲添加 TTS 功能
2. ✅ 支援 GEPT 詞庫（6,000 個單字）
3. ✅ 支援英語和中文
4. ✅ 支援男聲和女聲
5. ✅ 成本控制在 $1/年以內

### 技術目標
1. ✅ 預生成所有 GEPT 詞庫音頻
2. ✅ 使用 Cloudflare R2 存儲
3. ✅ 實施 MD5 Hash 全局緩存
4. ✅ 提供簡單的 API 接口
5. ✅ 支援未來擴展（其他語言、動態生成）

---

## 📅 實施時間表

### 階段 1: 環境設置（第 1 週）

#### 任務 1.1: Google Cloud TTS 設置
- [ ] 創建 Google Cloud 帳號
- [ ] 啟用 Text-to-Speech API
- [ ] 創建服務帳號和 API 金鑰
- [ ] 測試 API 調用

**預計時間**: 1 天

---

#### 任務 1.2: Cloudflare R2 設置
- [ ] 創建 Cloudflare 帳號
- [ ] 創建 R2 Bucket（名稱: `educreate-tts-audio`）
- [ ] 設置公開訪問權限
- [ ] 配置 CORS 設置
- [ ] 測試文件上傳和訪問

**預計時間**: 1 天

---

#### 任務 1.3: 資料庫設置
- [ ] 創建 `tts_cache` 表（存儲 Hash → URL 映射）
- [ ] 創建索引（Hash 欄位）
- [ ] 測試資料庫連接

**資料庫結構**:
```sql
CREATE TABLE tts_cache (
  id SERIAL PRIMARY KEY,
  hash VARCHAR(32) UNIQUE NOT NULL,
  text TEXT NOT NULL,
  language VARCHAR(10) NOT NULL,
  voice VARCHAR(10) NOT NULL,
  audio_url TEXT NOT NULL,
  gept_level VARCHAR(20),
  file_size INTEGER,
  duration FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_hash (hash)
);
```

**預計時間**: 1 天

---

### 階段 2: GEPT 詞庫準備（第 2 週）

#### 任務 2.1: 收集 GEPT 詞庫
- [ ] 收集 GEPT Kids 詞庫（300 個單字）
- [ ] 收集 GEPT 初級詞庫（1,000 個單字）
- [ ] 收集 GEPT 中級詞庫（2,000 個單字）
- [ ] 收集 GEPT 中高級詞庫（3,000 個單字）
- [ ] 整理成 JSON 格式

**詞庫格式**:
```json
{
  "gept_kids": ["apple", "banana", "cat", ...],
  "gept_elementary": ["abandon", "ability", ...],
  "gept_intermediate": ["abbreviate", ...],
  "gept_high_intermediate": ["abstract", ...]
}
```

**預計時間**: 3 天

---

#### 任務 2.2: 驗證詞庫
- [ ] 檢查重複單字
- [ ] 檢查拼寫錯誤
- [ ] 確認總數為 6,000 個單字
- [ ] 生成詞庫統計報告

**預計時間**: 1 天

---

### 階段 3: 預生成腳本開發（第 3 週）

#### 任務 3.1: 開發預生成腳本
- [ ] 創建 `scripts/pregenerate-tts.js`
- [ ] 實施 Google Cloud TTS 調用
- [ ] 實施 MD5 Hash 計算
- [ ] 實施 Cloudflare R2 上傳
- [ ] 實施資料庫記錄
- [ ] 添加進度顯示
- [ ] 添加錯誤處理和重試機制

**腳本結構**:
```javascript
// scripts/pregenerate-tts.js
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const fs = require('fs');

// 配置
const LANGUAGES = ['en-US', 'zh-TW'];
const VOICES = {
  'en-US': { Male: 'en-US-Neural2-D', Female: 'en-US-Neural2-F' },
  'zh-TW': { Male: 'zh-TW-Wavenet-C', Female: 'zh-TW-Wavenet-A' }
};

// 主函數
async function pregenerateGEPTAudio() {
  const geptVocabulary = require('../data/gept-vocabulary.json');
  
  let totalGenerated = 0;
  let totalCharacters = 0;
  
  for (const level in geptVocabulary) {
    for (const word of geptVocabulary[level]) {
      for (const language of LANGUAGES) {
        for (const voiceGender in VOICES[language]) {
          try {
            // 生成音頻
            const audioBuffer = await generateTTS(word, language, voiceGender);
            
            // 計算 Hash
            const hash = calculateHash(word, language, voiceGender);
            
            // 上傳到 R2
            const audioUrl = await uploadToR2(audioBuffer, hash, language);
            
            // 保存到資料庫
            await saveToCacheDB(hash, {
              text: word,
              language,
              voice: voiceGender,
              audioUrl,
              geptLevel: level,
              fileSize: audioBuffer.length
            });
            
            totalGenerated++;
            totalCharacters += word.length;
            
            console.log(`[${totalGenerated}/24000] Generated: ${word} (${language}, ${voiceGender})`);
          } catch (error) {
            console.error(`Error generating ${word}:`, error);
          }
        }
      }
    }
  }
  
  console.log(`\nTotal generated: ${totalGenerated}`);
  console.log(`Total characters: ${totalCharacters}`);
  console.log(`Estimated cost: $0 (within free tier)`);
}

// 輔助函數
function calculateHash(text, language, voice) {
  const input = `${text}-${language}-${voice}`;
  return crypto.createHash('md5').update(input).digest('hex');
}

async function generateTTS(text, language, voiceGender) {
  const client = new TextToSpeechClient();
  
  const request = {
    input: { text },
    voice: {
      languageCode: language,
      name: VOICES[language][voiceGender]
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0.0
    }
  };
  
  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent;
}

async function uploadToR2(audioBuffer, hash, language) {
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
  });
  
  const key = `${language}/${hash}.mp3`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: 'educreate-tts-audio',
    Key: key,
    Body: audioBuffer,
    ContentType: 'audio/mpeg',
    CacheControl: 'public, max-age=31536000'
  }));
  
  return `https://cdn.educreate.com/tts/${key}`;
}

async function saveToCacheDB(hash, data) {
  // 使用 Supabase 或其他資料庫
  await db.query(`
    INSERT INTO tts_cache (hash, text, language, voice, audio_url, gept_level, file_size)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (hash) DO NOTHING
  `, [hash, data.text, data.language, data.voice, data.audioUrl, data.geptLevel, data.fileSize]);
}

// 執行
pregenerateGEPTAudio().catch(console.error);
```

**預計時間**: 3 天

---

#### 任務 3.2: 測試預生成腳本
- [ ] 測試單個單字生成
- [ ] 測試批量生成（100 個單字）
- [ ] 驗證音頻質量
- [ ] 驗證 Hash 計算正確性
- [ ] 驗證 R2 上傳成功
- [ ] 驗證資料庫記錄正確

**預計時間**: 2 天

---

### 階段 4: 執行預生成（第 4 週）

#### 任務 4.1: 執行完整預生成
- [ ] 運行預生成腳本
- [ ] 監控進度（24,000 個音頻）
- [ ] 處理錯誤和重試
- [ ] 驗證所有音頻生成成功

**預計時間**: 2 天（腳本運行時間）

**預期結果**:
```
Total generated: 24,000
Total characters: 192,000
Estimated cost: $0 (within free tier)
Storage: 1.2GB on Cloudflare R2
```

---

#### 任務 4.2: 驗證預生成結果
- [ ] 檢查 R2 Bucket 文件數量（應為 24,000）
- [ ] 檢查資料庫記錄數量（應為 24,000）
- [ ] 隨機抽樣測試音頻播放
- [ ] 生成預生成報告

**預計時間**: 1 天

---

### 階段 5: API 開發（第 5 週）

#### 任務 5.1: 開發 TTS API
- [ ] 創建 `/api/tts/generate` 端點
- [ ] 實施 Hash 緩存檢查
- [ ] 實施預生成音頻查詢
- [ ] 實施動態生成（備用）
- [ ] 添加錯誤處理
- [ ] 添加速率限制

**API 結構**:
```javascript
// api/tts/generate.js
app.post('/api/tts/generate', async (req, res) => {
  const { text, language, voice, geptLevel } = req.body;
  
  try {
    // 1. 檢查是否為 GEPT 詞庫
    if (isGEPTWord(text)) {
      // 查詢預生成音頻
      const hash = calculateHash(text, language, voice);
      const cachedAudio = await getCachedAudio(hash);
      
      if (cachedAudio) {
        return res.json({
          audioUrl: cachedAudio.audio_url,
          cached: true,
          loadTime: '~250ms',
          source: 'pregenerated'
        });
      }
    }
    
    // 2. 檢查全局緩存
    const hash = calculateHash(text, language, voice);
    const cachedAudio = await getCachedAudio(hash);
    
    if (cachedAudio) {
      return res.json({
        audioUrl: cachedAudio.audio_url,
        cached: true,
        loadTime: '~250ms',
        source: 'global_cache'
      });
    }
    
    // 3. 動態生成（罕見情況）
    const audioBuffer = await generateTTS(text, language, voice, geptLevel);
    const audioUrl = await uploadToR2(audioBuffer, hash, language);
    await saveToCacheDB(hash, { text, language, voice, audioUrl, geptLevel });
    
    return res.json({
      audioUrl,
      cached: false,
      loadTime: '~2.3s',
      source: 'dynamic_generation'
    });
  } catch (error) {
    console.error('TTS generation error:', error);
    return res.status(500).json({ error: 'TTS generation failed' });
  }
});

// 輔助函數
function isGEPTWord(text) {
  const geptVocabulary = require('../data/gept-vocabulary.json');
  for (const level in geptVocabulary) {
    if (geptVocabulary[level].includes(text.toLowerCase())) {
      return true;
    }
  }
  return false;
}

async function getCachedAudio(hash) {
  const result = await db.query(
    'SELECT * FROM tts_cache WHERE hash = $1',
    [hash]
  );
  return result.rows[0];
}
```

**預計時間**: 3 天

---

#### 任務 5.2: API 測試
- [ ] 測試 GEPT 詞庫查詢
- [ ] 測試緩存命中
- [ ] 測試動態生成
- [ ] 測試錯誤處理
- [ ] 性能測試（響應時間）
- [ ] 負載測試（併發請求）

**預計時間**: 2 天

---

### 階段 6: 前端整合（第 6 週）

#### 任務 6.1: 創建 TTS 組件
- [ ] 創建 `TTSButton` 組件
- [ ] 創建 `TTSPlayer` 組件
- [ ] 實施音頻播放控制
- [ ] 添加載入狀態
- [ ] 添加錯誤處理

**組件結構**:
```javascript
// components/TTSButton.jsx
import React, { useState } from 'react';

export function TTSButton({ text, language = 'en-US', voice = 'Female' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const handlePlay = async () => {
    if (audioUrl) {
      // 播放已緩存的音頻
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      return;
    }
    
    // 獲取音頻 URL
    setIsLoading(true);
    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, voice })
      });
      
      const data = await response.json();
      setAudioUrl(data.audioUrl);
      
      // 播放音頻
      const audio = new Audio(data.audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handlePlay}
      disabled={isLoading || isPlaying}
      className="tts-button"
    >
      {isLoading ? '載入中...' : isPlaying ? '播放中...' : '🔊 播放'}
    </button>
  );
}
```

**預計時間**: 2 天

---

#### 任務 6.2: 整合到 25 種遊戲
- [ ] Quiz 遊戲整合
- [ ] Flash cards 整合
- [ ] Matching Pairs 整合
- [ ] Wordsearch 整合
- [ ] ... (其他 21 種遊戲)

**預計時間**: 3 天

---

### 階段 7: 測試和優化（第 7 週）

#### 任務 7.1: 功能測試
- [ ] 測試所有 25 種遊戲的 TTS 功能
- [ ] 測試英語和中文語音
- [ ] 測試男聲和女聲
- [ ] 測試不同 GEPT 等級
- [ ] 測試錯誤處理

**預計時間**: 2 天

---

#### 任務 7.2: 性能優化
- [ ] 優化 API 響應時間
- [ ] 優化音頻載入速度
- [ ] 實施客戶端緩存
- [ ] 優化資料庫查詢

**預計時間**: 2 天

---

#### 任務 7.3: 用戶測試
- [ ] 邀請 10 位用戶測試
- [ ] 收集用戶反饋
- [ ] 修復發現的問題
- [ ] 優化用戶體驗

**預計時間**: 1 天

---

### 階段 8: 部署和監控（第 8 週）

#### 任務 8.1: 部署到生產環境
- [ ] 部署 API 到生產伺服器
- [ ] 配置 Cloudflare R2 CDN
- [ ] 配置資料庫
- [ ] 配置環境變數
- [ ] 測試生產環境

**預計時間**: 1 天

---

#### 任務 8.2: 監控和日誌
- [ ] 設置 API 監控（Uptime, Response Time）
- [ ] 設置錯誤日誌（Sentry）
- [ ] 設置使用量統計
- [ ] 設置成本監控

**預計時間**: 1 天

---

#### 任務 8.3: 文檔和培訓
- [ ] 編寫 API 文檔
- [ ] 編寫用戶指南
- [ ] 培訓團隊成員
- [ ] 創建 FAQ

**預計時間**: 1 天

---

## 📊 資源需求

### 人力資源
- **後端開發**: 1 人（4 週）
- **前端開發**: 1 人（2 週）
- **測試**: 1 人（1 週）
- **DevOps**: 1 人（1 週）

### 技術資源
- Google Cloud TTS API（免費額度）
- Cloudflare R2（$0.018/月）
- 資料庫（現有）
- 伺服器（現有）

### 預算
- **開發成本**: 人力成本（依團隊薪資）
- **運營成本**: $0.216/年（幾乎免費）

---

## 🎯 成功指標

### 技術指標
- ✅ 預生成 24,000 個音頻文件
- ✅ API 響應時間 < 300ms（緩存命中）
- ✅ API 可用性 > 99.9%
- ✅ 音頻載入時間 < 500ms

### 業務指標
- ✅ 25 種遊戲全部支援 TTS
- ✅ 用戶滿意度 > 90%
- ✅ TTS 使用率 > 50%
- ✅ 成本控制在 $1/年以內

---

## 🚀 未來擴展

### 階段 9: 多語言支援（未來）
- [ ] 添加日語支援
- [ ] 添加韓語支援
- [ ] 添加法語支援
- [ ] 實施動態生成 + 全局緩存

### 階段 10: 高級功能（未來）
- [ ] 語速調整
- [ ] 音調調整
- [ ] 音量調整
- [ ] 自定義語音

---

**文檔創建日期**: 2025-10-23  
**維護者**: EduCreate Development Team  
**狀態**: 實施計畫已完成，等待執行

