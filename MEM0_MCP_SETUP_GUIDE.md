# Mem0 MCP 安装和配置指南

## 🎯 关于 Mem0 MCP

Mem0 MCP 是由 Mem0 AI 官方提供的 MCP 服务器，专门用于管理编程偏好和代码知识。它提供：

- **智能代码存储**: 保存代码片段、实现细节和编程模式
- **语义搜索**: 使用自然语言搜索相关代码和解决方案
- **编程偏好管理**: 跨对话保持编程风格和偏好
- **上下文感知**: 自动提取和存储代码的技术细节

## ✅ 已完成的步骤

1. ✅ **项目克隆**: 成功克隆了 `mem0ai/mem0-mcp` 项目
2. ✅ **配置更新**: 已更新 VS Code 和通用 MCP 配置
3. ✅ **安装脚本**: 创建了自动安装脚本

## 🔧 完成安装步骤

### 步骤 1: 获取 Mem0 API 密钥

1. 访问 [https://mem0.ai](https://mem0.ai)
2. 注册账户或登录
3. 获取您的 API 密钥

### 步骤 2: 配置 API 密钥

编辑 `mem0-mcp/.env` 文件：
```bash
MEM0_API_KEY=your_actual_api_key_here
```

### 步骤 3: 安装依赖

选择以下方法之一：

#### 方法 A: 使用 uv (推荐)
```bash
# 安装 uv
powershell -Command "irm https://astral.sh/uv/install.ps1 | iex"

# 进入项目目录
cd mem0-mcp

# 创建虚拟环境
uv venv

# 安装依赖
uv pip install -e .
```

#### 方法 B: 使用 pip
```bash
cd mem0-mcp
pip install httpx mcp mem0ai uvicorn starlette python-dotenv
```

### 步骤 4: 测试运行

```bash
cd mem0-mcp
python main.py
```

如果成功，您应该看到服务器在 `http://0.0.0.0:8080` 启动。

## 📋 当前配置

### VS Code 配置 (`.vscode/settings.json`):
```json
{
  "mcp.servers": {
    "mem0-mcp": {
      "command": "python",
      "args": ["mem0-mcp/main.py"],
      "name": "Mem0 MCP Server",
      "description": "Advanced coding preferences management with Mem0 AI"
    }
  }
}
```

## 🧠 Mem0 MCP 功能

### 核心工具：

1. **`add_coding_preference`**: 
   - 存储代码片段和实现细节
   - 包含完整的上下文和依赖信息
   - 自动提取技术细节

2. **`get_all_coding_preferences`**: 
   - 检索所有存储的编程偏好
   - 分析代码模式和实现历史
   - JSON 格式返回结果

3. **`search_coding_preferences`**: 
   - 语义搜索存储的代码和知识
   - 自然语言查询支持
   - 智能匹配相关解决方案

### 使用示例：

```javascript
// 存储代码偏好
add_coding_preference(`
我喜欢使用 TypeScript 进行 React 开发，
使用函数组件和 hooks，
偏好使用 Tailwind CSS 进行样式设计
`)

// 搜索相关代码
search_coding_preferences("React TypeScript 组件")

// 获取所有偏好
get_all_coding_preferences()
```

## 🎯 在 VS Code 中使用

1. **重启 VS Code** 让新配置生效
2. **确保 Mem0 MCP 服务器运行**:
   ```bash
   cd mem0-mcp
   python main.py
   ```
3. **在 GitHub Copilot Chat 中测试**:
   - "请记住我喜欢使用 TypeScript 而不是 JavaScript"
   - "搜索我之前保存的 React 组件代码"
   - "显示我所有的编程偏好"

## 🔧 故障排除

### 常见问题：

1. **API 密钥错误**:
   - 检查 `.env` 文件中的 API 密钥是否正确
   - 确保没有额外的空格或引号

2. **依赖安装失败**:
   - 确保 Python 版本 >= 3.12
   - 尝试使用虚拟环境

3. **服务器启动失败**:
   - 检查端口 8080 是否被占用
   - 查看错误日志获取详细信息

4. **VS Code 无法连接**:
   - 确保 Mem0 MCP 服务器正在运行
   - 重启 VS Code
   - 检查 GitHub Copilot 扩展状态

## 📊 与其他 MCP 服务器的区别

| 功能 | Filesystem MCP | Memory Bank MCP | Mem0 MCP |
|------|----------------|-----------------|----------|
| 文件操作 | ✅ | ❌ | ❌ |
| 基础记忆 | ❌ | ✅ | ❌ |
| 智能代码管理 | ❌ | ❌ | ✅ |
| 语义搜索 | ❌ | ✅ | ✅ |
| 编程偏好 | ❌ | ❌ | ✅ |
| 云端同步 | ❌ | ❌ | ✅ |

## 🎉 总结

现在您拥有三个强大的 MCP 服务器：
- 📁 **Filesystem MCP**: 文件系统操作
- 🧠 **Memory Bank MCP**: 基础记忆存储
- 🎯 **Mem0 MCP**: 智能编程偏好管理

完成 API 密钥配置后，您的 AI 助手将具备强大的代码知识管理能力！
