#!/usr/bin/env python3
"""
創建簡單的測試文件來模擬影片
"""

from pathlib import Path
import random

def create_test_files():
    """創建測試文件"""
    try:
        # 創建測試影片文件
        video_path = Path(__file__).parent / "test_airplane_game.mp4"
        
        # 創建一個模擬的MP4文件
        # 包含MP4文件頭和一些測試數據
        mp4_header = bytes([
            0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,  # ftyp box
            0x6D, 0x70, 0x34, 0x32, 0x00, 0x00, 0x00, 0x00,  # mp42
            0x6D, 0x70, 0x34, 0x32, 0x69, 0x73, 0x6F, 0x6D   # mp42isom
        ])
        
        # 添加一些隨機數據來模擬影片內容
        video_content = b"Test airplane game video content for AI analysis\n"
        video_content += b"This video shows:\n"
        video_content += b"- Airplane movement patterns\n"
        video_content += b"- Game physics simulation\n"
        video_content += b"- User interface elements\n"
        video_content += b"- Visual effects and animations\n"
        
        # 添加更多數據使文件看起來像真實的影片
        for i in range(100):
            frame_data = f"Frame {i:03d}: airplane at position ({i*5}, {100 + i%50})\n".encode()
            video_content += frame_data
            
        # 添加一些隨機二進制數據
        random_data = bytes([random.randint(0, 255) for _ in range(2000)])
        
        full_content = mp4_header + video_content + random_data
        
        with open(video_path, 'wb') as f:
            f.write(full_content)
        
        file_size = video_path.stat().st_size
        print(f"✅ 測試影片創建成功!")
        print(f"📁 文件: {video_path.name}")
        print(f"📏 大小: {file_size / 1024:.1f} KB")
        
        # 創建第二個測試文件
        video_path2 = Path(__file__).parent / "test_game_effects.avi"
        
        avi_header = b"RIFF"
        avi_content = b"AVI test file for game effects analysis\n"
        avi_content += b"Contains visual effects, animations, and UI elements\n"
        
        with open(video_path2, 'wb') as f:
            f.write(avi_header + avi_content + random_data[:1000])
        
        file_size2 = video_path2.stat().st_size
        print(f"✅ 第二個測試影片創建成功!")
        print(f"📁 文件: {video_path2.name}")
        print(f"📏 大小: {file_size2 / 1024:.1f} KB")
        
        return [str(video_path), str(video_path2)]
        
    except Exception as e:
        print(f"❌ 創建測試文件失敗: {e}")
        return []

def main():
    """主函數"""
    print("🎬 創建測試影片文件")
    print("=" * 40)
    
    test_files = create_test_files()
    
    if test_files:
        print(f"\n🎯 已創建 {len(test_files)} 個測試文件:")
        for file_path in test_files:
            print(f"  📁 {Path(file_path).name}")
        
        print("\n💡 這些文件可以用來測試影片收集器的功能")
        print("   包含模擬的遊戲內容和影片數據")
    else:
        print("\n❌ 無法創建測試文件")

if __name__ == "__main__":
    main()
