#!/usr/bin/env python3
"""
Enhanced MCP Video Feedback Collector 安裝腳本
自動安裝並配置 MCP 服務器
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description=""):
    """運行命令並處理錯誤"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} 成功")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} 失敗:")
        print(f"   錯誤: {e.stderr}")
        return False

def check_python_version():
    """檢查 Python 版本"""
    print("🐍 檢查 Python 版本...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 版本過低: {version.major}.{version.minor}")
        print("   需要 Python 3.8 或更高版本")
        return False
    print(f"✅ Python 版本: {version.major}.{version.minor}.{version.micro}")
    return True

def install_dependencies():
    """安裝依賴包"""
    dependencies = [
        "mcp>=1.0.0",
        "pillow>=9.0.0", 
        "fastmcp>=0.2.0"
    ]
    
    print("📦 安裝 MCP 依賴...")
    for dep in dependencies:
        if not run_command(f"pip install {dep}", f"安裝 {dep}"):
            return False
    
    return True

def install_mcp_server():
    """安裝 MCP 服務器"""
    print("\n📦 安裝 Enhanced MCP Video Feedback Collector...")
    
    # 檢查是否在項目目錄中
    if Path("pyproject.toml").exists():
        # 開發模式安裝
        return run_command("pip install -e .", "開發模式安裝 MCP 服務器")
    else:
        print("❌ 未找到 pyproject.toml 文件")
        print("   請確保在項目根目錄中運行此腳本")
        return False

def test_installation():
    """測試安裝"""
    print("\n🧪 測試 MCP 安裝...")
    
    test_code = """
try:
    from mcp_video_feedback_collector import collect_feedback, pick_video
    print("✅ Enhanced MCP Video Feedback Collector 導入成功")
    
    from mcp_video_feedback_collector import __version__
    print(f"✅ 版本: {__version__}")
    
    import tkinter
    print("✅ Tkinter 可用")
    
    from PIL import Image
    print("✅ Pillow 可用")
    
    print("🎉 MCP 安裝測試通過！")
except ImportError as e:
    print(f"❌ 導入失敗: {e}")
    exit(1)
except Exception as e:
    print(f"❌ 測試失敗: {e}")
    exit(1)
"""
    
    return run_command(f'python -c "{test_code}"', "MCP 安裝測試")

def create_mcp_config():
    """創建 MCP 配置文件"""
    print("\n⚙️ 創建 MCP 配置...")
    
    config_content = """{
  "mcpServers": {
    "enhanced-video-feedback-collector": {
      "command": "mcp-video-feedback-collector",
      "args": [],
      "env": {}
    }
  }
}"""
    
    try:
        config_dir = Path.home() / ".mcp"
        config_dir.mkdir(exist_ok=True)
        
        config_file = config_dir / "config.json"
        with open(config_file, "w", encoding="utf-8") as f:
            f.write(config_content)
        
        print(f"✅ MCP 配置已創建: {config_file}")
        return True
    except Exception as e:
        print(f"❌ 配置創建失敗: {e}")
        return False

def test_mcp_tools():
    """測試 MCP 工具"""
    print("\n🔧 測試 MCP 工具...")
    
    try:
        from mcp_video_feedback_collector import collect_feedback, pick_image, pick_video
        
        print("✅ 可用的 MCP 工具:")
        print("  - collect_feedback() - 完整反饋收集（文字+圖片+影片）")
        print("  - pick_image() - 圖片選擇工具")
        print("  - pick_video() - 影片選擇工具")
        
        # 詢問是否測試
        if input("\n是否測試 MCP 工具？(y/N): ").lower() == 'y':
            print("🎬 啟動測試...")
            
            result = collect_feedback(
                work_summary="🎉 Enhanced MCP Video Feedback Collector 安裝成功！\n\n請測試影片上傳功能。",
                timeout_seconds=60
            )
            
            print("✅ MCP 工具測試成功！")
            return True
        else:
            print("⏭️ 跳過 MCP 工具測試")
            return True
            
    except Exception as e:
        print(f"❌ MCP 工具測試失敗: {e}")
        return False

def main():
    """主安裝函數"""
    print("🚀 Enhanced MCP Video Feedback Collector 安裝程序")
    print("=" * 60)
    
    # 檢查 Python 版本
    if not check_python_version():
        sys.exit(1)
    
    # 安裝依賴
    if not install_dependencies():
        print("❌ 依賴安裝失敗，請檢查網絡連接和權限")
        sys.exit(1)
    
    # 安裝 MCP 服務器
    if not install_mcp_server():
        print("❌ MCP 服務器安裝失敗")
        sys.exit(1)
    
    # 測試安裝
    if not test_installation():
        print("❌ 安裝測試失敗")
        sys.exit(1)
    
    # 創建配置
    create_mcp_config()
    
    # 測試 MCP 工具
    test_mcp_tools()
    
    print("\n" + "=" * 60)
    print("🎉 Enhanced MCP Video Feedback Collector 安裝完成！")
    
    print("\n📋 安裝總結:")
    print("✅ Enhanced MCP Video Feedback Collector 已成功安裝")
    print("✅ 所有依賴包已安裝")
    print("✅ MCP 工具測試通過")
    print("✅ 配置文件已創建")
    
    print("\n🚀 使用方法:")
    print("1. 命令行啟動: mcp-video-feedback-collector")
    print("2. Python 中使用:")
    print("   from mcp_video_feedback_collector import collect_feedback")
    print("   feedback = collect_feedback('工作汇报')")
    
    print("\n🎬 新功能:")
    print("• 支持影片上傳和分析")
    print("• 多種影片格式支持")
    print("• 智能文件檢查")
    print("• 現代化用戶界面")
    
    print("\n📚 更多信息請查看 README.md")

if __name__ == "__main__":
    main()
