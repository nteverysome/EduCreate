#!/usr/bin/env python3
"""
增強版反饋收集器 - 支持影片上傳
為現有的 mcp-feedback-collector 添加影片選擇功能
"""

import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
from PIL import Image, ImageTk
import threading
import queue
from pathlib import Path
from datetime import datetime
import os
import mimetypes
import base64

class EnhancedFeedbackCollector:
    def __init__(self, work_summary="", timeout_seconds=300):
        self.result_queue = queue.Queue()
        self.root = None
        self.work_summary = work_summary
        self.timeout_seconds = timeout_seconds
        self.selected_images = []
        self.selected_videos = []
        self.text_widget = None

    def show_dialog(self):
        """顯示增強版反饋收集對話框"""
        def run_dialog():
            self.root = tk.Tk()
            self.root.title("🎯 增強版反饋收集器 - 支持影片上傳")
            self.root.geometry("800x700")
            self.root.resizable(True, True)
            self.root.configure(bg="#f5f5f5")
            
            # 居中顯示
            self.root.eval('tk::PlaceWindow . center')
            
            # 創建界面
            self.create_widgets()
            
            # 運行主循環
            self.root.mainloop()
        
        # 在新線程中運行對話框
        dialog_thread = threading.Thread(target=run_dialog)
        dialog_thread.daemon = True
        dialog_thread.start()
        
        # 等待結果
        try:
            result = self.result_queue.get(timeout=self.timeout_seconds)
            return result
        except queue.Empty:
            return None

    def create_widgets(self):
        """創建增強版界面"""
        # 主框架
        main_frame = tk.Frame(self.root, bg="#f5f5f5")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        # 標題
        title_label = tk.Label(
            main_frame,
            text="🎯 增強版反饋收集器",
            font=("Microsoft YaHei", 16, "bold"),
            bg="#f5f5f5",
            fg="#2c3e50"
        )
        title_label.pack(pady=(0, 20))
        
        # 工作汇报區域
        if self.work_summary:
            report_frame = tk.LabelFrame(
                main_frame,
                text="📋 AI工作完成汇报",
                font=("Microsoft YaHei", 12, "bold"),
                bg="#ffffff",
                fg="#34495e",
                relief=tk.RAISED,
                bd=2
            )
            report_frame.pack(fill=tk.X, pady=(0, 15))
            
            report_text = tk.Text(
                report_frame,
                height=4,
                wrap=tk.WORD,
                bg="#ecf0f1",
                fg="#2c3e50",
                font=("Microsoft YaHei", 10),
                relief=tk.FLAT,
                bd=5,
                state=tk.DISABLED
            )
            report_text.pack(fill=tk.X, padx=15, pady=15)
            
            report_text.config(state=tk.NORMAL)
            report_text.insert(tk.END, self.work_summary)
            report_text.config(state=tk.DISABLED)
        
        # 文字反饋區域
        feedback_frame = tk.LabelFrame(
            main_frame,
            text="💬 您的文字反饋（可選）",
            font=("Microsoft YaHei", 12, "bold"),
            bg="#ffffff",
            fg="#34495e",
            relief=tk.RAISED,
            bd=2
        )
        feedback_frame.pack(fill=tk.X, pady=(0, 15))
        
        self.text_widget = scrolledtext.ScrolledText(
            feedback_frame,
            height=4,
            wrap=tk.WORD,
            font=("Microsoft YaHei", 10),
            bg="#ffffff",
            fg="#2c3e50",
            relief=tk.FLAT,
            bd=5
        )
        self.text_widget.pack(fill=tk.X, padx=15, pady=15)
        self.text_widget.insert(tk.END, "請在此輸入您的反饋...")
        self.text_widget.bind("<FocusIn>", self.clear_placeholder)
        
        # 媒體文件區域
        media_frame = tk.LabelFrame(
            main_frame,
            text="📱 媒體文件反饋（可選）",
            font=("Microsoft YaHei", 12, "bold"),
            bg="#ffffff",
            fg="#34495e",
            relief=tk.RAISED,
            bd=2
        )
        media_frame.pack(fill=tk.X, pady=(0, 15))
        
        # 按鈕區域
        btn_frame = tk.Frame(media_frame, bg="#ffffff")
        btn_frame.pack(fill=tk.X, padx=15, pady=10)
        
        btn_style = {
            "font": ("Microsoft YaHei", 10, "bold"),
            "relief": tk.FLAT,
            "bd": 0,
            "cursor": "hand2",
            "height": 2
        }
        
        # 圖片按鈕
        tk.Button(
            btn_frame,
            text="📸 選擇圖片",
            command=self.select_images,
            bg="#3498db",
            fg="white",
            width=12,
            **btn_style
        ).pack(side=tk.LEFT, padx=(0, 5))
        
        # 影片按鈕（新增）
        tk.Button(
            btn_frame,
            text="🎬 選擇影片",
            command=self.select_videos,
            bg="#e74c3c",
            fg="white",
            width=12,
            **btn_style
        ).pack(side=tk.LEFT, padx=5)
        
        # 剪貼板按鈕
        tk.Button(
            btn_frame,
            text="📋 粘貼圖片",
            command=self.paste_from_clipboard,
            bg="#2ecc71",
            fg="white",
            width=12,
            **btn_style
        ).pack(side=tk.LEFT, padx=5)
        
        # 清除按鈕
        tk.Button(
            btn_frame,
            text="🗑️ 清除全部",
            command=self.clear_all_media,
            bg="#95a5a6",
            fg="white",
            width=12,
            **btn_style
        ).pack(side=tk.LEFT, padx=5)
        
        # 媒體預覽區域
        preview_frame = tk.Frame(media_frame, bg="#ffffff")
        preview_frame.pack(fill=tk.X, padx=15, pady=(0, 15))
        
        self.media_list = tk.Listbox(
            preview_frame,
            height=6,
            font=("Microsoft YaHei", 9),
            bg="#f8f9fa",
            selectmode=tk.SINGLE
        )
        self.media_list.pack(fill=tk.X)
        
        # 操作按鈕
        button_frame = tk.Frame(main_frame, bg="#f5f5f5")
        button_frame.pack(fill=tk.X, pady=(15, 0))
        
        submit_btn = tk.Button(
            button_frame,
            text="✅ 提交反饋",
            command=self.submit_feedback,
            font=("Microsoft YaHei", 12, "bold"),
            bg="#27ae60",
            fg="white",
            width=18,
            height=2,
            relief=tk.FLAT,
            cursor="hand2"
        )
        submit_btn.pack(side=tk.LEFT, padx=(0, 15))
        
        cancel_btn = tk.Button(
            button_frame,
            text="❌ 取消",
            command=self.cancel,
            font=("Microsoft YaHei", 12),
            bg="#95a5a6",
            fg="white",
            width=18,
            height=2,
            relief=tk.FLAT,
            cursor="hand2"
        )
        cancel_btn.pack(side=tk.LEFT)
        
        # 說明文字
        info_label = tk.Label(
            main_frame,
            text="💡 提示：支持文字、圖片和影片反饋，可以單獨或組合使用",
            font=("Microsoft YaHei", 9),
            fg="#7f8c8d",
            bg="#f5f5f5"
        )
        info_label.pack(pady=(15, 0))
        
        # 初始化媒體列表
        self.update_media_list()

    def clear_placeholder(self, event):
        """清除占位符文本"""
        if self.text_widget.get(1.0, tk.END).strip() == "請在此輸入您的反饋...":
            self.text_widget.delete(1.0, tk.END)

    def select_images(self):
        """選擇圖片文件"""
        file_types = [
            ("圖片文件", "*.png *.jpg *.jpeg *.gif *.bmp *.webp"),
            ("所有文件", "*.*")
        ]
        
        file_paths = filedialog.askopenfilenames(
            title="選擇圖片文件（可多選）",
            filetypes=file_types
        )
        
        for file_path in file_paths:
            try:
                path = Path(file_path)
                with open(file_path, 'rb') as f:
                    data = f.read()
                
                self.selected_images.append({
                    'type': 'image',
                    'name': path.name,
                    'data': data,
                    'size': len(data),
                    'path': str(path)
                })
            except Exception as e:
                messagebox.showerror("錯誤", f"無法讀取圖片: {e}")
        
        self.update_media_list()

    def select_videos(self):
        """選擇影片文件（新增功能）"""
        file_types = [
            ("影片文件", "*.mp4 *.avi *.mov *.wmv *.flv *.webm *.mkv"),
            ("所有文件", "*.*")
        ]
        
        file_paths = filedialog.askopenfilenames(
            title="選擇影片文件（可多選）",
            filetypes=file_types
        )
        
        for file_path in file_paths:
            try:
                path = Path(file_path)
                file_size = path.stat().st_size
                
                # 檢查文件大小（100MB限制）
                if file_size > 100 * 1024 * 1024:
                    messagebox.showwarning("警告", f"影片文件過大: {path.name}\n最大支持100MB")
                    continue
                
                # 讀取文件（對於大文件，可能需要優化）
                with open(file_path, 'rb') as f:
                    data = f.read()
                
                mime_type, _ = mimetypes.guess_type(file_path)
                
                self.selected_videos.append({
                    'type': 'video',
                    'name': path.name,
                    'data': data,
                    'size': len(data),
                    'path': str(path),
                    'mime_type': mime_type or 'video/mp4'
                })
                
            except Exception as e:
                messagebox.showerror("錯誤", f"無法讀取影片: {e}")
        
        self.update_media_list()

    def paste_from_clipboard(self):
        """從剪貼板粘貼圖片"""
        try:
            from PIL import ImageGrab
            img = ImageGrab.grabclipboard()
            if img:
                import io
                buffer = io.BytesIO()
                img.save(buffer, format='PNG')
                data = buffer.getvalue()
                
                self.selected_images.append({
                    'type': 'image',
                    'name': '剪貼板圖片.png',
                    'data': data,
                    'size': len(data),
                    'path': 'clipboard'
                })
                
                self.update_media_list()
            else:
                messagebox.showwarning("警告", "剪貼板中沒有圖片")
        except Exception as e:
            messagebox.showerror("錯誤", f"剪貼板操作失敗: {e}")

    def clear_all_media(self):
        """清除所有媒體文件"""
        self.selected_images = []
        self.selected_videos = []
        self.update_media_list()

    def update_media_list(self):
        """更新媒體文件列表"""
        self.media_list.delete(0, tk.END)
        
        # 添加圖片
        for i, img in enumerate(self.selected_images):
            size_mb = img['size'] / 1024 / 1024
            self.media_list.insert(tk.END, f"📸 圖片 {i+1}: {img['name']} ({size_mb:.1f}MB)")
        
        # 添加影片
        for i, vid in enumerate(self.selected_videos):
            size_mb = vid['size'] / 1024 / 1024
            self.media_list.insert(tk.END, f"🎬 影片 {i+1}: {vid['name']} ({size_mb:.1f}MB)")
        
        if not self.selected_images and not self.selected_videos:
            self.media_list.insert(tk.END, "未選擇任何媒體文件")

    def submit_feedback(self):
        """提交反饋"""
        text_content = self.text_widget.get(1.0, tk.END).strip()
        if text_content == "請在此輸入您的反饋...":
            text_content = ""
        
        has_text = bool(text_content)
        has_images = bool(self.selected_images)
        has_videos = bool(self.selected_videos)
        
        if not has_text and not has_images and not has_videos:
            messagebox.showwarning("警告", "請至少提供一種反饋內容")
            return
        
        # 構建結果
        result = {
            'success': True,
            'text_feedback': text_content if has_text else None,
            'images': [img['data'] for img in self.selected_images] if has_images else None,
            'videos': [vid['data'] for vid in self.selected_videos] if has_videos else None,
            'video_info': [{
                'name': vid['name'],
                'size': vid['size'],
                'mime_type': vid['mime_type'],
                'path': vid['path']
            } for vid in self.selected_videos] if has_videos else None,
            'has_text': has_text,
            'has_images': has_images,
            'has_videos': has_videos,
            'image_count': len(self.selected_images),
            'video_count': len(self.selected_videos),
            'timestamp': datetime.now().isoformat()
        }
        
        self.result_queue.put(result)
        self.root.destroy()

    def cancel(self):
        """取消操作"""
        self.result_queue.put({'success': False, 'message': '用戶取消了反饋提交'})
        self.root.destroy()

def enhanced_collect_feedback(work_summary="", timeout_seconds=300):
    """
    增強版反饋收集函數 - 支持影片上傳
    
    Args:
        work_summary: AI工作完成汇报
        timeout_seconds: 超時時間（秒）
        
    Returns:
        包含文字、圖片和影片反饋的結果
    """
    collector = EnhancedFeedbackCollector(work_summary, timeout_seconds)
    result = collector.show_dialog()
    
    if result is None:
        raise Exception(f"操作超時（{timeout_seconds}秒），請重試")
    
    if not result['success']:
        raise Exception(result.get('message', '用戶取消了反饋提交'))
    
    return result

if __name__ == "__main__":
    # 測試增強版反饋收集器
    try:
        result = enhanced_collect_feedback(
            work_summary="🎬 影片分析測試\n\n請上傳您想要分析的影片文件，我會進行詳細分析！",
            timeout_seconds=300
        )
        
        print("✅ 反饋收集成功！")
        print(f"文字反饋: {result.get('has_text', False)}")
        print(f"圖片數量: {result.get('image_count', 0)}")
        print(f"影片數量: {result.get('video_count', 0)}")
        
        if result.get('has_videos'):
            print("\n🎬 收到的影片:")
            for i, info in enumerate(result['video_info']):
                print(f"  {i+1}. {info['name']} ({info['size']/1024/1024:.1f}MB)")
        
    except Exception as e:
        print(f"❌ 反饋收集失敗: {e}")
