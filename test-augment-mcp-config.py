#!/usr/bin/env python3
"""
測試 Augment MCP 配置
驗證 mcp-feedback-collector 是否正確配置
"""

import json
import os
from pathlib import Path

def find_vscode_settings():
    """尋找 VS Code 設置文件"""
    
    possible_paths = [
        Path.home() / "AppData" / "Roaming" / "Code" / "User" / "settings.json",
        Path.home() / ".vscode" / "settings.json",
        Path("settings.json"),  # 當前目錄
        Path(".vscode") / "settings.json"  # 工作區設置
    ]
    
    for path in possible_paths:
        if path.exists():
            print(f"✅ 找到設置文件: {path}")
            return path
    
    print("❌ 找不到 VS Code 設置文件")
    return None

def check_augment_mcp_config():
    """檢查 Augment MCP 配置"""
    
    print("🔍 檢查 Augment MCP 配置...")
    
    settings_path = find_vscode_settings()
    if not settings_path:
        return False
    
    try:
        with open(settings_path, 'r', encoding='utf-8') as f:
            settings = json.load(f)
        
        # 檢查 augment.advanced.mcpServers
        if "augment.advanced" not in settings:
            print("❌ 設置中沒有 augment.advanced 部分")
            return False
        
        advanced = settings["augment.advanced"]
        
        if "mcpServers" not in advanced:
            print("❌ 設置中沒有 mcpServers 配置")
            return False
        
        mcp_servers = advanced["mcpServers"]
        
        # 尋找 mcp-feedback-collector
        feedback_server = None
        for server in mcp_servers:
            if server.get("name") == "mcp-feedback-collector":
                feedback_server = server
                break
        
        if not feedback_server:
            print("❌ 找不到 mcp-feedback-collector 配置")
            return False
        
        print("✅ 找到 mcp-feedback-collector 配置:")
        print(f"   名稱: {feedback_server.get('name')}")
        print(f"   命令: {feedback_server.get('command')}")
        print(f"   參數: {feedback_server.get('args', [])}")
        
        # 檢查服務器文件是否存在
        if "args" in feedback_server and feedback_server["args"]:
            server_path = Path(feedback_server["args"][0])
            if server_path.exists():
                print(f"✅ 服務器文件存在: {server_path}")
            else:
                print(f"❌ 服務器文件不存在: {server_path}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ 讀取設置文件失敗: {e}")
        return False

def generate_config_template():
    """生成配置模板"""
    
    print("\n📝 生成 Augment MCP 配置模板...")
    
    config_template = {
        "augment.advanced": {
            "mcpServers": [
                {
                    "name": "mcp-feedback-collector",
                    "command": "python",
                    "args": [
                        str(Path.cwd() / "mcp-feedback-collector" / "src" / "mcp_feedback_collector" / "server.py")
                    ],
                    "env": {
                        "PYTHONIOENCODING": "utf-8",
                        "MCP_DIALOG_TIMEOUT": "300",
                        "PYTHONPATH": str(Path.cwd() / "mcp-feedback-collector" / "src")
                    }
                }
            ]
        }
    }
    
    # 保存模板
    template_file = Path("augment-mcp-config-template.json")
    with open(template_file, 'w', encoding='utf-8') as f:
        json.dump(config_template, f, indent=4, ensure_ascii=False)
    
    print(f"✅ 配置模板已保存: {template_file}")
    
    print("\n📋 配置步驟:")
    print("1. 按 Ctrl+Shift+P")
    print("2. 選擇 'Edit Settings'")
    print("3. 點擊 'Edit in settings.json'")
    print("4. 添加以下配置到 settings.json:")
    print()
    print(json.dumps(config_template, indent=4, ensure_ascii=False))
    print()
    print("5. 保存文件並重啟 VS Code")
    
    return template_file

def main():
    """主函數"""
    
    print("🎯 Augment MCP 配置測試工具")
    print("=" * 50)
    
    # 檢查當前配置
    config_exists = check_augment_mcp_config()
    
    if not config_exists:
        print("\n⚠️ MCP 配置不存在或不正確")
        
        # 生成配置模板
        template_file = generate_config_template()
        
        print(f"\n💡 請按照上述步驟配置 MCP 服務器")
        print(f"📁 配置模板文件: {template_file}")
        
    else:
        print("\n🎉 MCP 配置檢查通過！")
        print("\n🚀 下一步:")
        print("1. 重啟 VS Code (如果還沒重啟)")
        print("2. 測試調用 mcp-feedback-collector.collect_feedback")
        print("3. 確認反饋收集功能正常工作")
    
    print("\n📞 測試命令:")
    print("   工具名稱: mcp-feedback-collector.collect_feedback")
    print("   參數: work_summary='測試反饋收集功能'")

if __name__ == "__main__":
    main()
