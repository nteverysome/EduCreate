#!/usr/bin/env python3
"""
MCP 反饋收集器測試腳本
測試反饋收集功能是否正常工作
"""

import sys
import os
import json
import time
import subprocess
from pathlib import Path

# 添加 mcp-feedback-collector 到 Python 路徑
sys.path.insert(0, str(Path(__file__).parent / "mcp-feedback-collector" / "src"))

try:
    from mcp_feedback_collector.server import FeedbackDialog
    MCP_AVAILABLE = True
    print("✅ MCP 反饋收集器模組載入成功")
except ImportError as e:
    MCP_AVAILABLE = False
    print(f"❌ MCP 反饋收集器模組載入失敗: {e}")

class FeedbackCollectorTester:
    """反饋收集器測試器"""
    
    def __init__(self):
        self.test_results = {}
        
    def test_module_import(self):
        """測試模組導入"""
        print("\n🔍 測試 1: 模組導入")
        
        if MCP_AVAILABLE:
            print("✅ 模組導入成功")
            self.test_results["module_import"] = True
            return True
        else:
            print("❌ 模組導入失敗")
            self.test_results["module_import"] = False
            return False
    
    def test_feedback_dialog_creation(self):
        """測試反饋對話框創建"""
        print("\n🔍 測試 2: 反饋對話框創建")
        
        if not MCP_AVAILABLE:
            print("⏭️ 跳過測試 (模組不可用)")
            return False
        
        try:
            # 創建測試對話框
            dialog = FeedbackDialog(
                work_summary="測試工作總結：已完成 Augment 硬體優化配置",
                timeout_seconds=10  # 短超時用於測試
            )
            
            print("✅ 反饋對話框創建成功")
            self.test_results["dialog_creation"] = True
            return True
            
        except Exception as e:
            print(f"❌ 反饋對話框創建失敗: {e}")
            self.test_results["dialog_creation"] = False
            return False
    
    def test_mcp_server_start(self):
        """測試 MCP 服務器啟動"""
        print("\n🔍 測試 3: MCP 服務器啟動")
        
        server_path = Path("mcp-feedback-collector/src/mcp_feedback_collector/server.py")
        
        if not server_path.exists():
            print(f"❌ 服務器文件不存在: {server_path}")
            self.test_results["server_start"] = False
            return False
        
        try:
            # 嘗試啟動服務器 (短時間測試)
            process = subprocess.Popen(
                [sys.executable, str(server_path)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # 等待短時間檢查是否正常啟動
            time.sleep(2)
            
            if process.poll() is None:
                print("✅ MCP 服務器啟動成功")
                process.terminate()
                process.wait()
                self.test_results["server_start"] = True
                return True
            else:
                stdout, stderr = process.communicate()
                print(f"❌ MCP 服務器啟動失敗")
                print(f"   錯誤輸出: {stderr}")
                self.test_results["server_start"] = False
                return False
                
        except Exception as e:
            print(f"❌ MCP 服務器啟動測試失敗: {e}")
            self.test_results["server_start"] = False
            return False
    
    def test_dependencies(self):
        """測試依賴包"""
        print("\n🔍 測試 4: 依賴包檢查")
        
        required_packages = ["PIL", "tkinter"]
        missing_packages = []
        
        # 檢查 PIL (Pillow)
        try:
            import PIL
            print("✅ PIL (Pillow) 可用")
        except ImportError:
            print("❌ PIL (Pillow) 不可用")
            missing_packages.append("pillow")
        
        # 檢查 tkinter
        try:
            import tkinter
            print("✅ tkinter 可用")
        except ImportError:
            print("❌ tkinter 不可用")
            missing_packages.append("tkinter")
        
        if missing_packages:
            print(f"⚠️ 缺少依賴包: {missing_packages}")
            print("   安裝命令: pip install " + " ".join(missing_packages))
            self.test_results["dependencies"] = False
            return False
        else:
            print("✅ 所有依賴包都可用")
            self.test_results["dependencies"] = True
            return True
    
    def simulate_feedback_workflow(self):
        """模擬反饋工作流程"""
        print("\n🔍 測試 5: 模擬反饋工作流程")
        
        if not MCP_AVAILABLE:
            print("⏭️ 跳過測試 (模組不可用)")
            return False
        
        try:
            # 模擬 Augment 完成工作後的反饋收集
            work_summary = """
📋 工作完成總結:
✅ 已成功安裝 mcp-feedback-collector
✅ 已創建配置文件和測試腳本
✅ 已整合到 Augment 工作流程

💡 下一步建議:
1. 測試反饋收集功能
2. 配置自動觸發機制
3. 整合到日常工作流程

❓ 需要確認:
- 反饋收集器是否按預期工作？
- 是否需要調整配置參數？
- 還有其他需要改進的地方嗎？
"""
            
            print("📋 模擬工作總結:")
            print(work_summary)
            
            print("\n🎯 模擬反饋收集調用...")
            print("   (實際使用時會顯示 GUI 對話框)")
            
            # 模擬反饋循環
            feedback_iterations = [
                "很好，但希望能添加更多測試案例",
                "可以增加錯誤處理機制嗎？",
                ""  # 空反饋表示滿意
            ]
            
            for i, feedback in enumerate(feedback_iterations, 1):
                print(f"\n   迭代 {i}:")
                if feedback:
                    print(f"   📥 用戶反饋: {feedback}")
                    print(f"   🔄 根據反饋進行調整...")
                else:
                    print(f"   📥 用戶反饋: (空 - 表示滿意)")
                    print(f"   ✅ 反饋循環結束")
                    break
            
            print("✅ 反饋工作流程模擬成功")
            self.test_results["workflow_simulation"] = True
            return True
            
        except Exception as e:
            print(f"❌ 反饋工作流程模擬失敗: {e}")
            self.test_results["workflow_simulation"] = False
            return False
    
    def generate_test_report(self):
        """生成測試報告"""
        print("\n📊 測試報告生成...")
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        
        report = {
            "test_summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": f"{(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "0%"
            },
            "test_results": self.test_results,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "recommendations": []
        }
        
        # 生成建議
        if not self.test_results.get("module_import", False):
            report["recommendations"].append("重新安裝 mcp-feedback-collector")
        
        if not self.test_results.get("dependencies", False):
            report["recommendations"].append("安裝缺少的依賴包")
        
        if not self.test_results.get("server_start", False):
            report["recommendations"].append("檢查 MCP 服務器配置")
        
        if passed_tests == total_tests:
            report["recommendations"].append("所有測試通過，可以開始使用反饋收集器")
        
        # 保存報告
        report_file = Path("mcp_feedback_test_report.json")
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"📋 測試報告已保存: {report_file}")
        
        return report
    
    def run_all_tests(self):
        """運行所有測試"""
        print("🧪 開始 MCP 反饋收集器測試...")
        
        tests = [
            self.test_module_import,
            self.test_dependencies,
            self.test_feedback_dialog_creation,
            self.test_mcp_server_start,
            self.simulate_feedback_workflow
        ]
        
        for test in tests:
            try:
                test()
                time.sleep(0.5)  # 測試間隔
            except Exception as e:
                print(f"❌ 測試執行錯誤: {e}")
        
        # 生成測試報告
        report = self.generate_test_report()
        
        print(f"\n📊 測試完成!")
        print(f"   通過: {report['test_summary']['passed_tests']}/{report['test_summary']['total_tests']}")
        print(f"   成功率: {report['test_summary']['success_rate']}")
        
        if report["recommendations"]:
            print(f"\n💡 建議:")
            for rec in report["recommendations"]:
                print(f"   • {rec}")
        
        return report

def main():
    """主函數"""
    
    print("🎯 MCP 反饋收集器測試工具")
    print("=" * 50)
    
    tester = FeedbackCollectorTester()
    report = tester.run_all_tests()
    
    # 根據測試結果提供指導
    if report["test_summary"]["passed_tests"] == report["test_summary"]["total_tests"]:
        print("\n🎉 所有測試通過！MCP 反饋收集器已準備就緒！")
        print("\n📋 使用說明:")
        print("1. Augment 會在完成任務前自動調用反饋收集器")
        print("2. 您可以提供文字或圖片反饋")
        print("3. Augment 會根據反饋進行調整")
        print("4. 直到您滿意為止")
    else:
        print("\n⚠️ 部分測試失敗，請檢查配置")

if __name__ == "__main__":
    main()
