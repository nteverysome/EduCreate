""" 
交互式反馈收集器 MCP 服务器 - 增強版
AI调用时会汇报工作内容，用户可以提供文本反馈、图片反馈和影片反馈
基於原始 mcp-feedback-collector 添加影片功能
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
    "增強版交互式反馈收集器",
    dependencies=["pillow", "tkinter"]
)

# 配置超时时间（秒）
DEFAULT_DIALOG_TIMEOUT = 300  # 5分钟
DIALOG_TIMEOUT = int(os.getenv("MCP_DIALOG_TIMEOUT", DEFAULT_DIALOG_TIMEOUT))

# 支持的影片格式
SUPPORTED_VIDEO_FORMATS = {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'}

class FeedbackDialog:
    def __init__(self, work_summary: str = "", timeout_seconds: int = DIALOG_TIMEOUT):
        self.result_queue = queue.Queue()
        self.root = None
        self.work_summary = work_summary
        self.timeout_seconds = timeout_seconds
        self.selected_images = []  # 改为支持多张图片
        self.selected_videos = []  # 新增：支持多个影片
        self.image_preview_frame = None
        self.video_preview_frame = None  # 新增：影片预览框架
        self.text_widget = None

    def show_dialog(self):
        """在新线程中显示反馈收集对话框"""
        def run_dialog():
            self.root = tk.Tk()
            self.root.title("🎯 增強版工作完成汇报与反馈收集")
            self.root.geometry("700x900")  # 增加高度以容纳影片区域
            self.root.resizable(True, True)
            self.root.configure(bg="#f5f5f5")
            
            # 设置窗口图标和样式
            try:
                self.root.iconbitmap(default="")
            except:
                pass
            
            # 居中显示窗口
            self.root.eval('tk::PlaceWindow . center')
            
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
        """创建美化的界面组件"""
        # 主框架
        main_frame = tk.Frame(self.root, bg="#f5f5f5")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        # 标题
        title_label = tk.Label(
            main_frame,
            text="🎯 增強版工作完成汇报与反馈收集",
            font=("Microsoft YaHei", 16, "bold"),
            bg="#f5f5f5",
            fg="#2c3e50"
        )
        title_label.pack(pady=(0, 20))
        
        # 1. 工作汇报区域
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
            height=4,  # 減少高度以節省空間
            wrap=tk.WORD,
            bg="#ecf0f1",
            fg="#2c3e50",
            font=("Microsoft YaHei", 10),
            relief=tk.FLAT,
            bd=5,
            state=tk.DISABLED
        )
        report_text.pack(fill=tk.X, padx=15, pady=15)
        
        # 显示工作汇报内容
        report_text.config(state=tk.NORMAL)
        report_text.insert(tk.END, self.work_summary or "本次对话中完成的工作内容...")
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
        
        # 文本输入框
        self.text_widget = scrolledtext.ScrolledText(
            feedback_frame,
            height=4,  # 減少高度
            wrap=tk.WORD,
            font=("Microsoft YaHei", 10),
            bg="#ffffff",
            fg="#2c3e50",
            relief=tk.FLAT,
            bd=5,
            insertbackground="#3498db"
        )
        self.text_widget.pack(fill=tk.X, padx=15, pady=15)
        self.text_widget.insert(tk.END, "请在此输入您的反馈、建议或问题...")
        self.text_widget.bind("<FocusIn>", self.clear_placeholder)
        
        # 3. 图片选择区域
        image_frame = tk.LabelFrame(
            main_frame,
            text="🖼️ 图片反馈（可选，支持多张）",
            font=("Microsoft YaHei", 12, "bold"),
            bg="#ffffff",
            fg="#34495e",
            relief=tk.RAISED,
            bd=2
        )
        image_frame.pack(fill=tk.X, pady=(0, 15))
        
        # 图片操作按钮
        img_btn_frame = tk.Frame(image_frame, bg="#ffffff")
        img_btn_frame.pack(fill=tk.X, padx=15, pady=10)
        
        # 美化的按钮样式
        btn_style = {
            "font": ("Microsoft YaHei", 9, "bold"),
            "relief": tk.FLAT,
            "bd": 0,
            "cursor": "hand2",
            "height": 2
        }
        
        tk.Button(
            img_btn_frame,
            text="📁 选择图片文件",
            command=self.select_image_file,
            bg="#3498db",
            fg="white",
            width=12,
            **btn_style
        ).pack(side=tk.LEFT, padx=(0, 5))
        
        tk.Button(
            img_btn_frame,
            text="📋 从剪贴板粘贴",
            command=self.paste_from_clipboard,
            bg="#2ecc71",
            fg="white",
            width=12,
            **btn_style
        ).pack(side=tk.LEFT, padx=5)
        
        tk.Button(
            img_btn_frame,
            text="❌ 清除所有图片",
            command=self.clear_all_images,
            bg="#e74c3c",
            fg="white",
            width=12,
            **btn_style
        ).pack(side=tk.LEFT, padx=5)
        
        # 图片预览区域（支持滚动）
        img_preview_container = tk.Frame(image_frame, bg="#ffffff")
        img_preview_container.pack(fill=tk.X, padx=15, pady=(0, 15))
        
        # 创建滚动画布
        img_canvas = tk.Canvas(img_preview_container, height=100, bg="#f8f9fa", relief=tk.SUNKEN, bd=1)
        img_scrollbar = tk.Scrollbar(img_preview_container, orient="horizontal", command=img_canvas.xview)
        self.image_preview_frame = tk.Frame(img_canvas, bg="#f8f9fa")
        
        self.image_preview_frame.bind(
            "<Configure>",
            lambda e: img_canvas.configure(scrollregion=img_canvas.bbox("all"))
        )
        
        img_canvas.create_window((0, 0), window=self.image_preview_frame, anchor="nw")
        img_canvas.configure(xscrollcommand=img_scrollbar.set)
        
        img_canvas.pack(side="top", fill="x")
        img_scrollbar.pack(side="bottom", fill="x")
        
        # 4. 影片選擇區域（新增）
        video_frame = tk.LabelFrame(
            main_frame,
            text="🎬 影片反馈（可选，支持多个）",
            font=("Microsoft YaHei", 12, "bold"),
            bg="#ffffff",
            fg="#34495e",
            relief=tk.RAISED,
            bd=2
        )
        video_frame.pack(fill=tk.X, pady=(0, 15))
        
        # 影片操作按鈕
        vid_btn_frame = tk.Frame(video_frame, bg="#ffffff")
        vid_btn_frame.pack(fill=tk.X, padx=15, pady=10)
        
        tk.Button(
            vid_btn_frame,
            text="🎥 选择影片文件",
            command=self.select_video_file,
            bg="#9b59b6",
            fg="white",
            width=12,
            **btn_style
        ).pack(side=tk.LEFT, padx=(0, 5))
        
        tk.Button(
            vid_btn_frame,
            text="❌ 清除所有影片",
            command=self.clear_all_videos,
            bg="#e74c3c",
            fg="white",
            width=12,
            **btn_style
        ).pack(side=tk.LEFT, padx=5)
        
        # 影片預覽區域
        vid_preview_container = tk.Frame(video_frame, bg="#ffffff")
        vid_preview_container.pack(fill=tk.X, padx=15, pady=(0, 15))
        
        self.video_preview_frame = tk.Frame(vid_preview_container, bg="#f8f9fa")
        self.video_preview_frame.pack(fill=tk.X, pady=5)
        
        # 初始提示
        self.update_image_preview()
        self.update_video_preview()
        
        # 5. 操作按钮
        button_frame = tk.Frame(main_frame, bg="#f5f5f5")
        button_frame.pack(fill=tk.X, pady=(15, 0))
        
        # 主要操作按钮
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
            bd=0,
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
            bd=0,
            cursor="hand2"
        )
        cancel_btn.pack(side=tk.LEFT)
        
        # 说明文字
        info_label = tk.Label(
            main_frame,
            text="💡 提示：您可以提供文字、图片和/或影片反馈（支持多张图片和多个影片）",
            font=("Microsoft YaHei", 9),
            fg="#7f8c8d",
            bg="#f5f5f5"
        )
        info_label.pack(pady=(15, 0))

    def clear_placeholder(self, event):
        """清除占位符文本"""
        if self.text_widget.get(1.0, tk.END).strip() == "请在此输入您的反馈、建议或问题...":
            self.text_widget.delete(1.0, tk.END)

    def select_image_file(self):
        """选择图片文件（支持多选）"""
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
                # 读取并验证图片
                with open(file_path, 'rb') as f:
                    image_data = f.read()

                img = Image.open(io.BytesIO(image_data))

                self.selected_images.append({
                    'data': image_data,
                    'source': f'文件: {Path(file_path).name}',
                    'size': img.size,
                    'image': img
                })
            except Exception as e:
                messagebox.showerror("错误", f"无法读取图片文件 {Path(file_path).name}: {str(e)}")

        self.update_image_preview()

    def select_video_file(self):
        """选择影片文件（支持多选）- 新增功能"""
        file_types = [
            ("影片文件", "*.mp4 *.avi *.mov *.wmv *.flv *.webm *.mkv *.m4v"),
            ("MP4文件", "*.mp4"),
            ("AVI文件", "*.avi"),
            ("MOV文件", "*.mov"),
            ("所有文件", "*.*")
        ]

        file_paths = filedialog.askopenfilenames(
            title="选择影片文件（可多选）",
            filetypes=file_types
        )

        for file_path in file_paths:
            try:
                path = Path(file_path)

                # 檢查文件格式
                if path.suffix.lower() not in SUPPORTED_VIDEO_FORMATS:
                    messagebox.showwarning("警告", f"不支持的影片格式: {path.suffix}")
                    continue

                # 檢查文件大小（限制為100MB）
                file_size = path.stat().st_size
                if file_size > 100 * 1024 * 1024:
                    messagebox.showwarning("警告", f"影片文件过大: {path.name}\n最大支持100MB")
                    continue

                # 讀取影片文件
                with open(file_path, 'rb') as f:
                    video_data = f.read()

                # 獲取MIME類型
                mime_type, _ = mimetypes.guess_type(file_path)

                self.selected_videos.append({
                    'data': video_data,
                    'source': f'文件: {path.name}',
                    'name': path.name,
                    'size': file_size,
                    'format': path.suffix.lower(),
                    'mime_type': mime_type or 'video/mp4'
                })

            except Exception as e:
                messagebox.showerror("错误", f"无法读取影片文件 {Path(file_path).name}: {str(e)}")

        self.update_video_preview()

    def paste_from_clipboard(self):
        """从剪贴板粘贴图片"""
        try:
            from PIL import ImageGrab
            img = ImageGrab.grabclipboard()

            if img:
                buffer = io.BytesIO()
                img.save(buffer, format='PNG')
                image_data = buffer.getvalue()

                self.selected_images.append({
                    'data': image_data,
                    'source': '剪贴板',
                    'size': img.size,
                    'image': img
                })

                self.update_image_preview()
            else:
                messagebox.showwarning("警告", "剪贴板中没有图片数据")

        except Exception as e:
            messagebox.showerror("错误", f"无法从剪贴板获取图片: {str(e)}")

    def clear_all_images(self):
        """清除所有选择的图片"""
        self.selected_images = []
        self.update_image_preview()

    def clear_all_videos(self):
        """清除所有选择的影片 - 新增功能"""
        self.selected_videos = []
        self.update_video_preview()

    def update_image_preview(self):
        """更新图片预览显示"""
        # 清除现有预览
        for widget in self.image_preview_frame.winfo_children():
            widget.destroy()

        if not self.selected_images:
            # 显示未选择图片的提示
            no_image_label = tk.Label(
                self.image_preview_frame,
                text="未选择图片",
                bg="#f8f9fa",
                fg="#95a5a6",
                font=("Microsoft YaHei", 10)
            )
            no_image_label.pack(pady=20)
        else:
            # 显示所有图片预览
            for i, img_info in enumerate(self.selected_images):
                try:
                    # 创建单个图片预览容器
                    img_container = tk.Frame(self.image_preview_frame, bg="#ffffff", relief=tk.RAISED, bd=1)
                    img_container.pack(side=tk.LEFT, padx=5, pady=5)

                    # 创建缩略图
                    img_copy = img_info['image'].copy()
                    img_copy.thumbnail((80, 60), Image.Resampling.LANCZOS)

                    # 转换为tkinter可用的格式
                    photo = ImageTk.PhotoImage(img_copy)

                    # 图片标签
                    img_label = tk.Label(img_container, image=photo, bg="#ffffff")
                    img_label.image = photo  # 保持引用
                    img_label.pack(padx=3, pady=3)

                    # 图片信息
                    info_text = f"{img_info['source']}\n{img_info['size'][0]}x{img_info['size'][1]}"
                    info_label = tk.Label(
                        img_container,
                        text=info_text,
                        font=("Microsoft YaHei", 7),
                        bg="#ffffff",
                        fg="#7f8c8d"
                    )
                    info_label.pack(pady=(0, 3))

                    # 删除按钮
                    del_btn = tk.Button(
                        img_container,
                        text="×",
                        command=lambda idx=i: self.remove_image(idx),
                        font=("Arial", 8, "bold"),
                        bg="#e74c3c",
                        fg="white",
                        width=2,
                        relief=tk.FLAT,
                        cursor="hand2"
                    )
                    del_btn.pack(pady=(0, 3))

                except Exception as e:
                    print(f"图片预览更新失败: {e}")

    def update_video_preview(self):
        """更新影片预览显示 - 新增功能"""
        # 清除现有预览
        for widget in self.video_preview_frame.winfo_children():
            widget.destroy()

        if not self.selected_videos:
            # 显示未选择影片的提示
            no_video_label = tk.Label(
                self.video_preview_frame,
                text="未选择影片",
                bg="#f8f9fa",
                fg="#95a5a6",
                font=("Microsoft YaHei", 10)
            )
            no_video_label.pack(pady=10)
        else:
            # 显示所有影片信息
            for i, vid_info in enumerate(self.selected_videos):
                try:
                    # 创建单个影片信息容器
                    vid_container = tk.Frame(self.video_preview_frame, bg="#ffffff", relief=tk.RAISED, bd=1)
                    vid_container.pack(fill=tk.X, padx=5, pady=2)

                    # 影片图标和信息
                    info_frame = tk.Frame(vid_container, bg="#ffffff")
                    info_frame.pack(fill=tk.X, padx=10, pady=5)

                    # 影片图标
                    icon_label = tk.Label(
                        info_frame,
                        text="🎬",
                        font=("Arial", 16),
                        bg="#ffffff"
                    )
                    icon_label.pack(side=tk.LEFT, padx=(0, 10))

                    # 影片信息
                    size_mb = vid_info['size'] / 1024 / 1024
                    info_text = f"文件: {vid_info['name']}\n格式: {vid_info['format']}\n大小: {size_mb:.1f}MB"
                    info_label = tk.Label(
                        info_frame,
                        text=info_text,
                        font=("Microsoft YaHei", 8),
                        bg="#ffffff",
                        fg="#2c3e50",
                        justify=tk.LEFT
                    )
                    info_label.pack(side=tk.LEFT, fill=tk.X, expand=True)

                    # 删除按钮
                    del_btn = tk.Button(
                        info_frame,
                        text="删除",
                        command=lambda idx=i: self.remove_video(idx),
                        font=("Microsoft YaHei", 7),
                        bg="#e74c3c",
                        fg="white",
                        relief=tk.FLAT,
                        cursor="hand2"
                    )
                    del_btn.pack(side=tk.RIGHT, padx=(10, 0))

                except Exception as e:
                    print(f"影片预览更新失败: {e}")

    def remove_image(self, index):
        """删除指定索引的图片"""
        if 0 <= index < len(self.selected_images):
            self.selected_images.pop(index)
            self.update_image_preview()

    def remove_video(self, index):
        """删除指定索引的影片 - 新增功能"""
        if 0 <= index < len(self.selected_videos):
            self.selected_videos.pop(index)
            self.update_video_preview()

    def submit_feedback(self):
        """提交反馈"""
        # 获取文本内容
        text_content = self.text_widget.get(1.0, tk.END).strip()
        if text_content == "请在此输入您的反馈、建议或问题...":
            text_content = ""

        # 检查是否有内容
        has_text = bool(text_content)
        has_images = bool(self.selected_images)
        has_videos = bool(self.selected_videos)  # 新增：檢查影片

        if not has_text and not has_images and not has_videos:
            messagebox.showwarning("警告", "请至少提供文字反馈、图片反馈或影片反馈")
            return

        # 准备结果数据
        result = {
            'success': True,
            'text_feedback': text_content if has_text else None,
            'images': [img['data'] for img in self.selected_images] if has_images else None,
            'image_sources': [img['source'] for img in self.selected_images] if has_images else None,
            'videos': [vid['data'] for vid in self.selected_videos] if has_videos else None,  # 新增：影片數據
            'video_info': [{  # 新增：影片信息
                'name': vid['name'],
                'size': vid['size'],
                'format': vid['format'],
                'mime_type': vid['mime_type'],
                'source': vid['source']
            } for vid in self.selected_videos] if has_videos else None,
            'has_text': has_text,
            'has_images': has_images,
            'has_videos': has_videos,  # 新增：影片標記
            'image_count': len(self.selected_images),
            'video_count': len(self.selected_videos),  # 新增：影片數量
            'timestamp': datetime.now().isoformat()
        }

        self.result_queue.put(result)
        self.root.destroy()

    def cancel(self):
        """取消操作"""
        self.result_queue.put({
            'success': False,
            'message': '用户取消了反馈提交'
        })
        self.root.destroy()


@mcp.tool()
def collect_feedback(work_summary: str = "", timeout_seconds: int = DIALOG_TIMEOUT) -> list:
    """
    收集用户反馈的交互式工具。AI可以汇报完成的工作，用户可以提供文字、图片和/或影片反馈。

    Args:
        work_summary: AI完成的工作内容汇报
        timeout_seconds: 对话框超时时间（秒），默认300秒（5分钟）

    Returns:
        包含用户反馈内容的列表，可能包含文本、图片和影片
    """
    dialog = FeedbackDialog(work_summary, timeout_seconds)
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
        for image_data, source in zip(result['images'], result['image_sources']):
            feedback_items.append(MCPImage(data=image_data, format='png'))
            # 添加图片描述
            from mcp.types import TextContent
            feedback_items.append(TextContent(
                type="text",
                text=f"图片来源: {source}"
            ))

    # 添加影片反馈信息 - 新增功能
    if result['has_videos']:
        from mcp.types import TextContent
        for i, video_info in enumerate(result['video_info']):
            # 由于MCP可能不直接支持视频，我们提供视频的详细信息
            video_text = f"""影片 {i+1} 信息：
文件名: {video_info['name']}
来源: {video_info['source']}
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
    用户可以选择本地图片文件，或者先截图到剪贴板然后粘贴。
    """
    # 使用简化的对话框只选择图片
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
    返回影片文件的基本信息。
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

                    if file_size > 100 * 1024 * 1024:  # 100MB限制
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

        # 说明文字
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


@mcp.tool()
def get_video_data(video_path: str) -> str:
    """
    读取指定路径的影片文件数据（返回base64编码）

    Args:
        video_path: 影片文件路径

    Returns:
        影片文件的base64编码数据和信息
    """
    try:
        path = Path(video_path)
        if not path.exists():
            return f"文件不存在: {video_path}"

        if path.suffix.lower() not in SUPPORTED_VIDEO_FORMATS:
            return f"不支持的影片格式: {path.suffix}"

        file_size = path.stat().st_size
        if file_size > 100 * 1024 * 1024:  # 100MB限制
            return f"影片文件过大: {file_size / 1024 / 1024:.1f} MB，最大支持100MB"

        # 读取文件并编码为base64
        with open(path, 'rb') as f:
            video_data = f.read()

        encoded_data = base64.b64encode(video_data).decode('utf-8')

        mime_type, _ = mimetypes.guess_type(video_path)

        return f"""影片数据已读取：
文件名: {path.name}
大小: {file_size / 1024 / 1024:.1f} MB
格式: {path.suffix.lower()}
MIME类型: {mime_type or 'video/mp4'}
Base64数据长度: {len(encoded_data)} 字符

Base64编码数据:
{encoded_data[:100]}...（已截断显示，完整数据可用于进一步处理）

注意：完整的base64数据可用于影片分析、转换或其他处理。"""

    except Exception as e:
        return f"读取影片数据失败: {str(e)}"


@mcp.tool()
def get_image_info(image_path: str) -> str:
    """
    获取指定路径图片的信息（尺寸、格式等）

    Args:
        image_path: 图片文件路径
    """
    try:
        path = Path(image_path)
        if not path.exists():
            return f"文件不存在: {image_path}"

        with Image.open(path) as img:
            info = {
                "文件名": path.name,
                "格式": img.format,
                "尺寸": f"{img.width} x {img.height}",
                "模式": img.mode,
                "文件大小": f"{path.stat().st_size / 1024:.1f} KB"
            }
            return "\n".join([f"{k}: {v}" for k, v in info.items()])
    except Exception as e:
        return f"获取图片信息失败: {str(e)}"


@mcp.tool()
def get_video_info(video_path: str) -> str:
    """
    获取指定路径影片的基本信息

    Args:
        video_path: 影片文件路径
    """
    try:
        path = Path(video_path)
        if not path.exists():
            return f"文件不存在: {video_path}"

        if path.suffix.lower() not in SUPPORTED_VIDEO_FORMATS:
            return f"不支持的影片格式: {path.suffix}"

        file_size = path.stat().st_size
        mime_type, _ = mimetypes.guess_type(video_path)

        info = {
            "文件名": path.name,
            "格式": path.suffix.lower(),
            "文件大小": f"{file_size / 1024 / 1024:.1f} MB",
            "MIME类型": mime_type or 'video/mp4',
            "创建时间": datetime.fromtimestamp(path.stat().st_ctime).strftime('%Y-%m-%d %H:%M:%S'),
            "修改时间": datetime.fromtimestamp(path.stat().st_mtime).strftime('%Y-%m-%d %H:%M:%S')
        }

        return "\n".join([f"{k}: {v}" for k, v in info.items()])

    except Exception as e:
        return f"获取影片信息失败: {str(e)}"


if __name__ == "__main__":
    mcp.run()

def main():
    """Main entry point for the enhanced-mcp-feedback-collector command."""
    mcp.run()
