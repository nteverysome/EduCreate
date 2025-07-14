# Wordwall 深度觸發測試指南

## 🎯 **測試目標**

這個深度觸發測試腳本專門設計來發現和分析 Wordwall 的隱藏功能，特別是自動保存機制和其他需要特定條件才能觸發的功能。

## 🔍 **重點測試領域**

### 1. **自動保存機制深度分析**
- **目標**: 發現 AutoSaveManager 的實現模式
- **測試方法**: 
  - 逐字符輸入觸發變更檢測
  - 30秒持續監控自動保存請求
  - 不同輸入速度的保存觸發測試
  - 頁面切換時的保存行為

### 2. **內容變更檢測系統**
- **目標**: 了解內容變更的檢測機制
- **測試方法**:
  - 字符級別的變更監控
  - 快速連續輸入測試
  - 長時間停留測試
  - 批量內容變更測試

### 3. **API 調用模式分析**
- **目標**: 發現隱藏的 API 端點和調用模式
- **測試方法**:
  - 完整的網路請求監控
  - POST 數據內容分析
  - 響應狀態碼追蹤
  - 錯誤處理機制觀察

### 4. **狀態同步機制**
- **目標**: 理解前端狀態與後端的同步方式
- **測試方法**:
  - 頁面切換狀態保持測試
  - 多標籤頁同步測試
  - 網路中斷恢復測試
  - 衝突解決機制測試

## 🚀 **使用方法**

### **啟動深度觸發測試**
```bash
npm run wordwall:trigger
```

### **測試流程**

#### **準備階段**
1. 腳本自動啟動瀏覽器
2. 導航到 Wordwall 登入頁面
3. **手動登入您的帳號**
4. 登入完成後按 Enter 開始測試

#### **Phase 1: 模板選擇和內容創建**
- 自動導航到創建頁面
- 自動選擇第一個可用的遊戲模板
- 開始內容輸入測試

#### **Phase 2: 內容輸入觸發測試**
- 在所有可能的輸入區域進行測試
- 逐字符輸入以觸發最多的變更事件
- 實時記錄每次變更和對應的網路請求

#### **Phase 3: 自動保存監控**
- 30秒持續監控期
- 每5秒報告監控進度
- 捕獲所有自動保存相關的 API 調用

#### **Phase 4: 各種觸發條件測試**
- **快速連續輸入**: 測試高頻變更的處理
- **頁面切換**: 測試導航時的保存觸發
- **長時間停留**: 測試空閒時間的自動保存
- **特定操作**: 測試按鈕點擊等操作的觸發

## 📊 **數據收集能力**

### **自動收集的數據**
- ✅ **所有網路請求** (包含 POST 數據和 headers)
- ✅ **自動保存事件** (時間戳、URL、數據內容)
- ✅ **內容變更事件** (字符級別的變更記錄)
- ✅ **用戶交互事件** (點擊、輸入、導航)
- ✅ **錯誤和控制台日誌**
- ✅ **性能指標** (響應時間、頻率分析)

### **深度分析功能**
- 🔍 **自動保存頻率計算**
- 🔍 **內容變更模式分析**
- 🔍 **API 調用模式識別**
- 🔍 **觸發效果評估**
- 🔍 **峰值活動檢測**

## 📋 **預期輸出**

### **生成的報告**
1. **JSON 數據報告**: `test-results/wordwall-trigger-analysis/deep-trigger-analysis-report.json`
2. **Markdown 分析報告**: `test-results/wordwall-trigger-analysis/DEEP_TRIGGER_ANALYSIS_REPORT.md`

### **關鍵指標**
- 📈 **自動保存頻率** (秒為單位)
- 📈 **內容變更檢測靈敏度**
- 📈 **API 調用效率**
- 📈 **觸發成功率**

## 🎯 **EduCreate AutoSaveManager 實現指導**

### **基於觸發測試的實現建議**

#### **核心架構**
```typescript
class AutoSaveManager {
  private saveInterval: number;
  private contentChangeThreshold: number;
  private lastSaveTime: number;
  private pendingChanges: ContentChange[];
  
  // 基於 Wordwall 分析的觸發邏輯
  triggerAutoSave(content: string): Promise<void>;
  
  // 內容變更檢測
  detectContentChange(newContent: string): boolean;
  
  // 智能保存策略
  shouldSave(): boolean;
}
```

#### **觸發條件設計**
- **時間觸發**: 基於分析結果的最佳間隔
- **內容觸發**: 字符變更閾值
- **行為觸發**: 特定用戶操作
- **狀態觸發**: 頁面切換、失焦等

#### **API 設計參考**
```typescript
// 基於 Wordwall API 模式
interface AutoSaveAPI {
  endpoint: '/api/user/activities/auto-save';
  method: 'POST';
  payload: {
    activityId: string;
    content: ContentData;
    timestamp: number;
    changeType: 'incremental' | 'full';
  };
}
```

## 🔧 **高級測試選項**

### **自定義測試參數**
可以修改腳本中的參數來調整測試行為：

```javascript
// 監控時長 (毫秒)
const monitorDuration = 30000;

// 輸入延遲 (毫秒)
const inputDelay = 100;

// 測試內容
const testContent = 'Test content for auto-save trigger analysis';
```

### **特定功能測試**
- **版本控制測試**: 測試內容版本的管理
- **衝突解決測試**: 模擬多用戶編輯衝突
- **離線支持測試**: 測試網路中斷時的行為
- **錯誤恢復測試**: 測試保存失敗的處理

## ⚠️ **注意事項**

### **測試要求**
- 需要有效的 Wordwall 帳號
- 穩定的網路連接
- 建議使用高速網路以確保準確捕獲所有請求

### **測試時間**
- 完整測試約需 10-15 分鐘
- 包含 30 秒的持續監控期
- 建議在網路流量較低時進行測試

### **數據隱私**
- 測試過程中輸入的內容僅用於觸發測試
- 不會保存任何個人敏感信息
- 所有數據僅用於技術分析

## 🚀 **開始測試**

準備好進行深度觸發測試了嗎？

```bash
npm run wordwall:trigger
```

這個測試將幫助您：
- 🔍 發現 Wordwall 的隱藏自動保存機制
- 📊 獲得實現 EduCreate AutoSaveManager 的詳細數據
- 🎯 理解最佳的觸發條件和頻率設置
- 💡 獲得 API 設計和錯誤處理的實現靈感

**開始深度觸發測試，揭開自動保存機制的秘密！** 🔬✨
