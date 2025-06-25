#!/usr/bin/env python3
"""
Enhanced MCP Feedback Collector 測試腳本

這個腳本演示如何使用增強版的 MCP 反饋收集器
"""

import sys
import os
import time
from pathlib import Path

# 添加源碼路徑
sys.path.insert(0, str(Path(__file__).parent / "src"))

try:
    from mcp_feedback_collector.enhanced_server import (
        collect_feedback,
        pick_image,
        pick_video,
        get_image_info,
        get_video_info,
        EnhancedFeedbackDialog
    )
    print("✅ 成功導入 Enhanced MCP Feedback Collector")
except ImportError as e:
    print(f"❌ 導入失敗: {e}")
    print("請確保已安裝所需依賴：pip install pillow mcp fastmcp")
    sys.exit(1)

def test_basic_functionality():
    """測試基本功能"""
    print("\n🧪 測試基本功能...")
    
    try:
        # 測試對話框創建
        dialog = EnhancedFeedbackDialog(
            work_summary="這是一個測試工作汇报",
            timeout_seconds=30
        )
        print("✅ 對話框創建成功")
        
        # 測試支持的格式
        from mcp_feedback_collector.enhanced_server import SUPPORTED_IMAGE_FORMATS, SUPPORTED_VIDEO_FORMATS
        print(f"✅ 支持的圖片格式: {SUPPORTED_IMAGE_FORMATS}")
        print(f"✅ 支持的影片格式: {SUPPORTED_VIDEO_FORMATS}")
        
    except Exception as e:
        print(f"❌ 基本功能測試失敗: {e}")

def test_image_functionality():
    """測試圖片功能"""
    print("\n🖼️ 測試圖片功能...")
    
    try:
        print("點擊確定後將彈出圖片選擇對話框...")
        input("按 Enter 繼續...")
        
        # 測試圖片選擇
        try:
            image = pick_image()
            print("✅ 圖片選擇功能正常")
            print(f"圖片數據大小: {len(image.data)} bytes")
        except Exception as e:
            print(f"ℹ️ 圖片選擇取消或失敗: {e}")
        
    except Exception as e:
        print(f"❌ 圖片功能測試失敗: {e}")

def test_video_functionality():
    """測試影片功能"""
    print("\n🎬 測試影片功能...")
    
    try:
        print("點擊確定後將彈出影片選擇對話框...")
        input("按 Enter 繼續...")
        
        # 測試影片選擇
        try:
            video_info = pick_video()
            print("✅ 影片選擇功能正常")
            print(f"影片信息:\n{video_info}")
        except Exception as e:
            print(f"ℹ️ 影片選擇取消或失敗: {e}")
        
    except Exception as e:
        print(f"❌ 影片功能測試失敗: {e}")

def test_feedback_collection():
    """測試反饋收集功能"""
    print("\n💬 測試反饋收集功能...")
    
    try:
        print("點擊確定後將彈出反饋收集對話框...")
        print("您可以測試以下功能：")
        print("- 輸入文字反饋")
        print("- 上傳圖片（文件或剪貼板）")
        print("- 上傳影片文件")
        print("- 組合使用多種反饋方式")
        input("按 Enter 繼續...")
        
        # 測試反饋收集
        try:
            feedback = collect_feedback(
                work_summary="""
🎮 Enhanced MCP Feedback Collector 測試

功能測試項目：
✅ 文字反饋收集
✅ 圖片上傳和預覽
✅ 影片上傳和處理
✅ 現代化用戶界面
✅ 多媒體組合反饋

請測試各項功能並提供反饋！
                """,
                timeout_seconds=120
            )
            
            print("✅ 反饋收集成功！")
            print(f"收到 {len(feedback)} 項反饋內容")
            
            for i, item in enumerate(feedback):
                if hasattr(item, 'type'):
                    if item.type == "text":
                        print(f"  {i+1}. 文字反饋: {item.text[:100]}...")
                    elif item.type == "image":
                        print(f"  {i+1}. 圖片數據: {len(item.data)} bytes")
                else:
                    print(f"  {i+1}. 其他內容: {str(item)[:100]}...")
                    
        except Exception as e:
            print(f"ℹ️ 反饋收集取消或超時: {e}")
        
    except Exception as e:
        print(f"❌ 反饋收集測試失敗: {e}")

def test_file_info():
    """測試文件信息功能"""
    print("\n📄 測試文件信息功能...")
    
    # 創建測試文件
    test_dir = Path(__file__).parent / "test_files"
    test_dir.mkdir(exist_ok=True)
    
    # 創建測試圖片
    try:
        from PIL import Image
        test_img = Image.new('RGB', (100, 100), color='red')
        test_img_path = test_dir / "test_image.png"
        test_img.save(test_img_path)
        
        # 測試圖片信息
        img_info = get_image_info(str(test_img_path))
        print(f"✅ 圖片信息獲取成功:\n{img_info}")
        
        # 清理測試文件
        test_img_path.unlink()
        
    except Exception as e:
        print(f"❌ 圖片信息測試失敗: {e}")
    
    # 測試不存在的影片文件
    try:
        video_info = get_video_info("nonexistent_video.mp4")
        print(f"✅ 影片信息處理: {video_info}")
    except Exception as e:
        print(f"❌ 影片信息測試失敗: {e}")

def main():
    """主測試函數"""
    print("🚀 Enhanced MCP Feedback Collector 測試開始")
    print("=" * 60)
    
    # 運行各項測試
    test_basic_functionality()
    test_file_info()
    
    # 交互式測試
    print("\n" + "=" * 60)
    print("🎯 交互式功能測試")
    print("以下測試需要用戶交互，您可以選擇跳過")
    
    if input("\n是否測試圖片功能？(y/N): ").lower() == 'y':
        test_image_functionality()
    
    if input("\n是否測試影片功能？(y/N): ").lower() == 'y':
        test_video_functionality()
    
    if input("\n是否測試完整反饋收集功能？(y/N): ").lower() == 'y':
        test_feedback_collection()
    
    print("\n" + "=" * 60)
    print("🎉 測試完成！")
    print("\n📋 功能總結：")
    print("✅ 支持文字、圖片、影片三種反饋方式")
    print("✅ 現代化的用戶界面設計")
    print("✅ 多媒體文件預覽和管理")
    print("✅ 大文件處理和進度顯示")
    print("✅ 完整的錯誤處理機制")
    print("\n🚀 Enhanced MCP Feedback Collector 已準備就緒！")

if __name__ == "__main__":
    main()
