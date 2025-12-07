# Wordwall 創建模式實現指南

## 🏗️ 推薦的混合架構

結合 Wordwall 的優點和 EduCreate 的遊戲優先設計：

```
┌─────────────────────────────────────────────────────┐
│           EduCreate 混合架構                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. 內容層（Content Layer）                        │
│     ├── ContentSet（內容集合）                     │
│     │   ├── id: GUID                              │
│     │   ├── title: string                         │
│     │   ├── items: VocabularyItem[]               │
│     │   └── metadata: Metadata                    │
│     └── VocabularyItem                            │
│         ├── term: string                          │
│         ├── definition: string                    │
│         ├── image: URL                            │
│         ├── audio: URL                            │
│         └── hint: string                          │
│                                                     │
│  2. 活動層（Activity Layer）                       │
│     ├── Activity                                  │
│     │   ├── gameTemplateId: string               │
│     │   ├── contentSetId: GUID                   │
│     │   ├── gameOptions: GameOptions             │
│     │   └── status: published|draft              │
│     └── GameOptions                              │
│         ├── difficulty: easy|medium|hard         │
│         ├── timeLimit: number                    │
│         └── customRules: object                  │
│                                                     │
│  3. 遊戲層（Game Layer）                          │
│     ├── GameTemplate                             │
│     │   ├── id: string                           │
│     │   ├── name: string                         │
│     │   ├── supportedContentTypes: string[]      │
│     │   └── defaultOptions: GameOptions          │
│     └── GameInstance                             │
│         ├── activityId: string                   │
│         ├── contentSet: ContentSet               │
│         └── gameState: GameState                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📋 API 端點設計

### 內容集合 API
```
GET    /api/content-sets              # 列出所有內容集合
POST   /api/content-sets              # 創建新內容集合
GET    /api/content-sets/{id}         # 獲取內容集合
PUT    /api/content-sets/{id}         # 更新內容集合
DELETE /api/content-sets/{id}         # 刪除內容集合

GET    /api/content-sets/{id}/items   # 列出詞彙項目
POST   /api/content-sets/{id}/items   # 添加詞彙項目
PUT    /api/content-sets/{id}/items/{itemId}    # 更新詞彙
DELETE /api/content-sets/{id}/items/{itemId}    # 刪除詞彙

POST   /api/content-sets/{id}/import  # 批量導入（CSV/Excel）
GET    /api/content-sets/{id}/export  # 導出為 CSV
```

### 活動 API
```
GET    /api/activities                # 列出活動
POST   /api/activities                # 創建活動
GET    /api/activities/{id}           # 獲取活動
PUT    /api/activities/{id}           # 更新活動
DELETE /api/activities/{id}           # 刪除活動

POST   /api/activities/{id}/duplicate # 複製活動
GET    /api/activities/{id}/preview   # 預覽活動
```

---

## 🔄 數據遷移策略

### 從當前 EduCreate 遷移
```javascript
// 舊結構
Activity {
  id: string,
  gameTemplateId: string,
  vocabularyItems: VocabularyItem[]
}

// 新結構
Activity {
  id: string,
  gameTemplateId: string,
  contentSetId: string,  // 新增
  gameOptions: GameOptions
}

ContentSet {
  id: string,
  title: string,
  items: VocabularyItem[]
}
```

### 遷移步驟
1. 為每個現有 Activity 創建對應的 ContentSet
2. 將 vocabularyItems 移到 ContentSet
3. 更新 Activity 引用 contentSetId
4. 保持向後兼容性

---

## 🎯 優先級實現順序

### Phase 1（第 1-2 周）
- [ ] 批量導入功能（CSV）
- [ ] 媒體庫管理
- [ ] 拖拽排序

### Phase 2（第 3-4 周）
- [ ] 內容集合系統
- [ ] 內容共享功能
- [ ] 版本控制

### Phase 3（第 5-6 周）
- [ ] 實時預覽
- [ ] AI 輔助創建
- [ ] 分析系統

---

## 📊 性能考慮

- **批量操作**：使用分頁，每頁 50-100 項
- **媒體上傳**：支援並行上傳（最多 5 個）
- **實時預覽**：使用 WebSocket 或 Server-Sent Events
- **緩存策略**：ContentSet 緩存 5 分鐘

