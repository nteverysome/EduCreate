# 🌐 語言卡片（Language Cards）深度分析

## 📋 目錄
1. [核心概念](#核心概念)
2. [語言卡片類型](#語言卡片類型)
3. [雙語系統架構](#雙語系統架構)
4. [詞彙加載流程](#詞彙加載流程)
5. [語言切換機制](#語言切換機制)
6. [性能優化](#性能優化)

---

## 核心概念

### 什麼是語言卡片？

在 EduCreate 中，**語言卡片** 指的是：
- **詞彙卡片**：顯示英文-中文對應的學習卡片
- **語言選擇卡片**：用戶選擇使用語言的界面
- **雙語提示卡片**：遊戲中的中文提示和英文提示
- **GEPT 等級卡片**：按難度分類的詞彙卡片

### 三層語言系統

```
┌─────────────────────────────────────┐
│  UI 層：語言選擇和詞彙顯示          │  ← 用戶看到的語言
├─────────────────────────────────────┤
│  管理層：BilingualManager            │  ← 語音合成和雙語管理
├─────────────────────────────────────┤
│  數據層：GEPTManager & 詞彙 API      │  ← 詞彙數據和等級
└─────────────────────────────────────┘
```

---

## 語言卡片類型

### 1️⃣ 詞彙卡片結構

```typescript
interface VocabularyItem {
  english: string;        // 英文單字
  chinese: string;        // 中文翻譯
  phonetic?: string;      // 音標 /ˈæpəl/
  partOfSpeech?: string;  // 詞性 (noun, verb, etc.)
  level: string;          // GEPT 等級
  difficulty?: number;    // 難度 (1-5)
  imageUrl?: string;      // 圖片 URL
  audioUrl?: string;      // 音頻 URL
}
```

### 2️⃣ 語言卡片在遊戲中的應用

```
Match-Up Game 中的語言卡片：
┌─────────────────────────────────────┐
│  左側卡片：中文 (Chinese)           │
│  ┌─────────────────────────────────┐│
│  │  蘋果                            ││
│  │  (中文提示)                      ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  右側卡片：英文 (English)           │
│  ┌─────────────────────────────────┐│
│  │  Apple                           ││
│  │  (英文答案)                      ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### 3️⃣ GEPT 等級卡片

```
Elementary (初級)
├─ 基礎詞彙 (500-1000 字)
├─ 簡單句型
└─ 日常用語

Intermediate (中級)
├─ 進階詞彙 (1000-2000 字)
├─ 複雜句型
└─ 專業用語

Advanced (高級)
├─ 高級詞彙 (2000+ 字)
├─ 複雜表達
└─ 學術用語
```

---

## 雙語系統架構

### BilingualManager 核心功能

```typescript
class BilingualManager {
  // 1. 語音合成
  async speakChinese(text: string): Promise<void>
  async speakEnglish(text: string): Promise<void>
  async speakBilingual(english: string, chinese: string): Promise<void>
  
  // 2. 中文提示
  showChinesePrompt(englishWord: string): void
  hideChinesePrompt(): void
  
  // 3. 語音列表
  getVoices(): SpeechSynthesisVoice[]
  getEnglishVoices(): SpeechSynthesisVoice[]
  getChineseVoices(): SpeechSynthesisVoice[]
}
```

### 雙語發音流程

```
用戶點擊卡片
    ↓
BilingualManager.speakBilingual()
    ├─ 播放中文 (Chinese)
    │  └─ 等待 500ms
    ├─ 播放英文 (English)
    └─ 完成
    ↓
用戶聽到：中文 → 英文
```

---

## 詞彙加載流程

### 三層詞彙加載架構

```
第一層：遊戲入口頁面
    ↓ (app/games/switcher/page.tsx)
    ├─ 驗證 activityId
    ├─ 加載詞彙集合
    └─ 存儲到 customVocabulary
    ↓
第二層：GameSwitcher 組件
    ↓ (components/games/GameSwitcher.tsx)
    ├─ 生成遊戲 URL
    ├─ 注入詞彙參數
    └─ 傳遞給 iframe
    ↓
第三層：遊戲 iframe 內部
    ↓ (public/games/match-up-game/scenes/game.js)
    ├─ 解析 URL 參數
    ├─ 調用 GEPTManager
    └─ 加載詞彙數據
```

### 詞彙參數傳遞

```typescript
// GameSwitcher 生成的 URL
const gameUrl = `${game.url}?` +
  `activityId=${activityId}&` +
  `customVocabulary=${encodeURIComponent(JSON.stringify(customVocabulary))}&` +
  `geptLevel=${currentGeptLevel}&` +
  `visualStyle=${visualStyle}`;

// iframe 內部接收
const params = new URLSearchParams(window.location.search);
const customVocab = JSON.parse(params.get('customVocabulary'));
const geptLevel = params.get('geptLevel');
```

---

## 語言切換機制

### 用戶語言設定

```typescript
// app/account/language/page.tsx
const handleLanguageChange = async (languageCode: string) => {
  const response = await fetch('/api/user/language', {
    method: 'PATCH',
    body: JSON.stringify({ language: languageCode })
  });
  
  // 更新 session
  await update({
    ...session,
    user: { ...session?.user, language: languageCode }
  });
};
```

### 支持的語言

```
SUPPORTED_LANGUAGES = [
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'zh-CN', name: '簡體中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' }
]
```

---

## 性能優化

### 優化策略

| 策略 | 實現 | 效果 |
|------|------|------|
| 詞彙緩存 | localStorage | 減少 API 調用 |
| 語音預加載 | preload() | 加快播放速度 |
| 防抖更新 | vocabUpdateTrigger | 避免重複加載 |
| 圖片懶加載 | Intersection Observer | 提升頁面速度 |

---

## 🔧 調試技巧

```javascript
// 查看當前詞彙
console.log(window.EduCreateGameAccess.getCurrentPageInfo());

// 手動播放雙語
window.bilingualManager.speakBilingual('apple', '蘋果');

// 查看語言設定
console.log(localStorage.getItem('gameCustomVocabulary'));
```

---

**最後更新：2025-12-03**

