#!/usr/bin/env python3
"""
測試增強版原始反饋收集器
基於原始 mcp-feedback-collector 添加影片功能
"""

import sys
from pathlib import Path

# 添加當前目錄到路徑
sys.path.insert(0, str(Path(__file__).parent))

def test_enhanced_feedback_collector():
    """測試增強版反饋收集器"""
    try:
        # 導入增強版模組
        from enhanced_original_server import collect_feedback, pick_image, pick_video
        
        print("✅ 成功導入增強版反饋收集器")
        print("📋 可用功能:")
        print("  - collect_feedback() - 完整的反饋收集（文字+圖片+影片）")
        print("  - pick_image() - 圖片選擇")
        print("  - pick_video() - 影片選擇（新增功能）")
        
        # 測試反饋收集功能
        print("\n🎬 啟動增強版反饋收集器...")
        print("即將彈出對話框，包含影片選擇功能！")
        
        result = collect_feedback(
            work_summary="""🎯 增強版反饋收集器測試

基於原始 mcp-feedback-collector 添加的新功能：

✅ 保留原有功能：
• 文字反饋收集
• 圖片上傳和預覽
• 剪貼板圖片粘貼

🆕 新增影片功能：
• 🎬 影片文件選擇按鈕
• 📁 支持多種影片格式（MP4, AVI, MOV, WMV, WebM, MKV, FLV）
• 📏 文件大小檢查（最大100MB）
• 🖼️ 影片信息預覽
• 🗑️ 影片文件管理（添加/刪除）

請測試新的影片上傳功能！您可以：
1. 點擊 "🎥 选择影片文件" 按鈕
2. 選擇您想要分析的影片
3. 添加文字描述
4. 提交給 AI 進行分析

支持的影片格式：MP4, AVI, MOV, WMV, FLV, WebM, MKV
最大文件大小：100MB""",
            timeout_seconds=300
        )
        
        print("\n🎉 反饋收集成功！")
        print("=" * 50)
        
        # 分析結果
        print(f"📝 文字反饋: {'有' if result[0].text else '無'}")
        
        # 統計各種類型的反饋
        text_count = 0
        image_count = 0
        video_count = 0
        
        for item in result:
            if hasattr(item, 'type'):
                if item.type == "text":
                    if "影片" in item.text:
                        video_count += 1
                    else:
                        text_count += 1
            elif hasattr(item, 'data'):
                image_count += 1
        
        print(f"📸 圖片數量: {image_count}")
        print(f"🎬 影片數量: {video_count}")
        print(f"📋 總反饋項目: {len(result)}")
        
        # 顯示詳細內容
        print("\n📋 反饋內容詳情:")
        for i, item in enumerate(result, 1):
            if hasattr(item, 'type') and item.type == "text":
                if "影片" in item.text:
                    print(f"  {i}. 🎬 影片信息:")
                    # 提取影片信息
                    lines = item.text.split('\n')
                    for line in lines[1:6]:  # 顯示前幾行影片信息
                        if line.strip():
                            print(f"     {line}")
                elif "图片来源" in item.text:
                    print(f"  {i}. 📸 {item.text}")
                else:
                    print(f"  {i}. 📝 文字反饋: {item.text[:100]}...")
            elif hasattr(item, 'data'):
                print(f"  {i}. 📸 圖片數據: {len(item.data)} bytes")
        
        if video_count > 0:
            print(f"\n🎉 成功收集到 {video_count} 個影片文件！")
            print("✅ 影片功能測試通過！")
        
        return result
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_individual_functions():
    """測試個別功能"""
    try:
        from enhanced_original_server import pick_image, pick_video, get_video_info
        
        print("\n🧪 測試個別功能...")
        
        # 測試影片選擇
        if input("\n是否測試 pick_video 功能？(y/N): ").lower() == 'y':
            try:
                print("🎬 啟動 pick_video...")
                video_info = pick_video()
                print("✅ pick_video 測試成功！")
                print(f"影片信息:\n{video_info}")
            except Exception as e:
                print(f"❌ pick_video 測試失敗: {e}")
        
        # 測試圖片選擇
        if input("\n是否測試 pick_image 功能？(y/N): ").lower() == 'y':
            try:
                print("📸 啟動 pick_image...")
                image = pick_image()
                print("✅ pick_image 測試成功！")
                print(f"圖片數據大小: {len(image.data)} bytes")
            except Exception as e:
                print(f"❌ pick_image 測試失敗: {e}")
        
    except Exception as e:
        print(f"❌ 個別功能測試失敗: {e}")

def main():
    """主測試函數"""
    print("🚀 增強版原始反饋收集器測試")
    print("基於 https://github.com/sanshao85/mcp-feedback-collector")
    print("=" * 60)
    
    print("\n📋 測試內容:")
    print("1. 完整反饋收集功能（包含新的影片功能）")
    print("2. 個別功能測試")
    
    # 主要測試
    result = test_enhanced_feedback_collector()
    
    if result:
        # 個別功能測試
        test_individual_functions()
    
    print("\n" + "=" * 60)
    print("🎉 測試完成！")
    
    print("\n📋 功能總結:")
    print("✅ 保留原始 mcp-feedback-collector 的所有功能")
    print("✅ 新增影片選擇和上傳功能")
    print("✅ 支持多種影片格式")
    print("✅ 智能文件大小檢查")
    print("✅ 影片信息預覽和管理")
    print("✅ 完整的錯誤處理")
    
    print("\n🎯 使用方法:")
    print("from enhanced_original_server import collect_feedback")
    print("result = collect_feedback('工作汇报', 300)")
    
    print("\n🔧 新增的 MCP 工具:")
    print("• pick_video() - 影片選擇對話框")
    print("• get_video_data(path) - 讀取影片數據")
    print("• get_video_info(path) - 獲取影片信息")

if __name__ == "__main__":
    main()
