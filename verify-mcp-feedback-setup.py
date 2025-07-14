#!/usr/bin/env python3
"""
驗證 MCP 反饋收集器設置
檢查配置是否正確並測試功能
"""

import json
import sys
import os
import subprocess
from pathlib import Path

def check_config_file():
    """檢查配置文件"""
    print("🔍 檢查 MCP 配置文件...")
    
    config_file = Path("claude_desktop_config.json")
    
    if not config_file.exists():
        print("❌ 找不到 claude_desktop_config.json")
        return False
    
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        if "mcpServers" not in config:
            print("❌ 配置文件中沒有 mcpServers 部分")
            return False
        
        if "mcp-feedback-collector" not in config["mcpServers"]:
            print("❌ 配置文件中沒有 mcp-feedback-collector")
            return False
        
        feedback_config = config["mcpServers"]["mcp-feedback-collector"]
        
        print("✅ 找到 mcp-feedback-collector 配置:")
        print(f"   命令: {feedback_config.get('command', 'N/A')}")
        print(f"   參數: {feedback_config.get('args', [])}")
        print(f"   環境變量: {feedback_config.get('env', {})}")
        
        # 檢查服務器文件是否存在
        if "args" in feedback_config and feedback_config["args"]:
            server_path = Path(feedback_config["args"][0])
            if server_path.exists():
                print(f"✅ 服務器文件存在: {server_path}")
            else:
                print(f"❌ 服務器文件不存在: {server_path}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ 讀取配置文件失敗: {e}")
        return False

def test_server_startup():
    """測試服務器啟動"""
    print("\n🧪 測試服務器啟動...")
    
    server_path = Path("mcp-feedback-collector/src/mcp_feedback_collector/server.py")
    
    if not server_path.exists():
        print(f"❌ 服務器文件不存在: {server_path}")
        return False
    
    try:
        # 測試服務器是否可以啟動
        env = os.environ.copy()
        env.update({
            "PYTHONIOENCODING": "utf-8",
            "MCP_DIALOG_TIMEOUT": "10",  # 短超時用於測試
            "PYTHONPATH": str(Path("mcp-feedback-collector/src"))
        })
        
        process = subprocess.Popen(
            [sys.executable, str(server_path)],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # 等待短時間
        import time
        time.sleep(3)
        
        if process.poll() is None:
            print("✅ 服務器啟動成功")
            process.terminate()
            process.wait()
            return True
        else:
            stdout, stderr = process.communicate()
            print(f"❌ 服務器啟動失敗")
            if stderr:
                print(f"   錯誤: {stderr}")
            return False
            
    except Exception as e:
        print(f"❌ 測試服務器啟動失敗: {e}")
        return False

def check_dependencies():
    """檢查依賴"""
    print("\n🔍 檢查依賴...")
    
    required_modules = ["mcp", "PIL", "tkinter"]
    missing = []
    
    for module in required_modules:
        try:
            if module == "PIL":
                import PIL
            elif module == "tkinter":
                import tkinter
            elif module == "mcp":
                import mcp
            print(f"✅ {module} 可用")
        except ImportError:
            print(f"❌ {module} 不可用")
            missing.append(module)
    
    if missing:
        print(f"\n⚠️ 缺少依賴: {missing}")
        print("安裝命令:")
        for module in missing:
            if module == "PIL":
                print("   pip install pillow")
            elif module == "mcp":
                print("   pip install mcp")
            # tkinter 通常是 Python 內建的
        return False
    
    return True

def generate_restart_instructions():
    """生成重啟指示"""
    print("\n📋 重啟 Augment 指示:")
    print("1. 關閉當前的 Augment 會話")
    print("2. 重新啟動 Augment")
    print("3. 等待 MCP 服務器載入")
    print("4. 測試調用 mcp-feedback-collector.collect_feedback")
    
    print("\n🎯 測試命令:")
    print("   調用工具: mcp-feedback-collector.collect_feedback")
    print("   參數: work_summary='測試反饋收集功能'")

def main():
    """主函數"""
    
    print("🎯 MCP 反饋收集器設置驗證")
    print("=" * 50)
    
    all_checks_passed = True
    
    # 檢查配置文件
    if not check_config_file():
        all_checks_passed = False
    
    # 檢查依賴
    if not check_dependencies():
        all_checks_passed = False
    
    # 測試服務器啟動
    if not test_server_startup():
        all_checks_passed = False
    
    print("\n" + "=" * 50)
    
    if all_checks_passed:
        print("🎉 所有檢查通過！")
        print("\n✅ MCP 反饋收集器已正確配置")
        print("✅ 所有依賴都可用")
        print("✅ 服務器可以正常啟動")
        
        print("\n🚀 下一步:")
        generate_restart_instructions()
        
    else:
        print("❌ 部分檢查失敗")
        print("\n🔧 請修復上述問題後重新運行此腳本")
    
    return all_checks_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
