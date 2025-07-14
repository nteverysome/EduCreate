#!/usr/bin/env python3
"""
本地記憶 MCP 測試腳本
驗證本地記憶系統功能
"""

import json
import subprocess
import time
import sys
from typing import Dict, Any

class LocalMemoryMCPTester:
    """本地記憶 MCP 測試器"""
    
    def __init__(self):
        self.server_process = None
        
    def start_server(self):
        """啟動本地記憶 MCP 服務器"""
        print("🚀 啟動本地記憶 MCP 服務器...")
        
        try:
            self.server_process = subprocess.Popen(
                [sys.executable, "local-memory-mcp-server.py"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            
            # 等待服務器啟動
            time.sleep(2)
            
            if self.server_process.poll() is None:
                print("✅ 本地記憶 MCP 服務器啟動成功")
                return True
            else:
                print("❌ 本地記憶 MCP 服務器啟動失敗")
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
            request_json = json.dumps(request, ensure_ascii=False) + "\n"
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
    
    def test_add_memory(self):
        """測試添加記憶"""
        print("\n🔍 測試 1: 添加記憶")
        
        response = self.send_request("add_memory", {
            "content": "用戶喜歡使用 React Hooks 而不是 Class Components",
            "memory_type": "preference",
            "category": "programming",
            "importance": 8,
            "tags": ["react", "hooks", "preference"]
        })
        
        if response.get("success"):
            print(f"✅ 成功添加記憶，ID: {response.get('memory_id')}")
        else:
            print(f"❌ 測試失敗: {response.get('error')}")
        
        return response.get("success", False)
    
    def test_search_memories(self):
        """測試搜索記憶"""
        print("\n🔍 測試 2: 搜索記憶")
        
        response = self.send_request("search_memories", {
            "query": "TypeScript",
            "limit": 10
        })
        
        if response.get("success"):
            memories = response.get("memories", [])
            print(f"✅ 找到 {len(memories)} 個相關記憶:")
            for memory in memories[:3]:  # 顯示前 3 個
                print(f"   📝 {memory['content'][:50]}... (重要性: {memory['importance']})")
        else:
            print(f"❌ 測試失敗: {response.get('error')}")
        
        return response.get("success", False)
    
    def test_user_preferences(self):
        """測試用戶偏好"""
        print("\n🔍 測試 3: 用戶偏好管理")
        
        # 添加偏好
        add_response = self.send_request("add_user_preference", {
            "key": "favorite_editor",
            "value": "VSCode with Augment"
        })
        
        if add_response.get("success"):
            print("✅ 成功添加用戶偏好")
        else:
            print(f"❌ 添加偏好失敗: {add_response.get('error')}")
            return False
        
        # 獲取偏好
        get_response = self.send_request("get_user_preference", {
            "key": "favorite_editor"
        })
        
        if get_response.get("success"):
            value = get_response.get("value")
            print(f"✅ 成功獲取用戶偏好: {value}")
        else:
            print(f"❌ 獲取偏好失敗: {get_response.get('error')}")
            return False
        
        return True
    
    def test_project_knowledge(self):
        """測試項目知識"""
        print("\n🔍 測試 4: 項目知識管理")
        
        # 添加項目知識
        add_response = self.send_request("add_project_knowledge", {
            "file_path": "components/games/MemoryGame.tsx",
            "knowledge_type": "component",
            "content": "這是一個記憶遊戲組件，實現了間隔重複算法",
            "confidence": 0.9
        })
        
        if add_response.get("success"):
            print("✅ 成功添加項目知識")
        else:
            print(f"❌ 添加知識失敗: {add_response.get('error')}")
            return False
        
        # 獲取項目知識
        get_response = self.send_request("get_project_knowledge", {
            "knowledge_type": "component"
        })
        
        if get_response.get("success"):
            knowledge = get_response.get("knowledge", [])
            print(f"✅ 找到 {len(knowledge)} 個組件知識")
        else:
            print(f"❌ 獲取知識失敗: {get_response.get('error')}")
            return False
        
        return True
    
    def test_conversation_learning(self):
        """測試對話學習"""
        print("\n🔍 測試 5: 對話學習")
        
        response = self.send_request("learn_from_conversation", {
            "user_input": "我通常使用 Playwright 進行端到端測試",
            "ai_response": "好的，我會記住您偏好使用 Playwright 進行測試"
        })
        
        if response.get("success"):
            print("✅ 成功從對話中學習")
        else:
            print(f"❌ 測試失敗: {response.get('error')}")
        
        return response.get("success", False)
    
    def test_get_user_context(self):
        """測試獲取用戶上下文"""
        print("\n🔍 測試 6: 獲取用戶上下文")
        
        response = self.send_request("get_user_context", {})
        
        if response.get("success"):
            context = response.get("context", {})
            summary = response.get("summary", {})
            
            print("✅ 成功獲取用戶上下文:")
            print(f"   📝 記憶數量: {summary.get('total_memories', 0)}")
            print(f"   ⚙️ 偏好數量: {summary.get('preferences_count', 0)}")
            print(f"   🧠 知識數量: {summary.get('knowledge_count', 0)}")
            
            # 顯示一些記憶
            recent_memories = context.get("recent_memories", [])
            if recent_memories:
                print("   最近記憶:")
                for memory in recent_memories[:3]:
                    print(f"     • {memory['content'][:50]}...")
        else:
            print(f"❌ 測試失敗: {response.get('error')}")
        
        return response.get("success", False)
    
    def test_statistics(self):
        """測試統計信息"""
        print("\n🔍 測試 7: 統計信息")
        
        response = self.send_request("get_statistics", {})
        
        if response.get("success"):
            stats = response.get("statistics", {})
            print("✅ 統計信息:")
            print(f"   📊 總記憶數: {stats.get('total_memories', 0)}")
            print(f"   📋 記憶類型: {stats.get('memory_types', {})}")
            print(f"   📂 記憶分類: {stats.get('categories', {})}")
            print(f"   ⭐ 平均重要性: {stats.get('avg_importance', 0)}")
            print(f"   💾 數據庫路徑: {stats.get('database_path', 'N/A')}")
        else:
            print(f"❌ 測試失敗: {response.get('error')}")
        
        return response.get("success", False)
    
    def run_all_tests(self):
        """運行所有測試"""
        print("🧪 開始本地記憶 MCP 功能測試...")
        
        if not self.start_server():
            print("❌ 無法啟動服務器，測試終止")
            return False
        
        tests = [
            self.test_add_memory,
            self.test_search_memories,
            self.test_user_preferences,
            self.test_project_knowledge,
            self.test_conversation_learning,
            self.test_get_user_context,
            self.test_statistics
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
            print("🎉 所有測試通過！本地記憶系統已準備就緒！")
        else:
            print("⚠️ 部分測試失敗，請檢查配置")
        
        return passed == total
    
    def cleanup(self):
        """清理資源"""
        if self.server_process:
            print("🧹 關閉本地記憶 MCP 服務器...")
            self.server_process.terminate()
            self.server_process.wait()

def main():
    """主函數"""
    tester = LocalMemoryMCPTester()
    
    try:
        success = tester.run_all_tests()
        
        if success:
            print("\n🎯 本地記憶系統使用建議:")
            print("1. 記憶系統會自動學習您的編程偏好和習慣")
            print("2. 項目知識會持續累積，提升 Augment 的理解能力")
            print("3. 所有數據存儲在本地 SQLite 數據庫中，完全私密")
            print("4. 支援語義搜索，能找到相關的記憶和知識")
            
            print("\n💡 與 Augment 整合:")
            print("- Augment 會自動使用記憶系統提供上下文")
            print("- 您的偏好會影響 Augment 的建議和代碼生成")
            print("- 項目知識會幫助 Augment 更好理解您的代碼庫")
            print("- 對話歷史會提升 Augment 的個人化體驗")
        
    except KeyboardInterrupt:
        print("\n⏹️ 測試被用戶中斷")
    finally:
        tester.cleanup()

if __name__ == "__main__":
    main()
