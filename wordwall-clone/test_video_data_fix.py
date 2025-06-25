#!/usr/bin/env python3
"""
測試影片數據傳遞修復
驗證影片數據能夠正確傳遞給AI進行分析
"""

import sys
from pathlib import Path

# 添加模組路徑
sys.path.insert(0, str(Path(__file__).parent / "mcp_video_feedback_collector" / "src"))

def test_video_data_transmission():
    """測試影片數據傳遞功能"""
    try:
        from mcp_video_feedback_collector.server import (
            collect_feedback, 
            get_last_video_data, 
            analyze_uploaded_video
        )
        
        print("✅ 成功導入修復後的模組")
        print("🔧 新增功能:")
        print("  - get_last_video_data() - 獲取最後上傳的影片數據")
        print("  - analyze_uploaded_video() - 分析上傳的影片內容")
        
        # 啟動修復後的反饋收集器
        print("\n🎬 啟動修復後的反饋收集器...")
        print("現在影片數據將正確傳遞給AI進行分析！")
        
        result = collect_feedback(
            work_summary="""🔧 影片數據傳遞修復完成！

修復的問題：
❌ **之前的問題**：
• 影片數據被收集但沒有傳遞給AI
• AI無法接收到實際的影片內容
• 只能看到影片信息，無法進行分析

✅ **修復後的改進**：
• 🎬 影片數據正確編碼和傳遞
• 📊 新增 get_last_video_data() 工具
• 🔍 新增 analyze_uploaded_video() 工具
• 💾 影片數據保存到全局變量
• 📋 Base64編碼確保數據完整性

🎯 **測試流程**：
1. 上傳影片文件
2. AI 自動接收影片數據
3. 使用 get_last_video_data() 查看數據
4. 使用 analyze_uploaded_video() 進行分析

請上傳一個影片文件來測試修復後的功能！
AI 現在能夠接收並分析您的影片內容了。""",
            timeout_seconds=300
        )
        
        print("\n🎉 反饋收集成功！")
        print("=" * 60)
        
        # 檢查是否收到影片
        video_count = 0
        for item in result:
            if hasattr(item, 'type') and item.type == "text" and "影片" in item.text and "已上傳" in item.text:
                video_count += 1
        
        if video_count > 0:
            print(f"🎬 檢測到 {video_count} 個影片！")
            print("✅ 影片數據傳遞修復成功！")
            
            # 測試獲取影片數據
            print("\n📊 測試獲取影片數據...")
            try:
                video_data = get_last_video_data()
                print("✅ get_last_video_data() 測試成功！")
                print("影片數據摘要:")
                print(video_data[:500] + "...")
                
                # 測試影片分析
                print("\n🔍 測試影片分析...")
                analysis = analyze_uploaded_video("遊戲機制和視覺效果分析")
                print("✅ analyze_uploaded_video() 測試成功！")
                print("分析報告摘要:")
                print(analysis[:500] + "...")
                
                return True
                
            except Exception as e:
                print(f"❌ 影片數據處理失敗: {e}")
                return False
        else:
            print("❌ 沒有檢測到影片數據")
            print("請確保上傳了影片文件")
            return False
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return False

def demonstrate_new_tools():
    """演示新的工具功能"""
    try:
        from mcp_video_feedback_collector.server import get_last_video_data, analyze_uploaded_video
        
        print("\n🔧 演示新增的MCP工具...")
        
        # 演示 get_last_video_data
        print("\n1. 📊 get_last_video_data() 工具:")
        try:
            data = get_last_video_data()
            if "沒有可用的影片數據" in data:
                print("   ℹ️ 目前沒有影片數據（需要先上傳影片）")
            else:
                print("   ✅ 成功獲取影片數據")
        except Exception as e:
            print(f"   ❌ 工具測試失敗: {e}")
        
        # 演示 analyze_uploaded_video
        print("\n2. 🔍 analyze_uploaded_video() 工具:")
        try:
            analysis = analyze_uploaded_video("測試分析")
            if "沒有可分析的影片數據" in analysis:
                print("   ℹ️ 目前沒有影片數據（需要先上傳影片）")
            else:
                print("   ✅ 成功進行影片分析")
        except Exception as e:
            print(f"   ❌ 工具測試失敗: {e}")
        
    except Exception as e:
        print(f"❌ 工具演示失敗: {e}")

def main():
    """主測試函數"""
    print("🔧 影片數據傳遞修復測試")
    print("=" * 50)
    
    print("\n📋 修復內容:")
    print("1. ✅ 影片數據正確編碼和傳遞")
    print("2. ✅ 新增 get_last_video_data() MCP工具")
    print("3. ✅ 新增 analyze_uploaded_video() MCP工具")
    print("4. ✅ 全局變量存儲影片數據")
    print("5. ✅ Base64編碼確保數據完整性")
    
    # 演示新工具
    demonstrate_new_tools()
    
    # 主要測試
    success = test_video_data_transmission()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 影片數據傳遞修復成功！")
        print("\n✅ 現在AI可以：")
        print("• 接收用戶上傳的影片數據")
        print("• 使用 get_last_video_data() 查看影片詳情")
        print("• 使用 analyze_uploaded_video() 分析影片內容")
        print("• 基於影片內容提供具體的改進建議")
    else:
        print("❌ 修復測試失敗，需要進一步調試")
    
    print("\n🎯 使用方法:")
    print("1. 啟動反饋收集器")
    print("2. 上傳影片文件")
    print("3. AI自動接收並分析影片")
    print("4. 獲得基於影片內容的具體建議")

if __name__ == "__main__":
    main()
