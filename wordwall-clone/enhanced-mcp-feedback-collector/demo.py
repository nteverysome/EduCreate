#!/usr/bin/env python3
"""
Enhanced MCP Feedback Collector 演示

簡化版演示腳本，展示增強版反饋收集器的核心功能
"""

import tkinter as tk
from tkinter import messagebox
import sys
from pathlib import Path

def demo_interface():
    """演示增強版界面"""
    root = tk.Tk()
    root.title("🎯 Enhanced MCP Feedback Collector Demo")
    root.geometry("600x700")
    root.configure(bg="#f5f5f5")
    
    # 標題
    title_label = tk.Label(
        root,
        text="🎯 Enhanced MCP Feedback Collector",
        font=("Microsoft YaHei", 16, "bold"),
        bg="#f5f5f5",
        fg="#2c3e50"
    )
    title_label.pack(pady=20)
    
    # 功能介紹
    features_frame = tk.LabelFrame(
        root,
        text="✨ 新增功能特色",
        font=("Microsoft YaHei", 12, "bold"),
        bg="#ffffff",
        fg="#34495e",
        relief=tk.RAISED,
        bd=2
    )
    features_frame.pack(fill=tk.X, padx=20, pady=10)
    
    features_text = """
🎬 影片上傳支持
• 支持 MP4, AVI, MOV, WMV 等多種格式
• 最大支持 100MB 文件
• 自動格式檢測和驗證

📱 多媒體反饋
• 文字 + 圖片 + 影片組合反饋
• 多文件同時上傳
• 實時預覽和管理

🎨 美化界面
• 現代化設計風格
• 響應式布局
• 直觀的用戶交互

⚡ 性能優化
• 大文件處理優化
• 進度顯示
• 異步處理機制
    """
    
    features_label = tk.Label(
        features_frame,
        text=features_text,
        font=("Microsoft YaHei", 10),
        bg="#ffffff",
        fg="#2c3e50",
        justify=tk.LEFT
    )
    features_label.pack(padx=15, pady=15)
    
    # 對比原版
    comparison_frame = tk.LabelFrame(
        root,
        text="📊 相比原版的改進",
        font=("Microsoft YaHei", 12, "bold"),
        bg="#ffffff",
        fg="#34495e",
        relief=tk.RAISED,
        bd=2
    )
    comparison_frame.pack(fill=tk.X, padx=20, pady=10)
    
    comparison_text = """
原版功能：
✅ 文字反饋收集
✅ 圖片上傳（單張）
✅ 基礎界面

增強版新增：
🆕 影片上傳和處理
🆕 多文件同時上傳
🆕 現代化界面設計
🆕 文件預覽和管理
🆕 進度顯示和錯誤處理
🆕 更多工具函數
🆕 性能優化
    """
    
    comparison_label = tk.Label(
        comparison_frame,
        text=comparison_text,
        font=("Microsoft YaHei", 10),
        bg="#ffffff",
        fg="#2c3e50",
        justify=tk.LEFT
    )
    comparison_label.pack(padx=15, pady=15)
    
    # 使用場景
    usage_frame = tk.LabelFrame(
        root,
        text="🎯 實際應用場景",
        font=("Microsoft YaHei", 12, "bold"),
        bg="#ffffff",
        fg="#34495e",
        relief=tk.RAISED,
        bd=2
    )
    usage_frame.pack(fill=tk.X, padx=20, pady=10)
    
    usage_text = """
🎮 遊戲開發反饋
• AI 完成遊戲開發後收集用戶測試反饋
• 用戶可上傳遊戲截圖和期望效果影片
• 結合文字描述提供詳細建議

🎬 影片分析工作流
• 用戶上傳期望效果影片
• AI 分析影片中的遊戲機制和視覺效果
• 基於分析結果改進遊戲
• 收集用戶對改進結果的反饋

🎨 UI/UX 設計改進
• 收集界面設計反饋
• 支持設計稿圖片和操作流程影片
• 多維度的用戶體驗反饋
    """
    
    usage_label = tk.Label(
        usage_frame,
        text=usage_text,
        font=("Microsoft YaHei", 10),
        bg="#ffffff",
        fg="#2c3e50",
        justify=tk.LEFT
    )
    usage_label.pack(padx=15, pady=15)
    
    # 按鈕區域
    button_frame = tk.Frame(root, bg="#f5f5f5")
    button_frame.pack(fill=tk.X, padx=20, pady=20)
    
    def show_install_info():
        messagebox.showinfo(
            "安裝信息",
            """🚀 安裝方法：

1. 克隆項目：
   git clone [項目地址]

2. 安裝依賴：
   pip install pillow mcp fastmcp

3. 運行測試：
   python test_enhanced_mcp.py

4. 查看示例：
   python example_usage.py

📚 更多信息請查看 README.md"""
        )
    
    def show_usage_info():
        messagebox.showinfo(
            "使用方法",
            """💡 基本用法：

from mcp_feedback_collector.enhanced_server import collect_feedback

# 收集反饋
feedback = collect_feedback(
    work_summary="AI工作完成汇报",
    timeout_seconds=600
)

# 處理反饋
for item in feedback:
    if item.type == "text":
        print(f"文字: {item.text}")
    elif item.type == "image":
        print(f"圖片: {len(item.data)} bytes")

🔧 更多工具函數：
• pick_image() - 選擇圖片
• pick_video() - 選擇影片
• get_video_data() - 獲取影片數據
• get_image_info() - 獲取圖片信息"""
        )
    
    def show_features_info():
        messagebox.showinfo(
            "功能特色",
            """✨ 核心功能：

🎬 影片處理：
• 支持多種影片格式
• 自動格式檢測
• 大文件處理優化

📱 多媒體反饋：
• 文字 + 圖片 + 影片
• 多文件同時處理
• 實時預覽管理

🎨 用戶體驗：
• 現代化界面設計
• 直觀的操作流程
• 完善的錯誤處理

⚡ 性能優化：
• 異步文件處理
• 進度顯示
• 內存優化"""
        )
    
    # 按鈕樣式
    btn_style = {
        "font": ("Microsoft YaHei", 11, "bold"),
        "relief": tk.FLAT,
        "bd": 0,
        "cursor": "hand2",
        "height": 2,
        "width": 15
    }
    
    tk.Button(
        button_frame,
        text="📦 安裝信息",
        command=show_install_info,
        bg="#3498db",
        fg="white",
        **btn_style
    ).pack(side=tk.LEFT, padx=5)
    
    tk.Button(
        button_frame,
        text="💡 使用方法",
        command=show_usage_info,
        bg="#2ecc71",
        fg="white",
        **btn_style
    ).pack(side=tk.LEFT, padx=5)
    
    tk.Button(
        button_frame,
        text="✨ 功能特色",
        command=show_features_info,
        bg="#9b59b6",
        fg="white",
        **btn_style
    ).pack(side=tk.LEFT, padx=5)
    
    tk.Button(
        button_frame,
        text="❌ 關閉",
        command=root.destroy,
        bg="#e74c3c",
        fg="white",
        **btn_style
    ).pack(side=tk.LEFT, padx=5)
    
    # 底部信息
    info_label = tk.Label(
        root,
        text="🚀 Enhanced MCP Feedback Collector - 讓 AI 與用戶的交互更加豐富！",
        font=("Microsoft YaHei", 10),
        bg="#f5f5f5",
        fg="#7f8c8d"
    )
    info_label.pack(pady=10)
    
    # 居中顯示
    root.eval('tk::PlaceWindow . center')
    
    root.mainloop()

def main():
    """主函數"""
    print("🚀 Enhanced MCP Feedback Collector Demo")
    print("=" * 50)
    print("正在啟動演示界面...")
    
    try:
        demo_interface()
    except Exception as e:
        print(f"❌ 演示啟動失敗: {e}")
        print("請確保已安裝 tkinter")

if __name__ == "__main__":
    main()
