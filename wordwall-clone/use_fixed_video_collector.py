#!/usr/bin/env python3
"""
使用修復後的影片反饋收集器
現在AI可以正確接收和分析影片數據
"""

import sys
from pathlib import Path

# 添加模組路徑
sys.path.insert(0, str(Path(__file__).parent / "mcp_video_feedback_collector" / "src"))

def use_enhanced_video_collector():
    """使用修復後的增強版影片收集器"""
    try:
        from mcp_video_feedback_collector.server import (
            collect_feedback, 
            get_last_video_data, 
            analyze_uploaded_video
        )
        
        print("🎬 Enhanced MCP Video Feedback Collector - 修復版")
        print("=" * 60)
        print("✅ 影片數據傳遞問題已修復")
        print("✅ AI現在可以接收和分析您的影片")
        
        # 啟動修復後的反饋收集器
        print("\n🚀 啟動修復後的反饋收集器...")
        
        result = collect_feedback(
            work_summary="""🎉 影片數據傳遞修復完成！

現在AI可以正確接收和分析您上傳的影片了！

🔧 **修復的核心問題**：
• 之前：影片數據收集但沒有傳遞給AI
• 現在：影片數據正確編碼並傳遞給AI

✅ **新增的分析能力**：
• 📊 自動接收影片的Base64編碼數據
• 🔍 基於影片內容進行詳細分析
• 💡 提供具體的改進建議
• 🎮 針對遊戲機制的專業分析

🎯 **請上傳您的影片**：
• 遊戲演示影片
• 期望效果參考影片
• 需要分析的任何影片內容

AI將立即分析您的影片並提供：
• 遊戲機制分析
• 視覺效果評估
• 性能優化建議
• 具體的實現方案

現在就上傳您的影片，讓AI為您進行專業分析！""",
            timeout_seconds=300
        )
        
        print("\n🎉 反饋收集完成！")
        print("=" * 60)
        
        # 檢查是否收到影片並進行分析
        video_received = False
        for item in result:
            if hasattr(item, 'type') and item.type == "text":
                if "影片" in item.text and "已上傳" in item.text:
                    video_received = True
                    print("🎬 檢測到影片上傳！")
                    print("📊 影片信息:")
                    # 顯示影片信息的前幾行
                    lines = item.text.split('\n')
                    for line in lines[:8]:
                        if line.strip():
                            print(f"   {line}")
                    break
        
        if video_received:
            print("\n🔍 正在進行影片分析...")
            
            # 獲取詳細的影片數據
            try:
                video_data = get_last_video_data()
                print("✅ 成功獲取影片數據")
                
                # 進行影片分析
                analysis = analyze_uploaded_video("全面分析遊戲機制、視覺效果和性能")
                print("✅ 影片分析完成")
                
                print("\n📋 影片分析報告:")
                print("=" * 60)
                print(analysis)
                
                return True
                
            except Exception as e:
                print(f"❌ 影片分析失敗: {e}")
                return False
        else:
            print("ℹ️ 沒有檢測到影片上傳")
            print("💡 提示：請在對話框中點擊 '🎬 選擇影片' 按鈕上傳影片")
            return False
        
    except Exception as e:
        print(f"❌ 啟動失敗: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主函數"""
    print("🎬 Enhanced MCP Video Feedback Collector")
    print("修復版 - AI現在可以分析您的影片了！")
    print("=" * 60)
    
    print("\n🔧 修復內容:")
    print("• ✅ 影片數據正確傳遞給AI")
    print("• ✅ Base64編碼確保數據完整性")
    print("• ✅ 新增影片數據獲取工具")
    print("• ✅ 新增影片內容分析工具")
    print("• ✅ 全面的影片分析報告")
    
    print("\n🎯 使用流程:")
    print("1. 點擊 '🎬 選擇影片' 按鈕")
    print("2. 選擇您想要分析的影片文件")
    print("3. AI自動接收並分析影片內容")
    print("4. 獲得詳細的分析報告和改進建議")
    
    # 啟動修復後的收集器
    success = use_enhanced_video_collector()
    
    if success:
        print("\n🎉 影片分析成功完成！")
        print("✅ AI已經分析了您的影片內容")
        print("✅ 提供了具體的改進建議")
    else:
        print("\n💡 使用提示:")
        print("• 確保選擇了影片文件")
        print("• 支持的格式：MP4, AVI, MOV, WMV, WebM, MKV, FLV")
        print("• 最大文件大小：100MB")

if __name__ == "__main__":
    main()
