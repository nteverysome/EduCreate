# 🎬 Enhanced MCP Video Feedback Collector

增強版 MCP 反饋收集器 - 支持影片上傳

基於原始 [mcp-feedback-collector](https://github.com/sanshao85/mcp-feedback-collector) 添加影片功能的完整 MCP 服務器。

## ✨ 功能特色

### 🆕 **新增影片功能**
- 🎬 **影片上傳支持** - 支持 MP4, AVI, MOV, WMV, WebM, MKV, FLV 等格式
- 📁 **多文件選擇** - 可同時選擇多個影片文件
- 📏 **智能檢查** - 自動檢查文件格式和大小（最大100MB）
- 🖼️ **影片預覽** - 顯示影片名稱、格式、大小等信息
- 🗑️ **文件管理** - 可添加和刪除選擇的影片

### ✅ **保留原有功能**
- 💬 **文字反饋收集** - 完整的文本輸入功能
- 📸 **圖片上傳** - 支持文件選擇和剪貼板粘貼
- 🎨 **美化界面** - 現代化的用戶界面設計
- ⚙️ **MCP 集成** - 完整的 MCP 工具支持

## 🚀 安裝

### 方法1：從源碼安裝
```bash
git clone [項目地址]
cd mcp-video-feedback-collector
pip install -e .
```

### 方法2：安裝依賴
```bash
pip install mcp pillow fastmcp
```

## 📖 使用方法

### 基本用法

```python
from mcp_video_feedback_collector import collect_feedback

# 收集用戶反饋（包含影片功能）
feedback = collect_feedback(
    work_summary="AI工作完成汇报",
    timeout_seconds=300
)

# 處理反饋內容
for item in feedback:
    if hasattr(item, 'type') and item.type == "text":
        if "影片" in item.text:
            print("收到影片反饋！")
        else:
            print(f"文字反饋: {item.text}")
    elif hasattr(item, 'data'):
        print(f"圖片數據: {len(item.data)} bytes")
```

### MCP 工具

#### 1. 完整反饋收集
```python
@mcp.tool()
def collect_feedback(work_summary: str = "", timeout_seconds: int = 300) -> list:
    """收集用戶的文字、圖片和影片反饋"""
```

#### 2. 圖片選擇
```python
@mcp.tool()
def pick_image() -> MCPImage:
    """彈出圖片選擇對話框"""
```

#### 3. 影片選擇（新增）
```python
@mcp.tool()
def pick_video() -> str:
    """彈出影片選擇對話框"""
```

## 🎮 實際應用場景

### 遊戲開發反饋
```python
# AI 完成遊戲開發後收集用戶反饋
feedback = collect_feedback(
    work_summary="飛機遊戲優化完成，請測試並提供反饋",
    timeout_seconds=600
)
# 用戶可以上傳：
# - 遊戲截圖
# - 期望效果影片
# - 文字建議
```

### 影片分析工作流
```python
# 1. 用戶上傳期望效果影片
video_info = pick_video()

# 2. AI 分析影片內容
# 3. 基於分析改進遊戲
# 4. 收集改進反饋
feedback = collect_feedback("基於影片分析的改進完成")
```

## 🎯 界面設計

### 對話框布局
```
🎯 Enhanced MCP Feedback Collector - 支持影片上傳
┌─────────────────────────────────────────┐
│ 📋 AI工作完成汇报                        │
│ [工作內容顯示區域]                       │
├─────────────────────────────────────────┤
│ 💬 您的文字反馈（可选）                  │
│ [文字輸入區域]                          │
├─────────────────────────────────────────┤
│ 📱 媒體文件反馈（可选）                  │
│ 第一行: [📸 選擇圖片] [🎬 選擇影片]       │
│ 第二行: [📋 粘貼圖片] [🗑️ 清除全部]       │
│ ┌─────────────────────────────────────┐ │
│ │ 📸 圖片 1: screenshot.png (2.45MB)  │ │
│ │ 🎬 影片 1: demo.mp4 (25.30MB)       │ │
│ │ 📊 總計: 1 張圖片, 1 個影片          │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ [✅ 提交反馈] [❌ 取消]                  │
└─────────────────────────────────────────┘
```

## 🔧 技術特色

### 影片處理能力
- ✅ 支持多種影片格式
- ✅ 智能文件大小檢查
- ✅ 自動格式驗證
- ✅ 錯誤處理和用戶提示
- ✅ 大文件處理優化

### MCP 集成
- ✅ 完整的 MCP 工具實現
- ✅ 標準的 MCP 服務器結構
- ✅ 可安裝的 Python 包
- ✅ 命令行工具支持

## 📊 支持的格式

### 影片格式
- 📹 **MP4** - 最常用格式
- 🎬 **AVI** - 經典格式
- 📱 **MOV** - Apple 格式
- 💻 **WMV** - Windows 格式
- 🌐 **WebM** - 網頁格式
- 📺 **MKV** - 高質量格式
- 🎞️ **FLV** - Flash 格式

### 圖片格式
- PNG, JPG, JPEG, GIF, BMP, WebP

## 🛠️ 開發

### 設置開發環境
```bash
git clone [項目地址]
cd mcp-video-feedback-collector
pip install -e .[dev]
```

### 運行測試
```bash
python -m pytest
```

### 啟動 MCP 服務器
```bash
mcp-video-feedback-collector
```

## 📝 更新日誌

### v1.1.0 (2024-12-23)
- 🎬 新增影片上傳和處理功能
- 🔧 修復按鈕顯示和文件大小計算問題
- 🎨 改進界面布局和用戶體驗
- ⚡ 增強錯誤處理和性能優化
- 📦 完整的 MCP 服務器實現

### 相比原版的改進
- ✅ **影片支持** - 完整的影片上傳和分析功能
- ✅ **界面優化** - 現代化的用戶界面
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
