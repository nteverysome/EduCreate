# iframe + CDN External 實施行動計劃

## 🎯 基於 Task 1.0 基礎的 CDN 升級計劃

### 📋 前置條件檢查

#### ✅ 已完成 (Task 1.0 系列)
- [x] Vite + Phaser 3 子專案 (games/airplane-game/)
- [x] iframe 嵌入機制 (app/games/airplane-iframe/)
- [x] 自動化構建流程 (scripts/deploy.js)
- [x] 父子頁面通信 (GameIframeSimple)
- [x] 本地部署驗證 (public/games/airplane-game/)

#### 🔧 需要準備
- [ ] Vercel 帳號和 CLI
- [ ] GitHub repository 權限
- [ ] 域名配置權限 (可選)

## 📅 **第 1 週: CDN 基礎設施**

### Day 1: Vercel CDN 項目設置

#### 🌅 上午任務 (2-3 小時)
```bash
# 1. 創建 CDN 項目目錄
mkdir educreat-games-cdn
cd educreat-games-cdn

# 2. 初始化項目
npm init -y
npm install -g vercel

# 3. 登入 Vercel
vercel login

# 4. 創建項目
vercel init
# 選擇: Create a new project
# 項目名稱: educreat-games-cdn
```

#### 🌆 下午任務 (2-3 小時)
```bash
# 5. 複製 CDN 配置文件
cp ../EduCreate/vercel-deployment/games-cdn/vercel.json ./
cp -r ../EduCreate/vercel-deployment/games-cdn/api ./

# 6. 測試部署
vercel deploy

# 7. 記錄 CDN URL
echo "CDN URL: $(vercel --prod)" > deployment-info.txt
```

#### ✅ Day 1 完成標準
- [ ] Vercel CDN 項目創建成功
- [ ] 基本配置文件部署
- [ ] 獲得 CDN URL (如: https://educreat-games-cdn.vercel.app)

### Day 2: 遊戲文件 CDN 部署

#### 🌅 上午任務 (2-3 小時)
```bash
# 1. 複製飛機遊戲構建文件
mkdir -p airplane-game
cp -r ../EduCreate/games/airplane-game/dist/* airplane-game/

# 2. 更新 vercel.json 路由
# 添加飛機遊戲路由配置

# 3. 部署到 CDN
vercel deploy --prod
```

#### 🌆 下午任務 (2-3 小時)
```bash
# 4. 測試 CDN 遊戲載入
curl -I https://your-cdn-url.vercel.app/airplane-game/index.html

# 5. 驗證 CORS 配置
curl -H "Origin: https://educreat.vercel.app" \
     https://your-cdn-url.vercel.app/api/games/config

# 6. 測試遊戲配置 API
curl https://your-cdn-url.vercel.app/api/games/config?gameId=airplane
```

#### ✅ Day 2 完成標準
- [ ] 飛機遊戲成功部署到 CDN
- [ ] CORS 配置正確
- [ ] 遊戲配置 API 正常運行

### Day 3: CDN 遊戲載入器開發

#### 🌅 上午任務 (3-4 小時)
```bash
# 1. 在主項目中創建 CDN 載入器
cd ../EduCreate
cp components/games/CDNGameLoader.tsx components/games/

# 2. 更新 CDN URL 配置
# 修改 CDNGameLoader.tsx 中的 CDN URL
```

#### 🌆 下午任務 (2-3 小時)
```bash
# 3. 創建 CDN 遊戲頁面
cp app/games/airplane-cdn/page.tsx app/games/

# 4. 更新路由配置
# 添加 /games/airplane-cdn 路由

# 5. 本地測試
npm run dev
# 訪問 http://localhost:3000/games/airplane-cdn
```

#### ✅ Day 3 完成標準
- [ ] CDNGameLoader 組件整合完成
- [ ] CDN 遊戲頁面創建
- [ ] 本地測試載入 CDN 遊戲成功

### Day 4: 跨域通信測試

#### 🌅 上午任務 (2-3 小時)
```bash
# 1. 測試跨域 iframe 載入
# 確保 CDN 遊戲可以在主應用中載入

# 2. 驗證 postMessage 通信
# 檢查遊戲狀態、分數更新等消息

# 3. 調試 CORS 問題
# 如有問題，調整 vercel.json 配置
```

#### 🌆 下午任務 (2-3 小時)
```bash
# 4. 性能測試
# 比較本地載入 vs CDN 載入的性能

# 5. 錯誤處理測試
# 測試網絡錯誤、載入失敗等情況

# 6. 文檔更新
# 記錄配置和測試結果
```

#### ✅ Day 4 完成標準
- [ ] 跨域 iframe 載入正常
- [ ] 父子頁面通信正常
- [ ] 性能測試通過

### Day 5: 自動化部署設置

#### 🌅 上午任務 (3-4 小時)
```bash
# 1. 設置 GitHub Secrets
# VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_GAMES_PROJECT_ID

# 2. 複製 GitHub Actions 配置
cp .github/workflows/deploy-games-cdn.yml .github/workflows/

# 3. 修改 workflow 配置
# 更新項目路徑和部署目標
```

#### 🌆 下午任務 (2-3 小時)
```bash
# 4. 測試自動化部署
git add .
git commit -m "feat: setup CDN deployment"
git push origin main

# 5. 監控部署狀態
# 檢查 GitHub Actions 執行結果

# 6. 驗證自動部署結果
# 確認 CDN 更新成功
```

#### ✅ Day 5 完成標準
- [ ] GitHub Actions 配置完成
- [ ] 自動化部署成功執行
- [ ] CDN 自動更新驗證

## 📅 **第 2 週: 優化和擴展**

### Day 6-7: 性能優化

#### 主要任務
- [ ] 實施資源預載入
- [ ] 優化緩存策略
- [ ] 添加性能監控
- [ ] 實現錯誤追蹤

### Day 8-9: 多遊戲支援

#### 主要任務
- [ ] 配對遊戲 CDN 部署
- [ ] 問答遊戲 CDN 部署
- [ ] 統一配置管理
- [ ] 動態遊戲載入

### Day 10: 測試和驗證

#### 主要任務
- [ ] 端到端測試
- [ ] 性能基準測試
- [ ] 用戶體驗測試
- [ ] 文檔完善

## 🚀 **立即可執行的第一步**

### 今天就可以開始 (30 分鐘)

```bash
# 1. 檢查當前基礎設施
cd EduCreate
ls -la games/airplane-game/dist/
ls -la public/games/airplane-game/
ls -la app/games/airplane-iframe/

# 2. 驗證當前 iframe 機制
npm run dev
# 訪問 http://localhost:3000/games/airplane-iframe

# 3. 準備 CDN 項目目錄
mkdir ../educreat-games-cdn
cd ../educreat-games-cdn

# 4. 安裝 Vercel CLI
npm install -g vercel

# 5. 登入 Vercel (如果還沒有)
vercel login
```

### 明天的具體任務 (Day 1)

```bash
# 1. 初始化 CDN 項目
npm init -y
vercel init

# 2. 複製配置文件
cp ../EduCreate/vercel-deployment/games-cdn/vercel.json ./
cp -r ../EduCreate/vercel-deployment/games-cdn/api ./

# 3. 首次部署
vercel deploy

# 4. 記錄結果
echo "First deployment completed at $(date)" >> deployment-log.txt
```

## 📊 **進度追蹤表**

### Week 1 Progress
| Day | 任務 | 狀態 | 完成時間 | 備註 |
|-----|------|------|----------|------|
| 1 | Vercel CDN 項目設置 | ⏳ | | |
| 2 | 遊戲文件 CDN 部署 | ⏳ | | |
| 3 | CDN 遊戲載入器開發 | ⏳ | | |
| 4 | 跨域通信測試 | ⏳ | | |
| 5 | 自動化部署設置 | ⏳ | | |

### 關鍵里程碑
- [ ] Day 2: CDN 遊戲可訪問
- [ ] Day 3: 主應用可載入 CDN 遊戲
- [ ] Day 5: 自動化部署完成

## ⚠️ **常見問題和解決方案**

### 問題 1: CORS 錯誤
```bash
# 解決方案: 檢查 vercel.json 配置
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://educreat.vercel.app"
        }
      ]
    }
  ]
}
```

### 問題 2: 遊戲載入失敗
```bash
# 解決方案: 檢查文件路徑和權限
curl -I https://your-cdn-url.vercel.app/airplane-game/index.html
```

### 問題 3: 部署失敗
```bash
# 解決方案: 檢查 GitHub Secrets 配置
# 確保 VERCEL_TOKEN 等變量正確設置
```

## 🎯 **成功標準**

### 技術指標
- [ ] CDN 載入時間 < 2 秒
- [ ] 跨域通信成功率 100%
- [ ] 自動化部署成功率 > 95%

### 用戶體驗
- [ ] 遊戲載入流暢
- [ ] 無明顯延遲
- [ ] 錯誤處理友好

**基於已完成的 Task 1.0 基礎設施，這個 CDN 升級計劃是完全可行的，預計 1-2 週即可完成核心功能！** 🚀
