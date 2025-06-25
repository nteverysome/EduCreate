#!/usr/bin/env python3
"""
簡單的 pick_video 功能演示

模擬 pick_image 的使用方式，讓用戶選擇影片文件
"""

import tkinter as tk
from tkinter import filedialog, messagebox
from pathlib import Path
import mimetypes

def pick_video():
    """
    彈出影片選擇對話框，讓用戶選擇影片文件
    就像 pick_image 一樣簡單易用
    
    Returns:
        dict: 影片文件信息，如果取消則返回 None
    """
    
    # 創建隱藏的根窗口
    root = tk.Tk()
    root.withdraw()  # 隱藏主窗口
    
    try:
        # 定義支持的影片格式
        video_formats = [
            ("影片文件", "*.mp4 *.avi *.mov *.wmv *.flv *.webm *.mkv *.m4v"),
            ("MP4文件", "*.mp4"),
            ("AVI文件", "*.avi"),
            ("MOV文件", "*.mov"),
            ("WMV文件", "*.wmv"),
            ("所有文件", "*.*")
        ]
        
        # 彈出文件選擇對話框
        file_path = filedialog.askopenfilename(
            title="🎬 選擇影片文件",
            filetypes=video_formats,
            initialdir=".",
        )
        
        if not file_path:
            print("❌ 未選擇影片文件")
            return None
        
        # 獲取文件信息
        path = Path(file_path)
        file_size = path.stat().st_size
        mime_type, _ = mimetypes.guess_type(file_path)
        
        # 檢查文件大小（限制100MB）
        max_size = 100 * 1024 * 1024  # 100MB
        if file_size > max_size:
            messagebox.showwarning(
                "文件過大", 
                f"影片文件過大: {file_size / 1024 / 1024:.1f} MB\n最大支持: 100 MB"
            )
            return None
        
        # 檢查是否為影片文件
        video_extensions = {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'}
        if path.suffix.lower() not in video_extensions:
            messagebox.showwarning(
                "格式不支持", 
                f"不支持的文件格式: {path.suffix}\n支持的格式: {', '.join(video_extensions)}"
            )
            return None
        
        # 構建返回信息
        video_info = {
            'name': path.name,
            'path': str(path.absolute()),
            'size': file_size,
            'size_mb': round(file_size / 1024 / 1024, 1),
            'format': path.suffix.lower(),
            'mime_type': mime_type or 'video/mp4'
        }
        
        # 顯示成功信息
        success_msg = f"""✅ 影片選擇成功！

📁 文件名: {video_info['name']}
📏 大小: {video_info['size_mb']} MB
🎬 格式: {video_info['format']}
📍 路徑: {video_info['path']}
🏷️ MIME類型: {video_info['mime_type']}"""
        
        messagebox.showinfo("影片選擇成功", success_msg)
        
        return video_info
        
    except Exception as e:
        messagebox.showerror("錯誤", f"選擇影片時發生錯誤: {str(e)}")
        return None
    
    finally:
        root.destroy()

def get_video_info_text(video_info):
    """
    將影片信息格式化為文本
    
    Args:
        video_info (dict): 影片信息字典
        
    Returns:
        str: 格式化的影片信息文本
    """
    if not video_info:
        return "未選擇影片文件"
    
    return f"""影片文件信息：
文件名: {video_info['name']}
路徑: {video_info['path']}
大小: {video_info['size_mb']} MB
格式: {video_info['format']}
MIME類型: {video_info['mime_type']}

注意：影片文件已選擇，可進行進一步處理。"""

def demo_pick_video():
    """演示 pick_video 功能"""
    print("🎬 pick_video 功能演示")
    print("=" * 40)
    print("即將彈出影片選擇對話框...")
    print("支持格式: MP4, AVI, MOV, WMV, WebM, MKV 等")
    print("最大文件: 100MB")
    print()
    
    # 調用 pick_video 功能
    video_info = pick_video()
    
    if video_info:
        print("🎉 影片選擇成功！")
        print("-" * 40)
        print(get_video_info_text(video_info))
        print()
        
        # 詢問是否要查看更多操作
        root = tk.Tk()
        root.withdraw()
        
        result = messagebox.askyesno(
            "後續操作", 
            "影片已選擇！\n\n是否要演示更多功能？\n• 讀取影片數據\n• 分析影片信息\n• 模擬 AI 處理"
        )
        
        if result:
            demo_video_processing(video_info)
        
        root.destroy()
        
    else:
        print("❌ 未選擇影片或操作取消")

def demo_video_processing(video_info):
    """演示影片處理功能"""
    print("\n🔧 影片處理演示")
    print("=" * 40)
    
    # 模擬讀取影片數據
    print("📖 正在讀取影片數據...")
    print(f"   文件大小: {video_info['size_mb']} MB")
    print(f"   預計處理時間: {video_info['size_mb'] * 0.1:.1f} 秒")
    
    # 模擬 AI 分析
    print("\n🤖 AI 分析中...")
    print("   🔍 檢測影片格式和編碼")
    print("   🎮 分析遊戲機制和效果")
    print("   🎨 識別視覺風格和動畫")
    print("   ⚡ 評估性能和優化建議")
    
    # 模擬分析結果
    analysis_result = f"""
🎯 影片分析結果：

📁 文件信息：
• 文件名: {video_info['name']}
• 格式: {video_info['format'].upper()}
• 大小: {video_info['size_mb']} MB

🎮 內容分析：
• 遊戲類型: 飛機射擊遊戲
• 移動方式: 垂直滑動控制
• 視覺效果: 2D/3D 混合
• 動畫流暢度: 高

💡 改進建議：
• 增強物理引擎
• 添加粒子效果
• 優化動畫過渡
• 提升響應速度

🚀 可應用改進：
• 實現流暢的飛機移動
• 添加 3D 視覺效果
• 增強爆炸動畫
• 優化遊戲性能
"""
    
    print(analysis_result)
    
    # 顯示結果對話框
    root = tk.Tk()
    root.withdraw()
    
    messagebox.showinfo(
        "🎯 AI 分析完成", 
        f"影片分析已完成！\n\n基於您的影片內容，AI 已生成改進建議。\n\n文件: {video_info['name']}\n大小: {video_info['size_mb']} MB\n\n可以將這些建議應用到遊戲開發中！"
    )
    
    root.destroy()

def main():
    """主函數"""
    print("🚀 Simple Pick Video Demo")
    print("模擬 pick_image 的使用方式")
    print("=" * 50)
    
    try:
        demo_pick_video()
    except Exception as e:
        print(f"❌ 演示失敗: {e}")
    
    print("\n🎉 演示完成！")
    print("\n💡 使用方法：")
    print("from simple_pick_video import pick_video")
    print("video_info = pick_video()")
    print("print(get_video_info_text(video_info))")

if __name__ == "__main__":
    main()
