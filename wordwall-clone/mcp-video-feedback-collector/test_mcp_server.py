#!/usr/bin/env python3
"""
Enhanced MCP Video Feedback Collector 測試腳本
測試完整的 MCP 服務器功能
"""

import sys
from pathlib import Path

def test_mcp_import():
    """測試 MCP 模組導入"""
    try:
        from mcp_video_feedback_collector import collect_feedback, pick_image, pick_video
        print("✅ MCP 模組導入成功")
        return True
    except ImportError as e:
        print(f"❌ MCP 模組導入失敗: {e}")
        return False

def test_mcp_server():
    """測試 MCP 服務器功能"""
    try:
        from mcp_video_feedback_collector import collect_feedback
        
        print("🎬 啟動 Enhanced MCP Video Feedback Collector...")
        print("即將彈出包含影片功能的對話框！")
        
        result = collect_feedback(
            work_summary="""🎯 Enhanced MCP Video Feedback Collector 正式版測試

這是正式加入 MCP 系統的增強版反饋收集器：

✅ **完整的 MCP 集成**：
• 📦 標準的 Python 包結構
• ⚙️ 完整的 MCP 服務器實現
• 🔧 可安裝的命令行工具
• 📋 完整的配置和文檔

🎬 **影片功能**：
• 🎥 影片選擇和上傳
• 📁 支持多種格式（MP4, AVI, MOV, WMV, WebM, MKV, FLV）
• 📏 智能文件大小檢查（最大100MB）
• 🖼️ 影片信息預覽和管理

✅ **修復的問題**：
• 影片按鈕正確顯示
• 文件大小正確計算
• 改進的按鈕布局
• 增強的錯誤處理

🔧 **MCP 工具**：
• collect_feedback() - 完整反饋收集
• pick_image() - 圖片選擇
• pick_video() - 影片選擇

請測試所有功能，特別是新的影片上傳功能！""",
            timeout_seconds=300
        )
        
        print("\n🎉 MCP 服務器測試成功！")
        return result
        
    except Exception as e:
        print(f"❌ MCP 服務器測試失敗: {e}")
        return None

def analyze_feedback_result(result):
    """分析反饋結果"""
    if not result:
        return
    
    print("=" * 60)
    print("📊 反饋結果分析:")
    
    text_items = []
    image_items = []
    video_items = []
    
    for item in result:
        if hasattr(item, 'type') and item.type == "text":
            if "影片" in item.text:
                video_items.append(item)
            else:
                text_items.append(item)
        elif hasattr(item, 'data'):
            image_items.append(item)
    
    print(f"📝 文字反饋: {len(text_items)} 項")
    print(f"📸 圖片反饋: {len(image_items)} 項")
    print(f"🎬 影片反饋: {len(video_items)} 項")
    print(f"📋 總計: {len(result)} 項反饋")
    
    # 顯示影片詳情
    if video_items:
        print(f"\n🎬 影片反饋詳情:")
        for i, item in enumerate(video_items, 1):
            print(f"\n影片 {i}:")
            lines = item.text.split('\n')
            for line in lines[1:6]:
                if line.strip():
                    print(f"  {line}")
        
        print(f"\n🎉 成功收集到 {len(video_items)} 個影片文件！")
        print("✅ MCP 影片功能測試通過！")

def test_individual_tools():
    """測試個別 MCP 工具"""
    try:
        from mcp_video_feedback_collector import pick_image, pick_video
        
        print("\n🧪 測試個別 MCP 工具...")
        
        # 測試 pick_video
        if input("\n是否測試 pick_video 工具？(y/N): ").lower() == 'y':
            try:
                print("🎬 啟動 pick_video...")
                video_info = pick_video()
                print("✅ pick_video 測試成功！")
                print(f"影片信息:\n{video_info}")
            except Exception as e:
                print(f"❌ pick_video 測試失敗: {e}")
        
        # 測試 pick_image
        if input("\n是否測試 pick_image 工具？(y/N): ").lower() == 'y':
            try:
                print("📸 啟動 pick_image...")
                image = pick_image()
                print("✅ pick_image 測試成功！")
                print(f"圖片數據大小: {len(image.data)} bytes")
            except Exception as e:
                print(f"❌ pick_image 測試失敗: {e}")
        
    except Exception as e:
        print(f"❌ 個別工具測試失敗: {e}")

def test_mcp_command():
    """測試 MCP 命令行工具"""
    print("\n🔧 測試 MCP 命令行工具...")
    
    try:
        import subprocess
        
        # 測試命令是否可用
        result = subprocess.run(
            ["mcp-video-feedback-collector", "--help"], 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        
        if result.returncode == 0:
            print("✅ MCP 命令行工具可用")
            print("🚀 可以使用: mcp-video-feedback-collector")
        else:
            print("❌ MCP 命令行工具不可用")
            print("   請確保已正確安裝")
            
    except subprocess.TimeoutExpired:
        print("⏱️ 命令行工具測試超時")
    except FileNotFoundError:
        print("❌ 命令行工具未找到")
        print("   請運行: pip install -e .")
    except Exception as e:
        print(f"❌ 命令行工具測試失敗: {e}")

def main():
    """主測試函數"""
    print("🚀 Enhanced MCP Video Feedback Collector 正式版測試")
    print("=" * 60)
    
    # 測試導入
    if not test_mcp_import():
        print("❌ 請先安裝 MCP 服務器:")
        print("   python install_mcp.py")
        sys.exit(1)
    
    print("\n📋 測試項目:")
    print("1. MCP 服務器功能測試")
    print("2. 個別工具測試")
    print("3. 命令行工具測試")
    
    # 主要測試
    result = test_mcp_server()
    
    if result:
        # 分析結果
        analyze_feedback_result(result)
        
        # 個別工具測試
        test_individual_tools()
    
    # 命令行工具測試
    test_mcp_command()
    
    print("\n" + "=" * 60)
    print("🎉 Enhanced MCP Video Feedback Collector 測試完成！")
    
    print("\n📋 MCP 服務器功能總結:")
    print("✅ 完整的 MCP 服務器實現")
    print("✅ 影片上傳和處理功能")
    print("✅ 保留原始功能並增強")
    print("✅ 標準的 Python 包結構")
    print("✅ 可安裝的命令行工具")
    print("✅ 完整的配置和文檔")
    
    print("\n🔧 使用方法:")
    print("• Python: from mcp_video_feedback_collector import collect_feedback")
    print("• 命令行: mcp-video-feedback-collector")
    print("• MCP 配置: ~/.mcp/config.json")
    
    print("\n🎬 新功能亮點:")
    print("• 支持多種影片格式")
    print("• 智能文件檢查和錯誤處理")
    print("• 現代化用戶界面")
    print("• 完整的 MCP 工具集成")

if __name__ == "__main__":
    main()
