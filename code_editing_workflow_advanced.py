"""
AutoGen 編輯工作流 - 高級版本
使用 AutoGen 框架實現帶條件循環的編輯工作流：
- agent1: 負責寫代碼
- agent2: 審查代碼並決定是否需要進一步修改
- agent3: 根據審查建議重新修改代碼
- 支持迭代改進直到代碼質量滿足要求

基於 AutoGen 最新版本的 GraphFlow 和條件邊
"""

import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import DiGraphBuilder, GraphFlow
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient


async def create_advanced_editing_workflow():
    """創建高級代碼編輯工作流（帶條件循環）"""
    
    # 創建 OpenAI 模型客戶端
    model_client = OpenAIChatCompletionClient(
        model="gpt-4o",
        # api_key="YOUR_API_KEY",  # 如果沒有設置環境變量 OPENAI_API_KEY
    )
    
    # Agent 1: 代碼編寫者/改進者
    code_generator = AssistantAgent(
        name="code_generator",
        model_client=model_client,
        system_message="""你是一個專業的代碼編寫者和改進者。
        你的職責是：
        1. 根據用戶需求編寫初始代碼
        2. 根據審查反饋改進現有代碼
        3. 確保代碼功能完整且可運行
        4. 添加適當的註釋和文檔
        5. 遵循最佳編程實踐
        
        如果這是初次編寫，請創建完整的解決方案。
        如果這是基於反饋的改進，請重點解決審查者提出的問題。"""
    )
    
    # Agent 2: 代碼審查者（決策者）
    code_reviewer = AssistantAgent(
        name="code_reviewer", 
        model_client=model_client,
        system_message="""你是一個嚴格的代碼審查者。
        你的職責是：
        1. 仔細審查提供的代碼
        2. 識別問題、錯誤或改進點
        3. 評估代碼質量是否達到標準
        4. 做出明確的決策：批准或要求修改
        
        審查標準：
        - 功能正確性
        - 代碼可讀性
        - 性能優化
        - 錯誤處理
        - 最佳實踐
        
        請在回應中明確表示：
        - 如果代碼質量良好，回應中包含 "APPROVE"
        - 如果需要改進，提供具體的修改建議，不要包含 "APPROVE"
        """
    )
    
    # Agent 3: 最終總結者
    final_summarizer = AssistantAgent(
        name="final_summarizer",
        model_client=model_client,
        system_message="""你是最終總結專家。
        你的職責是：
        1. 總結整個編輯過程
        2. 展示最終的代碼版本
        3. 說明所做的改進
        4. 提供使用指南
        
        請提供一個完整的總結報告，包括最終代碼和改進說明。"""
    )
    
    # 構建工作流圖
    builder = DiGraphBuilder()
    
    # 添加節點
    builder.add_node(code_generator)
    builder.add_node(code_reviewer)
    builder.add_node(final_summarizer)
    
    # 定義邊和條件
    # 1. 代碼生成器 -> 審查者（總是執行）
    builder.add_edge(code_generator, code_reviewer)
    
    # 2. 審查者 -> 最終總結者（如果批准）
    builder.add_edge(
        code_reviewer, 
        final_summarizer, 
        condition=lambda msg: "APPROVE" in msg.to_model_text().upper()
    )
    
    # 3. 審查者 -> 代碼生成器（如果需要修改）
    builder.add_edge(
        code_reviewer, 
        code_generator, 
        condition=lambda msg: "APPROVE" not in msg.to_model_text().upper()
    )
    
    # 設置入口點
    builder.set_entry_point(code_generator)
    
    # 構建並驗證圖
    graph = builder.build()
    
    # 創建工作流
    flow = GraphFlow(
        participants=builder.get_participants(),
        graph=graph,
    )
    
    return flow, model_client


async def create_message_filtered_workflow():
    """創建帶消息過濾的工作流（減少上下文長度）"""
    
    from autogen_agentchat.agents import MessageFilterAgent, MessageFilterConfig, PerSourceFilter
    
    # 創建基礎工作流
    flow, model_client = await create_advanced_editing_workflow()
    
    # 這裡可以添加消息過濾邏輯
    # 例如：只讓最終總結者看到最後的審查結果
    
    return flow, model_client


async def run_advanced_workflow(task: str, max_iterations: int = 3):
    """運行高級編輯工作流"""
    
    # 創建工作流
    flow, model_client = await create_advanced_editing_workflow()
    
    print(f"🚀 開始執行高級編輯工作流")
    print(f"📝 任務: {task}")
    print(f"🔄 最大迭代次數: {max_iterations}")
    print("=" * 60)
    
    try:
        # 運行工作流並顯示過程
        await Console(flow.run_stream(task=task))
        
    except Exception as e:
        print(f"❌ 工作流執行出錯: {e}")
    
    finally:
        # 關閉模型客戶端連接
        await model_client.close()
        print("\n✅ 高級工作流執行完成")


async def demo_multiple_tasks():
    """演示多個任務的處理"""
    
    tasks = [
        """編寫一個 Python 類來管理學生信息，包括：
        1. 添加學生
        2. 刪除學生  
        3. 查找學生
        4. 計算平均成績
        要求使用適當的數據結構和錯誤處理。""",
        
        """創建一個簡單的 Web API 端點（使用 FastAPI），用於：
        1. 獲取用戶列表
        2. 創建新用戶
        3. 更新用戶信息
        包含適當的驗證和錯誤處理。"""
    ]
    
    for i, task in enumerate(tasks, 1):
        print(f"\n{'='*20} 任務 {i} {'='*20}")
        await run_advanced_workflow(task)
        print(f"{'='*50}")


async def main():
    """主函數 - 演示高級編輯工作流"""
    
    # 單個任務示例
    task = """請編寫一個 Python 裝飾器來測量函數執行時間。
    要求：
    1. 支持同步和異步函數
    2. 可以選擇性地記錄到日誌
    3. 返回執行時間
    4. 包含完整的類型提示
    5. 提供使用示例"""
    
    await run_advanced_workflow(task)
    
    # 如果想測試多個任務，取消下面的註釋
    # await demo_multiple_tasks()


if __name__ == "__main__":
    # 運行示例
    asyncio.run(main())
