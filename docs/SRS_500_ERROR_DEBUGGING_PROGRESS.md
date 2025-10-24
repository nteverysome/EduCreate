# SRS 500 錯誤調試進度報告

**日期**: 2025-10-24  
**狀態**: 🔄 調試中  
**進度**: 70%

---

## 📋 問題描述

`POST /api/srs/sessions` 端點在生產環境 (Vercel) 返回 HTTP 500 錯誤。

### 錯誤表現
```
HTTP 500: Internal Server Error
❌ SRS 會話創建失敗: Error: HTTP 500
```

---

## 🔍 已完成的調試步驟

### 1. 初步分析 (2025-10-24 早上)
**發現**: 內部 API 調用認證問題
- `/api/srs/sessions` 內部調用 `/api/srs/words-to-review`
- HTTP fetch 不會自動傳遞認證 cookies
- 導致 401 Unauthorized 錯誤

### 2. 代碼重構 (Commit: 407cdd3)
**解決方案**: 提取共享函數
- ✅ 創建 `lib/srs/getWordsToReview.ts` 共享函數
- ✅ 修改 `/api/srs/sessions` 直接調用共享函數
- ✅ 修改 `/api/srs/words-to-review` 使用共享函數
- ✅ 提交並部署到生產環境

**結果**: ❌ 500 錯誤仍然存在

### 3. 創建測試端點 (Commit: 89ad636)
**目的**: 系統性測試資料庫連接和各個組件
- ✅ 創建 `app/api/srs/test-db/route.ts`
- ✅ 測試 8 個關鍵功能:
  1. 用戶身份驗證
  2. Prisma 客戶端檢查
  3. 資料庫連接測試
  4. 用戶存在性查詢
  5. TTSCache 表查詢
  6. UserWordProgress 表查詢
  7. LearningSession 創建測試
  8. getWordsToReview 函數調用

**部署狀態**: ✅ 已部署到生產環境
**測試結果**: 🔄 需要登入才能測試 (401 Unauthorized)

---

## 🎯 當前狀態

### 已驗證正常的組件
- ✅ 用戶認證系統 (NextAuth)
- ✅ Prisma 客戶端初始化
- ✅ 基本資料庫連接
- ✅ `/api/srs/words-to-review` 端點 (返回單字列表)
- ✅ SRS 模式檢測 (URL 參數 `useSRS=true`)
- ✅ Phaser 3 SRSManager 初始化

### 未驗證的組件
- ❓ 生產環境的 Prisma 客戶端完整功能
- ❓ LearningSession 表的寫入操作
- ❓ 外鍵約束驗證
- ❓ 資料庫連接池狀態
- ❓ Vercel Functions 超時問題

---

## 🔬 可能的原因分析

### 原因 1: Prisma 客戶端問題 (可能性: 40%)
**症狀**:
- 生產環境的 Prisma 客戶端可能未正確初始化
- 或者某些操作在 Vercel Serverless 環境中不支援

**驗證方法**:
- 使用測試端點逐步測試每個 Prisma 操作
- 檢查 Vercel 部署日誌

### 原因 2: 資料庫連接問題 (可能性: 30%)
**症狀**:
- Vercel 資料庫連接可能有問題
- 連接池耗盡或超時

**驗證方法**:
- 檢查 DATABASE_URL 環境變數
- 測試資料庫連接穩定性
- 檢查連接池配置

### 原因 3: 外鍵約束問題 (可能性: 20%)
**症狀**:
- `userId` 可能在 `User` 表中不存在
- 或者外鍵關係配置錯誤

**驗證方法**:
- 使用測試端點驗證用戶存在性
- 檢查 Prisma schema 的外鍵定義

### 原因 4: 其他未知錯誤 (可能性: 10%)
**可能性**:
- Vercel Functions 超時 (10 秒限制)
- 記憶體不足
- 環境變數缺失
- 代碼邏輯錯誤

**驗證方法**:
- 查看 Vercel 詳細日誌
- 添加更多 console.log 追蹤
- 簡化代碼邏輯測試

---

## 📝 下一步行動計畫

### 選項 A: 使用測試端點進行系統性測試 (推薦 ⭐)
**步驟**:
1. 在瀏覽器中登入 EduCreate
2. 訪問 `https://edu-create.vercel.app/api/srs/test-db`
3. 查看詳細的測試結果
4. 根據失敗的測試項目定位問題
5. 修復並重新測試

**預計時間**: 30-60 分鐘  
**成功率**: 80%

### 選項 B: 查看 Vercel 部署日誌
**步驟**:
1. 登入 Vercel Dashboard
2. 進入 edu-create 專案
3. 查看 Functions 日誌
4. 搜尋 `/api/srs/sessions` 的錯誤信息
5. 根據錯誤信息修復

**預計時間**: 20-40 分鐘  
**成功率**: 70%

### 選項 C: 添加更詳細的錯誤處理
**步驟**:
1. 在 `/api/srs/sessions` 添加更多 try-catch
2. 記錄每個步驟的詳細信息
3. 返回更具體的錯誤信息
4. 重新部署並測試

**預計時間**: 40-60 分鐘  
**成功率**: 60%

### 選項 D: 簡化實施 (臨時方案)
**步驟**:
1. 移除資料庫依賴
2. 使用 localStorage 存儲學習進度
3. 快速驗證 SRS 概念
4. 稍後再整合資料庫

**預計時間**: 2-3 小時  
**成功率**: 90% (但不是最終解決方案)

---

## 📊 技術細節

### 當前代碼結構
```
app/api/srs/
├── sessions/route.ts          # 創建學習會話 (500 錯誤)
├── words-to-review/route.ts   # 獲取複習單字 (正常)
├── test-db/route.ts           # 測試端點 (新增)
└── ...

lib/srs/
├── getWordsToReview.ts        # 共享函數 (新增)
└── ...
```

### 關鍵代碼片段

**`app/api/srs/sessions/route.ts` (簡化版)**:
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. 驗證用戶
    const session = await getServerSession(authOptions);
    const userId = session.user.id;
    
    // 2. 獲取單字 (使用共享函數)
    const wordsData = await getWordsToReview(userId, geptLevel, 15);
    
    // 3. 創建學習會話 (可能在這裡失敗?)
    const learningSession = await prisma.learningSession.create({
      data: {
        userId,
        geptLevel,
        newWordsCount: wordsData.newWordsCount,
        reviewWordsCount: wordsData.reviewWordsCount,
        totalWords: wordsData.words.length,
        correctAnswers: 0,
        totalAnswers: 0
      }
    });
    
    return NextResponse.json({
      sessionId: learningSession.id,
      words: wordsData.words
    });
  } catch (error) {
    return NextResponse.json({ error: '...' }, { status: 500 });
  }
}
```

---

## 🎯 成功標準

只有當以下條件全部滿足時才算解決:
- ✅ `/api/srs/sessions` 返回 200 OK
- ✅ 成功創建 LearningSession 記錄
- ✅ 返回正確的 sessionId 和 words 列表
- ✅ Phaser 3 遊戲能夠正常啟動 SRS 模式
- ✅ 完整的學習流程可以正常運行

---

## 📚 相關文檔

- `docs/SRS_IMPLEMENTATION_PROGRESS_REPORT.md` - SRS 整體實施進度
- `docs/SRS_API_500_ERROR_FINAL_ANALYSIS.md` - 500 錯誤初步分析
- `lib/srs/getWordsToReview.ts` - 共享函數實現
- `app/api/srs/test-db/route.ts` - 測試端點實現

---

## 📞 聯絡信息

如需協助,請提供:
1. Vercel 部署日誌截圖
2. 瀏覽器 Console 錯誤信息
3. 測試端點的完整回應

---

**最後更新**: 2025-10-24 09:01 (UTC+8)  
**下次更新**: 待測試端點驗證完成後

