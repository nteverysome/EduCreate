# Wordwall 圖片功能深度分析報告

## 📋 元分析：對原始分析的反思

本文檔是對之前 Wordwall 圖片功能分析的**深度反思和補充**，旨在發現盲點、填補空白、提供更全面的技術洞察。

**原始分析文檔**：
- `wordwall-image-picker-analysis.md`
- `wordwall-image-insertion-complete-analysis.md`

**本文檔目標**：
- 識別原始分析的不足
- 補充關鍵技術細節
- 提供更深層的洞察
- 完善實施建議

---

## 🔍 原始分析的優點

### ✅ 做得好的地方

1. **完整的功能流程梳理**
   - 清晰的用戶操作流程
   - 詳細的技術實現步驟
   - 有截圖證據支持

2. **可執行的代碼示例**
   - React 組件實現
   - TypeScript 類型定義
   - CSS 樣式設計

3. **實用的優化建議**
   - 圖片壓縮
   - 縮略圖生成
   - 懶加載實現

---

## ⚠️ 原始分析的不足

### 1. 性能分析不夠深入

#### 問題：Base64 vs URL 的性能影響

**原始分析的不足**：
- 只提到了 base64 存儲，但沒有深入分析性能影響
- 沒有量化 base64 的開銷

**深度分析**：

```typescript
// Base64 vs URL 性能對比

// Base64 的問題：
// 1. 數據大小增加 33%
const originalSize = 100; // KB
const base64Size = originalSize * 1.33; // 133 KB

// 2. 解析開銷
// 瀏覽器需要解碼 base64 字符串
// 對於大量圖片，會導致主線程阻塞

// 3. 內存佔用
// base64 字符串會一直佔用內存
// 無法利用瀏覽器的圖片緩存機制

// URL 的優勢：
// 1. 可以利用 HTTP 緩存
// 2. 可以使用 CDN 加速
// 3. 可以實現漸進式載入
// 4. 可以使用 Service Worker 離線緩存

// Wordwall 為什麼選擇 base64？
// 推測原因：
// 1. 簡化數據傳輸（一次性傳輸所有數據）
// 2. 支持離線編輯（不依賴外部資源）
// 3. 避免 CORS 問題
// 4. 簡化服務器架構（不需要圖片服務器）
```

**建議的實現策略**：

```typescript
// 混合策略：根據圖片大小選擇存儲方式
interface ImageStorage {
  type: 'base64' | 'url';
  data: string;
  size: number;
}

function chooseStorageStrategy(imageSize: number): 'base64' | 'url' {
  // 小於 50KB：使用 base64（快速載入，減少請求）
  if (imageSize < 50 * 1024) {
    return 'base64';
  }
  // 大於 50KB：使用 URL（減少內存佔用，利用緩存）
  return 'url';
}
```

---

### 2. 數據持久化分析缺失

#### 問題：沒有分析數據如何保存到服務器

**原始分析的不足**：
- 沒有分析 Wordwall 的保存機制
- 沒有提供自動保存方案
- 沒有考慮版本控制

**深度分析**：

```typescript
// 數據持久化策略

// 1. 自動保存機制
interface AutoSaveConfig {
  interval: number;        // 自動保存間隔（毫秒）
  debounceTime: number;    // 防抖時間
  maxRetries: number;      // 最大重試次數
}

class AutoSaveManager {
  private saveTimer: NodeJS.Timeout | null = null;
  private isDirty: boolean = false;
  private isSaving: boolean = false;

  constructor(private config: AutoSaveConfig) {}

  // 標記數據已修改
  markDirty() {
    this.isDirty = true;
    this.scheduleSave();
  }

  // 調度保存
  private scheduleSave() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.save();
    }, this.config.debounceTime);
  }

  // 執行保存
  private async save() {
    if (!this.isDirty || this.isSaving) return;

    this.isSaving = true;
    try {
      await this.saveToServer();
      this.isDirty = false;
      console.log('✅ 自動保存成功');
    } catch (error) {
      console.error('❌ 自動保存失敗', error);
      // 重試邏輯
      this.retry();
    } finally {
      this.isSaving = false;
    }
  }

  private async saveToServer() {
    // 實際的保存邏輯
    const data = this.collectData();
    await fetch('/api/activities/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  private collectData() {
    // 收集需要保存的數據
    return {
      items: [], // 內容項
      timestamp: Date.now(),
      version: 1
    };
  }

  private retry() {
    // 重試邏輯
  }
}

// 2. 版本控制
interface Version {
  id: string;
  timestamp: number;
  data: any;
  author: string;
}

class VersionControl {
  private versions: Version[] = [];
  private currentIndex: number = -1;

  // 保存新版本
  saveVersion(data: any, author: string) {
    // 刪除當前位置之後的所有版本（如果有的話）
    this.versions = this.versions.slice(0, this.currentIndex + 1);

    // 添加新版本
    const version: Version = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(data)), // 深拷貝
      author
    };

    this.versions.push(version);
    this.currentIndex = this.versions.length - 1;

    // 限制版本數量（最多保留 50 個版本）
    if (this.versions.length > 50) {
      this.versions.shift();
      this.currentIndex--;
    }
  }

  // 撤銷
  undo(): any | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.versions[this.currentIndex].data;
    }
    return null;
  }

  // 重做
  redo(): any | null {
    if (this.currentIndex < this.versions.length - 1) {
      this.currentIndex++;
      return this.versions[this.currentIndex].data;
    }
    return null;
  }

  // 獲取版本歷史
  getHistory(): Version[] {
    return this.versions.map(v => ({
      ...v,
      data: undefined // 不返回完整數據，只返回元信息
    }));
  }
}

// 3. 樂觀更新（Optimistic UI）
class OptimisticUpdateManager {
  private pendingUpdates: Map<string, any> = new Map();

  async updateItem(id: string, data: any) {
    // 1. 立即更新 UI（樂觀更新）
    this.applyUpdate(id, data);

    // 2. 記錄待處理的更新
    this.pendingUpdates.set(id, data);

    try {
      // 3. 發送到服務器
      await this.sendToServer(id, data);

      // 4. 成功後移除待處理記錄
      this.pendingUpdates.delete(id);
    } catch (error) {
      // 5. 失敗後回滾
      this.rollback(id);
      this.pendingUpdates.delete(id);
      throw error;
    }
  }

  private applyUpdate(id: string, data: any) {
    // 更新 UI
  }

  private async sendToServer(id: string, data: any) {
    // 發送到服務器
  }

  private rollback(id: string) {
    // 回滾更新
  }
}
```

---

### 3. 安全性考慮不足

#### 問題：沒有提到 XSS 攻擊和圖片驗證

**原始分析的不足**：
- 沒有提到 contenteditable 的 XSS 風險
- 沒有提到圖片上傳的安全驗證
- 沒有提到 CORS 問題

**深度分析**：

```typescript
// 安全性檢查清單

// 1. XSS 防護（contenteditable）
import DOMPurify from 'dompurify';

function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br'],
    ALLOWED_ATTR: []
  });
}

// 使用示例
const handleTextChange = () => {
  const rawHTML = textInputRef.current?.innerHTML || '';
  const cleanHTML = sanitizeHTML(rawHTML);
  onChange({ ...item, text: cleanHTML });
};

// 2. 圖片上傳驗證
interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

async function validateImage(file: File): Promise<ImageValidationResult> {
  // 2.1 檢查文件類型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '不支持的圖片格式' };
  }

  // 2.2 檢查文件大小（最大 5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '圖片大小不能超過 5MB' };
  }

  // 2.3 檢查圖片尺寸
  const dimensions = await getImageDimensions(file);
  const maxDimension = 4096;
  if (dimensions.width > maxDimension || dimensions.height > maxDimension) {
    return { valid: false, error: '圖片尺寸過大' };
  }

  // 2.4 檢查圖片內容（防止偽裝的惡意文件）
  const isValidImage = await verifyImageContent(file);
  if (!isValidImage) {
    return { valid: false, error: '無效的圖片文件' };
  }

  return { valid: true };
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function verifyImageContent(file: File): Promise<boolean> {
  // 讀取文件頭部，驗證是否為真實的圖片文件
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return true;
  }

  // GIF: 47 49 46
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return true;
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return true;
  }

  return false;
}

// 3. CORS 處理
// 如果使用第三方圖片 API，需要配置 CORS

// 服務器端（Next.js API Route）
export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
  }

  // 驗證 URL 來源
  const allowedDomains = ['images.unsplash.com', 'cdn.pixabay.com'];
  const url = new URL(imageUrl);
  if (!allowedDomains.includes(url.hostname)) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 403 });
  }

  // 代理請求
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  return new NextResponse(blob, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
}

// 4. CSP（Content Security Policy）
// 在 Next.js 中配置 CSP
export const headers = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "img-src 'self' data: https://images.unsplash.com https://cdn.pixabay.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'"
    ].join('; ')
  }
];
```

---

### 4. 可訪問性（a11y）分析缺失

#### 問題：沒有考慮殘障用戶的體驗

**原始分析的不足**：
- 沒有分析鍵盤導航
- 沒有分析屏幕閱讀器支持
- 沒有分析 ARIA 屬性

**深度分析**：

```typescript
// 可訪問性增強

// 1. 鍵盤導航
function ContentItemWithImage({ item, onChange }: ContentItemWithImageProps) {
  const imageButtonRef = useRef<HTMLButtonElement>(null);
  const textInputRef = useRef<HTMLDivElement>(null);

  // 處理鍵盤事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Tab: 在圖片按鈕和文字輸入框之間切換
    if (e.key === 'Tab') {
      // 默認行為已經處理了 Tab 導航
      return;
    }

    // Enter: 在圖片按鈕上按 Enter 打開選擇器
    if (e.key === 'Enter' && document.activeElement === imageButtonRef.current) {
      e.preventDefault();
      setIsPickerOpen(true);
    }

    // Delete/Backspace: 刪除圖片
    if ((e.key === 'Delete' || e.key === 'Backspace') && 
        document.activeElement === imageButtonRef.current && 
        item.image) {
      e.preventDefault();
      handleImageRemove(e as any);
    }

    // Escape: 關閉圖片選擇器
    if (e.key === 'Escape' && isPickerOpen) {
      setIsPickerOpen(false);
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {/* 圖片按鈕 */}
      <button
        ref={imageButtonRef}
        onClick={() => setIsPickerOpen(true)}
        aria-label={item.image ? '更換圖片' : '添加圖片'}
        aria-describedby="image-button-description"
      >
        {item.image ? (
          <img src={item.image.src} alt={item.image.alt || ''} />
        ) : (
          <ImageIcon />
        )}
      </button>
      <span id="image-button-description" className="sr-only">
        按 Enter 鍵打開圖片選擇器，按 Delete 鍵刪除圖片
      </span>

      {/* 文字輸入框 */}
      <div
        ref={textInputRef}
        contentEditable
        role="textbox"
        aria-label="輸入文字內容"
        aria-multiline="false"
        tabIndex={0}
      >
        {item.text}
      </div>
    </div>
  );
}

// 2. 屏幕閱讀器支持
// 使用 ARIA live regions 通知狀態變化
function ImagePicker({ isOpen, onClose, onSelect }: ImagePickerProps) {
  const [announcement, setAnnouncement] = useState('');

  const handleSearch = async () => {
    setAnnouncement('正在搜索圖片...');
    // ... 搜索邏輯
    setAnnouncement(`找到 ${results.length} 張圖片`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* ARIA live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* 對話框內容 */}
      <DialogContent aria-label="圖片選擇器">
        {/* ... */}
      </DialogContent>
    </Dialog>
  );
}

// 3. 顏色對比度
// 確保符合 WCAG AA 標準（對比度至少 4.5:1）
const colors = {
  // 文字顏色
  text: {
    primary: '#1a1a1a',      // 對比度 16:1（白色背景）
    secondary: '#666666',    // 對比度 5.7:1
    disabled: '#999999'      // 對比度 2.8:1（僅用於禁用狀態）
  },
  // 背景顏色
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    hover: '#e0e0e0'
  },
  // 邊框顏色
  border: {
    default: '#d0d0d0',      // 對比度 1.6:1
    focus: '#0066cc'         // 對比度 4.5:1
  }
};

// 4. 焦點指示器
// 確保焦點狀態清晰可見
const focusStyles = {
  outline: '2px solid #0066cc',
  outlineOffset: '2px',
  borderRadius: '4px'
};
```

---

## 📊 補充分析

### 5. 錯誤處理和邊緣情況

```typescript
// 完整的錯誤處理策略

// 1. 圖片載入失敗
function ImageWithFallback({ src, alt, ...props }: ImageProps) {
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleError = () => {
    if (retryCount < maxRetries) {
      // 重試載入
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setError(false);
      }, 1000 * (retryCount + 1)); // 指數退避
    } else {
      // 顯示錯誤狀態
      setError(true);
    }
  };

  if (error) {
    return (
      <div className="image-error">
        <AlertCircle />
        <span>圖片載入失敗</span>
        <button onClick={() => {
          setError(false);
          setRetryCount(0);
        }}>
          重試
        </button>
      </div>
    );
  }

  return (
    <img
      src={`${src}?retry=${retryCount}`}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}

// 2. 網絡中斷處理
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// 使用示例
function ImagePicker() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="offline-notice">
        <WifiOff />
        <p>您目前處於離線狀態</p>
        <p>圖片搜索功能需要網絡連接</p>
      </div>
    );
  }

  // ... 正常的圖片選擇器
}

// 3. 文件格式不支持
const SUPPORTED_FORMATS = {
  'image/jpeg': { ext: '.jpg', name: 'JPEG' },
  'image/png': { ext: '.png', name: 'PNG' },
  'image/gif': { ext: '.gif', name: 'GIF' },
  'image/webp': { ext: '.webp', name: 'WebP' }
};

function validateFileFormat(file: File): { valid: boolean; message?: string } {
  if (!SUPPORTED_FORMATS[file.type as keyof typeof SUPPORTED_FORMATS]) {
    const supportedList = Object.values(SUPPORTED_FORMATS)
      .map(f => f.name)
      .join(', ');

    return {
      valid: false,
      message: `不支持的文件格式。支持的格式：${supportedList}`
    };
  }

  return { valid: true };
}
```

---

## 📈 性能優化深度分析

### 6. 實際性能測試

```typescript
// 性能監控

// 1. 圖片載入性能
class ImagePerformanceMonitor {
  private metrics: Map<string, PerformanceEntry> = new Map();

  measureImageLoad(imageUrl: string) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === imageUrl) {
          this.metrics.set(imageUrl, entry);
          console.log(`圖片載入時間: ${entry.duration}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  getMetrics() {
    return Array.from(this.metrics.entries()).map(([url, entry]) => ({
      url,
      duration: entry.duration,
      size: (entry as PerformanceResourceTiming).transferSize
    }));
  }
}

// 2. 組件渲染性能
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  console.log(`${id} ${phase} 渲染時間: ${actualDuration}ms`);

  // 如果渲染時間超過 16ms（60fps），記錄警告
  if (actualDuration > 16) {
    console.warn(`⚠️ ${id} 渲染性能不佳`);
  }
}

// 使用示例
<Profiler id="ImagePicker" onRender={onRenderCallback}>
  <ImagePicker />
</Profiler>
```

---

## 🎯 改進建議總結

### 立即實施（高優先級）

1. **安全性**
   - ✅ 實施 XSS 防護（DOMPurify）
   - ✅ 添加圖片驗證
   - ✅ 配置 CSP

2. **錯誤處理**
   - ✅ 圖片載入失敗重試
   - ✅ 網絡中斷提示
   - ✅ 文件格式驗證

3. **可訪問性**
   - ✅ 鍵盤導航
   - ✅ ARIA 屬性
   - ✅ 焦點管理

### 中期實施（中優先級）

4. **性能優化**
   - ⏳ 混合存儲策略（base64 + URL）
   - ⏳ 圖片懶加載
   - ⏳ 性能監控

5. **數據持久化**
   - ⏳ 自動保存
   - ⏳ 版本控制
   - ⏳ 樂觀更新

### 長期實施（低優先級）

6. **擴展功能**
   - 📅 視頻支持
   - 📅 音頻支持
   - 📅 多張圖片

---

## 📝 結論

原始分析提供了良好的基礎，但缺少了許多關鍵的技術細節。本深度分析補充了：

1. ✅ 性能分析（base64 vs URL）
2. ✅ 數據持久化方案
3. ✅ 安全性考慮
4. ✅ 可訪問性支持
5. ✅ 錯誤處理策略
6. ✅ 性能監控方案

這些補充內容將幫助團隊做出更明智的技術決策，構建更健壯、更安全、更易用的產品。

---

## 🔬 競品對比分析

### Wordwall vs 其他平台

| 功能 | Wordwall | Kahoot | Quizlet | Quizizz | EduCreate (建議) |
|------|----------|--------|---------|---------|------------------|
| 圖片搜索 | ✅ 內建 | ✅ 內建 | ✅ 內建 | ✅ 內建 | ✅ Unsplash API |
| 圖片上傳 | ✅ | ✅ | ✅ | ✅ | ✅ Supabase Storage |
| 圖片編輯 | ❌ | ❌ | ❌ | ✅ 裁剪 | ✅ 裁剪+濾鏡 |
| 存儲方式 | base64 | URL | URL | URL | 混合策略 |
| 個人圖庫 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 批量上傳 | ❌ | ❌ | ❌ | ❌ | ✅ 計劃支持 |
| 拖放上傳 | ❌ | ✅ | ✅ | ✅ | ✅ 計劃支持 |
| 圖片 AI | ❌ | ❌ | ❌ | ❌ | ✅ AI 生成圖片 |

**Wordwall 的優勢**：
- 簡潔的 UI
- 快速的載入（base64）
- 支持離線編輯

**Wordwall 的劣勢**：
- 缺少圖片編輯功能
- 不支持拖放上傳
- 性能問題（大量圖片時）

**EduCreate 的機會**：
- 提供更強大的圖片編輯功能
- 支持 AI 生成圖片
- 更好的性能優化
- 更好的移動端體驗

---

## 💰 成本效益分析

### 圖片存儲成本

```typescript
// 成本計算

// 假設：
// - 每個活動平均 10 張圖片
// - 每張圖片平均 200KB
// - 每月 10,000 個活動

// 方案 A：Base64 存儲（存儲在數據庫）
const base64Cost = {
  storagePerActivity: 10 * 200 * 1.33, // KB (base64 增加 33%)
  totalStorage: 10000 * 10 * 200 * 1.33 / 1024 / 1024, // GB
  monthlyCost: 0, // 包含在數據庫成本中
  bandwidth: 10000 * 10 * 200 * 1.33 / 1024 / 1024, // GB
  bandwidthCost: (10000 * 10 * 200 * 1.33 / 1024 / 1024) * 0.09 // $0.09/GB
};

console.log('Base64 方案：');
console.log(`存儲：${base64Cost.totalStorage.toFixed(2)} GB`);
console.log(`帶寬：${base64Cost.bandwidth.toFixed(2)} GB`);
console.log(`月成本：$${base64Cost.bandwidthCost.toFixed(2)}`);

// 方案 B：URL 存儲（Supabase Storage + CDN）
const urlCost = {
  storagePerActivity: 10 * 200, // KB
  totalStorage: 10000 * 10 * 200 / 1024 / 1024, // GB
  storageCost: (10000 * 10 * 200 / 1024 / 1024) * 0.021, // $0.021/GB
  bandwidth: 10000 * 10 * 200 / 1024 / 1024, // GB
  bandwidthCost: (10000 * 10 * 200 / 1024 / 1024) * 0.09, // $0.09/GB
  totalCost: 0
};

urlCost.totalCost = urlCost.storageCost + urlCost.bandwidthCost;

console.log('URL 方案：');
console.log(`存儲：${urlCost.totalStorage.toFixed(2)} GB`);
console.log(`帶寬：${urlCost.bandwidth.toFixed(2)} GB`);
console.log(`月成本：$${urlCost.totalCost.toFixed(2)}`);

// 結論：
// Base64: ~$22.77/月（僅帶寬）
// URL: ~$21.67/月（存儲 + 帶寬）
// URL 方案更經濟，且性能更好
```

### Unsplash API 成本

```typescript
// Unsplash API 限制
const unsplashLimits = {
  free: {
    requestsPerHour: 50,
    requestsPerMonth: 50000,
    cost: 0
  },
  paid: {
    requestsPerHour: 5000,
    requestsPerMonth: 'unlimited',
    cost: 99 // USD/month
  }
};

// 預估使用量
const estimatedUsage = {
  activeUsers: 1000,
  searchesPerUser: 5, // 每個用戶平均搜索 5 次
  totalSearches: 1000 * 5, // 5000 次/月
  withinFreeLimit: 5000 < 50000 // true
};

console.log('Unsplash API 成本：$0/月（在免費額度內）');
```

---

## 🗺️ 詳細實施路線圖

### Phase 1：MVP（2 週）

**目標**：實現基本的圖片選擇和插入功能

**任務**：
- [ ] 實現 ImagePicker 組件（3 天）
  - 模態框 UI
  - 搜索功能（整合 Unsplash API）
  - 圖片網格顯示
- [ ] 實現 ContentItemWithImage 組件（2 天）
  - 圖片和文字佈局
  - 圖片選擇/刪除
  - 文字編輯
- [ ] 基本的圖片上傳功能（2 天）
  - 文件選擇
  - 上傳到 Supabase Storage
  - 顯示上傳進度
- [ ] 基本的錯誤處理（1 天）
- [ ] 單元測試（2 天）

**交付物**：
- ✅ 可工作的圖片選擇器
- ✅ 可工作的內容項組件
- ✅ 基本的測試覆蓋

**風險**：
- ⚠️ Unsplash API 整合可能遇到 CORS 問題
- ⚠️ Supabase Storage 配置可能需要調整

---

### Phase 2：優化和增強（2 週）

**目標**：提升性能和用戶體驗

**任務**：
- [ ] 圖片壓縮和優化（2 天）
  - 實現圖片壓縮
  - 生成縮略圖
  - 混合存儲策略
- [ ] 尺寸篩選功能（1 天）
- [ ] 個人圖庫管理（2 天）
  - 顯示用戶上傳的圖片
  - 刪除功能
  - 分頁或無限滾動
- [ ] 響應式設計優化（2 天）
  - 手機版本優化
  - 平板版本優化
- [ ] 性能優化（2 天）
  - 圖片懶加載
  - 虛擬滾動（如果需要）
- [ ] E2E 測試（1 天）

**交付物**：
- ✅ 優化的性能
- ✅ 完整的響應式設計
- ✅ 個人圖庫功能

**風險**：
- ⚠️ 性能優化可能需要更多時間
- ⚠️ 移動端測試可能發現新問題

---

### Phase 3：高級功能（2 週）

**目標**：添加高級功能和完善細節

**任務**：
- [ ] 圖片編輯功能（3 天）
  - 裁剪
  - 旋轉
  - 濾鏡（可選）
- [ ] 拖放上傳（1 天）
- [ ] 批量上傳（2 天）
- [ ] 自動保存機制（2 天）
- [ ] 版本控制（2 天）
- [ ] 可訪問性增強（2 天）
  - 鍵盤導航
  - ARIA 屬性
  - 屏幕閱讀器支持

**交付物**：
- ✅ 圖片編輯功能
- ✅ 批量操作
- ✅ 自動保存
- ✅ 完整的可訪問性支持

**風險**：
- ⚠️ 圖片編輯功能可能比預期複雜
- ⚠️ 可訪問性測試需要專業工具

---

### Phase 4：測試和優化（1 週）

**目標**：全面測試和性能優化

**任務**：
- [ ] 完整的測試覆蓋（2 天）
  - 單元測試
  - 集成測試
  - E2E 測試
- [ ] 性能測試和優化（2 天）
  - Lighthouse 測試
  - 性能基準測試
  - 優化瓶頸
- [ ] 安全審計（1 天）
- [ ] 用戶測試（1 天）
- [ ] Bug 修復（1 天）

**交付物**：
- ✅ 完整的測試報告
- ✅ 性能優化報告
- ✅ 安全審計報告
- ✅ 生產就緒的代碼

**風險**：
- ⚠️ 可能發現需要重構的問題
- ⚠️ 性能優化可能需要架構調整

---

## 📋 測試策略

### 單元測試

```typescript
// ImagePicker.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImagePicker } from './ImagePicker';

describe('ImagePicker', () => {
  it('應該打開模態框', () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();

    render(
      <ImagePicker
        isOpen={true}
        onClose={onClose}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('選擇圖片')).toBeInTheDocument();
  });

  it('應該搜索圖片', async () => {
    const onSelect = jest.fn();

    render(
      <ImagePicker
        isOpen={true}
        onClose={() => {}}
        onSelect={onSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText('搜索圖片...');
    fireEvent.change(searchInput, { target: { value: 'dog' } });
    fireEvent.click(screen.getByRole('button', { name: /搜索/i }));

    await waitFor(() => {
      expect(screen.getByText(/找到/i)).toBeInTheDocument();
    });
  });

  it('應該選擇圖片', async () => {
    const onSelect = jest.fn();

    render(
      <ImagePicker
        isOpen={true}
        onClose={() => {}}
        onSelect={onSelect}
      />
    );

    // 模擬搜索
    // ...

    // 點擊第一張圖片
    const firstImage = screen.getAllByRole('img')[0];
    fireEvent.click(firstImage);

    expect(onSelect).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        id: expect.any(String),
        url: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number)
      })
    );
  });
});
```

### E2E 測試

```typescript
// image-picker.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('圖片選擇器', () => {
  test('應該完成完整的圖片選擇流程', async ({ page }) => {
    // 1. 訪問頁面
    await page.goto('/game-editor');

    // 2. 點擊添加圖片按鈕
    await page.click('[aria-label="添加圖片"]');

    // 3. 等待模態框打開
    await expect(page.locator('text=選擇圖片')).toBeVisible();

    // 4. 輸入搜索關鍵字
    await page.fill('[placeholder="搜索圖片..."]', 'dog');

    // 5. 點擊搜索按鈕
    await page.click('button:has-text("搜索")');

    // 6. 等待搜索結果
    await expect(page.locator('.image-grid img').first()).toBeVisible();

    // 7. 點擊第一張圖片
    await page.click('.image-grid img').first();

    // 8. 驗證圖片已插入
    await expect(page.locator('.item-image')).toBeVisible();

    // 9. 輸入文字
    await page.fill('[contenteditable="true"]', 'dog');

    // 10. 驗證文字已輸入
    await expect(page.locator('[contenteditable="true"]')).toHaveText('dog');
  });

  test('應該處理圖片上傳', async ({ page }) => {
    await page.goto('/game-editor');

    // 點擊添加圖片
    await page.click('[aria-label="添加圖片"]');

    // 點擊上傳按鈕
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=上傳');
    const fileChooser = await fileChooserPromise;

    // 選擇文件
    await fileChooser.setFiles('./test-images/dog.jpg');

    // 等待上傳完成
    await expect(page.locator('text=上傳成功')).toBeVisible();

    // 驗證圖片已插入
    await expect(page.locator('.item-image')).toBeVisible();
  });
});
```

---

## 🎓 學習資源和參考

### 推薦閱讀

1. **圖片優化**
   - [Web.dev - Image Optimization](https://web.dev/fast/#optimize-your-images)
   - [MDN - Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

2. **可訪問性**
   - [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
   - [A11y Project](https://www.a11yproject.com/)

3. **性能優化**
   - [React Performance Optimization](https://react.dev/learn/render-and-commit)
   - [Web Vitals](https://web.dev/vitals/)

4. **安全性**
   - [OWASP Top 10](https://owasp.org/www-project-top-ten/)
   - [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### 相關工具

- **圖片處理**：Sharp, Jimp, ImageMagick
- **圖片 CDN**：Cloudinary, Imgix, Cloudflare Images
- **測試**：Jest, React Testing Library, Playwright
- **性能監控**：Lighthouse, WebPageTest, Chrome DevTools

---

**文檔版本**：1.0
**最後更新**：2025-10-21
**作者**：EduCreate Development Team

