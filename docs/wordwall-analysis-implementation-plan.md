# Wordwall 架構分析與 EduCreate 實現計劃

## 🎯 Wordwall 核心架構分析

### 三層架構設計
1. **活動管理層** (`/myactivities`) - 統一的活動中心
2. **內容編輯層** (`/create/editcontent`) - 詞彙和內容編輯  
3. **遊戲執行層** (`/resource/[id]`) - 遊戲運行和配置

### 完整用戶流程
```
創建活動 → 選擇模板 → 編輯內容 → 保存活動 → 管理活動 → 重複使用
```

## 🚀 Wordwall 關鍵功能特點

### 活動管理系統
- ✅ **資料夾組織**: 支援資料夾分類管理
- ✅ **搜索功能**: 全文搜索活動名稱和內容
- ✅ **排序選項**: 按名稱、修改時間、播放次數排序
- ✅ **批量操作**: 支援複製、刪除、移動等操作
- ✅ **版本歷史**: 完整的修改記錄追蹤

### 內容編輯系統
- ✅ **問答式編輯**: 問題 + 多選答案的結構化編輯
- ✅ **圖片支援**: 每個問題和答案都可添加圖片
- ✅ **AI 內容生成**: 使用 AI 自動生成內容
- ✅ **即時預覽**: 編輯時可即時預覽效果

### 遊戲配置系統
- ✅ **視覺風格**: 7種主題風格 (雲、電子遊戲、魔術圖書館等)
- ✅ **遊戲選項**: 計時器、機會、速度、隨機化等
- ✅ **模板切換**: 同一內容可切換到不同遊戲類型
- ✅ **排行榜**: 遊戲結果記錄和排名

## 💡 EduCreate 實現建議

### 階段 1: 改進 my-activities 頁面 (立即實施)

#### 1.1 資料夾管理系統
```typescript
// components/activities/FolderManager.tsx
interface Folder {
  id: string;
  name: string;
  activityCount: number;
  createdAt: Date;
  parentId?: string;
}

const FolderManager = () => {
  return (
    <div className="folder-grid">
      <FolderCard folder={folder} />
      <CreateFolderButton />
    </div>
  );
};
```

#### 1.2 活動卡片改進
```typescript
// components/activities/ActivityCard.tsx
interface ActivityCardProps {
  activity: {
    id: string;
    title: string;
    type: 'vocabulary' | 'system';
    gameType: string; // '飛機遊戲', '匹配遊戲' 等
    isPublic: boolean;
    playCount: number;
    lastModified: Date;
    thumbnail: string;
  };
}
```

#### 1.3 搜索和篩選增強
```typescript
// components/activities/ActivitySearch.tsx
const ActivitySearch = () => {
  return (
    <div className="search-controls">
      <SearchInput placeholder="搜尋我的活動..." />
      <FilterDropdown options={['全部', '詞彙活動', '系統活動']} />
      <SortDropdown options={['名稱', '修改時間', '播放次數']} />
    </div>
  );
};
```

### 階段 2: 統一內容編輯器升級 (1-2週)

#### 2.1 問答式編輯界面
```typescript
// components/vocabulary/QuestionAnswerEditor.tsx
interface Question {
  id: string;
  question: string;
  questionImage?: string;
  answers: Answer[];
}

interface Answer {
  id: string;
  text: string;
  image?: string;
  isCorrect: boolean;
}
```

#### 2.2 AI 內容生成整合
```typescript
// lib/ai/ContentGenerator.ts
export class AIContentGenerator {
  async generateVocabularyQuestions(
    topic: string, 
    level: GEPTLevel, 
    count: number
  ): Promise<Question[]> {
    // 整合 OpenAI API 生成詞彙問題
  }
}
```

### 階段 3: 遊戲配置系統 (2-3週)

#### 3.1 視覺主題系統
```typescript
// lib/themes/ThemeManager.ts
interface GameTheme {
  id: string;
  name: string;
  preview: string;
  assets: {
    background: string;
    ui: string;
    sounds: string[];
  };
}

export const GAME_THEMES: GameTheme[] = [
  { id: 'cloud', name: '雲朵', preview: '/themes/cloud.jpg' },
  { id: 'space', name: '太空', preview: '/themes/space.jpg' },
  { id: 'underwater', name: '水下', preview: '/themes/underwater.jpg' },
];
```

#### 3.2 遊戲選項配置
```typescript
// components/games/GameOptionsPanel.tsx
interface GameOptions {
  timer: 'none' | 'count' | 'countdown';
  timerDuration?: number;
  chances: number;
  speed: number;
  randomize: boolean;
  showAnswers: boolean;
}
```

### 階段 4: 數據持久化和同步 (1週)

#### 4.1 雲端存儲整合
```typescript
// lib/storage/CloudStorage.ts
export class CloudStorageService {
  async saveActivity(activity: VocabularyActivity): Promise<string> {
    // 保存到 Neon PostgreSQL
  }
  
  async getActivities(userId: string): Promise<VocabularyActivity[]> {
    // 從數據庫載入活動
  }
  
  async syncLocalToCloud(): Promise<void> {
    // 同步本地存儲到雲端
  }
}
```

## 🎯 實施優先級

### 高優先級 (立即實施)
1. ✅ 詞彙活動在 my-activities 顯示 (已完成)
2. 🔄 資料夾管理系統
3. 🔄 活動搜索和篩選增強
4. 🔄 活動卡片 UI 改進

### 中優先級 (1-2週內)
1. 問答式編輯界面
2. AI 內容生成整合
3. 遊戲配置面板
4. 視覺主題系統

### 低優先級 (長期規劃)
1. 版本歷史追蹤
2. 協作編輯功能
3. 社區分享功能
4. 高級分析報告

## 🚀 技術實現要點

### 數據結構設計
```typescript
interface VocabularyActivity {
  id: string;
  title: string;
  description: string;
  folderId?: string;
  questions: Question[];
  gameConfig: GameOptions;
  theme: string;
  isPublic: boolean;
  playCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
```

### API 端點設計
```
GET    /api/activities          - 獲取用戶活動列表
POST   /api/activities          - 創建新活動
PUT    /api/activities/:id      - 更新活動
DELETE /api/activities/:id      - 刪除活動
POST   /api/activities/:id/copy - 複製活動
GET    /api/folders             - 獲取資料夾列表
POST   /api/folders             - 創建資料夾
```

### 前端路由設計
```
/my-activities              - 活動管理主頁
/my-activities/folder/:id   - 資料夾內容
/create/activity           - 創建新活動
/edit/activity/:id         - 編輯活動
/play/activity/:id         - 遊戲執行
```

## 📊 成功指標

### 用戶體驗指標
- 活動創建到遊戲執行的完整流程 < 3 分鐘
- 活動搜索響應時間 < 500ms
- 遊戲載入時間 < 2 秒

### 功能完整性指標
- 支援 25 種遊戲類型的統一內容管理
- 100% 的詞彙活動可在 my-activities 中管理
- 支援至少 5 種視覺主題

### 技術性能指標
- 支援 1000+ 活動的流暢管理
- 離線模式下的基本功能可用
- 跨設備數據同步成功率 > 99%
