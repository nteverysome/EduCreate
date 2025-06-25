"""
Enhanced MCP Feedback Collector with Video Support
增強版交互式反馈收集器 MCP 服务器 - 支持影片上傳
基於原始 mcp-feedback-collector 添加影片功能

修復版本 - 解決了按鈕顯示和文件大小計算問題
"""

import io
import base64
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
from PIL import Image, ImageTk
import threading
import queue
from pathlib import Path
from datetime import datetime
import os
import mimetypes
from mcp.server.fastmcp import FastMCP
from mcp.server.fastmcp.utilities.types import Image as MCPImage

# 创建MCP服务器
mcp = FastMCP(
    "Enhanced MCP Feedback Collector with Video",
    dependencies=["pillow", "tkinter"]
)

# 配置超时时间（秒）
DEFAULT_DIALOG_TIMEOUT = 300
DIALOG_TIMEOUT = int(os.getenv("MCP_DIALOG_TIMEOUT", DEFAULT_DIALOG_TIMEOUT))

# 支持的影片格式
SUPPORTED_VIDEO_FORMATS = {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'}

class EnhancedFeedbackDialog:
    def __init__(self, work_summary: str = "", timeout_seconds: int = DIALOG_TIMEOUT):
        self.result_queue = queue.Queue()
        self.root = None
        self.work_summary = work_summary
        self.timeout_seconds = timeout_seconds
        self.selected_images = []
        self.selected_videos = []  # 新增：影片列表
        self.text_widget = None

    def show_dialog(self):
        """在新线程中显示反馈收集对话框"""
        def run_dialog():
            self.root = tk.Tk()
            self.root.title("🎯 Enhanced MCP Feedback Collector - 支持影片上傳")
            self.root.geometry("700x800")
            self.root.resizable(True, True)
            self.root.configure(bg="#f5f5f5")
            
            # 居中显示窗口
            self.root.eval('tk::PlaceWindow . center')
            
            # 确保窗口在最前面
            self.root.lift()
            self.root.attributes('-topmost', True)
            self.root.after_idle(self.root.attributes, '-topmost', False)
            
            # 创建界面
            self.create_widgets()
            
            # 运行主循环
            self.root.mainloop()
        
        # 在新线程中运行对话框
        dialog_thread = threading.Thread(target=run_dialog)
        dialog_thread.daemon = True
        dialog_thread.start()
        
        # 等待结果
        try:
            result = self.result_queue.get(timeout=self.timeout_seconds)
            return result
        except queue.Empty:
            return None

    def create_widgets(self):
        """创建增強版界面组件"""
        # 主框架
        main_frame = tk.Frame(self.root, bg="#f5f5f5")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        # 标题
        title_label = tk.Label(
            main_frame,
            text="🎯 Enhanced MCP Feedback Collector",
            font=("Microsoft YaHei", 16, "bold"),
            bg="#f5f5f5",
            fg="#2c3e50"
        )
        title_label.pack(pady=(0, 20))
        
        # 1. 工作汇报区域
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
        
        # 2. 用户反馈文本区域
        feedback_frame = tk.LabelFrame(
            main_frame,
            text="💬 您的文字反馈（可选）",
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
        self.text_widget.insert(tk.END, "请在此输入您的反馈、建议或问题...")
        self.text_widget.bind("<FocusIn>", self.clear_placeholder)
        
        # 3. 媒體文件區域（圖片+影片）
        media_frame = tk.LabelFrame(
            main_frame,
            text="📱 媒體文件反馈（可选）",
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
            "font": ("Microsoft YaHei", 9, "bold"),
            "relief": tk.FLAT,
            "bd": 0,
            "cursor": "hand2",
            "height": 2
        }

        # 第一行按鈕
        btn_row1 = tk.Frame(btn_frame, bg="#ffffff")
        btn_row1.pack(fill=tk.X, pady=(0, 5))

        # 圖片按鈕
        tk.Button(
            btn_row1,
            text="📸 選擇圖片",
            command=self.select_images,
            bg="#3498db",
            fg="white",
            width=15,
            **btn_style
        ).pack(side=tk.LEFT, padx=(0, 5))

        # 影片按鈕（確保正確的命令綁定）
        video_btn = tk.Button(
            btn_row1,
            text="🎬 選擇影片",
            command=self.select_videos,
            bg="#e74c3c",
            fg="white",
            width=15,
            **btn_style
        )
        video_btn.pack(side=tk.LEFT, padx=5)

        # 第二行按鈕
        btn_row2 = tk.Frame(btn_frame, bg="#ffffff")
        btn_row2.pack(fill=tk.X)

        # 剪貼板按鈕
        tk.Button(
            btn_row2,
            text="📋 粘貼圖片",
            command=self.paste_from_clipboard,
            bg="#2ecc71",
            fg="white",
            width=15,
            **btn_style
        ).pack(side=tk.LEFT, padx=(0, 5))

        # 清除按鈕
        tk.Button(
            btn_row2,
            text="🗑️ 清除全部",
            command=self.clear_all_media,
            bg="#95a5a6",
            fg="white",
            width=15,
            **btn_style
        ).pack(side=tk.LEFT, padx=5)
        
        # 媒體文件列表
        list_frame = tk.Frame(media_frame, bg="#ffffff")
        list_frame.pack(fill=tk.X, padx=15, pady=(0, 15))
        
        self.media_listbox = tk.Listbox(
            list_frame,
            height=8,
            font=("Microsoft YaHei", 9),
            bg="#f8f9fa",
            selectmode=tk.SINGLE
        )
        self.media_listbox.pack(fill=tk.X)
        
        # 初始化媒體列表
        self.update_media_list()
        
        # 4. 操作按钮
        button_frame = tk.Frame(main_frame, bg="#f5f5f5")
        button_frame.pack(fill=tk.X, pady=(15, 0))
        
        submit_btn = tk.Button(
            button_frame,
            text="✅ 提交反馈",
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
        
        # 说明文字
        info_label = tk.Label(
            main_frame,
            text="💡 提示：支持文字、圖片和影片反馈，可以單獨或組合使用",
            font=("Microsoft YaHei", 9),
            fg="#7f8c8d",
            bg="#f5f5f5"
        )
        info_label.pack(pady=(15, 0))

    def clear_placeholder(self, event):
        """清除占位符文本"""
        if self.text_widget.get(1.0, tk.END).strip() == "请在此输入您的反馈、建议或问题...":
            self.text_widget.delete(1.0, tk.END)

    def select_images(self):
        """选择图片文件"""
        file_types = [
            ("图片文件", "*.png *.jpg *.jpeg *.gif *.bmp *.webp"),
            ("PNG文件", "*.png"),
            ("JPEG文件", "*.jpg *.jpeg"),
            ("所有文件", "*.*")
        ]

        file_paths = filedialog.askopenfilenames(
            title="选择图片文件（可多选）",
            filetypes=file_types
        )

        for file_path in file_paths:
            try:
                # 獲取文件大小
                file_size = Path(file_path).stat().st_size

                # 檢查文件大小（10MB限制）
                if file_size > 10 * 1024 * 1024:
                    messagebox.showwarning("警告", f"圖片文件過大: {Path(file_path).name}\n最大支持10MB")
                    continue

                # 讀取文件
                with open(file_path, 'rb') as f:
                    data = f.read()

                # 驗證圖片
                img = Image.open(io.BytesIO(data))

                self.selected_images.append({
                    'type': 'image',
                    'name': Path(file_path).name,
                    'data': data,
                    'size': file_size,  # 使用實際文件大小
                    'path': str(file_path),
                    'dimensions': f"{img.width}x{img.height}",
                    'format': img.format
                })

            except Exception as e:
                messagebox.showerror("错误", f"无法读取图片 {Path(file_path).name}: {str(e)}")

        self.update_media_list()

    def select_videos(self):
        """选择影片文件 - 核心新功能"""
        file_types = [
            ("影片文件", "*.mp4 *.avi *.mov *.wmv *.flv *.webm *.mkv *.m4v"),
            ("MP4文件", "*.mp4"),
            ("AVI文件", "*.avi"),
            ("MOV文件", "*.mov"),
            ("WMV文件", "*.wmv"),
            ("所有文件", "*.*")
        ]

        file_paths = filedialog.askopenfilenames(
            title="🎬 选择影片文件（可多选）",
            filetypes=file_types
        )

        if not file_paths:
            return  # 用戶取消選擇

        for file_path in file_paths:
            try:
                path = Path(file_path)
                file_size = path.stat().st_size

                # 檢查文件大小（100MB限制）
                if file_size > 100 * 1024 * 1024:
                    size_mb = file_size / 1024 / 1024
                    messagebox.showwarning("警告", f"影片文件過大: {path.name}\n文件大小: {size_mb:.1f}MB\n最大支持: 100MB")
                    continue

                # 檢查格式
                if path.suffix.lower() not in SUPPORTED_VIDEO_FORMATS:
                    messagebox.showwarning("警告", f"不支持的影片格式: {path.suffix}\n支持的格式: {', '.join(SUPPORTED_VIDEO_FORMATS)}")
                    continue

                # 顯示處理進度
                print(f"正在處理影片: {path.name} ({file_size / 1024 / 1024:.1f}MB)")

                # 讀取文件（對於大文件可能需要時間）
                with open(file_path, 'rb') as f:
                    data = f.read()

                # 獲取MIME類型
                mime_type, _ = mimetypes.guess_type(file_path)

                self.selected_videos.append({
                    'type': 'video',
                    'name': path.name,
                    'data': data,
                    'size': file_size,  # 使用實際文件大小
                    'path': str(path),
                    'format': path.suffix.lower(),
                    'mime_type': mime_type or 'video/mp4'
                })

                print(f"✅ 影片添加成功: {path.name}")

            except Exception as e:
                messagebox.showerror("错误", f"无法读取影片文件 {Path(file_path).name}: {str(e)}")

        self.update_media_list()

        # 顯示成功信息
        if self.selected_videos:
            messagebox.showinfo("成功", f"已添加 {len(self.selected_videos)} 個影片文件！")

    def paste_from_clipboard(self):
        """从剪贴板粘贴图片"""
        try:
            from PIL import ImageGrab
            img = ImageGrab.grabclipboard()
            if img:
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
                messagebox.showwarning("警告", "剪贴板中没有图片")
        except Exception as e:
            messagebox.showerror("错误", f"剪贴板操作失败: {e}")

    def clear_all_media(self):
        """清除所有媒體文件"""
        self.selected_images = []
        self.selected_videos = []
        self.update_media_list()

    def update_media_list(self):
        """更新媒體文件列表"""
        self.media_listbox.delete(0, tk.END)

        # 添加圖片
        for i, img in enumerate(self.selected_images):
            # 確保正確計算文件大小
            size_bytes = img.get('size', 0)
            if size_bytes == 0 and 'data' in img:
                size_bytes = len(img['data'])

            size_mb = size_bytes / 1024 / 1024
            self.media_listbox.insert(tk.END, f"📸 圖片 {i+1}: {img['name']} ({size_mb:.2f}MB)")

        # 添加影片
        for i, vid in enumerate(self.selected_videos):
            # 確保正確計算文件大小
            size_bytes = vid.get('size', 0)
            if size_bytes == 0 and 'data' in vid:
                size_bytes = len(vid['data'])

            size_mb = size_bytes / 1024 / 1024
            self.media_listbox.insert(tk.END, f"🎬 影片 {i+1}: {vid['name']} ({size_mb:.2f}MB)")

        if not self.selected_images and not self.selected_videos:
            self.media_listbox.insert(tk.END, "未選擇任何媒體文件")

        # 更新狀態顯示
        total_files = len(self.selected_images) + len(self.selected_videos)
        if total_files > 0:
            self.media_listbox.insert(tk.END, f"")
            self.media_listbox.insert(tk.END, f"📊 總計: {len(self.selected_images)} 張圖片, {len(self.selected_videos)} 個影片")

    def submit_feedback(self):
        """提交反馈"""
        text_content = self.text_widget.get(1.0, tk.END).strip()
        if text_content == "请在此输入您的反馈、建议或问题...":
            text_content = ""
        
        has_text = bool(text_content)
        has_images = bool(self.selected_images)
        has_videos = bool(self.selected_videos)
        
        if not has_text and not has_images and not has_videos:
            messagebox.showwarning("警告", "请至少提供一种反馈内容")
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
                'format': vid['format'],
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


# MCP 工具函數

@mcp.tool()
def collect_feedback(work_summary: str = "", timeout_seconds: int = DIALOG_TIMEOUT) -> list:
    """
    收集用户反馈的交互式工具。AI可以汇报完成的工作，用户可以提供文字、图片和/或影片反馈。

    Args:
        work_summary: AI完成的工作内容汇报
        timeout_seconds: 对话框超时时间（秒），默认300秒

    Returns:
        包含用户反馈内容的列表，可能包含文本、图片和影片
    """
    dialog = EnhancedFeedbackDialog(work_summary, timeout_seconds)
    result = dialog.show_dialog()

    if result is None:
        raise Exception(f"操作超时（{timeout_seconds}秒），请重试")

    if not result['success']:
        raise Exception(result.get('message', '用户取消了反馈提交'))

    # 构建返回内容列表
    feedback_items = []

    # 添加文字反馈
    if result['has_text']:
        from mcp.types import TextContent
        feedback_items.append(TextContent(
            type="text",
            text=f"用户文字反馈：{result['text_feedback']}\n提交时间：{result['timestamp']}"
        ))

    # 添加图片反馈
    if result['has_images']:
        for i, image_data in enumerate(result['images']):
            feedback_items.append(MCPImage(data=image_data, format='png'))
            from mcp.types import TextContent
            feedback_items.append(TextContent(
                type="text",
                text=f"图片 {i+1}: 已上传"
            ))

    # 添加影片反馈信息
    if result['has_videos']:
        from mcp.types import TextContent
        for i, video_info in enumerate(result['video_info']):
            video_text = f"""影片 {i+1} 信息：
文件名: {video_info['name']}
格式: {video_info['format']}
大小: {video_info['size'] / 1024 / 1024:.1f} MB
MIME类型: {video_info['mime_type']}

注意：影片数据已收集，可通过相关工具获取具体内容。"""

            feedback_items.append(TextContent(
                type="text",
                text=video_text
            ))

    return feedback_items


@mcp.tool()
def pick_image() -> MCPImage:
    """
    弹出图片选择对话框，让用户选择图片文件或从剪贴板粘贴图片。
    """
    def simple_image_dialog():
        root = tk.Tk()
        root.title("选择图片")
        root.geometry("400x300")
        root.resizable(False, False)
        root.eval('tk::PlaceWindow . center')

        selected_image = {'data': None}

        def select_file():
            file_path = filedialog.askopenfilename(
                title="选择图片文件",
                filetypes=[("图片文件", "*.png *.jpg *.jpeg *.gif *.bmp *.webp")]
            )
            if file_path:
                try:
                    with open(file_path, 'rb') as f:
                        selected_image['data'] = f.read()
                    root.destroy()
                except Exception as e:
                    messagebox.showerror("错误", f"无法读取图片: {e}")

        def paste_clipboard():
            try:
                from PIL import ImageGrab
                img = ImageGrab.grabclipboard()
                if img:
                    buffer = io.BytesIO()
                    img.save(buffer, format='PNG')
                    selected_image['data'] = buffer.getvalue()
                    root.destroy()
                else:
                    messagebox.showwarning("警告", "剪贴板中没有图片")
            except Exception as e:
                messagebox.showerror("错误", f"剪贴板操作失败: {e}")

        def cancel():
            root.destroy()

        # 界面
        tk.Label(root, text="请选择图片来源", font=("Arial", 14, "bold")).pack(pady=20)

        btn_frame = tk.Frame(root)
        btn_frame.pack(pady=20)

        tk.Button(btn_frame, text="📁 选择图片文件", font=("Arial", 12),
                 width=20, height=2, command=select_file).pack(pady=10)
        tk.Button(btn_frame, text="📋 从剪贴板粘贴", font=("Arial", 12),
                 width=20, height=2, command=paste_clipboard).pack(pady=10)
        tk.Button(btn_frame, text="❌ 取消", font=("Arial", 12),
                 width=20, height=1, command=cancel).pack(pady=10)

        root.mainloop()
        return selected_image['data']

    image_data = simple_image_dialog()

    if image_data is None:
        raise Exception("未选择图片或操作被取消")

    return MCPImage(data=image_data, format='png')


@mcp.tool()
def pick_video() -> str:
    """
    弹出影片选择对话框，让用户选择影片文件。
    """
    def simple_video_dialog():
        root = tk.Tk()
        root.title("选择影片")
        root.geometry("400x300")
        root.resizable(False, False)
        root.eval('tk::PlaceWindow . center')

        selected_video = {'info': None}

        def select_file():
            file_path = filedialog.askopenfilename(
                title="选择影片文件",
                filetypes=[
                    ("影片文件", "*.mp4 *.avi *.mov *.wmv *.flv *.webm *.mkv"),
                    ("MP4文件", "*.mp4"),
                    ("所有文件", "*.*")
                ]
            )
            if file_path:
                try:
                    path = Path(file_path)
                    file_size = path.stat().st_size

                    if file_size > 100 * 1024 * 1024:
                        messagebox.showwarning("警告", "影片文件过大，最大支持100MB")
                        return

                    mime_type, _ = mimetypes.guess_type(file_path)

                    selected_video['info'] = {
                        'path': str(path),
                        'name': path.name,
                        'size': file_size,
                        'format': path.suffix.lower(),
                        'mime_type': mime_type or 'video/mp4'
                    }
                    root.destroy()
                except Exception as e:
                    messagebox.showerror("错误", f"无法读取影片文件: {e}")

        def cancel():
            root.destroy()

        # 界面
        tk.Label(root, text="请选择影片文件", font=("Arial", 14, "bold")).pack(pady=20)

        btn_frame = tk.Frame(root)
        btn_frame.pack(pady=20)

        tk.Button(btn_frame, text="🎥 选择影片文件", font=("Arial", 12),
                 width=20, height=2, command=select_file).pack(pady=10)
        tk.Button(btn_frame, text="❌ 取消", font=("Arial", 12),
                 width=20, height=1, command=cancel).pack(pady=10)

        tk.Label(root, text="支持格式: MP4, AVI, MOV, WMV等\n最大文件大小: 100MB",
                font=("Arial", 10), fg="gray").pack(pady=10)

        root.mainloop()
        return selected_video['info']

    video_info = simple_video_dialog()

    if video_info is None:
        raise Exception("未选择影片或操作被取消")

    return f"""影片文件信息：
文件名: {video_info['name']}
路径: {video_info['path']}
大小: {video_info['size'] / 1024 / 1024:.1f} MB
格式: {video_info['format']}
MIME类型: {video_info['mime_type']}

注意：影片文件已选择，可通过相关工具读取具体内容。"""


def main():
    """Main entry point for the enhanced mcp-feedback-collector command."""
    print("🚀 啟動 Enhanced MCP Video Feedback Collector...")
    print("📋 可用工具: collect_feedback, pick_image, pick_video")
    mcp.run()

if __name__ == "__main__":
    main()
