# AutoGen 編輯工作流

使用 AutoGen 框架實現的多 Agent 代碼編輯工作流，包含三個核心 Agent：
- **Agent1 (代碼編寫者)**: 負責編寫初始代碼
- **Agent2 (代碼審查者)**: 審查代碼並提出修改建議  
- **Agent3 (代碼重構者)**: 根據審查建議重新修改代碼

## 🚀 特性

- ✅ 基於 AutoGen 最新版本 (v0.4+)
- ✅ 支持多種工作流模式：GraphFlow、Swarm
- ✅ 條件循環和迭代改進
- ✅ 專業化 Agent 角色分工
- ✅ 完整的中文註釋和文檔
- ✅ 錯誤處理和狀態管理

## 📁 文件結構

```
├── code_editing_workflow_basic.py      # 基礎線性工作流
├── code_editing_workflow_advanced.py   # 高級條件循環工作流
├── code_editing_workflow_swarm.py      # Swarm 模式工作流
└── AutoGen_Workflow_README.md          # 使用說明
```

## 🛠️ 安裝依賴

```bash
# 安裝 AutoGen
pip install autogen-agentchat[openai]

# 或者安裝完整版本
pip install autogen-agentchat[all]
```

## ⚙️ 配置

### 1. 設置 OpenAI API Key

```bash
# 方法1: 環境變量
export OPENAI_API_KEY="your-api-key-here"

# 方法2: 在代碼中直接設置
model_client = OpenAIChatCompletionClient(
    model="gpt-4o",
    api_key="your-api-key-here"
)
```

### 2. 選擇模型

支持的模型：
- `gpt-4o` (推薦)
- `gpt-4o-mini` 
- `gpt-4-turbo`
- `gpt-3.5-turbo`

## 🎯 使用方法

### 基礎工作流

```python
import asyncio
from code_editing_workflow_basic import run_editing_workflow

async def main():
    task = """請編寫一個 Python 函數來實現快速排序算法。
    要求：
    1. 包含詳細註釋
    2. 添加錯誤處理
    3. 提供使用示例
    """
    
    await run_editing_workflow(task)

asyncio.run(main())
```

### 高級工作流（條件循環）

```python
import asyncio
from code_editing_workflow_advanced import run_advanced_workflow

async def main():
    task = """創建一個 Python 類來管理數據庫連接池。
    要求包含連接管理、錯誤處理和性能優化。
    """
    
    await run_advanced_workflow(task, max_iterations=3)

asyncio.run(main())
```

### Swarm 工作流

```python
import asyncio
from code_editing_workflow_swarm import run_swarm_workflow

async def main():
    task = """設計一個安全的用戶認證系統。
    需要考慮密碼加密、會話管理和安全防護。
    """
    
    await run_swarm_workflow(task)

asyncio.run(main())
```

## 🔄 工作流類型對比

| 特性 | 基礎工作流 | 高級工作流 | Swarm 工作流 |
|------|------------|------------|--------------|
| 執行模式 | 線性順序 | 條件循環 | 動態 Handoff |
| 迭代改進 | ❌ | ✅ | ✅ |
| 靈活性 | 低 | 中 | 高 |
| 複雜度 | 簡單 | 中等 | 複雜 |
| 適用場景 | 簡單任務 | 質量要求高 | 複雜協作 |

## 🎨 自定義工作流

### 添加新的 Agent

```python
# 創建專門的測試 Agent
test_agent = AssistantAgent(
    name="test_agent",
    model_client=model_client,
    system_message="""你是測試專家。
    負責為代碼編寫單元測試和集成測試。
    """
)

# 添加到工作流中
builder.add_node(test_agent)
builder.add_edge(code_refactor, test_agent)
```

### 自定義條件邊

```python
# 基於代碼複雜度的條件路由
def complexity_condition(msg):
    content = msg.to_model_text().lower()
    return "complex" in content or "optimization" in content

builder.add_edge(
    reviewer, 
    performance_optimizer,
    condition=complexity_condition
)
```

## 📊 監控和調試

### 啟用詳細日誌

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("autogen")
```

### 保存工作流狀態

```python
# 保存狀態
state = await team.save_state()
with open("workflow_state.json", "w") as f:
    json.dump(state, f)

# 恢復狀態
with open("workflow_state.json", "r") as f:
    state = json.load(f)
await team.load_state(state)
```

## 🔧 故障排除

### 常見問題

1. **API Key 錯誤**
   ```
   解決方案: 檢查 OPENAI_API_KEY 環境變量或代碼中的 api_key 參數
   ```

2. **模型響應超時**
   ```python
   model_client = OpenAIChatCompletionClient(
       model="gpt-4o",
       timeout=60  # 增加超時時間
   )
   ```

3. **內存使用過高**
   ```python
   # 使用消息過濾減少上下文
   from autogen_agentchat.agents import MessageFilterAgent
   ```

## 📚 進階功能

### 工具集成

```python
from autogen_core.tools import FunctionTool

def code_analyzer(code: str) -> str:
    """分析代碼複雜度"""
    # 實現代碼分析邏輯
    return "分析結果"

analyzer_tool = FunctionTool(code_analyzer, description="代碼分析工具")

agent = AssistantAgent(
    name="analyzer",
    model_client=model_client,
    tools=[analyzer_tool]
)
```

### 多語言支持

```python
# 針對不同編程語言的專門 Agent
languages = {
    "python": "Python 專家",
    "javascript": "JavaScript 專家", 
    "java": "Java 專家"
}

for lang, description in languages.items():
    agent = AssistantAgent(
        name=f"{lang}_expert",
        system_message=f"你是 {description}，專門處理 {lang} 相關任務。"
    )
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個工作流！

## 📄 許可證

MIT License

## 🔗 相關資源

- [AutoGen 官方文檔](https://microsoft.github.io/autogen/)
- [AutoGen GitHub](https://github.com/microsoft/autogen)
- [OpenAI API 文檔](https://platform.openai.com/docs)
