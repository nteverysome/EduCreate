#!/usr/bin/env python3
"""
Enhanced MCP Feedback Collector 安裝腳本

自動安裝增強版 MCP 反饋收集器及其依賴
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
        "pillow>=9.0.0",
        "mcp>=1.0.0", 
        "fastmcp>=0.2.0"
    ]
    
    print("📦 安裝基礎依賴...")
    for dep in dependencies:
        if not run_command(f"pip install {dep}", f"安裝 {dep}"):
            return False
    
    return True

def install_optional_dependencies():
    """安裝可選依賴"""
    print("\n🎬 是否安裝影片處理增強功能？")
    print("   包含: opencv-python, moviepy, ffmpeg-python")
    
    if input("安裝影片處理功能？(y/N): ").lower() == 'y':
        video_deps = [
            "opencv-python>=4.8.0",
            "moviepy>=1.0.3", 
            "ffmpeg-python>=0.2.0"
        ]
        
        for dep in video_deps:
            run_command(f"pip install {dep}", f"安裝 {dep}")
    
    print("\n🛠️ 是否安裝開發工具？")
    print("   包含: pytest, black, isort, mypy, flake8")
    
    if input("安裝開發工具？(y/N): ").lower() == 'y':
        dev_deps = [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "isort>=5.12.0",
            "mypy>=1.0.0",
            "flake8>=6.0.0"
        ]
        
        for dep in dev_deps:
            run_command(f"pip install {dep}", f"安裝 {dep}")

def install_package():
    """安裝主包"""
    print("\n📦 安裝 Enhanced MCP Feedback Collector...")
    
    # 檢查是否在項目目錄中
    if Path("pyproject.toml").exists():
        # 開發模式安裝
        return run_command("pip install -e .", "開發模式安裝")
    else:
        print("❌ 未找到 pyproject.toml 文件")
        print("   請確保在項目根目錄中運行此腳本")
        return False

def test_installation():
    """測試安裝"""
    print("\n🧪 測試安裝...")
    
    test_code = """
try:
    from mcp_feedback_collector.enhanced_server import collect_feedback
    print("✅ Enhanced MCP Feedback Collector 導入成功")
    
    from mcp_feedback_collector import __version__
    print(f"✅ 版本: {__version__}")
    
    import tkinter
    print("✅ Tkinter 可用")
    
    from PIL import Image
    print("✅ Pillow 可用")
    
    print("🎉 安裝測試通過！")
except ImportError as e:
    print(f"❌ 導入失敗: {e}")
    exit(1)
except Exception as e:
    print(f"❌ 測試失敗: {e}")
    exit(1)
"""
    
    return run_command(f'python -c "{test_code}"', "安裝測試")

def create_desktop_shortcut():
    """創建桌面快捷方式（Windows）"""
    if sys.platform == "win32":
        print("\n🖥️ 是否創建桌面測試快捷方式？")
        if input("創建快捷方式？(y/N): ").lower() == 'y':
            try:
                import winshell
                from win32com.client import Dispatch
                
                desktop = winshell.desktop()
                path = os.path.join(desktop, "Enhanced MCP Test.lnk")
                target = sys.executable
                wDir = str(Path(__file__).parent)
                arguments = str(Path(__file__).parent / "test_enhanced_mcp.py")
                
                shell = Dispatch('WScript.Shell')
                shortcut = shell.CreateShortCut(path)
                shortcut.Targetpath = target
                shortcut.Arguments = arguments
                shortcut.WorkingDirectory = wDir
                shortcut.IconLocation = target
                shortcut.save()
                
                print("✅ 桌面快捷方式創建成功")
            except ImportError:
                print("ℹ️ 需要安裝 pywin32 和 winshell 來創建快捷方式")
                print("   運行: pip install pywin32 winshell")
            except Exception as e:
                print(f"❌ 快捷方式創建失敗: {e}")

def main():
    """主安裝函數"""
    print("🚀 Enhanced MCP Feedback Collector 安裝程序")
    print("=" * 60)
    
    # 檢查 Python 版本
    if not check_python_version():
        sys.exit(1)
    
    # 安裝依賴
    if not install_dependencies():
        print("❌ 依賴安裝失敗，請檢查網絡連接和權限")
        sys.exit(1)
    
    # 安裝可選依賴
    install_optional_dependencies()
    
    # 安裝主包
    if not install_package():
        print("❌ 主包安裝失敗")
        sys.exit(1)
    
    # 測試安裝
    if not test_installation():
        print("❌ 安裝測試失敗")
        sys.exit(1)
    
    # 創建快捷方式
    create_desktop_shortcut()
    
    print("\n" + "=" * 60)
    print("🎉 安裝完成！")
    print("\n📋 安裝總結：")
    print("✅ Enhanced MCP Feedback Collector 已成功安裝")
    print("✅ 所有依賴包已安裝")
    print("✅ 功能測試通過")
    
    print("\n🚀 使用方法：")
    print("1. 運行測試: python test_enhanced_mcp.py")
    print("2. 在代碼中使用:")
    print("   from mcp_feedback_collector.enhanced_server import collect_feedback")
    print("   feedback = collect_feedback('工作汇报')")
    
    print("\n📚 更多信息請查看 README.md")
    
    # 詢問是否立即運行測試
    if input("\n是否立即運行功能測試？(y/N): ").lower() == 'y':
        test_script = Path(__file__).parent / "test_enhanced_mcp.py"
        if test_script.exists():
            os.system(f"python {test_script}")
        else:
            print("❌ 測試腳本未找到")

if __name__ == "__main__":
    main()
