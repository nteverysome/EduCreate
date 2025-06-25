#!/usr/bin/env python3
"""
簡化版影片上傳工具
確保能夠正確接收影片數據
"""

import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
import base64
from pathlib import Path
from datetime import datetime

# 全局變量存儲影片數據
VIDEO_DATA = None

def upload_video():
    """上傳影片的簡化版本"""
    global VIDEO_DATA
    
    root = tk.Tk()
    root.title("🎬 影片上傳 - AI分析")
    root.geometry("500x400")
    root.configure(bg="#f0f0f0")
    
    # 居中顯示
    root.eval('tk::PlaceWindow . center')
    root.lift()
    root.attributes('-topmost', True)
    root.after_idle(root.attributes, '-topmost', False)
    
    selected_video = None
    
    # 標題
    title_label = tk.Label(
        root,
        text="🎬 上傳影片給AI分析",
        font=("Microsoft YaHei", 16, "bold"),
        bg="#f0f0f0",
        fg="#2c3e50"
    )
    title_label.pack(pady=20)
    
    # 說明文字
    info_label = tk.Label(
        root,
        text="請選擇您想要分析的影片文件\n支持格式：MP4, AVI, MOV, WMV, WebM, MKV\n最大大小：100MB",
        font=("Microsoft YaHei", 10),
        bg="#f0f0f0",
        fg="#666666"
    )
    info_label.pack(pady=10)
    
    # 文字描述區域
    desc_label = tk.Label(
        root,
        text="📝 請描述您想要分析的內容（可選）：",
        font=("Microsoft YaHei", 10, "bold"),
        bg="#f0f0f0"
    )
    desc_label.pack(pady=(20, 5))
    
    text_area = scrolledtext.ScrolledText(
        root,
        height=4,
        width=50,
        font=("Microsoft YaHei", 9)
    )
    text_area.pack(pady=5)
    text_area.insert(tk.END, "請告訴我您想要分析什麼...")
    
    def clear_placeholder(event):
        if text_area.get(1.0, tk.END).strip() == "請告訴我您想要分析什麼...":
            text_area.delete(1.0, tk.END)
    
    text_area.bind("<FocusIn>", clear_placeholder)
    
    # 文件選擇區域
    file_label = tk.Label(
        root,
        text="📁 未選擇文件",
        font=("Microsoft YaHei", 10),
        bg="#f0f0f0",
        fg="#666666"
    )
    file_label.pack(pady=10)
    
    def select_video():
        nonlocal selected_video
        file_path = filedialog.askopenfilename(
            title="選擇影片文件",
            filetypes=[
                ("影片文件", "*.mp4 *.avi *.mov *.wmv *.webm *.mkv *.flv"),
                ("所有文件", "*.*")
            ]
        )
        
        if file_path:
            try:
                path = Path(file_path)
                file_size = path.stat().st_size
                
                if file_size > 100 * 1024 * 1024:
                    messagebox.showwarning("警告", "文件過大，最大支持100MB")
                    return
                
                with open(file_path, 'rb') as f:
                    video_data = f.read()
                
                selected_video = {
                    'name': path.name,
                    'size': file_size,
                    'data': video_data,
                    'path': str(path)
                }
                
                file_label.config(
                    text=f"✅ 已選擇: {path.name} ({file_size/1024/1024:.1f}MB)",
                    fg="#27ae60"
                )
                
            except Exception as e:
                messagebox.showerror("錯誤", f"讀取文件失敗: {e}")
    
    # 選擇按鈕
    select_btn = tk.Button(
        root,
        text="🎬 選擇影片文件",
        font=("Microsoft YaHei", 12, "bold"),
        bg="#3498db",
        fg="white",
        width=20,
        height=2,
        command=select_video
    )
    select_btn.pack(pady=10)
    
    # 提交按鈕
    def submit():
        global VIDEO_DATA
        
        if not selected_video:
            messagebox.showwarning("警告", "請先選擇影片文件")
            return
        
        text_content = text_area.get(1.0, tk.END).strip()
        if text_content == "請告訴我您想要分析什麼...":
            text_content = ""
        
        # 保存到全局變量
        VIDEO_DATA = {
            'video_info': selected_video,
            'text_feedback': text_content,
            'timestamp': datetime.now().isoformat(),
            'video_data': selected_video['data']
        }
        
        messagebox.showinfo(
            "成功", 
            f"影片上傳成功！\n文件: {selected_video['name']}\n大小: {selected_video['size']/1024/1024:.1f}MB\n\nAI將立即進行分析。"
        )
        
        root.destroy()
    
    submit_btn = tk.Button(
        root,
        text="✅ 提交給AI分析",
        font=("Microsoft YaHei", 12, "bold"),
        bg="#27ae60",
        fg="white",
        width=20,
        height=2,
        command=submit
    )
    submit_btn.pack(pady=20)
    
    # 取消按鈕
    def cancel():
        root.destroy()
    
    cancel_btn = tk.Button(
        root,
        text="❌ 取消",
        font=("Microsoft YaHei", 10),
        bg="#95a5a6",
        fg="white",
        width=15,
        command=cancel
    )
    cancel_btn.pack(pady=5)
    
    root.mainloop()
    
    return VIDEO_DATA

def check_video_status():
    """檢查影片狀態"""
    global VIDEO_DATA
    
    if VIDEO_DATA:
        print("✅ 檢測到影片數據！")
        print(f"📁 文件名: {VIDEO_DATA['video_info']['name']}")
        print(f"📏 文件大小: {VIDEO_DATA['video_info']['size']/1024/1024:.1f}MB")
        print(f"💬 文字描述: {'有' if VIDEO_DATA['text_feedback'] else '無'}")
        print(f"⏰ 上傳時間: {VIDEO_DATA['timestamp']}")
        return True
    else:
        print("❌ 沒有影片數據")
        return False

def main():
    """主函數"""
    print("🎬 簡化版影片上傳工具")
    print("=" * 40)
    
    # 啟動上傳界面
    result = upload_video()
    
    if result:
        print("\n📊 上傳結果:")
        check_video_status()
        
        print("\n🎉 影片上傳成功！")
        print("AI現在可以分析您的影片了。")
    else:
        print("\n❌ 沒有上傳影片")

if __name__ == "__main__":
    main()
