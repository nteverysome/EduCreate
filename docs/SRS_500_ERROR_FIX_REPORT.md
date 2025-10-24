# SRS 500 錯誤修復報告

## 📋 問題描述

### 症狀
- 遊戲中碰撞檢測正常工作
- 但更新學習進度時 API 返回 **HTTP 500 錯誤**
- 錯誤發生在 `/api/srs/update-progress` 端點

### 錯誤日誌
```
[ERROR] Failed to load resource: the server responded with a status of 500 ()
[ERROR] ❌ 進度更新失敗: Error: HTTP 500
```

---

## 🔍 根本原因分析

### 問題 1: 外鍵約束錯誤

**發現**:
- `UserWordProgress.wordId` 指向 `VocabularyItem.id` (外鍵約束)
- 但我們的代碼使用 `TTSCache.id` 作為 `wordId`
- 這導致外鍵約束失敗,返回 500 錯誤

**Prisma Schema**:
```prisma
model UserWordProgress {
  id       String   @id @default(cuid())
  userId   String
  wordId   String  // ← 必須是 VocabularyItem.id
  
  // 關聯
  user     User     @relation("UserWordProgress", fields: [userId], references: [id])
  word     VocabularyItem @relation("WordProgress", fields: [wordId], references: [id])
  //       ^^^^^^^^^^^^^^ 外鍵指向 VocabularyItem
  
  @@unique([userId, wordId])
}
```

**數據流問題**:
```
TTSCache.id → getWordsToReview() → SRSManager → API
                                                   ↓
                                            UserWordProgress.wordId
                                                   ↓
                                            ❌ 外鍵約束失敗!
                                            (wordId 不存在於 VocabularyItem 表)
```

---

## ✅ 解決方案

### 修改 1: `lib/srs/getWordsToReview.ts`

**目標**: 為每個 TTS 單字創建或查找對應的 VocabularyItem

**實現**:
```typescript
// 6. 為每個單字創建或獲取 VocabularyItem
const createOrGetVocabItem = async (ttsWord: any, chinese: string) => {
  // 嘗試查找現有的 VocabularyItem
  let vocabItem = await prisma.vocabularyItem.findFirst({
    where: {
      english: ttsWord.text,
      chinese: chinese
    }
  });
  
  // 如果不存在,創建新的
  if (!vocabItem) {
    vocabItem = await prisma.vocabularyItem.create({
      data: {
        english: ttsWord.text,
        chinese: chinese,
        audioUrl: ttsWord.audioUrl,
        difficultyLevel: 1
      }
    });
    console.log(`  - 創建 VocabularyItem: ${ttsWord.text} (${vocabItem.id})`);
  }
  
  return vocabItem;
};

// 7. 合併單字列表 (使用 VocabularyItem.id)
const words: WordToReview[] = [];

// 處理新單字
for (const w of selectedNewWords) {
  const word = w.text.toLowerCase();
  const chinese = translations[word] || '';
  const vocabItem = await createOrGetVocabItem(w, chinese);
  
  words.push({
    id: vocabItem.id,  // ← 使用 VocabularyItem.id
    english: w.text,
    chinese: chinese,
    audioUrl: w.audioUrl,
    geptLevel: w.geptLevel,
    isNew: true,
    needsReview: false,
    memoryStrength: 0
  });
}

// 處理複習單字
for (const p of selectedReviewWords) {
  const w = allWords.find(word => word.id === p.wordId);
  if (!w) {
    throw new Error(`找不到單字: ${p.wordId}`);
  }
  const word = w.text.toLowerCase();
  const chinese = translations[word] || '';
  const vocabItem = await createOrGetVocabItem(w, chinese);
  
  words.push({
    id: vocabItem.id,  // ← 使用 VocabularyItem.id
    english: w.text,
    chinese: chinese,
    audioUrl: w.audioUrl,
    geptLevel: w.geptLevel,
    isNew: false,
    needsReview: true,
    memoryStrength: p.memoryStrength
  });
}
```

**關鍵改進**:
1. ✅ 為每個 TTS 單字創建對應的 VocabularyItem
2. ✅ 使用 `VocabularyItem.id` 而非 `TTSCache.id`
3. ✅ 避免重複創建 (先查找再創建)
4. ✅ 保持數據一致性

---

### 修改 2: `app/api/srs/update-progress/route.ts`

**目標**: 添加 wordId 驗證,提供更好的錯誤信息

**實現**:
```typescript
// 2. 驗證 wordId 是否存在於 VocabularyItem 表中
const vocabularyItem = await prisma.vocabularyItem.findUnique({
  where: { id: wordId }
});

if (!vocabularyItem) {
  console.error(`❌ 找不到單字: ${wordId}`);
  return NextResponse.json(
    { error: `找不到單字: ${wordId}` },
    { status: 404 }
  );
}

// 3. 獲取或創建學習記錄
let progress = await prisma.userWordProgress.findUnique({
  where: {
    userId_wordId: {
      userId,
      wordId
    }
  }
});
```

**關鍵改進**:
1. ✅ 驗證 wordId 存在於 VocabularyItem 表
2. ✅ 返回 404 而非 500 (更準確的錯誤碼)
3. ✅ 提供清晰的錯誤信息

---

## 📊 修復前後對比

### 修復前
```
TTSCache.id → getWordsToReview() → SRSManager → API
                                                   ↓
                                            UserWordProgress.wordId
                                                   ↓
                                            ❌ 外鍵約束失敗!
                                            HTTP 500 錯誤
```

### 修復後
```
TTSCache → createOrGetVocabItem() → VocabularyItem.id
                                           ↓
                                    getWordsToReview()
                                           ↓
                                      SRSManager
                                           ↓
                                          API
                                           ↓
                                    UserWordProgress.wordId
                                           ↓
                                    ✅ 外鍵約束滿足!
                                    成功保存進度
```

---

## 🚀 部署狀態

### Git 提交
```bash
commit 40dbeed
Author: nteverysome
Date: Fri Oct 24 12:38:18 2025 +0800

fix: Create VocabularyItem for SRS words to fix 500 error
```

### 修改的文件
1. `lib/srs/getWordsToReview.ts` - 創建 VocabularyItem 邏輯
2. `app/api/srs/update-progress/route.ts` - 添加驗證

### 部署狀態
- ✅ 代碼已推送到 GitHub
- ✅ Vercel 自動部署中
- ⏳ 等待部署完成後測試

---

## 🧪 測試計畫

### 測試步驟
1. ✅ 清除瀏覽器緩存
2. ✅ 重新載入遊戲
3. ✅ 開始 SRS 會話
4. ⏳ 碰撞正確單字
5. ⏳ 檢查 API 回應 (應該是 200 而非 500)
6. ⏳ 驗證進度保存到資料庫
7. ⏳ 碰撞錯誤單字
8. ⏳ 再次檢查 API 回應
9. ⏳ 完成所有 5 個單字
10. ⏳ 創建第二個會話,驗證複習單字出現

### 預期結果
- ✅ API 返回 200 成功
- ✅ 進度保存到 UserWordProgress 表
- ✅ SM-2 算法正確計算
- ✅ 複習單字按時間出現

---

## 📝 技術總結

### 學到的教訓
1. **外鍵約束很重要**: 必須確保 ID 指向正確的表
2. **數據流追蹤**: 從源頭 (TTSCache) 到目標 (UserWordProgress) 的完整路徑
3. **錯誤處理**: 提供清晰的錯誤信息幫助調試
4. **數據一致性**: 避免重複創建記錄

### 架構改進
- ✅ TTSCache 和 VocabularyItem 的關係更清晰
- ✅ SRS 系統使用正確的數據模型
- ✅ 錯誤處理更完善

---

## 🔄 下一步

1. **完成測試** - 驗證修復是否成功
2. **E2E 測試** - 完整的學習流程測試
3. **性能優化** - 批量創建 VocabularyItem
4. **文檔更新** - 更新 SRS 系統文檔

---

**報告時間**: 2025-10-24 12:40
**狀態**: 修復已部署,等待測試驗證

