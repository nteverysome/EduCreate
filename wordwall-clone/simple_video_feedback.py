#!/usr/bin/env python3
"""
簡單的影片反饋收集器
確保能夠正常彈出對話框
"""

import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
from pathlib import Path
import sys
from datetime import datetime

def create_video_feedback_dialog():
    """創建影片反饋對話框"""
    root = tk.Tk()
    root.title("🎬 影片反饋收集器")
    root.geometry("600x500")
    root.configure(bg="#f0f0f0")
    
    # 居中顯示窗口
    root.eval('tk::PlaceWindow . center')
    
    # 確保窗口在最前面
    root.lift()
    root.attributes('-topmost', True)
    root.after_idle(root.attributes, '-topmost', False)
    
    selected_files = []
    
    # 標題
    title_label = tk.Label(
        root,
        text="🎬 影片分析反饋收集器",
        font=("Arial", 16, "bold"),
        bg="#f0f0f0",
        fg="#2c3e50"
    )
    title_label.pack(pady=20)
    
    # 說明文字
    info_label = tk.Label(
        root,
        text="請上傳您想要分析的影片文件，我會進行詳細分析！",
        font=("Arial", 12),
        bg="#f0f0f0",
        fg="#34495e",
        wraplength=500
    )
    info_label.pack(pady=10)
    
    # 文字輸入區域
    text_frame = tk.LabelFrame(
        root,
        text="💬 描述您的需求（可選）",
        font=("Arial", 12, "bold"),
        bg="#ffffff",
        fg="#2c3e50"
    )
    text_frame.pack(fill=tk.X, padx=20, pady=10)
    
    text_widget = scrolledtext.ScrolledText(
        text_frame,
        height=4,
        wrap=tk.WORD,
        font=("Arial", 10),
        bg="#ffffff"
    )
    text_widget.pack(fill=tk.X, padx=10, pady=10)
    text_widget.insert(tk.END, "請描述您想要分析的內容或期望的改進效果...")
    
    def clear_placeholder(event):
        if text_widget.get(1.0, tk.END).strip() == "請描述您想要分析的內容或期望的改進效果...":
            text_widget.delete(1.0, tk.END)
    
    text_widget.bind("<FocusIn>", clear_placeholder)
    
    # 文件選擇區域
    file_frame = tk.LabelFrame(
        root,
        text="📁 選擇文件",
        font=("Arial", 12, "bold"),
        bg="#ffffff",
        fg="#2c3e50"
    )
    file_frame.pack(fill=tk.X, padx=20, pady=10)
    
    # 按鈕區域
    button_frame = tk.Frame(file_frame, bg="#ffffff")
    button_frame.pack(fill=tk.X, padx=10, pady=10)
    
    def select_videos():
        """選擇影片文件"""
        file_types = [
            ("影片文件", "*.mp4 *.avi *.mov *.wmv *.flv *.webm *.mkv"),
            ("MP4文件", "*.mp4"),
            ("所有文件", "*.*")
        ]
        
        files = filedialog.askopenfilenames(
            title="選擇影片文件",
            filetypes=file_types
        )
        
        for file_path in files:
            path = Path(file_path)
            size = path.stat().st_size
            size_mb = size / 1024 / 1024
            
            if size_mb > 100:
                messagebox.showwarning("警告", f"文件過大: {path.name}\n大小: {size_mb:.1f}MB\n最大支持: 100MB")
                continue
            
            selected_files.append({
                'path': str(path),
                'name': path.name,
                'size': size,
                'size_mb': size_mb
            })
        
        update_file_list()
    
    def select_images():
        """選擇圖片文件"""
        file_types = [
            ("圖片文件", "*.png *.jpg *.jpeg *.gif *.bmp"),
            ("所有文件", "*.*")
        ]
        
        files = filedialog.askopenfilenames(
            title="選擇圖片文件",
            filetypes=file_types
        )
        
        for file_path in files:
            path = Path(file_path)
            size = path.stat().st_size
            size_mb = size / 1024 / 1024
            
            selected_files.append({
                'path': str(path),
                'name': path.name,
                'size': size,
                'size_mb': size_mb,
                'type': 'image'
            })
        
        update_file_list()
    
    def clear_files():
        """清除所有文件"""
        selected_files.clear()
        update_file_list()
    
    # 按鈕
    tk.Button(
        button_frame,
        text="🎬 選擇影片",
        command=select_videos,
        font=("Arial", 11, "bold"),
        bg="#e74c3c",
        fg="white",
        width=12,
        height=2,
        relief=tk.FLAT,
        cursor="hand2"
    ).pack(side=tk.LEFT, padx=5)
    
    tk.Button(
        button_frame,
        text="📸 選擇圖片",
        command=select_images,
        font=("Arial", 11, "bold"),
        bg="#3498db",
        fg="white",
        width=12,
        height=2,
        relief=tk.FLAT,
        cursor="hand2"
    ).pack(side=tk.LEFT, padx=5)
    
    tk.Button(
        button_frame,
        text="🗑️ 清除",
        command=clear_files,
        font=("Arial", 11, "bold"),
        bg="#95a5a6",
        fg="white",
        width=12,
        height=2,
        relief=tk.FLAT,
        cursor="hand2"
    ).pack(side=tk.LEFT, padx=5)
    
    # 文件列表
    file_list = tk.Listbox(
        file_frame,
        height=6,
        font=("Arial", 9),
        bg="#f8f9fa"
    )
    file_list.pack(fill=tk.X, padx=10, pady=(0, 10))
    
    def update_file_list():
        """更新文件列表"""
        file_list.delete(0, tk.END)
        
        if not selected_files:
            file_list.insert(tk.END, "未選擇任何文件")
        else:
            for i, file_info in enumerate(selected_files):
                file_type = "🎬" if file_info['name'].lower().endswith(('.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv')) else "📸"
                file_list.insert(tk.END, f"{file_type} {file_info['name']} ({file_info['size_mb']:.1f}MB)")
    
    # 操作按鈕
    action_frame = tk.Frame(root, bg="#f0f0f0")
    action_frame.pack(fill=tk.X, padx=20, pady=20)
    
    def submit_feedback():
        """提交反饋"""
        text_content = text_widget.get(1.0, tk.END).strip()
        if text_content == "請描述您想要分析的內容或期望的改進效果...":
            text_content = ""
        
        if not text_content and not selected_files:
            messagebox.showwarning("警告", "請至少提供文字描述或選擇文件")
            return
        
        # 構建結果信息
        result_info = f"""✅ 反饋提交成功！

📝 文字描述: {'有' if text_content else '無'}
📁 選擇文件: {len(selected_files)} 個

文件列表:"""
        
        for file_info in selected_files:
            file_type = "影片" if file_info['name'].lower().endswith(('.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv')) else "圖片"
            result_info += f"\n• {file_type}: {file_info['name']} ({file_info['size_mb']:.1f}MB)"
        
        if text_content:
            result_info += f"\n\n💬 您的描述:\n{text_content[:200]}..."
        
        result_info += "\n\n🤖 AI 將開始分析您提供的內容！"
        
        messagebox.showinfo("提交成功", result_info)
        
        # 保存結果到文件
        try:
            with open("feedback_result.txt", "w", encoding="utf-8") as f:
                f.write("=== 影片分析反饋結果 ===\n\n")
                f.write(f"提交時間: {datetime.now()}\n\n")
                f.write(f"文字描述:\n{text_content}\n\n")
                f.write("選擇的文件:\n")
                for file_info in selected_files:
                    f.write(f"- {file_info['name']} ({file_info['path']})\n")
            
            print("✅ 反饋已保存到 feedback_result.txt")
        except Exception as e:
            print(f"❌ 保存失敗: {e}")
        
        root.destroy()
    
    def cancel():
        """取消"""
        root.destroy()
    
    tk.Button(
        action_frame,
        text="✅ 提交給 AI 分析",
        command=submit_feedback,
        font=("Arial", 12, "bold"),
        bg="#27ae60",
        fg="white",
        width=20,
        height=2,
        relief=tk.FLAT,
        cursor="hand2"
    ).pack(side=tk.LEFT, padx=(0, 10))
    
    tk.Button(
        action_frame,
        text="❌ 取消",
        command=cancel,
        font=("Arial", 12),
        bg="#e74c3c",
        fg="white",
        width=20,
        height=2,
        relief=tk.FLAT,
        cursor="hand2"
    ).pack(side=tk.LEFT)
    
    # 初始化文件列表
    update_file_list()
    
    # 顯示窗口
    root.mainloop()

def main():
    """主函數"""
    print("🚀 啟動影片反饋收集器...")
    
    try:
        # 測試 tkinter 是否可用
        test_root = tk.Tk()
        test_root.withdraw()
        test_root.destroy()
        print("✅ Tkinter 可用")
        
        # 創建對話框
        create_video_feedback_dialog()
        
    except Exception as e:
        print(f"❌ 啟動失敗: {e}")
        print("請確保已安裝 tkinter")
        
        # 提供替代方案
        print("\n💡 替代方案:")
        print("1. 使用命令行描述您的需求")
        print("2. 將影片文件路徑告訴我")
        print("3. 上傳影片截圖進行分析")
        
        input("\n按 Enter 鍵退出...")

if __name__ == "__main__":
    main()
