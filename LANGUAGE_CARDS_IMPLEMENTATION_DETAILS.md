# 🎯 語言卡片實現細節

## 1. BilingualManager 核心實現

### 語音合成系統

```typescript
class BilingualManager {
  private state = {
    isVisible: false,
    currentWord: null,
    isPlaying: false
  };

  // 播放中文
  async speakChinese(text: string, options = {}) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = options.rate || 0.8;
    utterance.pitch = options.pitch || 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // 播放英文
  async speakEnglish(text: string, options = {}) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // 雙語發音（中文 → 英文）
  async speakBilingual(english: string, chinese: string) {
    await this.speakChinese(chinese);
    await new Promise(r => setTimeout(r, 500));
    await this.speakEnglish(english);
  }
}
```

---

## 2. 詞彙卡片結構

### VocabularyItem 完整定義

```typescript
interface VocabularyItem {
  // 基本信息
  id: string;
  english: string;
  chinese: string;
  
  // 語言信息
  phonetic: string;           // /ˈæpəl/
  partOfSpeech: string;       // noun, verb, adj
  pronunciation: string;      // 發音指南
  
  // 分級信息
  level: 'elementary' | 'intermediate' | 'advanced';
  difficulty: 1 | 2 | 3 | 4 | 5;
  frequency: number;          // 使用頻率
  
  // 媒體資源
  imageUrl: string;
  audioUrl: string;
  exampleSentence: string;
  
  // 元數據
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}
```

---

## 3. 語言卡片在遊戲中的渲染

### Match-Up Game 卡片渲染

```javascript
// 創建左側卡片（中文）
createLeftCard(word, position) {
  const card = this.add.container(position.x, position.y);
  
  // 背景
  const bg = this.add.rectangle(0, 0, 100, 100, 0x4FC3F7);
  
  // 文字
  const text = this.add.text(0, 0, word.chinese, {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  
  card.add([bg, text]);
  card.setData('pairId', word.id);
  card.setData('type', 'chinese');
  
  return card;
}

// 創建右側卡片（英文）
createRightCard(word, position) {
  const card = this.add.container(position.x, position.y);
  
  // 背景
  const bg = this.add.rectangle(0, 0, 100, 100, 0x81C784);
  
  // 文字
  const text = this.add.text(0, 0, word.english, {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  
  card.add([bg, text]);
  card.setData('pairId', word.id);
  card.setData('type', 'english');
  
  return card;
}
```

---

## 4. 詞彙加載機制

### GEPTManager 詞彙加載

```typescript
class GEPTManager {
  // 從 URL 參數加載詞彙
  static async loadFromCloud(geptLevel) {
    const params = new URLSearchParams(window.location.search);
    
    // 優先級：customVocabulary > activityId > 默認詞彙
    if (params.has('customVocabulary')) {
      return JSON.parse(params.get('customVocabulary'));
    }
    
    if (params.has('activityId')) {
      const response = await fetch(`/api/activities/${activityId}/vocabulary`);
      return response.json();
    }
    
    // 使用默認詞彙
    return this.getDefaultVocabulary(geptLevel);
  }

  // 按等級獲取詞彙
  static getWordsByLevel(level) {
    return this.vocabulary.filter(w => w.level === level);
  }

  // 隨機選擇詞彙
  static getRandomWord(level) {
    const words = this.getWordsByLevel(level);
    return words[Math.floor(Math.random() * words.length)];
  }
}
```

---

## 5. 語言卡片的交互

### 卡片點擊事件

```javascript
card.on('pointerdown', () => {
  // 播放雙語發音
  if (this.game.bilingualManager) {
    const word = this.getWordData(card);
    this.game.bilingualManager.speakBilingual(
      word.english,
      word.chinese
    );
  }
  
  // 顯示中文提示
  this.showChinesePrompt(card);
});

card.on('pointerup', () => {
  // 隱藏中文提示
  this.hideChinesePrompt();
});
```

---

## 6. 多語言支持

### 遊戲文本本地化

```typescript
const i18n = {
  'zh-TW': {
    title: '配對遊戲',
    objective: '將中文單字與英文單字配對',
    correct: '正確！',
    incorrect: '不正確，請重試',
    score: '分數',
    time: '時間'
  },
  'en': {
    title: 'Matching Game',
    objective: 'Match Chinese words with English words',
    correct: 'Correct!',
    incorrect: 'Incorrect, try again',
    score: 'Score',
    time: 'Time'
  }
};

// 使用
const text = i18n[currentLanguage].title;
```

---

## 7. 性能優化技巧

### 詞彙緩存

```typescript
// 緩存已加載的詞彙
const vocabularyCache = new Map();

function getCachedVocabulary(activityId) {
  if (vocabularyCache.has(activityId)) {
    return vocabularyCache.get(activityId);
  }
  
  const vocab = loadVocabulary(activityId);
  vocabularyCache.set(activityId, vocab);
  return vocab;
}
```

### 語音預加載

```typescript
// 預加載常用詞彙的語音
async function preloadAudio(vocabulary) {
  for (const word of vocabulary) {
    const audio = new Audio(word.audioUrl);
    await audio.load();
  }
}
```

---

**實現細節完成 ✅**

