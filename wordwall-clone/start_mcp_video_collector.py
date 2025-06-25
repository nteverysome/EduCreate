#!/usr/bin/env python3
"""
Enhanced MCP Video Feedback Collector 快速啟動腳本
"""

import sys
from pathlib import Path

def quick_start():
    """快速啟動 MCP 反饋收集器"""
    try:
        # 添加 MCP 路徑
        mcp_path = Path(__file__).parent / "mcp-video-feedback-collector" / "src"
        sys.path.insert(0, str(mcp_path))
        
        # 導入並啟動
        from mcp_video_feedback_collector import collect_feedback
        
        print("🚀 Enhanced MCP Video Feedback Collector")
        print("=" * 50)
        print("🎬 支持影片上傳的增強版反饋收集器")
        print("✅ 已加入 MCP 系統")
        
        # 啟動反饋收集器
        result = collect_feedback(
            work_summary="""🎉 Enhanced MCP Video Feedback Collector 已成功加入 MCP 系統！

✅ **完成的工作**：
• 📦 創建完整的 MCP 包結構
• 🔧 修復按鈕顯示和文件大小問題
• 📋 添加完整的文檔和配置
• ⚙️ 實現標準的 MCP 服務器
• 🎬 集成影片上傳功能

🎯 **MCP 系統集成**：
• 標準的 Python 包結構
• 可安裝的命令行工具
• 完整的 MCP 工具實現
• 配置文件和文檔

🎬 **影片功能**：
• 支持 MP4, AVI, MOV, WMV, WebM, MKV, FLV
• 智能文件檢查（最大100MB）
• 現代化用戶界面
• 完整的錯誤處理

現在您可以：
1. 測試影片上傳功能
2. 提供反饋和建議
3. 上傳相關文件
4. 體驗完整的 MCP 集成

請測試所有功能並提供您的反饋！""",
            timeout_seconds=300
        )
        
        print("\n🎉 MCP 反饋收集成功！")
        
        # 分析結果
        if result:
            video_count = sum(1 for item in result if hasattr(item, 'type') and item.type == "text" and "影片" in item.text)
            image_count = sum(1 for item in result if hasattr(item, 'data'))
            text_count = len(result) - video_count - image_count
            
            print(f"📊 收集結果: {text_count} 文字, {image_count} 圖片, {video_count} 影片")
            
            if video_count > 0:
                print("🎬 影片功能測試成功！")
        
        return result
        
    except ImportError as e:
        print(f"❌ 導入失敗: {e}")
        print("\n🔧 請先安裝 MCP 服務器:")
        print("cd mcp-video-feedback-collector")
        print("python install_mcp.py")
        return None
    except Exception as e:
        print(f"❌ 啟動失敗: {e}")
        return None

def main():
    """主函數"""
    print("🎬 Enhanced MCP Video Feedback Collector 快速啟動")
    print("基於原始 mcp-feedback-collector 的增強版本")
    print("=" * 60)
    
    result = quick_start()
    
    if result:
        print("\n✅ MCP 系統集成成功！")
        print("\n📋 可用功能:")
        print("• collect_feedback() - 完整反饋收集")
        print("• pick_image() - 圖片選擇")
        print("• pick_video() - 影片選擇")
        
        print("\n🚀 使用方法:")
        print("from mcp_video_feedback_collector import collect_feedback")
        print("feedback = collect_feedback('工作汇报')")
    else:
        print("\n❌ 啟動失敗，請檢查安裝")

if __name__ == "__main__":
    main()
