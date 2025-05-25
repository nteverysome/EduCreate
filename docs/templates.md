# EduCreate 模板系統使用指南

## 概述

模板系統是 EduCreate 平台的核心功能之一，它允許教師基於預設模板快速創建互動式教學活動。本文檔將介紹如何使用模板系統以及如何擴展新的模板。

## 模板類型

目前，EduCreate 平台支持以下三種基本模板類型：

1. **配對遊戲 (Matching)** - 用於創建配對練習，幫助學生建立概念聯繫
2. **單字卡片 (Flashcards)** - 用於製作互動式詞彙學習卡片
3. **測驗問答 (Quiz)** - 用於設計趣味測驗，檢驗學習成果

## 使用模板

### 訪問模板庫

1. 登錄到 EduCreate 平台
2. 從儀表板頁面，點擊「模板庫」按鈕
3. 或直接訪問 `/templates` 頁面

### 選擇模板

在模板庫中，您可以：

- 按類別篩選模板（語言學習、數學、科學等）
- 使用搜索框搜索特定模板
- 查看模板的詳細信息，包括難度級別和標籤

找到合適的模板後，點擊「使用此模板」按鈕。

### 配置模板

選擇模板後，您將進入模板配置頁面，在這裡您可以：

1. 設置活動的基本信息（標題、描述等）
2. 根據模板類型輸入相應的內容
   - 配對遊戲：輸入配對項目對
   - 單字卡片：輸入卡片正反面內容和標籤
   - 測驗問答：輸入問題、選項、正確答案和解釋

### 預覽和保存

配置完成後，您可以：

1. 預覽活動效果（學生視圖/教師視圖）
2. 返回編輯進行修改
3. 保存活動（草稿或發布）

## 擴展新模板

### 模板結構

每個模板由以下部分組成：

1. **模板元數據** - 包括ID、名稱、描述、縮略圖、類型、難度和標籤
2. **配置字段** - 定義模板配置表單的字段
3. **默認數據** - 提供字段的默認值
4. **數據處理邏輯** - 處理用戶輸入並生成活動數據
5. **預覽組件** - 顯示活動的預覽效果

### 添加新模板

要添加新模板，需要：

1. 在 `components/templates/TemplateConfig.tsx` 中的 `getConfigByTemplateId` 函數中添加新模板配置
2. 創建模板縮略圖 SVG 文件並放置在 `public/templates/` 目錄下
3. 在 `pages/templates/index.tsx` 中的 `templateCategories` 數組中添加新模板信息
4. 如果需要新的活動類型，在 `components/games/` 目錄下創建相應的遊戲組件
5. 在 `components/templates/TemplatePreview.tsx` 中的 `renderPreview` 函數中添加新模板類型的預覽支持

### 模板數據格式

#### 配對遊戲數據格式

```typescript
{
  title: string;
  description?: string;
  instructions?: string;
  pairs: Array<{
    id: string;
    question: { id: string; content: string };
    answer: { id: string; content: string };
  }>;
  questions: Array<{ id: string; content: string }>;
  answers: Array<{ id: string; content: string }>;
}
```

#### 單字卡片數據格式

```typescript
{
  title: string;
  description?: string;
  instructions?: string;
  cards: Array<{
    id: string;
    front: string;
    back: string;
    tags?: string[];
  }>;
}
```

#### 測驗問答數據格式

```typescript
{
  title: string;
  description?: string;
  instructions?: string;
  questions: Array<{
    id: string | number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}
```

## 最佳實踐

1. **提供清晰的說明** - 確保模板包含清晰的說明，幫助用戶理解如何填寫配置
2. **提供有用的默認值** - 默認值應該是有意義的示例，幫助用戶理解預期的輸入格式
3. **適當的錯誤處理** - 驗證用戶輸入並提供有用的錯誤消息
4. **保持一致性** - 新模板應該遵循現有模板的設計模式和用戶體驗

## 常見問題

### 如何在模板中添加多媒體內容？

目前，模板系統主要支持文本內容。未來版本將添加圖片、音頻和視頻支持。

### 如何共享我創建的模板？

目前，模板是系統預設的。未來版本將允許教師創建和共享自定義模板。

### 如何導入/導出模板？

導入/導出功能計劃在未來版本中實現。

## 技術支持

如果您在使用模板系統時遇到問題，請聯繫技術支持團隊。