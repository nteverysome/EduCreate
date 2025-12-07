# Flying Fruit 遊戲 - 實際遊戲分析（基於瀏覽器測試）

## 🎮 遊戲啟動方式

### 頁面結構
- **資源頁面**：`https://wordwall.net/resource/103626299/untitled62`
- **Canvas 容器**：`<div class="canvas-container">`
- **Canvas 元素**：`<canvas class="render-canvas js-render-canvas js-glitch-ignore">`
- **Canvas 尺寸**：761px × 441px

### 遊戲加載流程
```
1. 頁面加載
   ↓
2. 加載主題資源（XML、圖片、音效、字體）
   ├─ 主題 XML：/themexml/jungle/1080p/assets-82.xml
   ├─ 圖片資源：/themeimage/1080p/jungle/...
   ├─ 音效資源：/themesound/jungle/sounds-03-2025/...
   └─ 字體資源：/themefont/...
   ↓
3. Canvas 初始化
   ├─ 寬度：761px
   ├─ 高度：441px
   └─ 類名：render-canvas js-render-canvas js-glitch-ignore
   ↓
4. 遊戲預加載
   ├─ 預加載進度顯示：100%
   └─ 隱藏預加載 UI
   ↓
5. 遊戲準備就緒（等待用戶交互）
```

---

## 🎯 遊戲交互方式

### 啟動遊戲
- **方式**：點擊 Canvas 元素
- **事件**：MouseEvent('click')
- **觸發位置**：Canvas 中心（380.5, 220.5）

### 遊戲交互
- **答案選擇**：在 Canvas 上點擊不同位置
- **點擊位置**：
  - 左側答案：x ≈ 200
  - 中央答案：x ≈ 400
  - 右側答案：x ≈ 600
  - 垂直位置：y ≈ 200-300

---

## 📊 遊戲特點

### 開放式模板
- **重要發現**：Flying Fruit 是 **open-ended template**
- **排行榜支持**：❌ 不生成排行榜分數
- **計分系統**：❌ 不計分
- **用途**：純粹的學習和練習工具

### 遊戲機制
- **記憶類型**：動態反應記憶
- **交互方式**：Canvas 上的點擊交互
- **視覺反饋**：Canvas 渲染的動畫
- **音頻反饋**：主題音效系統

---

## 🔧 技術實現細節

### Canvas 渲染
```
Canvas 元素
├─ 寬度：761px
├─ 高度：441px
├─ 類名：render-canvas js-render-canvas js-glitch-ignore
├─ 事件監聽：click, mousemove, keydown 等
└─ 渲染引擎：Saltarelle（C# 編譯到 JavaScript）
```

### 資源加載
```
主題資源加載順序：
1. 主題 XML 配置
2. 動畫定義 XML
3. 音效定義 XML
4. 調色板 XML
5. 設置 XML
6. 內容布局 XML
7. 圖片資源（WebP 格式）
8. 音效資源（OGG 格式）
9. 字體資源（WOFF2 格式）
```

### 預加載系統
```
預加載 UI：
├─ 容器類名：play-preload js-play-preload
├─ 進度顯示：<p class="js-play-preload-loader">100%</p>
├─ 日誌消息：<p class="play-log-message js-play-log-message">
└─ 隱藏類名：hidden（加載完成後隱藏）
```

---

## 🎨 主題系統架構

### 主題資源結構
```
/themexml/jungle/
├─ 1080p/
│  ├─ assets-82.xml（主配置）
│  ├─ scenes/default.xml
│  ├─ builders/
│  │  ├─ tiles/
│  │  │  ├─ default.xml
│  │  │  ├─ square.xml
│  │  │  ├─ rank.xml
│  │  │  └─ flyingfruitanswer.xml
│  │  ├─ places/
│  │  ├─ label.xml
│  │  ├─ images/basic.xml
│  │  └─ sprites/contentsound.xml
│  ├─ animations.xml
│  ├─ audios.xml
│  ├─ palette.xml
│  └─ settings.xml
└─ _shared/
   ├─ fonts.xml
   └─ animations/
      ├─ appear.xml
      ├─ buzz.xml
      ├─ decoration.xml
      ├─ disable.xml
      ├─ eliminate.xml
      ├─ flash.xml
      ├─ flip.xml
      └─ highlight.xml
```

---

## 🎵 音效系統

### 遊戲音效
```
junglegameintro.ogg          - 遊戲開始音效
junglegamemenu.ogg           - 菜單音效
junglereveal.ogg             - 揭示音效
jungleffcorrect1-3.ogg       - 正確答案音效（3 種）
jungleffincorrect1-3.ogg     - 錯誤答案音效（3 種）
junglefrog.ogg               - 青蛙音效
jungletoucan.ogg             - 鸚鵡音效
junglemonkey.ogg             - 猴子音效
junglegamerestart.ogg        - 重新開始音效
jungletimesup.ogg            - 時間到音效
junglegamesuccessful.ogg     - 遊戲成功音效
junglegameunsuccessful.ogg   - 遊戲失敗音效
jungleleaderboards.ogg       - 排行榜音效
```

---

## 📱 遊戲流程

```
1. 頁面加載
   ↓
2. 資源預加載（顯示進度 100%）
   ↓
3. Canvas 初始化
   ↓
4. 等待用戶點擊 Canvas 啟動遊戲
   ↓
5. 遊戲開始
   ├─ 播放開始音效
   ├─ 顯示第一個問題
   └─ 水果開始飛行
   ↓
6. 用戶點擊答案
   ├─ 驗證答案
   ├─ 播放反饋音效
   ├─ 顯示動畫反饋
   └─ 更新遊戲狀態
   ↓
7. 檢查遊戲狀態
   ├─ 生命值 > 0 → 下一題
   └─ 生命值 = 0 → 遊戲結束
   ↓
8. 遊戲結束
   ├─ 播放結束音效
   ├─ 顯示結果
   └─ 提供重新開始選項
```

---

## 🚀 對 EduCreate 的實現建議

### 核心要素
1. **Canvas 渲染引擎**
   - 使用 Canvas 2D 或 WebGL
   - 實現物理引擎（水果飛行）
   - 碰撞檢測系統

2. **事件系統**
   - 點擊事件監聽
   - 鍵盤事件支持
   - 觸摸事件支持（移動設備）

3. **資源管理**
   - 主題 XML 解析
   - 圖片預加載
   - 音效預加載
   - 字體加載

4. **遊戲狀態管理**
   - 當前問題追蹤
   - 生命值管理
   - 分數計算（如果需要）
   - 計時器管理

5. **用戶反饋**
   - 視覺動畫反饋
   - 音效反饋
   - 進度指示
   - 結果顯示

### 實現優先級
- **Phase 1**：Canvas 基礎 + 事件系統
- **Phase 2**：資源加載 + 主題系統
- **Phase 3**：遊戲邏輯 + 狀態管理
- **Phase 4**：動畫 + 音效系統

