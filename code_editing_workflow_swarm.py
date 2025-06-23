"""
AutoGen 編輯工作流 - Swarm 版本
使用 AutoGen 框架的 Swarm 模式實現編輯工作流：
- 支持 agent 之間的動態 handoff
- 更靈活的協作模式
- 基於 AutoGen 最新版本的 Swarm 團隊

Agent 角色：
- coordinator: 協調者，負責任務分配和流程控制
- coder: 代碼編寫者
- reviewer: 代碼審查者  
- refactor: 代碼重構者
"""

import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import HandoffTermination, TextMentionTermination
from autogen_agentchat.messages import HandoffMessage
from autogen_agentchat.teams import Swarm
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient


async def create_swarm_editing_workflow():
    """創建基於 Swarm 的編輯工作流"""
    
    # 創建 OpenAI 模型客戶端
    model_client = OpenAIChatCompletionClient(
        model="gpt-4o",
        # api_key="YOUR_API_KEY",  # 如果沒有設置環境變量 OPENAI_API_KEY
    )
    
    # 協調者 Agent - 負責任務分配和流程控制
    coordinator = AssistantAgent(
        name="coordinator",
        model_client=model_client,
        handoffs=["coder", "reviewer", "refactor", "user"],
        system_message="""你是編輯工作流的協調者。
        你的職責是：
        1. 理解用戶需求並制定工作計劃
        2. 將任務分配給合適的專家
        3. 監控工作進度
        4. 確保工作流順利進行
        
        工作流程：
        1. 首先將編碼任務交給 coder
        2. 代碼完成後交給 reviewer 審查
        3. 如需改進則交給 refactor 重構
        4. 完成後向用戶報告
        
        請先說明你的計劃，然後開始分配任務。
        使用 TERMINATE 表示整個流程完成。"""
    )
    
    # 代碼編寫者
    coder = AssistantAgent(
        name="coder",
        model_client=model_client,
        handoffs=["coordinator", "reviewer"],
        system_message="""你是專業的代碼編寫者。
        你的職責是：
        1. 根據需求編寫高質量代碼
        2. 確保代碼功能完整
        3. 添加適當註釋和文檔
        4. 遵循最佳實踐
        
        完成編碼後，請將代碼交給 reviewer 進行審查。
        如果需要協調者介入，可以 handoff 給 coordinator。"""
    )
    
    # 代碼審查者
    reviewer = AssistantAgent(
        name="reviewer",
        model_client=model_client,
        handoffs=["coordinator", "refactor", "coder"],
        system_message="""你是經驗豐富的代碼審查者。
        你的職責是：
        1. 仔細審查代碼質量
        2. 識別潛在問題和改進點
        3. 提供具體修改建議
        4. 決定是否需要重構
        
        審查完成後：
        - 如果代碼質量良好，交回給 coordinator 完成流程
        - 如果需要重構，交給 refactor 進行改進
        - 如果需要重新編寫，交給 coder"""
    )
    
    # 代碼重構者
    refactor = AssistantAgent(
        name="refactor",
        model_client=model_client,
        handoffs=["coordinator", "reviewer"],
        system_message="""你是代碼重構專家。
        你的職責是：
        1. 基於審查建議改進代碼
        2. 優化代碼結構和性能
        3. 保持功能完整性
        4. 提升代碼可讀性
        
        重構完成後：
        - 將改進後的代碼交給 reviewer 再次審查
        - 或者交給 coordinator 報告完成情況"""
    )
    
    # 定義終止條件
    termination = HandoffTermination(target="user") | TextMentionTermination("TERMINATE")
    
    # 創建 Swarm 團隊
    team = Swarm(
        participants=[coordinator, coder, reviewer, refactor],
        termination_condition=termination
    )
    
    return team, model_client


async def run_swarm_workflow(task: str):
    """運行 Swarm 編輯工作流"""
    
    # 創建工作流
    team, model_client = await create_swarm_editing_workflow()
    
    print(f"🚀 開始執行 Swarm 編輯工作流")
    print(f"📝 任務: {task}")
    print("=" * 60)
    
    try:
        # 運行工作流
        task_result = await Console(team.run_stream(task=task))
        last_message = task_result.messages[-1]
        
        # 處理可能的用戶交互
        while isinstance(last_message, HandoffMessage) and last_message.target == "user":
            user_message = input("用戶回應: ")
            
            task_result = await Console(
                team.run_stream(
                    task=HandoffMessage(
                        source="user", 
                        target=last_message.source, 
                        content=user_message
                    )
                )
            )
            last_message = task_result.messages[-1]
            
    except Exception as e:
        print(f"❌ Swarm 工作流執行出錯: {e}")
    
    finally:
        # 關閉模型客戶端連接
        await model_client.close()
        print("\n✅ Swarm 工作流執行完成")


async def create_specialized_swarm():
    """創建專門化的 Swarm（針對特定編程語言或領域）"""
    
    model_client = OpenAIChatCompletionClient(model="gpt-4o")
    
    # Python 專家
    python_expert = AssistantAgent(
        name="python_expert",
        model_client=model_client,
        handoffs=["coordinator", "security_expert", "performance_expert"],
        system_message="""你是 Python 編程專家。
        專長：Python 語法、標準庫、最佳實踐、PEP 規範。
        負責編寫符合 Python 風格的高質量代碼。"""
    )
    
    # 安全專家
    security_expert = AssistantAgent(
        name="security_expert",
        model_client=model_client,
        handoffs=["coordinator", "python_expert", "performance_expert"],
        system_message="""你是代碼安全專家。
        專長：安全漏洞檢測、輸入驗證、權限控制、加密。
        負責審查代碼的安全性並提供安全改進建議。"""
    )
    
    # 性能專家
    performance_expert = AssistantAgent(
        name="performance_expert",
        model_client=model_client,
        handoffs=["coordinator", "python_expert", "security_expert"],
        system_message="""你是性能優化專家。
        專長：算法優化、內存管理、並發處理、性能分析。
        負責優化代碼性能並提供性能改進建議。"""
    )
    
    # 協調者（更新版本）
    coordinator = AssistantAgent(
        name="coordinator",
        model_client=model_client,
        handoffs=["python_expert", "security_expert", "performance_expert", "user"],
        system_message="""你是專業編程團隊的協調者。
        團隊成員：
        - python_expert: Python 編程專家
        - security_expert: 安全專家
        - performance_expert: 性能專家
        
        根據任務需求，合理分配工作並協調各專家的協作。
        使用 TERMINATE 表示任務完成。"""
    )
    
    termination = HandoffTermination(target="user") | TextMentionTermination("TERMINATE")
    
    team = Swarm(
        participants=[coordinator, python_expert, security_expert, performance_expert],
        termination_condition=termination
    )
    
    return team, model_client


async def main():
    """主函數 - 演示 Swarm 編輯工作流"""
    
    # 基礎 Swarm 示例
    task1 = """請設計並實現一個 Python 類來管理文件上傳功能。
    要求：
    1. 支持多種文件格式驗證
    2. 文件大小限制
    3. 安全的文件存儲
    4. 錯誤處理和日誌記錄
    5. 異步處理支持"""
    
    print("=== 基礎 Swarm 工作流 ===")
    await run_swarm_workflow(task1)
    
    # 專業化 Swarm 示例
    print("\n=== 專業化 Swarm 工作流 ===")
    team, model_client = await create_specialized_swarm()
    
    task2 = """創建一個高性能的 Web API 端點來處理用戶認證。
    需要考慮安全性、性能和 Python 最佳實踐。"""
    
    try:
        await Console(team.run_stream(task=task2))
    finally:
        await model_client.close()


if __name__ == "__main__":
    # 運行示例
    asyncio.run(main())
