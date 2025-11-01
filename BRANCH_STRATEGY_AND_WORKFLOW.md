# 佈局計算改進方案 - 分支策略和工作流程

**創建日期**：2025-11-01  
**主分支**：`feat/layout-calculation-improvements`  
**當前分支**：`fix/p0-step-order-horizontalspacing`

---

## 🌳 分支結構

```
master (主分支)
  ↓
feat/layout-calculation-improvements (主功能分支)
  ├── fix/p0-step-order-horizontalspacing ✅ 已創建
  ├── fix/p0-device-detection
  ├── fix/p0-chinese-text-height
  ├── fix/p1-mincard-size
  ├── fix/p1-chinese-text-position
  ├── fix/p1-rectangle-height
  ├── fix/p1-event-listeners
  ├── fix/p2-button-area
  ├── fix/p2-column-logic
  ├── fix/p2-fullscreen-principle
  └── fix/p2-device-table
```

---

## 📋 分支命名規則

| 類型 | 前綴 | 示例 |
|------|------|------|
| 功能分支 | `feat/` | `feat/layout-calculation-improvements` |
| 修復分支 | `fix/` | `fix/p0-step-order-horizontalspacing` |
| 文檔分支 | `docs/` | `docs/layout-analysis` |
| 測試分支 | `test/` | `test/layout-verification` |

---

## 🔄 工作流程

### 第一階段：P0 修復（3 個任務）

#### 步驟 1：P0-1 修復

```bash
# 當前分支：fix/p0-step-order-horizontalspacing
# 1. 修改代碼
# 2. 測試驗證
# 3. 提交

git add public/games/match-up-game/scenes/game.js
git commit -m "fix: P0-1 - 調整步驟順序（horizontalSpacing 問題）"

# 4. 創建下一個分支
git checkout feat/layout-calculation-improvements
git checkout -b fix/p0-device-detection
```

#### 步驟 2：P0-2 修復

```bash
# 當前分支：fix/p0-device-detection
# 1. 修改代碼
# 2. 測試驗證
# 3. 提交

git add public/games/match-up-game/scenes/game.js
git commit -m "fix: P0-2 - 統一設備檢測邏輯"

# 4. 創建下一個分支
git checkout feat/layout-calculation-improvements
git checkout -b fix/p0-chinese-text-height
```

#### 步驟 3：P0-3 修復

```bash
# 當前分支：fix/p0-chinese-text-height
# 1. 修改代碼
# 2. 測試驗證
# 3. 提交

git add public/games/match-up-game/scenes/game.js
git commit -m "fix: P0-3 - 修正中文文字高度計算公式"

# 4. 合併到主功能分支
git checkout feat/layout-calculation-improvements
git merge fix/p0-chinese-text-height
```

### 第二階段：P1 修復（4 個任務）

類似 P0 流程，創建 4 個分支：
- `fix/p1-mincard-size`
- `fix/p1-chinese-text-position`
- `fix/p1-rectangle-height`
- `fix/p1-event-listeners`

### 第三階段：P2 修復（4 個任務）

類似 P0 流程，創建 4 個分支：
- `fix/p2-button-area`
- `fix/p2-column-logic`
- `fix/p2-fullscreen-principle`
- `fix/p2-device-table`

### 測試階段

創建測試分支：
- `test/layout-verification`

---

## 📝 提交信息格式

### 標準格式

```
<type>: <scope> - <subject>

<body>

<footer>
```

### 示例

```
fix: P0-1 - 調整步驟順序（horizontalSpacing 問題）

修改 game.js 中的計算步驟順序，確保 horizontalSpacing 在使用前定義。

- 第三步：計算寬高比和間距
- 第四步：計算水平間距
- 第五步：計算垂直間距

Fixes: #123
```

### 類型說明

| 類型 | 說明 | 示例 |
|------|------|------|
| `fix` | 修復 bug | `fix: P0-1 - ...` |
| `feat` | 新功能 | `feat: 添加新功能` |
| `docs` | 文檔 | `docs: 更新文檔` |
| `test` | 測試 | `test: 添加測試` |
| `refactor` | 重構 | `refactor: 簡化邏輯` |

---

## 🔀 合併策略

### 合併到主功能分支

```bash
# 完成一個修復後
git checkout feat/layout-calculation-improvements
git merge fix/p0-step-order-horizontalspacing

# 或使用 rebase（保持線性歷史）
git rebase fix/p0-step-order-horizontalspacing
```

### 合併到 master

```bash
# 完成所有修復後
git checkout master
git merge feat/layout-calculation-improvements

# 或推送到 GitHub 並創建 PR
git push origin feat/layout-calculation-improvements
```

---

## ✅ 檢查清單

### 每個任務完成前

- [ ] 代碼修改完成
- [ ] 本地測試通過
- [ ] 沒有 console 錯誤
- [ ] 代碼符合項目風格
- [ ] 提交信息清晰

### 每個階段完成前

- [ ] 所有子任務完成
- [ ] 所有分支已合併
- [ ] 測試通過
- [ ] 文檔已更新

### 最終提交前

- [ ] 所有 P0/P1/P2 任務完成
- [ ] 所有測試通過
- [ ] 測試報告已生成
- [ ] 代碼審查通過
- [ ] 準備合併到 master

---

## 🚀 快速命令參考

### 查看分支

```bash
# 查看本地分支
git branch

# 查看遠程分支
git branch -r

# 查看所有分支
git branch -a
```

### 切換分支

```bash
# 切換到已存在的分支
git checkout <branch-name>

# 創建並切換到新分支
git checkout -b <branch-name>

# 從特定分支創建新分支
git checkout -b <new-branch> <base-branch>
```

### 查看提交歷史

```bash
# 查看當前分支的提交
git log --oneline

# 查看所有分支的提交
git log --oneline --all --graph

# 查看特定分支的提交
git log --oneline <branch-name>
```

### 同步分支

```bash
# 從 master 更新當前分支
git fetch origin
git rebase origin/master

# 或使用 merge
git merge origin/master
```

---

## 📊 進度追蹤

### 查看當前狀態

```bash
# 查看當前分支
git branch

# 查看未提交的更改
git status

# 查看修改的文件
git diff
```

### 更新進度文檔

每完成一個任務，更新 `IMPLEMENTATION_PROGRESS.md`：

```bash
git add IMPLEMENTATION_PROGRESS.md
git commit -m "docs: Update progress - P0-1 completed"
```

---

## 🔗 相關資源

- **IMPLEMENTATION_PROGRESS.md**：實施進度追蹤
- **LAYOUT_CALCULATION_IMPLEMENTATION_TASKLIST.md**：詳細任務清單
- **IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md v4.0**：改進方案

---

## 💡 最佳實踐

1. **頻繁提交**：每完成一個小功能就提交
2. **清晰的提交信息**：描述做了什麼和為什麼
3. **定期同步**：保持分支與 master 同步
4. **測試優先**：修改前後都要測試
5. **文檔更新**：修改代碼時同時更新文檔

---

**最後更新**：2025-11-01  
**下一步**：開始 P0-1 代碼修改

