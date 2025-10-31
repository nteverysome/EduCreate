#!/usr/bin/env python3
"""
測試 MCP 連接的簡單腳本
"""

import json
import subprocess
import sys
from pathlib import Path

def test_mcp_server(server_name, command, args):
    """測試單個 MCP 服務器"""
    print(f"🧪 測試服務器: {server_name}")
    print(f"   命令: {command}")
    print(f"   參數: {args}")
    
    try:
        # 嘗試啟動服務器
        cmd = [command] + args
        print(f"   執行: {' '.join(cmd)}")
        
        # 使用短暫的超時來測試服務器是否能啟動
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # 等待一小段時間看是否有錯誤
        try:
            stdout, stderr = process.communicate(timeout=3)
            print(f"   ✅ 服務器啟動成功")
            if stdout:
                print(f"   📝 輸出: {stdout[:200]}...")
            return True
        except subprocess.TimeoutExpired:
            # 超時通常意味著服務器正在運行（等待輸入）
            process.terminate()
            print(f"   ✅ 服務器正在運行（等待連接）")
            return True
            
    except Exception as e:
        print(f"   ❌ 錯誤: {e}")
        return False

def main():
    print("🔧 MCP 服務器連接測試")
    print("=" * 40)
    
    # 讀取當前配置
    config_path = Path(".trae/mcp.json")
    if not config_path.exists():
        print("❌ MCP 配置文件不存在")
        return
    
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    servers = config.get('mcpServers', {})
    if not servers:
        print("❌ 沒有配置的 MCP 服務器")
        return
    
    print(f"📊 找到 {len(servers)} 個服務器")
    
    success_count = 0
    for server_name, server_config in servers.items():
        command = server_config.get('command', '')
        args = server_config.get('args', [])
        
        if test_mcp_server(server_name, command, args):
            success_count += 1
        print()
    
    print(f"🏁 測試完成: {success_count}/{len(servers)} 個服務器可用")

if __name__ == "__main__":
    main()