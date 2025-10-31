#!/usr/bin/env python3
"""
MCP 診斷腳本
檢查 MCP 配置和連接狀態
"""

import json
import os
import sys
from pathlib import Path
import subprocess

def check_file_exists(file_path):
    """檢查文件是否存在"""
    return Path(file_path).exists()

def check_json_validity(file_path):
    """檢查 JSON 文件是否有效"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            json.load(f)
        return True, "Valid JSON"
    except Exception as e:
        return False, str(e)

def check_executable(exe_path):
    """檢查可執行文件是否存在"""
    try:
        result = subprocess.run([exe_path, '--version'], 
                              capture_output=True, text=True, timeout=10)
        return True, result.stdout.strip()
    except Exception as e:
        return False, str(e)

def main():
    print("🔍 MCP 診斷報告")
    print("=" * 50)
    
    # 檢查 MCP 配置文件
    mcp_config_path = Path(".trae/mcp.json")
    print(f"\n📁 MCP 配置文件: {mcp_config_path}")
    
    if check_file_exists(mcp_config_path):
        print("   ✅ 文件存在")
        
        # 檢查 JSON 有效性
        is_valid, message = check_json_validity(mcp_config_path)
        if is_valid:
            print("   ✅ JSON 格式有效")
            
            # 讀取配置內容
            with open(mcp_config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            print(f"   📊 服務器數量: {len(config.get('mcpServers', {}))}")
            
            # 檢查每個服務器
            for server_name, server_config in config.get('mcpServers', {}).items():
                print(f"\n   🔧 服務器: {server_name}")
                command = server_config.get('command', '')
                
                if command:
                    # 檢查命令是否存在
                    cmd_exists, cmd_info = check_executable(command)
                    if cmd_exists:
                        print(f"      ✅ 命令可用: {command}")
                        print(f"      📝 版本: {cmd_info}")
                    else:
                        print(f"      ❌ 命令不可用: {command}")
                        print(f"      🚫 錯誤: {cmd_info}")
                
                # 檢查腳本文件
                args = server_config.get('args', [])
                if args:
                    script_path = args[0] if args else None
                    if script_path and check_file_exists(script_path):
                        print(f"      ✅ 腳本存在: {script_path}")
                    elif script_path:
                        print(f"      ❌ 腳本不存在: {script_path}")
        else:
            print(f"   ❌ JSON 格式錯誤: {message}")
    else:
        print("   ❌ 文件不存在")
    
    # 檢查備份文件
    backup_files = [
        ".trae/mcp.json.backup",
        ".trae/mcp-full.json.backup", 
        ".trae/mcp-minimal.json",
        ".trae/mcp-empty.json"
    ]
    
    print(f"\n📋 備份文件:")
    for backup in backup_files:
        if check_file_exists(backup):
            print(f"   ✅ {backup}")
        else:
            print(f"   ❌ {backup}")
    
    # 檢查其他可能的配置位置
    other_configs = [
        "claude_desktop_config.json",
        ".cursor/mcp.json",
        ".augment/mcp-config.json"
    ]
    
    print(f"\n🔍 其他配置文件:")
    for config_path in other_configs:
        if check_file_exists(config_path):
            print(f"   ✅ {config_path}")
        else:
            print(f"   ❌ {config_path}")
    
    print(f"\n🏁 診斷完成")

if __name__ == "__main__":
    main()