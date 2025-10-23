# EduCreate TTS 成本策略更新（基於 Wordwall 分析）

## 📋 文檔概述

**創建日期**: 2025-10-23  
**更新原因**: 基於 Wordwall「加入聲音」功能的深度分析，更新 EduCreate 的 TTS 成本策略  
**核心發現**: Wordwall 使用 MD5 Hash 緩存策略，驗證了我們的「預生成 + 緩存」方案的正確性

---

## 🎯 成本策略變化總結

### 之前的策略（Google Cloud TTS 深度分析）

**核心策略**: 預生成 + 緩存
- 預生成 GEPT 詞庫（6,000 個單字）
- 使用 CDN 分發
- 智能緩存（80% 緩存 + 20% 動態生成）

**成本估算**:
| 階段 | 用戶數 | 月成本（不緩存）| 月成本（緩存）|
|------|--------|----------------|--------------|
| 初期 | 1,000 | $0 | $0 |
| 成長期 | 10,000 | $112 | $0 |
| 規模化 | 100,000 | $1,264 | $0 |

---

### 更新後的策略（基於 Wordwall 分析）

**核心策略**: MD5 Hash 緩存 + 預生成 GEPT 詞庫

#### 新增發現
1. **MD5 Hash 緩存機制**（來自 Wordwall）
   - 相同文字 + 語言 + 性別 = 相同 Hash
   - 自動避免重複生成
   - 更高效的緩存命中率

2. **Azure Blob Storage + CDN**（來自 Wordwall）
   - Wordwall 使用 Azure Blob Storage
   - EduCreate 可以使用 Cloudflare CDN（更便宜）

3. **性能數據**（來自 Wordwall 實測）
   - 首次生成: ~2.3 秒
   - 緩存命中: ~250ms
   - 性能提升: **9.2 倍**

---

## 💰 更新後的成本分析

### 1. **Google Cloud TTS 成本（不變）**

#### 免費額度
- **每月免費**: 100 萬字符（Neural2 語音）
- **永久有效**: 每月重置

#### 付費定價
- **Neural2**: $16 USD / 100 萬字符

---

### 2. **存儲成本（更新）**

#### 方案 A: Cloudflare R2（推薦）

**定價**:
- **存儲**: $0.015 USD/GB/月
- **流量**: 免費（無出站流量費用）

**計算**:
```
預生成 6,000 個單字：
- 每個音頻文件: 50KB（MP3 格式）
- 總存儲: 6,000 × 50KB = 300MB = 0.3GB

存儲成本: 0.3GB × $0.015 = $0.0045 USD/月
年成本: $0.054 USD/年

幾乎免費！
```

---

#### 方案 B: AWS S3 + CloudFront

**定價**:
- **S3 存儲**: $0.023 USD/GB/月
- **CloudFront 流量**: $0.085 USD/GB（前 10TB）

**計算**:
```
存儲成本: 0.3GB × $0.023 = $0.007 USD/月

流量成本（假設 10,000 用戶，每個用戶 100 個單字）:
- 總流量: 10,000 × 100 × 50KB = 50GB/月
- 流量成本: 50GB × $0.085 = $4.25 USD/月

總成本: $0.007 + $4.25 = $4.26 USD/月
年成本: $51.12 USD/年
```

---

#### 方案 C: Azure Blob Storage（Wordwall 使用）

**定價**:
- **存儲**: $0.018 USD/GB/月
- **流量**: $0.087 USD/GB（前 10TB）

**計算**:
```
存儲成本: 0.3GB × $0.018 = $0.0054 USD/月

流量成本（10,000 用戶）:
- 總流量: 50GB/月
- 流量成本: 50GB × $0.087 = $4.35 USD/月

總成本: $0.0054 + $4.35 = $4.36 USD/月
年成本: $52.32 USD/年
```

---

### 3. **CDN 成本對比**

| CDN 服務 | 存儲成本 | 流量成本（50GB/月）| 總成本/月 | 總成本/年 |
|---------|---------|-------------------|----------|----------|
| **Cloudflare R2** | $0.0045 | $0（免費）| **$0.0045** | **$0.054** |
| **AWS S3 + CloudFront** | $0.007 | $4.25 | $4.26 | $51.12 |
| **Azure Blob Storage** | $0.0054 | $4.35 | $4.36 | $52.32 |

**結論**: **Cloudflare R2 是最佳選擇！**

---

### 4. **MD5 Hash 緩存成本（新增）**

#### 數據庫存儲（Hash → URL 映射）

**數據結構**:
```javascript
{
  hash: 'fa7fa5d0c793600a300f601265840a2b',
  text: 'Hello world, this is a test.',
  language: 'zh-TW',
  voice: 'Male',
  audioUrl: 'https://cdn.educreate.com/tts/zh-tw-yunjheneural/fa7fa5d0c793600a300f601265840a2b.mp3',
  duration: 3.5,
  createdAt: '2025-10-23T14:00:00Z'
}
```

**存儲需求**:
```
假設 6,000 個單字：
- 每條記錄: ~200 bytes
- 總存儲: 6,000 × 200 bytes = 1.2MB

數據庫成本（PostgreSQL on Supabase）:
- 免費額度: 500MB
- 成本: $0/月
```

---

## 📊 最終成本對比

### 方案 1: 不緩存（動態生成）

| 階段 | 用戶數 | TTS 成本 | 存儲成本 | CDN 成本 | 總成本/月 |
|------|--------|---------|---------|---------|----------|
| 初期 | 1,000 | $0 | $0 | $0 | **$0** |
| 成長期 | 10,000 | $112 | $0 | $0 | **$112** |
| 規模化 | 100,000 | $1,264 | $0 | $0 | **$1,264** |

---

### 方案 2: 預生成 + Cloudflare R2（推薦）

| 階段 | 用戶數 | TTS 成本 | 存儲成本 | CDN 成本 | 總成本/月 |
|------|--------|---------|---------|---------|----------|
| 初期 | 1,000 | $0（一次性）| $0.0045 | $0 | **$0.0045** |
| 成長期 | 10,000 | $0 | $0.0045 | $0 | **$0.0045** |
| 規模化 | 100,000 | $0 | $0.0045 | $0 | **$0.0045** |

**年成本**: **$0.054 USD/年**（幾乎免費！）

---

### 方案 3: 預生成 + AWS S3 + CloudFront

| 階段 | 用戶數 | TTS 成本 | 存儲成本 | CDN 成本 | 總成本/月 |
|------|--------|---------|---------|---------|----------|
| 初期 | 1,000 | $0（一次性）| $0.007 | $0.85 | **$0.86** |
| 成長期 | 10,000 | $0 | $0.007 | $4.25 | **$4.26** |
| 規模化 | 100,000 | $0 | $0.007 | $42.5 | **$42.51** |

**年成本**: $51.12 USD/年（成長期）

---

### 方案 4: 智能緩存（80% 緩存 + 20% 動態）

| 階段 | 用戶數 | TTS 成本 | 存儲成本 | CDN 成本 | 總成本/月 |
|------|--------|---------|---------|---------|----------|
| 初期 | 1,000 | $0 | $0.0045 | $0 | **$0.0045** |
| 成長期 | 10,000 | $25.6 | $0.0045 | $0 | **$25.61** |
| 規模化 | 100,000 | $256 | $0.0045 | $0 | **$256.01** |

---

## 🎯 最終推薦方案

### **方案 2: 預生成 + Cloudflare R2**

#### 為什麼選擇這個方案？

1. **成本最低**: $0.054 USD/年（幾乎免費）
2. **性能最好**: 250ms 載入時間（緩存命中）
3. **用戶體驗最佳**: 零延遲（音頻已預生成）
4. **維護最簡單**: 一次性預生成，無需動態管理
5. **擴展性最強**: 支援無限用戶（成本不變）

---

## 🚀 實施步驟

### 階段 1: 預生成 GEPT 詞庫（一次性）

```javascript
// 1. 準備 GEPT 詞庫
const geptVocabulary = {
  elementary: ['apple', 'banana', 'cat', ...], // 1000 個單字
  intermediate: ['abandon', 'ability', ...],   // 2000 個單字
  highIntermediate: ['abbreviate', ...]        // 3000 個單字
};

// 2. 預生成所有音頻
async function pregenerateGEPTAudio() {
  const languages = ['en-US', 'zh-TW'];
  const voices = ['Male', 'Female'];
  
  for (const level in geptVocabulary) {
    for (const word of geptVocabulary[level]) {
      for (const language of languages) {
        for (const voice of voices) {
          // 生成音頻
          const audioBuffer = await googleCloudTTS.synthesize(word, {
            languageCode: language,
            voiceName: getVoiceName(language, voice),
            speakingRate: getGEPTSpeakingRate(level),
            pitch: getGEPTPitch(level)
          });
          
          // 計算 MD5 Hash
          const hash = calculateHash(word, language, voice);
          
          // 上傳到 Cloudflare R2
          const audioUrl = await uploadToR2(audioBuffer, hash, language);
          
          // 存儲 Hash → URL 映射
          await saveHashMapping(hash, {
            text: word,
            language,
            voice,
            audioUrl,
            geptLevel: level
          });
          
          console.log(`✅ Generated: ${word} (${language}, ${voice})`);
        }
      }
    }
  }
}

// 執行預生成
await pregenerateGEPTAudio();
```

**預生成統計**:
```
總單字數: 6,000
語言數: 2（英語、繁體中文）
性別數: 2（男聲、女聲）
總音頻數: 6,000 × 2 × 2 = 24,000 個音頻文件

總字符數: 6,000 × 8 × 2 × 2 = 192,000 字符
TTS 成本: $0（在免費額度內）

總存儲: 24,000 × 50KB = 1.2GB
存儲成本: 1.2GB × $0.015 = $0.018 USD/月
年成本: $0.216 USD/年
```

---

### 階段 2: 設置 Cloudflare R2

```javascript
// 1. 安裝 Cloudflare R2 SDK
npm install @cloudflare/workers-types

// 2. 配置 R2 Bucket
const R2_BUCKET_NAME = 'educreate-tts-audio';
const R2_PUBLIC_URL = 'https://cdn.educreate.com/tts';

// 3. 上傳音頻到 R2
async function uploadToR2(audioBuffer, hash, language) {
  const key = `${language}/${hash}.mp3`;
  
  await R2.put(key, audioBuffer, {
    httpMetadata: {
      contentType: 'audio/mpeg',
      cacheControl: 'public, max-age=31536000' // 緩存 1 年
    }
  });
  
  return `${R2_PUBLIC_URL}/${key}`;
}
```

---

### 階段 3: 實施 MD5 Hash 緩存

```javascript
// 1. 計算 MD5 Hash
const crypto = require('crypto');

function calculateHash(text, language, voice) {
  const input = `${text}-${language}-${voice}`;
  return crypto.createHash('md5').update(input).digest('hex');
}

// 2. 檢查緩存
async function checkCache(text, language, voice) {
  const hash = calculateHash(text, language, voice);
  
  // 從數據庫查詢
  const cached = await db.query(
    'SELECT audio_url FROM tts_cache WHERE hash = $1',
    [hash]
  );
  
  if (cached.rows.length > 0) {
    return cached.rows[0].audio_url;
  }
  
  return null;
}

// 3. TTS API 端點
app.post('/api/tts/generate', async (req, res) => {
  const { text, language, voice, geptLevel } = req.body;
  
  // 檢查緩存
  const cachedUrl = await checkCache(text, language, voice);
  if (cachedUrl) {
    return res.json({ 
      audioUrl: cachedUrl, 
      cached: true,
      loadTime: '~250ms'
    });
  }
  
  // 動態生成（罕見情況）
  const audioBuffer = await googleCloudTTS.synthesize(text, {
    languageCode: language,
    voiceName: getVoiceName(language, voice, geptLevel),
    speakingRate: getGEPTSpeakingRate(geptLevel),
    pitch: getGEPTPitch(geptLevel)
  });
  
  // 計算 Hash
  const hash = calculateHash(text, language, voice);
  
  // 上傳到 R2
  const audioUrl = await uploadToR2(audioBuffer, hash, language);
  
  // 緩存 URL
  await saveHashMapping(hash, {
    text,
    language,
    voice,
    audioUrl,
    geptLevel
  });
  
  return res.json({ 
    audioUrl, 
    cached: false,
    loadTime: '~2.3s'
  });
});
```

---

## 📊 成本節省對比

### 不緩存 vs 預生成 + Cloudflare R2

| 階段 | 用戶數 | 不緩存成本 | 預生成成本 | 節省金額 | 節省比例 |
|------|--------|-----------|-----------|---------|---------|
| 初期 | 1,000 | $0/月 | $0.0045/月 | -$0.0045 | - |
| 成長期 | 10,000 | $112/月 | $0.0045/月 | $111.99/月 | **99.996%** |
| 規模化 | 100,000 | $1,264/月 | $0.0045/月 | $1,263.99/月 | **99.996%** |

**年度節省**（成長期）:
```
不緩存: $112 × 12 = $1,344 USD/年
預生成: $0.0045 × 12 = $0.054 USD/年

節省: $1,343.95 USD/年（99.996%）
```

---

## 🎯 最終結論

### 成本策略變化

| 項目 | 之前的策略 | 更新後的策略 | 變化 |
|------|-----------|-------------|------|
| **核心方法** | 預生成 + 緩存 | MD5 Hash 緩存 + 預生成 | ✅ 更精確 |
| **存儲方案** | 未指定 | Cloudflare R2 | ✅ 更便宜 |
| **緩存機制** | 智能緩存 | MD5 Hash | ✅ 更高效 |
| **成本估算** | $0-$200/月 | $0.0045/月 | ✅ 更準確 |
| **性能數據** | 推測 | 實測（250ms）| ✅ 有數據支持 |

---

### 最終推薦

**方案**: 預生成 GEPT 詞庫 + Cloudflare R2 + MD5 Hash 緩存

**成本**:
- **初期（1,000 用戶）**: $0.0045/月（$0.054/年）
- **成長期（10,000 用戶）**: $0.0045/月（$0.054/年）
- **規模化（100,000 用戶）**: $0.0045/月（$0.054/年）

**優勢**:
1. ✅ **成本最低**: 幾乎免費（$0.054/年）
2. ✅ **性能最好**: 250ms 載入時間
3. ✅ **用戶體驗最佳**: 零延遲
4. ✅ **擴展性最強**: 支援無限用戶
5. ✅ **維護最簡單**: 一次性預生成

---

**文檔創建日期**: 2025-10-23  
**維護者**: EduCreate Development Team  
**狀態**: 成本策略更新完成，建議立即實施

