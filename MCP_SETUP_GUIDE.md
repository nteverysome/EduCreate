# MCP (Model Context Protocol) 设置指南

## 已完成的安装步骤

✅ **已安装 Filesystem MCP 包**: `@shtse8/filesystem-mcp` 已通过 npm 全局安装
✅ **已安装 Memory MCP 包**: `@movibe/memory-bank-mcp` 已通过 npm 全局安装
✅ **已创建 VS Code 配置**: `.vscode/settings.json` 已配置
✅ **已创建通用 MCP 配置**: `mcp_settings.json` 已创建
✅ **已克隆 MCP Memory 项目**: `mcp-memory/` 目录已创建

## VS Code 中使用 MCP

### 1. 确保使用 VS Code Insiders 或最新版本
MCP 支持需要 VS Code 的最新版本或 Insiders 版本。

### 2. 启用 GitHub Copilot Chat
确保您已安装并启用了 GitHub Copilot Chat 扩展。

### 3. 配置已完成
我们已经在 `.vscode/settings.json` 中配置了 MCP 服务器：

```json
{
  "mcp.servers": {
    "filesystem-mcp": {
      "command": "npx",
      "args": ["@shtse8/filesystem-mcp"],
      "name": "Filesystem MCP Server",
      "description": "Secure filesystem access for AI agents"
    },
    "memory-bank-mcp": {
      "command": "npx",
      "args": ["@movibe/memory-bank-mcp"],
      "name": "Memory Bank MCP Server",
      "description": "Persistent memory storage for AI conversations"
    }
  }
}
```

### 4. 使用方法
1. 打开 VS Code
2. 启动 GitHub Copilot Chat
3. 在 Agent Mode 中，AI 现在可以安全地访问您的项目文件系统

## 其他 AI 工具配置

### Cline/Claude Desktop
如果您使用 Cline 或 Claude Desktop，可以使用 `mcp_settings.json` 配置文件。

### 可用功能

#### 📁 Filesystem MCP 功能：
- 📁 **文件浏览**: 列出文件和目录
- 📄 **读写文件**: 读取和写入多个文件
- ✏️ **精确编辑**: 插入、替换、删除代码行
- 🔍 **搜索功能**: 正则表达式搜索和替换
- 🏗️ **目录管理**: 创建目录结构
- 🗑️ **安全删除**: 删除文件和目录
- ↔️ **移动复制**: 移动和复制文件
- 🔒 **权限控制**: 修改文件权限

#### 🧠 Memory MCP 功能：
- 💾 **持久记忆**: 跨对话保存用户偏好和行为
- 🔍 **向量搜索**: 基于语义而非关键词的智能搜索
- 📝 **记忆管理**: 存储、检索和更新记忆内容
- 🎯 **上下文感知**: 根据对话内容自动关联相关记忆
- 🔒 **用户隔离**: 每个用户的记忆独立存储

## 安全特性
- 所有操作都限制在项目根目录内
- 无法访问项目外的文件系统
- 批量操作减少 AI 交互次数，节省 token

## 故障排除
如果遇到问题：
1. 确保 VS Code 是最新版本
2. 重启 VS Code
3. 检查 GitHub Copilot 是否正常工作
4. 查看 VS Code 的输出面板中的错误信息

## 测试 MCP 连接
您可以在 VS Code 的 GitHub Copilot Chat 中询问 AI：
"请列出当前项目的文件结构"

如果 MCP 工作正常，AI 应该能够访问并列出您的项目文件。
