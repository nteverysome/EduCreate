# TTS 預覽模態框實施報告

**日期**: 2025-10-23  
**版本**: v1.0  
**狀態**: ✅ 完成  
**Commit**: `059afed`

---

## 📋 實施概述

根據 Wordwall「Add Sound」功能的深度分析,成功實施了**雙模態框預覽流程**,提升用戶體驗和語音質量控制。

---

## 🎯 實施目標

### 主要目標
1. **實施預覽模態框**: 生成語音後顯示預覽模態框
2. **提供播放控制**: 大型播放/暫停按鈕
3. **返回編輯功能**: 允許用戶返回第一個模態框重新編輯
4. **確認流程**: 用戶確認後才添加語音

### 設計參考
- **Wordwall**: 雙模態框設計 (輸入配置 → 預覽確認)
- **用戶體驗**: 提高用戶信心,避免添加錯誤的語音

---

## 🔧 技術實施

### 1. 新增狀態管理

```typescript
const [previewMode, setPreviewMode] = useState(false); // 預覽模式狀態
const [isPlaying, setIsPlaying] = useState(false); // 播放狀態
const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null); // 音頻元素
```

**說明**:
- `previewMode`: 控制是否顯示預覽模態框
- `isPlaying`: 追蹤音頻播放狀態
- `audioElement`: 保存音頻元素引用,用於控制播放/暫停

---

### 2. 修改生成邏輯

**修改前**:
```typescript
const data = await response.json();
setAudioUrl(data.audioUrl);
setSuccess(true);

// 通知父組件
onSoundGenerated(data.audioUrl);

// 2 秒後自動關閉
setTimeout(() => {
  onClose();
}, 2000);
```

**修改後**:
```typescript
const data = await response.json();
setAudioUrl(data.audioUrl);
setSuccess(true);

// 進入預覽模式（類似 Wordwall 的第二個模態框）
setPreviewMode(true);
```

**改進**:
- ❌ 移除自動關閉邏輯
- ❌ 移除直接通知父組件
- ✅ 進入預覽模式,讓用戶確認

---

### 3. 新增播放控制函數

#### `handlePlayPreview()`
```typescript
const handlePlayPreview = () => {
  if (audioUrl) {
    // 停止當前播放
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    // 創建新的音頻元素
    const audio = new Audio(audioUrl);
    setAudioElement(audio);
    setIsPlaying(true);

    // 播放音頻
    audio.play();

    // 監聽播放結束
    audio.onended = () => {
      setIsPlaying(false);
    };

    // 監聽錯誤
    audio.onerror = () => {
      setIsPlaying(false);
      setError('播放音頻時出錯');
    };
  }
};
```

#### `handleStopPreview()`
```typescript
const handleStopPreview = () => {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
    setIsPlaying(false);
  }
};
```

#### `handleBackToEdit()`
```typescript
const handleBackToEdit = () => {
  // 返回編輯模式
  setPreviewMode(false);
  setSuccess(false);
  setAudioUrl(null);
  handleStopPreview();
};
```

#### `handleConfirm()`
```typescript
const handleConfirm = () => {
  // 確認並添加語音
  if (audioUrl) {
    onSoundGenerated(audioUrl);
    handleStopPreview();
    onClose();
  }
};
```

#### `handleClose()`
```typescript
const handleClose = () => {
  handleStopPreview();
  setPreviewMode(false);
  setSuccess(false);
  setAudioUrl(null);
  onClose();
};
```

---

### 4. 實施預覽模態框 UI

#### 模態框結構
```typescript
if (previewMode && audioUrl) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* 標題欄 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-blue-600" />
            預覽語音
          </h2>
          <button onClick={handleClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="px-6 py-8 flex flex-col items-center justify-center space-y-6">
          {/* 語音信息 */}
          <div className="w-full space-y-2 text-center">
            <p className="text-sm text-gray-500">文字</p>
            <p className="text-lg font-medium text-gray-900">{inputText}</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">語言</p>
              <p className="text-base font-medium text-gray-900">
                {LANGUAGE_OPTIONS.find(opt => opt.value === language)?.label}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">語音類型</p>
              <p className="text-base font-medium text-gray-900">
                {VOICE_OPTIONS.find(opt => opt.value === voice)?.label}
              </p>
            </div>
          </div>

          {/* 播放按鈕 */}
          <button
            onClick={isPlaying ? handleStopPreview : handlePlayPreview}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } shadow-lg hover:shadow-xl`}
          >
            {/* 播放/暫停圖標 */}
          </button>

          <p className="text-sm text-gray-500">
            {isPlaying ? '正在播放...' : '點擊播放預覽語音'}
          </p>
        </div>

        {/* 底部按鈕 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={handleBackToEdit}>返回編輯</button>
          <button onClick={handleConfirm}>確認</button>
        </div>
      </div>
    </div>
  );
}
```

#### UI 特點
1. **語音信息顯示**: 顯示文字、語言、語音類型
2. **大型播放按鈕**: 24×24 圓形按鈕,藍色(播放)/紅色(暫停)
3. **播放/暫停切換**: 根據 `isPlaying` 狀態切換圖標和顏色
4. **返回編輯按鈕**: 允許用戶返回第一個模態框
5. **確認按鈕**: 確認後添加語音並關閉模態框

---

### 5. 修改第一個模態框

#### 移除的功能
- ❌ 移除「試聽」按鈕 (不再需要,預覽在第二個模態框)
- ❌ 移除成功提示和自動關閉邏輯

#### 保留的功能
- ✅ 文字輸入
- ✅ 語言選擇
- ✅ 語音類型選擇
- ✅ 生成按鈕
- ✅ 取消按鈕

---

## 📊 完整流程對比

### 修改前的流程
```
1. 打開「加入聲音」模態框
2. 輸入文字 + 選擇語言/語音
3. 點擊「生成語音」
4. 顯示成功提示 + 試聽按鈕
5. 2 秒後自動關閉
6. 語音添加到輸入框
```

**問題**:
- ❌ 用戶無法在確認前預覽語音
- ❌ 自動關閉可能太快
- ❌ 沒有返回編輯的機會

---

### 修改後的流程 (類似 Wordwall)
```
1. 打開「加入聲音」模態框 (第一個模態框)
2. 輸入文字 + 選擇語言/語音
3. 點擊「生成語音」
4. 顯示「預覽語音」模態框 (第二個模態框) ⭐
5. 預覽語音信息 (文字、語言、語音類型)
6. 點擊播放按鈕預覽語音
7. 選擇操作:
   - 點擊「返回編輯」→ 返回第一個模態框
   - 點擊「確認」→ 語音添加到輸入框,關閉模態框
   - 點擊「×」→ 取消,關閉模態框
```

**優點**:
- ✅ 用戶可以在確認前預覽語音
- ✅ 提供返回編輯的機會
- ✅ 用戶有完全的控制權
- ✅ 提高用戶信心
- ✅ 避免添加錯誤的語音

---

## 🎨 UI/UX 改進

### 1. 視覺設計
- **大型播放按鈕**: 24×24 圓形,吸引注意力
- **顏色區分**: 藍色(播放) / 紅色(暫停)
- **語音信息展示**: 清晰顯示文字、語言、語音類型
- **居中布局**: 內容居中,視覺焦點明確

### 2. 交互設計
- **播放/暫停切換**: 點擊同一按鈕切換狀態
- **狀態提示**: 顯示「正在播放...」或「點擊播放預覽語音」
- **返回編輯**: 清除預覽狀態,返回第一個模態框
- **確認操作**: 只有確認後才添加語音

### 3. 錯誤處理
- **播放錯誤**: 監聽 `audio.onerror`,顯示錯誤提示
- **停止播放**: 關閉模態框時自動停止播放
- **清理資源**: 切換模態框時清理音頻元素

---

## 📈 統計數據

### 代碼修改
- **修改文件**: 1 個 (`components/tts/AddSoundDialog.tsx`)
- **新增行數**: +168 行
- **刪除行數**: -39 行
- **淨增加**: +129 行

### 功能改進
- **新增狀態**: 3 個 (`previewMode`, `isPlaying`, `audioElement`)
- **新增函數**: 5 個 (播放、停止、返回、確認、關閉)
- **新增模態框**: 1 個 (預覽模態框)

### Git 提交
- **Commit**: `059afed`
- **Message**: "feat: Implement two-modal preview flow for TTS (like Wordwall)"
- **狀態**: ✅ 已推送到 GitHub

---

## ✅ 測試建議

### 功能測試
1. **第一個模態框**:
   - ✅ 輸入文字
   - ✅ 選擇語言
   - ✅ 選擇語音類型
   - ✅ 點擊「生成語音」

2. **第二個模態框**:
   - ✅ 顯示語音信息
   - ✅ 點擊播放按鈕
   - ✅ 播放/暫停切換
   - ✅ 點擊「返回編輯」
   - ✅ 點擊「確認」
   - ✅ 點擊「×」關閉

3. **邊緣情況**:
   - ✅ 播放中關閉模態框
   - ✅ 播放中返回編輯
   - ✅ 播放錯誤處理

---

## 🎉 總結

成功實施了 Wordwall 風格的雙模態框預覽流程,顯著提升了 TTS 功能的用戶體驗:

1. **預覽功能**: 用戶可以在確認前預覽語音
2. **返回編輯**: 提供重新編輯的機會
3. **用戶控制**: 用戶有完全的控制權
4. **專業感**: 雙模態框設計提升產品質量感知

**下一步**: 部署到 Vercel 並進行實際測試。

