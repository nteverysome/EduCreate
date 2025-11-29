"""
AutoGen 編輯工作流示例運行腳本
演示如何使用三種不同的工作流模式
"""

import asyncio
import os
from code_editing_workflow_basic import run_editing_workflow
from code_editing_workflow_advanced import run_advanced_workflow
from code_editing_workflow_swarm import run_swarm_workflow


def check_api_key():
    """檢查 OpenAI API Key 是否設置"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠️  警告: 未檢測到 OPENAI_API_KEY 環境變量")
        print("請設置您的 OpenAI API Key:")
        print("export OPENAI_API_KEY='your-api-key-here'")
        return False
    else:
        print("✅ OpenAI API Key 已設置")
        return True


async def demo_basic_workflow():
    """演示基礎工作流"""
    print("\n" + "="*60)
    print("🚀 演示基礎編輯工作流")
    print("="*60)
    
    task = """請編寫一個 Python 函數來計算兩個數的最大公約數 (GCD)。
    要求：
    1. 使用歐幾里得算法
    2. 添加類型提示
    3. 包含詳細的文檔字符串
    4. 添加錯誤處理
    5. 提供使用示例"""
    
    await run_editing_workflow(task)


async def demo_advanced_workflow():
    """演示高級工作流（條件循環）"""
    print("\n" + "="*60)
    print("🔄 演示高級編輯工作流（條件循環）")
    print("="*60)
    
    task = """創建一個 Python 類來實現簡單的緩存系統。
    要求：
    1. 支持 LRU (Least Recently Used) 策略
    2. 線程安全
    3. 可配置的最大容量
    4. 提供統計信息（命中率等）
    5. 包含完整的錯誤處理
    6. 添加類型提示和文檔"""
    
    await run_advanced_workflow(task, max_iterations=3)


async def demo_swarm_workflow():
    """演示 Swarm 工作流"""
    print("\n" + "="*60)
    print("🐝 演示 Swarm 編輯工作流")
    print("="*60)
    
    task = """設計並實現一個 Python 模塊來處理 CSV 文件操作。
    要求：
    1. 支持讀取、寫入、更新 CSV 文件
    2. 數據驗證和清理功能
    3. 支持大文件的分塊處理
    4. 錯誤處理和日誌記錄
    5. 性能優化
    6. 安全性考慮（防止 CSV 注入等）"""
    
    await run_swarm_workflow(task)


async def interactive_demo():
    """交互式演示"""
    print("\n" + "="*60)
    print("🎯 交互式演示")
    print("="*60)
    
    print("請選擇要演示的工作流:")
    print("1. 基礎工作流 (線性執行)")
    print("2. 高級工作流 (條件循環)")
    print("3. Swarm 工作流 (動態協作)")
    print("4. 自定義任務")
    print("0. 退出")
    
    while True:
        try:
            choice = input("\n請輸入選項 (0-4): ").strip()
            
            if choice == "0":
                print("👋 再見!")
                break
            elif choice == "1":
                await demo_basic_workflow()
            elif choice == "2":
                await demo_advanced_workflow()
            elif choice == "3":
                await demo_swarm_workflow()
            elif choice == "4":
                await custom_task_demo()
            else:
                print("❌ 無效選項，請重新選擇")
                
        except KeyboardInterrupt:
            print("\n👋 用戶中斷，退出程序")
            break
        except Exception as e:
            print(f"❌ 發生錯誤: {e}")


async def custom_task_demo():
    """自定義任務演示"""
    print("\n📝 自定義任務")
    print("-" * 40)
    
    task = input("請輸入您的編程任務描述: ").strip()
    if not task:
        print("❌ 任務描述不能為空")
        return
    
    print("\n請選擇工作流類型:")
    print("1. 基礎工作流")
    print("2. 高級工作流") 
    print("3. Swarm 工作流")
    
    workflow_choice = input("選擇 (1-3): ").strip()
    
    try:
        if workflow_choice == "1":
            await run_editing_workflow(task)
        elif workflow_choice == "2":
            await run_advanced_workflow(task)
        elif workflow_choice == "3":
            await run_swarm_workflow(task)
        else:
            print("❌ 無效選項")
    except Exception as e:
        print(f"❌ 執行任務時發生錯誤: {e}")


async def run_all_demos():
    """運行所有演示"""
    print("🎬 運行所有工作流演示")
    
    try:
        await demo_basic_workflow()
        await asyncio.sleep(2)  # 短暫暫停
        
        await demo_advanced_workflow()
        await asyncio.sleep(2)
        
        await demo_swarm_workflow()
        
    except Exception as e:
        print(f"❌ 演示過程中發生錯誤: {e}")


def print_welcome():
    """打印歡迎信息"""
    print("🎉 歡迎使用 AutoGen 編輯工作流演示!")
    print("=" * 60)
    print("本演示展示了三種不同的 AutoGen 工作流模式:")
    print("• 基礎工作流: 簡單的線性執行")
    print("• 高級工作流: 帶條件循環的迭代改進")
    print("• Swarm 工作流: 動態協作和 handoff")
    print("=" * 60)


async def main():
    """主函數"""
    print_welcome()
    
    # 檢查 API Key
    if not check_api_key():
        return
    
    print("\n請選擇運行模式:")
    print("1. 交互式演示 (推薦)")
    print("2. 運行所有演示")
    print("3. 僅運行基礎工作流")
    print("4. 僅運行高級工作流")
    print("5. 僅運行 Swarm 工作流")
    
    try:
        mode = input("\n請選擇模式 (1-5): ").strip()
        
        if mode == "1":
            await interactive_demo()
        elif mode == "2":
            await run_all_demos()
        elif mode == "3":
            await demo_basic_workflow()
        elif mode == "4":
            await demo_advanced_workflow()
        elif mode == "5":
            await demo_swarm_workflow()
        else:
            print("❌ 無效選項，默認運行交互式演示")
            await interactive_demo()
            
    except KeyboardInterrupt:
        print("\n👋 用戶中斷，退出程序")
    except Exception as e:
        print(f"❌ 程序執行出錯: {e}")


if __name__ == "__main__":
    asyncio.run(main())
