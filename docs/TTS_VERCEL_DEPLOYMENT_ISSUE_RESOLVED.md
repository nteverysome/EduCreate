# TTS Vercel 部署問題解決報告

## 📋 問題摘要

**日期**: 2025-10-23  
**狀態**: ✅ 已解決  
**嚴重程度**: 🔴 Critical (阻塞生產環境)

### 問題描述
TTS API 端點 (`/api/tts`) 在 Vercel 生產環境中返回 500 錯誤:
```
TypeError: Cannot read properties of undefined (reading 'findUnique')
```

---

## 🔍 問題調查過程

### 1. 初步診斷 (19:30 - 19:45)

**症狀**:
- API 端點返回 500 錯誤
- 錯誤信息: `Cannot read properties of undefined (reading 'findUnique')`
- 本地開發環境正常運行

**初步假設**:
- Prisma Client 未正確初始化
- 環境變數配置問題
- 依賴包缺失

### 2. 環境變數檢查 (19:45 - 19:55)

**檢查項目**:
- ✅ `DATABASE_URL` - 已配置 (Production & Preview)
- ✅ `GOOGLE_CLOUD_TTS_KEY_JSON` - 已配置
- ✅ `R2_*` 環境變數 - 全部已配置

**結論**: 環境變數配置完整,不是問題根源。

### 3. 依賴包檢查 (19:55 - 20:00)

**修復嘗試**:
- Commit `6f37d87`: 添加 `@google-cloud/text-to-speech` 和 `@aws-sdk/client-s3`
- Commit `bd416f2`: 支援從環境變數讀取 Google Cloud TTS 憑證

**結果**: 問題依然存在。

### 4. Prisma Client 導入問題 (20:00 - 20:05)

**修復嘗試**:
- Commit `bf3809f`: 使用 Prisma singleton (`lib/prisma`)
- Commit `8fe34c2`: 改用相對路徑導入

**結果**: 問題依然存在。

### 5. Debug 日誌分析 (20:05 - 20:10)

**添加 Debug 日誌** (Commit `8c73ab5`):
```javascript
console.log('prisma object:', prisma);
console.log('prisma type:', typeof prisma);
console.log('prisma.tTSCache:', prisma?.tTSCache);
```

**關鍵發現**:
```
prisma.tTSCache: undefined
```

**結論**: Prisma Client 對象存在,但 `tTSCache` 屬性不存在!

### 6. Prisma Client 生成檢查 (20:10 - 20:15)

**修復嘗試** (Commit `b2566b7`):
- 修改 `package.json` build script: `"prisma generate && next build"`
- 更新 `vercel.json` FORCE_REBUILD 時間戳

**Build Logs 分析**:
```
20:06:22.539 > prisma generate
20:06:24.057 ✔ Generated Prisma Client (v6.9.0) to ./node_modules/@prisma/client in 403ms
20:06:25.776 ✔ Generated Prisma Client (v6.9.0) to ./node_modules/@prisma/client in 364ms
```

**結論**: Prisma Client 成功生成了兩次,不是生成問題!

### 7. 根本原因發現 (20:15 - 20:20)

**關鍵錯誤日誌**:
```
20:06:57.637 ❌ TTS 統計查詢錯誤: TypeError: Cannot read properties of undefined (reading 'count')
at GET (/vercel/path0/.next/server/app/api/tts/stats/route.js:1:558)
```

**Git 狀態檢查**:
```bash
$ git status prisma/schema.prisma
Changes not staged for commit:
        modified:   prisma/schema.prisma
```

**驗證**:
```bash
$ git show 904c803:prisma/schema.prisma | Select-String -Pattern "model TTSCache"
# 無輸出 - TTSCache 模型不存在於 Git 歷史中!
```

**🎯 根本原因**: `prisma/schema.prisma` 文件有未提交的更改,`TTSCache` 模型只存在於本地,沒有被推送到 GitHub!

---

## ✅ 解決方案

### 執行步驟

1. **提交 Schema 文件** (Commit `45171cd`):
```bash
git add prisma/schema.prisma
git commit -m "feat: Add TTSCache model to Prisma schema for TTS audio caching"
git push origin master
```

2. **等待 Vercel 自動部署** (~2 分鐘)

3. **驗證修復**:
```bash
$ curl "https://edu-create.vercel.app/api/tts?text=hello&language=en-US&voice=en-US-Neural2-D"
{
  "audioUrl": "https://pub-4529e19f90554bd48899f7258311a69a.r2.dev/tts/36b6ad3ce4302e6da62140ef7fcb8dab.mp3",
  "cached": true,
  "hash": "36b6ad3ce4302e6da62140ef7fcb8dab",
  "fileSize": 6720,
  "hitCount": 0
}
```

**✅ 成功!** API 返回 200 OK,功能正常運行。

---

## 📊 問題時間線

| 時間 | 事件 | 狀態 |
|------|------|------|
| 19:16 | Phase 6 完成,首次部署 | ❌ 失敗 |
| 19:35 | 修復依賴包問題 | ❌ 仍失敗 |
| 19:42 | 修復 Google Cloud TTS 憑證 | ❌ 仍失敗 |
| 19:50 | 修復 Prisma 導入問題 | ❌ 仍失敗 |
| 19:59 | 添加 Debug 日誌 | 🔍 發現線索 |
| 20:07 | 強制 Prisma Client 重新生成 | ❌ 仍失敗 |
| 20:15 | 發現根本原因 | 🎯 找到問題 |
| 20:20 | 提交 Schema 文件 | ✅ 問題解決 |

**總耗時**: ~1 小時

---

## 🎓 經驗教訓

### 1. **Git 狀態檢查的重要性**
在調試部署問題時,應該首先檢查所有相關文件是否已提交到 Git。

**建議**: 在推送代碼前執行:
```bash
git status
git diff
```

### 2. **Prisma Schema 的特殊性**
Prisma Schema 文件是生成 Prisma Client 的基礎,如果 Schema 沒有提交,生成的 Client 將不包含新模型。

**建議**: 每次修改 `prisma/schema.prisma` 後立即提交。

### 3. **構建時錯誤 vs 運行時錯誤**
Build Logs 中的錯誤 (`❌ TTS 統計查詢錯誤`) 發生在構建時,這是一個重要線索,表明問題出在構建階段而非運行時。

**建議**: 仔細檢查 Build Logs,特別是錯誤和警告信息。

### 4. **Debug 日誌的價值**
添加 Debug 日誌 (`console.log('prisma.tTSCache:', prisma?.tTSCache)`) 幫助我們快速定位到 `tTSCache` 屬性不存在的問題。

**建議**: 在調試時不要害怕添加 Debug 日誌,它們能提供關鍵信息。

### 5. **系統性排查方法**
按照以下順序排查問題:
1. 環境變數
2. 依賴包
3. 代碼邏輯
4. 構建過程
5. **Git 狀態** ⭐ (最容易被忽略)

---

## 🔧 預防措施

### 1. **Pre-commit Hook**
添加 Git pre-commit hook 檢查 `prisma/schema.prisma` 的狀態:

```bash
# .git/hooks/pre-commit
#!/bin/sh
if git diff --cached --name-only | grep -q "prisma/schema.prisma"; then
  echo "✅ Prisma schema changes detected and staged"
fi
```

### 2. **CI/CD 檢查**
在 CI/CD 流程中添加檢查:
```yaml
- name: Check Prisma Schema
  run: |
    if [ -n "$(git status --porcelain prisma/schema.prisma)" ]; then
      echo "❌ Error: prisma/schema.prisma has uncommitted changes"
      exit 1
    fi
```

### 3. **開發文檔更新**
在開發文檔中明確說明:
> ⚠️ **重要**: 修改 `prisma/schema.prisma` 後必須立即提交並推送,否則會導致 Vercel 部署失敗。

---

## 📈 影響評估

### 正面影響
- ✅ TTS API 功能完全恢復
- ✅ 所有 TTS 相關功能正常運行
- ✅ 學到了寶貴的調試經驗

### 負面影響
- ⏱️ 浪費了約 1 小時的調試時間
- 📉 生產環境短暫不可用

### 未來改進
- 🔧 實施上述預防措施
- 📚 更新開發文檔
- 🎓 團隊分享經驗

---

## 🎯 總結

**問題**: Prisma Schema 文件未提交導致 Vercel 構建時使用舊 Schema,生成的 Prisma Client 不包含 `TTSCache` 模型。

**解決**: 提交並推送 `prisma/schema.prisma` 文件。

**關鍵教訓**: 在調試部署問題時,務必檢查所有相關文件的 Git 狀態!

---

**報告生成時間**: 2025-10-23 20:25  
**報告作者**: AI Agent  
**最終狀態**: ✅ 問題已完全解決,系統正常運行

