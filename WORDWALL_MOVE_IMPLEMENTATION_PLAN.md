# EduCreate 實現 Wordwall 風格移動功能計劃

## 🎯 目標
基於 Playwright 分析結果，在 EduCreate 的我的活動頁面實現 Wordwall 風格的移動功能，替換現有的拖拽系統。

## 📊 現狀分析

### 現有功能
✅ **已有三個點菜單** - WordwallStyleActivityCard 已有 MoreVertical 菜單
✅ **已有移動 API** - handleActivityDropToFolder 函數已實現
✅ **已有資料夾系統** - FolderManager 組件完整
❌ **使用拖拽操作** - 需要替換為點擊式移動

### 需要修改的組件
1. `WordwallStyleActivityCard.tsx` - 添加移動菜單項
2. `WordwallStyleMyActivities.tsx` - 添加移動模態對話框
3. 新建 `MoveActivityModal.tsx` - 移動功能模態對話框

## 🔧 實施步驟

### 步驟 1：創建移動模態對話框組件

**新建文件：** `components/activities/MoveActivityModal.tsx`

**功能需求：**
- 顯示所有可用資料夾
- 支援移動到根級別
- 顯示資料夾活動數量
- 提供取消操作

### 步驟 2：修改活動卡片組件

**修改文件：** `components/activities/WordwallStyleActivityCard.tsx`

**需要添加：**
- 移動菜單項到三個點菜單
- onMove 回調函數
- 移動圖標 (Folder 或 Move)

### 步驟 3：整合到主頁面

**修改文件：** `components/activities/WordwallStyleMyActivities.tsx`

**需要添加：**
- 移動模態對話框狀態管理
- 處理移動操作的函數
- 傳遞資料夾列表給模態對話框

### 步驟 4：移除拖拽功能

**清理項目：**
- 移除 HTML5 拖拽相關代碼
- 移除拖拽樣式和狀態
- 簡化組件 props

### 步驟 5：測試和優化

**測試項目：**
- 移動功能正常工作
- 模態對話框響應式設計
- 錯誤處理和用戶反饋

## 💻 具體實現代碼

### 1. MoveActivityModal 組件

```typescript
interface MoveActivityModalProps {
  isOpen: boolean;
  activityId: string | null;
  activityTitle: string;
  folders: Array<{
    id: string;
    name: string;
    activityCount: number;
  }>;
  currentFolderId: string | null;
  onMove: (activityId: string, targetFolderId: string | null) => Promise<void>;
  onClose: () => void;
}
```

### 2. 活動卡片菜單項

```typescript
// 在現有的三個點菜單中添加
<button
  onClick={(e) => {
    e.stopPropagation();
    onMove?.(activity);
    setShowMenu(false);
  }}
  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
>
  <Folder className="w-3 h-3" />
  移動到資料夾
</button>
```

### 3. 主頁面狀態管理

```typescript
const [showMoveModal, setShowMoveModal] = useState(false);
const [moveActivityId, setMoveActivityId] = useState<string | null>(null);
const [moveActivityTitle, setMoveActivityTitle] = useState('');

const handleMoveActivity = (activity: Activity) => {
  setMoveActivityId(activity.id);
  setMoveActivityTitle(activity.title);
  setShowMoveModal(true);
};
```

## 🎨 UI/UX 設計要求

### 模態對話框設計
- **標題：** "移動活動"
- **副標題：** "選擇目標資料夾"
- **資料夾列表：** 顯示圖標、名稱、活動數量
- **根級別選項：** "移動到根級別" 選項
- **取消按鈕：** 右上角 X 按鈕

### 視覺樣式
- 使用現有的設計系統
- 保持與 Wordwall 相似的佈局
- 響應式設計支援手機和桌面

## 📱 跨設備兼容性

### 桌面版
- 模態對話框居中顯示
- 鍵盤導航支援
- 點擊外部關閉

### 手機版
- 全屏或底部彈出設計
- 觸摸友好的按鈕大小
- 滑動手勢支援

## 🔄 API 整合

### 現有 API 重用
```typescript
// 移動到資料夾
PUT /api/activities/${activityId}
{
  "folderId": "target-folder-id"
}

// 移動到根級別
PUT /api/activities/${activityId}
{
  "folderId": null
}
```

### 錯誤處理
- 網絡錯誤提示
- 權限錯誤處理
- 重試機制

## ✅ 驗收標準

### 功能要求
- [ ] 點擊三個點菜單顯示移動選項
- [ ] 點擊移動打開模態對話框
- [ ] 顯示所有可用資料夾
- [ ] 支援移動到根級別
- [ ] 移動成功後更新界面
- [ ] 提供錯誤處理和用戶反饋

### 性能要求
- [ ] 模態對話框快速載入
- [ ] 移動操作響應時間 < 2 秒
- [ ] 界面更新流暢無卡頓

### 兼容性要求
- [ ] 桌面瀏覽器正常工作
- [ ] 手機瀏覽器正常工作
- [ ] 不同屏幕尺寸適配

## 🚀 部署計劃

### 階段 1：開發環境測試
- 實現基本功能
- 本地測試驗證

### 階段 2：功能完善
- 添加錯誤處理
- 優化用戶體驗

### 階段 3：生產部署
- 代碼審查
- 部署到 Vercel
- 用戶反饋收集

## 📋 時間估算

- **步驟 1-2：** 2-3 小時（創建組件和修改卡片）
- **步驟 3：** 1-2 小時（整合到主頁面）
- **步驟 4：** 1 小時（清理拖拽功能）
- **步驟 5：** 1-2 小時（測試和優化）

**總計：** 5-8 小時完成整個功能

## 🎯 成功指標

- 用戶可以輕鬆找到移動功能
- 移動操作成功率 > 95%
- 用戶滿意度提升
- 減少意外操作（拖拽干擾）

---

**這個計劃將讓 EduCreate 的移動功能與 Wordwall 保持一致，提供更好的用戶體驗！**
