#!/usr/bin/env python3
"""
創建測試影片文件
用於測試影片收集器的功能
"""

import cv2
import numpy as np
from pathlib import Path

def create_test_video():
    """創建一個簡單的測試影片"""
    try:
        # 影片參數
        width, height = 640, 480
        fps = 30
        duration = 3  # 3秒
        total_frames = fps * duration
        
        # 創建影片寫入器
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        output_path = Path(__file__).parent / "test_game_demo.mp4"
        out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
        
        print(f"🎬 正在創建測試影片: {output_path}")
        
        for frame_num in range(total_frames):
            # 創建背景
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            frame[:] = (20, 50, 100)  # 深藍色背景
            
            # 添加移動的飛機（白色矩形）
            plane_x = int((frame_num / total_frames) * (width - 60)) + 30
            plane_y = height // 2
            cv2.rectangle(frame, (plane_x-20, plane_y-10), (plane_x+20, plane_y+10), (255, 255, 255), -1)
            
            # 添加一些"雲朵"（灰色圓圈）
            for i in range(3):
                cloud_x = (i * 200 + frame_num * 2) % width
                cloud_y = 100 + i * 50
                cv2.circle(frame, (cloud_x, cloud_y), 30, (200, 200, 200), -1)
            
            # 添加文字
            cv2.putText(frame, f"Game Demo Frame {frame_num+1}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(frame, "Airplane Flying Test", (10, height-20), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
            
            out.write(frame)
        
        out.release()
        
        # 檢查文件
        if output_path.exists():
            file_size = output_path.stat().st_size
            print(f"✅ 測試影片創建成功!")
            print(f"📁 文件路徑: {output_path}")
            print(f"📏 文件大小: {file_size / 1024:.1f} KB")
            print(f"🎞️ 影片規格: {width}x{height}, {fps}fps, {duration}秒")
            return str(output_path)
        else:
            print("❌ 影片創建失敗")
            return None
            
    except ImportError:
        print("❌ 需要安裝 opencv-python: pip install opencv-python")
        return None
    except Exception as e:
        print(f"❌ 創建影片時發生錯誤: {e}")
        return None

def create_simple_test_video():
    """創建一個更簡單的測試影片（不依賴opencv）"""
    try:
        # 創建一個小的測試文件來模擬影片
        output_path = Path(__file__).parent / "simple_test_video.mp4"
        
        # 創建一個包含一些二進制數據的文件來模擬影片
        test_data = b'\x00\x00\x00\x20ftypmp42\x00\x00\x00\x00mp42isom'  # MP4 header
        test_data += b'\x00' * 1000  # 添加一些數據
        test_data += b'Test video content for AI analysis'
        test_data += b'\x00' * 500
        
        with open(output_path, 'wb') as f:
            f.write(test_data)
        
        file_size = output_path.stat().st_size
        print(f"✅ 簡單測試影片創建成功!")
        print(f"📁 文件路徑: {output_path}")
        print(f"📏 文件大小: {file_size / 1024:.1f} KB")
        
        return str(output_path)
        
    except Exception as e:
        print(f"❌ 創建簡單測試影片失敗: {e}")
        return None

def main():
    """主函數"""
    print("🎬 創建測試影片用於驗證影片收集器")
    print("=" * 50)
    
    # 嘗試創建真實的影片
    video_path = create_test_video()
    
    # 如果失敗，創建簡單的測試文件
    if video_path is None:
        print("\n🔄 嘗試創建簡單測試影片...")
        video_path = create_simple_test_video()
    
    if video_path:
        print(f"\n🎯 測試影片已準備就緒: {video_path}")
        print("現在可以使用這個文件來測試影片收集器!")
    else:
        print("\n❌ 無法創建測試影片")

if __name__ == "__main__":
    main()
