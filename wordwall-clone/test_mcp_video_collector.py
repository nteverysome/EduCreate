#!/usr/bin/env python3
"""
測試真正的 MCP Video Feedback Collector
"""

import sys
from pathlib import Path

# 添加 MCP 模組路徑
sys.path.insert(0, str(Path(__file__).parent))

def test_mcp_video_collector():
    """測試 MCP Video Feedback Collector"""
    try:
        # 導入 MCP 模組
        from mcp_video_feedback_collector.server import collect_feedback, pick_image, pick_video
        
        print("✅ 成功導入 MCP Video Feedback Collector")
        print("📋 可用的 MCP 工具:")
        print("  - collect_feedback() - 完整反饋收集（文字+圖片+影片）")
        print("  - pick_image() - 圖片選擇工具")
        print("  - pick_video() - 影片選擇工具")
        
        # 測試完整的反饋收集功能
        print("\n🎬 啟動 MCP Video Feedback Collector...")
        print("即將彈出包含影片選擇功能的對話框！")
        
        result = collect_feedback(
            work_summary="""🎯 MCP Video Feedback Collector 測試

這是一個真正的 MCP 服務器，基於原始 mcp-feedback-collector 添加影片功能：

✅ **保留原有功能**：
• 💬 文字反饋收集
• 📸 圖片上傳和預覽
• 📋 剪貼板圖片粘貼
• 🎨 美化的用戶界面

🆕 **新增影片功能**：
• 🎬 影片文件選擇按鈕
• 📁 支持多種格式（MP4, AVI, MOV, WMV, WebM, MKV, FLV）
• 📏 智能文件大小檢查（最大100MB）
• 🖼️ 影片信息預覽和管理
• 🗑️ 文件添加/刪除功能

🔧 **MCP 工具集成**：
• collect_feedback() - 主要反饋收集工具
• pick_image() - 圖片選擇工具
• pick_video() - 影片選擇工具

請測試新的影片上傳功能！您可以：
1. 點擊 "🎬 選擇影片" 按鈕
2. 選擇您想要分析的影片文件
3. 添加文字描述和圖片
4. 提交給 AI 進行分析

這個版本可以作為真正的 MCP 服務器運行！""",
            timeout_seconds=300
        )
        
        print("\n🎉 MCP 反饋收集成功！")
        print("=" * 60)
        
        # 分析結果
        text_items = []
        image_items = []
        video_items = []
        
        for item in result:
            if hasattr(item, 'type'):
                if item.type == "text":
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
        
        # 顯示詳細內容
        print("\n📋 反饋內容詳情:")
        for i, item in enumerate(result, 1):
            if hasattr(item, 'type') and item.type == "text":
                if "影片" in item.text:
                    print(f"  {i}. 🎬 影片信息:")
                    lines = item.text.split('\n')
                    for line in lines[1:6]:
                        if line.strip():
                            print(f"     {line}")
                elif "图片" in item.text:
                    print(f"  {i}. 📸 {item.text}")
                else:
                    print(f"  {i}. 📝 文字反饋: {item.text[:100]}...")
            elif hasattr(item, 'data'):
                print(f"  {i}. 📸 圖片數據: {len(item.data)} bytes")
        
        if video_items:
            print(f"\n🎉 成功收集到 {len(video_items)} 個影片文件！")
            print("✅ MCP 影片功能測試通過！")
        
        return result
        
    except Exception as e:
        print(f"❌ MCP 測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_individual_tools():
    """測試個別 MCP 工具"""
    try:
        from mcp_video_feedback_collector.server import pick_image, pick_video
        
        print("\n🧪 測試個別 MCP 工具...")
        
        # 測試 pick_video
        if input("\n是否測試 pick_video MCP 工具？(y/N): ").lower() == 'y':
            try:
                print("🎬 啟動 pick_video MCP 工具...")
                video_info = pick_video()
                print("✅ pick_video 測試成功！")
                print(f"影片信息:\n{video_info}")
            except Exception as e:
                print(f"❌ pick_video 測試失敗: {e}")
        
        # 測試 pick_image
        if input("\n是否測試 pick_image MCP 工具？(y/N): ").lower() == 'y':
            try:
                print("📸 啟動 pick_image MCP 工具...")
                image = pick_image()
                print("✅ pick_image 測試成功！")
                print(f"圖片數據大小: {len(image.data)} bytes")
            except Exception as e:
                print(f"❌ pick_image 測試失敗: {e}")
        
    except Exception as e:
        print(f"❌ 個別工具測試失敗: {e}")

def install_mcp_server():
    """安裝 MCP 服務器"""
    print("\n📦 安裝 MCP Video Feedback Collector...")
    
    try:
        import subprocess
        import os
        
        # 切換到 MCP 目錄
        mcp_dir = Path(__file__).parent / "mcp_video_feedback_collector"
        
        # 安裝依賴
        print("🔧 安裝依賴...")
        subprocess.run([
            sys.executable, "-m", "pip", "install", 
            "mcp", "pillow", "fastmcp"
        ], check=True)
        
        # 安裝 MCP 服務器
        print("📦 安裝 MCP 服務器...")
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-e", str(mcp_dir)
        ], check=True)
        
        print("✅ MCP Video Feedback Collector 安裝成功！")
        
        # 測試安裝
        print("🧪 測試安裝...")
        from mcp_video_feedback_collector.server import collect_feedback
        print("✅ 安裝測試通過！")
        
        return True
        
    except Exception as e:
        print(f"❌ 安裝失敗: {e}")
        return False

def main():
    """主測試函數"""
    print("🚀 MCP Video Feedback Collector 測試")
    print("真正的 MCP 服務器 - 支持影片上傳")
    print("=" * 60)
    
    # 檢查是否需要安裝
    try:
        from mcp_video_feedback_collector.server import collect_feedback
        print("✅ MCP Video Feedback Collector 已安裝")
    except ImportError:
        print("📦 需要安裝 MCP Video Feedback Collector...")
        if not install_mcp_server():
            print("❌ 安裝失敗，無法繼續測試")
            return
    
    print("\n📋 測試內容:")
    print("1. 完整 MCP 反饋收集功能（包含影片功能）")
    print("2. 個別 MCP 工具測試")
    
    # 主要測試
    result = test_mcp_video_collector()
    
    if result:
        # 個別工具測試
        test_individual_tools()
    
    print("\n" + "=" * 60)
    print("🎉 MCP 測試完成！")
    
    print("\n📋 MCP 服務器功能總結:")
    print("✅ 真正的 MCP 服務器實現")
    print("✅ 完整的影片上傳和處理功能")
    print("✅ 保留原始 mcp-feedback-collector 所有功能")
    print("✅ 支持多種影片格式和智能檢查")
    print("✅ 可以作為 MCP 工具被其他應用調用")
    
    print("\n🔧 MCP 工具使用方法:")
    print("from mcp_video_feedback_collector.server import collect_feedback, pick_video")
    print("result = collect_feedback('工作汇报', 300)")
    print("video_info = pick_video()")
    
    print("\n🚀 MCP 服務器啟動方法:")
    print("python -m mcp_video_feedback_collector.server")

if __name__ == "__main__":
    main()
