"""
AutoGen 編輯工作流 - 基礎版本
使用 AutoGen 框架實現三個 agent 的編輯工作流：
- agent1: 負責寫代碼
- agent2: 審查代碼並提出修改建議  
- agent3: 根據前兩者的輸出重新修改代碼

基於 AutoGen 最新版本的 GraphFlow 模式
"""

import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import DiGraphBuilder, GraphFlow
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient


async def create_code_editing_workflow():
    """創建代碼編輯工作流"""
    
    # 創建 OpenAI 模型客戶端
    model_client = OpenAIChatCompletionClient(
        model="gpt-4o",
        # api_key="YOUR_API_KEY",  # 如果沒有設置環境變量 OPENAI_API_KEY
    )
    
    # Agent 1: 代碼編寫者
    code_writer = AssistantAgent(
        name="code_writer",
        model_client=model_client,
        system_message="""你是一個專業的代碼編寫者。
        你的職責是：
        1. 根據用戶需求編寫高質量的代碼
        2. 確保代碼功能完整且可運行
        3. 添加適當的註釋和文檔
        4. 遵循最佳編程實踐
        
        請編寫清晰、可維護的代碼，並解釋你的設計思路。"""
    )
    
    # Agent 2: 代碼審查者
    code_reviewer = AssistantAgent(
        name="code_reviewer",
        model_client=model_client,
        system_message="""你是一個經驗豐富的代碼審查者。
        你的職責是：
        1. 仔細審查提供的代碼
        2. 識別潛在的問題、錯誤或改進點
        3. 提供具體的修改建議
        4. 評估代碼的可讀性、性能和安全性
        5. 建議最佳實踐和優化方案
        
        請提供詳細的審查報告，包括：
        - 發現的問題
        - 具體的改進建議
        - 推薦的最佳實踐"""
    )
    
    # Agent 3: 代碼重構者
    code_refactor = AssistantAgent(
        name="code_refactor",
        model_client=model_client,
        system_message="""你是一個代碼重構專家。
        你的職責是：
        1. 基於原始代碼和審查建議進行重構
        2. 實施審查者提出的改進建議
        3. 優化代碼結構和性能
        4. 確保重構後的代碼更加清晰和高效
        5. 保持原有功能的完整性
        
        請提供重構後的完整代碼，並解釋所做的改進。"""
    )
    
    # 構建工作流圖
    builder = DiGraphBuilder()
    
    # 添加節點
    builder.add_node(code_writer)
    builder.add_node(code_reviewer) 
    builder.add_node(code_refactor)
    
    # 定義執行順序：代碼編寫 -> 代碼審查 -> 代碼重構
    builder.add_edge(code_writer, code_reviewer)
    builder.add_edge(code_reviewer, code_refactor)
    
    # 構建並驗證圖
    graph = builder.build()
    
    # 創建工作流
    flow = GraphFlow(
        participants=builder.get_participants(),
        graph=graph,
    )
    
    return flow, model_client


async def run_editing_workflow(task: str):
    """運行編輯工作流"""
    
    # 創建工作流
    flow, model_client = await create_code_editing_workflow()
    
    print(f"🚀 開始執行編輯工作流")
    print(f"📝 任務: {task}")
    print("=" * 60)
    
    try:
        # 運行工作流並顯示過程
        await Console(flow.run_stream(task=task))
        
    except Exception as e:
        print(f"❌ 工作流執行出錯: {e}")
    
    finally:
        # 關閉模型客戶端連接
        await model_client.close()
        print("\n✅ 工作流執行完成")


async def main():
    """主函數 - 演示編輯工作流"""
    
    # 示例任務
    task = """請編寫一個 Python 函數來計算斐波那契數列的第 n 項。
    要求：
    1. 使用遞歸方法實現
    2. 添加適當的錯誤處理
    3. 包含詳細的文檔字符串
    4. 提供使用示例"""
    
    await run_editing_workflow(task)


if __name__ == "__main__":
    # 運行示例
    asyncio.run(main())
