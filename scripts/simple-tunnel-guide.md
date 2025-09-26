# 🌐 創建公開隧道的替代方案

## 方案 A：使用 localtunnel（最簡單）

### 1. 安裝 localtunnel
```bash
npm install -g localtunnel
```

### 2. 啟動隧道
```bash
lt --port 3000
```

### 3. 獲得公開 URL
會顯示類似：`your url is: https://abc123.loca.lt`

### 4. 手機測試地址
```
https://abc123.loca.lt/mobile-postmessage-test.html
```

---

## 方案 B：使用 Vercel CLI（推薦）

### 1. 安裝 Vercel CLI
```bash
npm install -g vercel
```

### 2. 登入 Vercel
```bash
vercel login
```

### 3. 部署專案
```bash
vercel --prod
```

### 4. 獲得公開 URL
會顯示部署後的 URL，如：`https://your-project.vercel.app`

### 5. 手機測試地址
```
https://your-project.vercel.app/mobile-postmessage-test.html
```

---

## 方案 C：使用 serveo（無需安裝）

### 1. 使用 SSH 隧道
```bash
ssh -R 80:localhost:3000 serveo.net
```

### 2. 獲得公開 URL
會顯示類似：`https://abc123.serveo.net`

### 3. 手機測試地址
```
https://abc123.serveo.net/mobile-postmessage-test.html
```

---

## 🎯 測試步驟（適用於所有方案）

1. **獲得公開 URL 後**：
   - 在手機瀏覽器中打開測試地址
   - 等待遊戲載入完成（約3-5秒）

2. **測試全螢幕功能**：
   - 點擊遊戲內的 ⛶ 按鈕
   - 觀察是否順利進入全螢幕
   - 再次點擊 ⛶ 按鈕
   - 觀察是否順利退出全螢幕

3. **驗證修復效果**：
   - ✅ 應該看到：順暢的進入/退出切換
   - 🚫 不應該看到：快速閃爍的無限循環

4. **測試完成後**：
   - 按 Ctrl+C 停止隧道服務
   - 或關閉相關終端視窗

---

## 💡 推薦順序

1. **最簡單**：方案 A (localtunnel)
2. **最穩定**：方案 B (Vercel)
3. **無需安裝**：方案 C (serveo)

選擇一個方案執行即可！
