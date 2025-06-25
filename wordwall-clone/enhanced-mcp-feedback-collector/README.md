# 🎯 Enhanced MCP Feedback Collector

增強版交互式反馈收集器 MCP 服务器，支持文本、图片和影片反馈收集。

## ✨ 功能特色

### 🔥 **新增功能**
- 🎬 **影片上傳支持** - 支持 MP4, AVI, MOV, WMV 等多種影片格式
- 📱 **多媒體反饋** - 同時支持文字、圖片和影片反饋
- 🎨 **美化界面** - 現代化的用戶界面設計
- ⚡ **性能優化** - 大文件處理和進度顯示
- 🔧 **智能分析** - 自動檢測文件格式和大小

### 📋 **原有功能增強**
- 💬 **文字反饋** - 支持多行文本輸入
- 🖼️ **圖片反饋** - 支持多張圖片上傳和剪貼板粘貼
- 🎯 **工作汇报** - AI 可以汇报完成的工作內容
- ⏱️ **超時控制** - 可配置的對話框超時時間

## 🚀 安裝

### 方法1：從源碼安裝
```bash
git clone https://github.com/enhanced-mcp/enhanced-mcp-feedback-collector.git
cd enhanced-mcp-feedback-collector
pip install -e .
```

### 方法2：直接安裝
```bash
pip install enhanced-mcp-feedback-collector
```

### 可選依賴
```bash
# 影片處理增強功能
pip install enhanced-mcp-feedback-collector[video]

# 開發工具
pip install enhanced-mcp-feedback-collector[dev]
```

## 📖 使用方法

### 基本用法

```python
from mcp_feedback_collector.enhanced_server import collect_feedback

# 收集用戶反饋
feedback = collect_feedback(
    work_summary="我已經完成了飛機遊戲的優化，包括物理引擎和3D效果",
    timeout_seconds=600
)

# 處理反饋內容
for item in feedback:
    if item.type == "text":
        print(f"文字反饋: {item.text}")
    elif item.type == "image":
        print(f"收到圖片，大小: {len(item.data)} bytes")
```

### MCP 工具函數

#### 1. 收集反饋
```python
@mcp.tool()
def collect_feedback(work_summary: str = "", timeout_seconds: int = 600) -> list:
    """收集用戶的文字、圖片和影片反饋"""
```

#### 2. 選擇圖片
```python
@mcp.tool()
def pick_image() -> MCPImage:
    """彈出圖片選擇對話框"""
```

#### 3. 選擇影片
```python
@mcp.tool()
def pick_video() -> str:
    """彈出影片選擇對話框"""
```

#### 4. 獲取影片數據
```python
@mcp.tool()
def get_video_data(video_path: str) -> str:
    """讀取影片文件並返回 base64 編碼"""
```

#### 5. 獲取文件信息
```python
@mcp.tool()
def get_image_info(image_path: str) -> str:
    """獲取圖片文件信息"""

@mcp.tool()
def get_video_info(video_path: str) -> str:
    """獲取影片文件信息"""
```

## 🎮 實際應用示例

### 遊戲開發反饋
```python
# AI 完成遊戲優化後收集用戶反饋
feedback = collect_feedback(
    work_summary="""
    🎮 飛機英文遊戲優化完成！
    
    改進內容：
    ✅ 實現流暢的物理引擎
    ✅ 添加 3D 飛機模型
    ✅ 增強動畫效果
    ✅ 優化性能到 60FPS
    
    請測試遊戲並提供反饋！
    """,
    timeout_seconds=300
)
```

### 影片分析工作流
```python
# 1. 用戶上傳期望效果影片
video_info = pick_video()

# 2. 獲取影片數據進行分析
video_data = get_video_data(video_info['path'])

# 3. AI 分析影片並改進遊戲
# ... AI 處理邏輯 ...

# 4. 收集用戶對改進結果的反饋
feedback = collect_feedback(
    work_summary="基於您的影片分析，我已經改進了遊戲效果",
    timeout_seconds=600
)
```

## 🎨 界面特色

### 現代化設計
- 🎯 **直觀布局** - 清晰的功能分區
- 🌈 **美觀配色** - 現代化的視覺設計
- 📱 **響應式** - 適配不同螢幕尺寸
- ⚡ **流暢動畫** - 平滑的用戶體驗

### 多媒體支持
- 📸 **圖片預覽** - 縮略圖顯示和信息展示
- 🎬 **影片信息** - 文件大小、格式、時長等
- 📊 **進度顯示** - 大文件處理進度條
- 🗑️ **便捷管理** - 一鍵添加和刪除

## 🔧 配置選項

### 環境變量
```bash
# 設置默認超時時間（秒）
export MCP_DIALOG_TIMEOUT=600

# 設置最大文件大小
export MCP_MAX_IMAGE_SIZE=10485760  # 10MB
export MCP_MAX_VIDEO_SIZE=104857600 # 100MB
```

### 支持的格式

#### 圖片格式
- PNG, JPG, JPEG, GIF, BMP, WebP, TIFF

#### 影片格式
- MP4, AVI, MOV, WMV, FLV, WebM, MKV, M4V

## 🛠️ 開發

### 設置開發環境
```bash
git clone https://github.com/enhanced-mcp/enhanced-mcp-feedback-collector.git
cd enhanced-mcp-feedback-collector
pip install -e .[dev]
```

### 運行測試
```bash
pytest
```

### 代碼格式化
```bash
black src/
isort src/
```

### 類型檢查
```bash
mypy src/
```

## 📝 更新日誌

### v1.0.0 (2024-12-23)
- 🎬 新增影片上傳和處理功能
- 🎨 全新的現代化界面設計
- ⚡ 性能優化和大文件處理
- 📱 改進的多媒體預覽功能
- 🔧 增強的錯誤處理和用戶體驗

### 相比原版的改進
- ✅ **影片支持** - 完整的影片上傳和分析功能
- ✅ **界面美化** - 現代化的用戶界面
- ✅ **性能提升** - 優化的文件處理和內存管理
- ✅ **功能增強** - 更多的工具函數和配置選項
- ✅ **穩定性** - 改進的錯誤處理和異常管理

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 許可證

MIT License

## 🙏 致謝

基於原始的 [mcp-feedback-collector](https://github.com/sanshao85/mcp-feedback-collector) 項目進行增強開發。

---

**讓 AI 與用戶的交互更加豐富和直觀！** 🚀✨
