#!/usr/bin/env python3
"""
檢查是否接收到影片數據
"""

import sys
from pathlib import Path

# 添加模組路徑
sys.path.insert(0, str(Path(__file__).parent))

def check_video_data():
    """檢查影片數據狀態"""
    try:
        from direct_video_collector import COLLECTED_VIDEO_DATA
        
        print("🔍 檢查影片數據狀態...")
        
        if COLLECTED_VIDEO_DATA is not None:
            print("✅ 檢測到影片數據！")
            print(f"📊 數據結構: {type(COLLECTED_VIDEO_DATA)}")
            
            # 檢查各個字段
            text_feedback = COLLECTED_VIDEO_DATA.get('text_feedback', '')
            videos = COLLECTED_VIDEO_DATA.get('videos', [])
            video_info = COLLECTED_VIDEO_DATA.get('video_info', [])
            timestamp = COLLECTED_VIDEO_DATA.get('timestamp', '')
            
            print(f"💬 文字反饋: {'有' if text_feedback else '無'}")
            print(f"🎬 影片數量: {len(videos)}")
            print(f"📋 影片信息數量: {len(video_info)}")
            print(f"⏰ 時間戳: {timestamp}")
            
            if text_feedback:
                print(f"📝 反饋內容: {text_feedback[:100]}...")
            
            if video_info:
                print("\n📁 影片文件信息:")
                for i, info in enumerate(video_info):
                    name = info.get('name', '未知')
                    size = info.get('size', 0)
                    format_type = info.get('format', '未知')
                    print(f"  {i+1}. {name} ({size/1024/1024:.1f}MB, {format_type})")
            
            if videos:
                print(f"\n💾 影片數據大小:")
                for i, video_data in enumerate(videos):
                    print(f"  影片 {i+1}: {len(video_data)} bytes")
            
            return True
        else:
            print("❌ 沒有檢測到影片數據")
            print("💡 可能的原因:")
            print("  • 還沒有上傳影片")
            print("  • 沒有點擊提交按鈕")
            print("  • 對話框被關閉了")
            print("  • 影片收集器沒有正常運行")
            return False
            
    except ImportError as e:
        print(f"❌ 無法導入模組: {e}")
        print("💡 請確保 direct_video_collector.py 存在")
        return False
    except Exception as e:
        print(f"❌ 檢查過程中發生錯誤: {e}")
        return False

def main():
    """主函數"""
    print("🎬 Enhanced MCP Video Feedback Collector")
    print("影片數據接收狀態檢查")
    print("=" * 50)
    
    has_data = check_video_data()
    
    print("\n" + "=" * 50)
    if has_data:
        print("🎉 影片數據接收成功！")
        print("✅ 可以進行影片分析")
    else:
        print("⏳ 等待影片上傳...")
        print("💡 請在對話框中:")
        print("  1. 點擊 '🎬 選擇影片文件'")
        print("  2. 選擇您的影片文件")
        print("  3. 點擊 '✅ 提交給AI分析'")

if __name__ == "__main__":
    main()
