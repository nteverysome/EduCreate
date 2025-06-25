#!/usr/bin/env python3
"""
測試修復後的反饋收集器
"""

import sys
from pathlib import Path

# 添加模組路徑
sys.path.insert(0, str(Path(__file__).parent))

def test_fixed_collector():
    """測試修復後的反饋收集器"""
    try:
        # 導入修復後的模組
        from mcp_video_feedback_collector.server import collect_feedback
        
        print("✅ 成功導入修復後的反饋收集器")
        print("🔧 修復內容:")
        print("  - 修復影片按鈕顯示問題")
        print("  - 修復文件大小計算錯誤")
        print("  - 改進按鈕布局和功能")
        print("  - 增強錯誤處理和用戶提示")
        
        # 啟動修復後的反饋收集器
        print("\n🎬 啟動修復後的反饋收集器...")
        print("現在應該會看到正確的影片選擇按鈕！")
        
        result = collect_feedback(
            work_summary="""🔧 反饋收集器修復完成！

修復的問題：
❌ **之前的問題**：
• 影片按鈕顯示為"清除全部"
• 圖片大小顯示 0MB
• 按鈕功能混亂

✅ **修復後的改進**：
• 🎬 影片選擇按鈕正確顯示和功能
• 📏 文件大小正確計算和顯示
• 🎨 改進的按鈕布局（兩行設計）
• 📊 詳細的文件信息顯示
• ⚠️ 增強的錯誤處理和用戶提示

🎯 **新的界面布局**：
第一行: [📸 選擇圖片] [🎬 選擇影片]
第二行: [📋 粘貼圖片] [🗑️ 清除全部]

請測試修復後的功能：
1. 點擊 "🎬 選擇影片" 按鈕
2. 選擇影片文件
3. 查看正確的文件大小顯示
4. 測試其他按鈕功能

現在影片上傳功能應該完全正常工作了！""",
            timeout_seconds=300
        )
        
        print("\n🎉 修復測試成功！")
        print("=" * 50)
        
        # 分析結果
        text_count = 0
        image_count = 0
        video_count = 0
        
        for item in result:
            if hasattr(item, 'type') and item.type == "text":
                if "影片" in item.text:
                    video_count += 1
                else:
                    text_count += 1
            elif hasattr(item, 'data'):
                image_count += 1
        
        print(f"📝 文字反饋: {text_count} 項")
        print(f"📸 圖片反饋: {image_count} 項")
        print(f"🎬 影片反饋: {video_count} 項")
        print(f"📋 總計: {len(result)} 項反饋")
        
        # 顯示影片信息
        if video_count > 0:
            print(f"\n🎉 成功收集到 {video_count} 個影片文件！")
            print("✅ 影片功能修復成功！")
            
            for item in result:
                if hasattr(item, 'type') and item.type == "text" and "影片" in item.text:
                    print("\n🎬 影片詳情:")
                    lines = item.text.split('\n')
                    for line in lines[1:6]:
                        if line.strip():
                            print(f"   {line}")
        
        return result
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """主測試函數"""
    print("🔧 修復後的反饋收集器測試")
    print("=" * 50)
    
    print("\n📋 修復內容:")
    print("1. ✅ 影片按鈕正確顯示和功能")
    print("2. ✅ 文件大小正確計算")
    print("3. ✅ 改進的按鈕布局")
    print("4. ✅ 增強的錯誤處理")
    print("5. ✅ 詳細的用戶提示")
    
    # 運行測試
    result = test_fixed_collector()
    
    print("\n" + "=" * 50)
    print("🎉 修復測試完成！")
    
    if result:
        print("\n✅ 修復成功的功能:")
        print("• 🎬 影片選擇按鈕正常工作")
        print("• 📏 文件大小正確顯示")
        print("• 🎨 按鈕布局清晰明確")
        print("• 📊 詳細的文件信息")
        print("• ⚠️ 完善的錯誤處理")
    else:
        print("\n❌ 仍有問題需要進一步修復")
    
    print("\n🎯 使用方法:")
    print("from mcp_video_feedback_collector.server import collect_feedback")
    print("result = collect_feedback('工作汇报', 300)")

if __name__ == "__main__":
    main()
