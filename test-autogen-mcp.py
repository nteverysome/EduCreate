#!/usr/bin/env python3
"""
AutoGen MCP 測試腳本
演示如何使用 AutoGen MCP 提升 Augment 能力
"""

import json
import subprocess
import time
import sys
from typing import Dict, Any

class AutoGenMCPTester:
    """AutoGen MCP 測試器"""
    
    def __init__(self):
        self.server_process = None
        
    def start_server(self):
        """啟動 AutoGen MCP 服務器"""
        print("🚀 啟動 AutoGen MCP 服務器...")
        
        try:
            self.server_process = subprocess.Popen(
                [sys.executable, "autogen-mcp-server.py"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            
            # 等待服務器啟動
            time.sleep(2)
            
            if self.server_process.poll() is None:
                print("✅ AutoGen MCP 服務器啟動成功")
                return True
            else:
                print("❌ AutoGen MCP 服務器啟動失敗")
                return False
                
        except Exception as e:
            print(f"❌ 啟動服務器時發生錯誤: {e}")
            return False
    
    def send_request(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """發送 MCP 請求"""
        
        if not self.server_process:
            return {"success": False, "error": "服務器未啟動"}
        
        request = {
            "method": method,
            "params": params
        }
        
        try:
            # 發送請求
            request_json = json.dumps(request) + "\n"
            self.server_process.stdin.write(request_json)
            self.server_process.stdin.flush()
            
            # 讀取響應
            response_line = self.server_process.stdout.readline()
            if response_line:
                return json.loads(response_line.strip())
            else:
                return {"success": False, "error": "無響應"}
                
        except Exception as e:
            return {"success": False, "error": f"請求失敗: {e}"}
    
    def test_get_available_agents(self):
        """測試獲取可用代理"""
        print("\n🔍 測試 1: 獲取可用代理")
        
        response = self.send_request("get_available_agents", {})
        
        if response.get("success"):
            agents = response.get("agents", {})
            print(f"✅ 成功獲取 {len(agents)} 個代理:")
            
            for agent_id, agent_info in agents.items():
                print(f"   📋 {agent_info['name']} ({agent_info['role']})")
                print(f"      能力: {', '.join(agent_info['capabilities'])}")
                print(f"      優先級: {agent_info['priority']}")
                print()
        else:
            print(f"❌ 測試失敗: {response.get('error')}")
        
        return response.get("success", False)
    
    def test_create_agent_team(self):
        """測試創建代理團隊"""
        print("\n🔍 測試 2: 創建代理團隊")
        
        response = self.send_request("create_agent_team", {
            "task_type": "full_stack_development",
            "requirements": {
                "frontend": "React + TypeScript",
                "backend": "Node.js + Express", 
                "testing": "Playwright + Jest"
            }
        })
        
        if response.get("success"):
            team = response.get("team", [])
            print(f"✅ 成功創建團隊，包含 {len(team)} 個代理:")
            
            for agent_id in team:
                agent_info = response.get("agents", {}).get(agent_id, {})
                print(f"   👥 {agent_info.get('name', agent_id)} - {agent_info.get('role', 'Unknown')}")
        else:
            print(f"❌ 測試失敗: {response.get('error')}")
        
        return response.get("success", False)
    
    def test_execute_collaborative_task(self):
        """測試執行協作任務"""
        print("\n🔍 測試 3: 執行協作任務")
        
        response = self.send_request("execute_collaborative_task", {
            "session_id": "test_session_001",
            "task": "實現一個用戶註冊和登入功能",
            "team": ["architect", "frontend_expert", "backend_expert", "test_expert"]
        })
        
        if response.get("success"):
            results = response.get("results", {})
            print(f"✅ 協作任務完成，{len(results)} 個代理參與:")
            
            for agent_id, result in results.items():
                print(f"   🤖 {result['agent']} ({result['role']}):")
                print(f"      狀態: {result['status']}")
                print(f"      建議: {result['recommendations']}")
                print()
        else:
            print(f"❌ 測試失敗: {response.get('error')}")
        
        return response.get("success", False)
    
    def test_specialized_task(self):
        """測試專業化任務"""
        print("\n🔍 測試 4: 專業化任務 (前端開發)")
        
        response = self.send_request("execute_collaborative_task", {
            "session_id": "frontend_task_001", 
            "task": "設計一個響應式的用戶儀表板界面",
            "team": ["frontend_expert", "test_expert", "doc_expert"]
        })
        
        if response.get("success"):
            print("✅ 前端專業化任務完成")
            print(f"   摘要: {response.get('summary')}")
        else:
            print(f"❌ 測試失敗: {response.get('error')}")
        
        return response.get("success", False)
    
    def run_all_tests(self):
        """運行所有測試"""
        print("🧪 開始 AutoGen MCP 功能測試...")
        
        if not self.start_server():
            print("❌ 無法啟動服務器，測試終止")
            return False
        
        tests = [
            self.test_get_available_agents,
            self.test_create_agent_team,
            self.test_execute_collaborative_task,
            self.test_specialized_task
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
                time.sleep(1)  # 測試間隔
            except Exception as e:
                print(f"❌ 測試執行錯誤: {e}")
        
        print(f"\n📊 測試結果: {passed}/{total} 通過")
        
        if passed == total:
            print("🎉 所有測試通過！AutoGen MCP 已準備就緒！")
        else:
            print("⚠️ 部分測試失敗，請檢查配置")
        
        return passed == total
    
    def cleanup(self):
        """清理資源"""
        if self.server_process:
            print("🧹 關閉 AutoGen MCP 服務器...")
            self.server_process.terminate()
            self.server_process.wait()

def main():
    """主函數"""
    tester = AutoGenMCPTester()
    
    try:
        success = tester.run_all_tests()
        
        if success:
            print("\n🎯 AutoGen MCP 使用建議:")
            print("1. 在 Augment 中提及複雜開發任務時，會自動啟用多代理協作")
            print("2. 使用關鍵詞如 '設計架構'、'全棧開發'、'性能優化' 觸發團隊模式")
            print("3. 每個代理都有專業領域，會提供專業化的建議和解決方案")
            print("4. 代理之間會協調工作，確保任務的完整性和品質")
            
            print("\n💡 示例使用場景:")
            print("- '幫我設計一個電商系統的架構' → 啟用架構師 + 前後端專家")
            print("- '實現用戶認證功能' → 啟用後端專家 + 安全專家 + 測試專家")
            print("- '優化頁面載入速度' → 啟用前端專家 + 性能專家")
            print("- '重構這個模組' → 啟用架構師 + 相關領域專家")
        
    except KeyboardInterrupt:
        print("\n⏹️ 測試被用戶中斷")
    finally:
        tester.cleanup()

if __name__ == "__main__":
    main()
