# 📚 Responsively App + CDP 调试信息收集指南

**最后更新**: 2025-11-09  
**作者**: Augment Agent  
**目的**: 使用 Responsively App 和 Chrome DevTools Protocol (CDP) 收集特定设备的实时调试日志

---

## 📋 目录

1. [快速开始](#快速开始)
2. [环境准备](#环境准备)
3. [详细步骤](#详细步骤)
4. [脚本说明](#脚本说明)
5. [常见问题](#常见问题)
6. [故障排除](#故障排除)

---

## 🚀 快速开始

### 3 步快速收集日志

```bash
# 步骤 1: 启动 Responsively App 并启用 CDP
powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-ipad-pro.ps1

# 步骤 2: 在 Responsively App 中打开游戏
# (手动操作 - 见下文详细步骤)

# 步骤 3: 运行日志收集脚本
node scripts/collect-ipad-pro-logs.js
```

**预期输出:**
```
🚀 启动日志收集脚本 (iPad Pro 1024×1366)
📱 设备: iPad Pro 12.9" (1024×1366)

📡 获取游戏页面 WebSocket 端点...
✅ 找到游戏页面: https://edu-create.vercel.app/...
📡 WebSocket 端点: ws://127.0.0.1:9222/devtools/page/...

📡 连接到 CDP...
✅ 已连接到 CDP

📝 开始收集控制台日志...
⏳ 等待日志收集 (10 秒)...

✅ 游戏信息:
  - 窗口大小: 1024×1366
  - DPR: 1
  - 标题: EduCreate - 記憶科學驅動的智能教育遊戲平台

📈 统计信息:
  - 总日志数: 372
  - 关键日志数: 5
  - v57.0 日志: 2
  - v58.0 日志: 3

✅ 完成！
📁 输出目录: reports/cdp-logs
```

---

## 🔧 环境准备

### 必需软件

- **Node.js** (v14+)
- **Responsively App** (最新版本)
- **npm** 或 **yarn**

### 必需依赖

```bash
npm install ws puppeteer-core
```

### 验证环境

```bash
# 检查 Node.js
node --version

# 检查 npm
npm --version

# 检查 Responsively App 是否安装
Get-Command ResponsivelyApp -ErrorAction SilentlyContinue
```

---

## 📖 详细步骤

### 步骤 1: 启动 Responsively App 并启用 CDP

#### 方法 A: 使用 PowerShell 脚本 (推荐)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-ipad-pro.ps1
```

**脚本内容:**
```powershell
$ResponsivelyPath = "C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe"
$process = Start-Process -FilePath $ResponsivelyPath -ArgumentList "--remote-debugging-port=9222" -PassThru
Write-Host "✅ Responsively App 已启动 (PID: $($process.Id))"
Write-Host "📡 CDP 端点: http://127.0.0.1:9222"
```

#### 方法 B: 手动启动

1. 打开 Responsively App
2. 在命令行中运行:
   ```bash
   "C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe" --remote-debugging-port=9222
   ```

### 步骤 2: 在 Responsively App 中打开游戏

1. **添加设备** (如果需要)
   - 点击 "+ Add Device"
   - 搜索 "iPad Pro 12.9" 或手动输入 1024×1366
   - 设置 DPR (Device Pixel Ratio) = 2

2. **打开游戏 URL**
   - 在地址栏输入游戏 URL:
     ```
     https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmhjff7340001jf04htar2e5k&layout=mixed&itemsPerPage=20
     ```
   - 按 Enter 加载游戏

3. **等待游戏加载**
   - 等待 3-5 秒，确保游戏完全加载
   - 观察 Responsively App 中的预览

### 步骤 3: 验证 CDP 连接

```bash
# 检查 CDP 端点是否可用
$response = Invoke-WebRequest -Uri "http://127.0.0.1:9222/json" -TimeoutSec 5
$response.Content | ConvertFrom-Json | Select-Object -First 1 | Format-List
```

**预期输出:**
```
description          :
devtoolsFrontendUrl  : /devtools/inspector.html?ws=127.0.0.1:9222/devtools/page/...
id                   : DBE6450976E772047A6CAB720B28E805
title                : Responsively App
type                 : page
url                  : file:///C:/Users/Administrator/AppData/Local/Programs/ResponsivelyApp/...
webSocketDebuggerUrl : ws://127.0.0.1:9222/devtools/page/DBE6450976E772047A6CAB720B28E805
```

### 步骤 4: 运行日志收集脚本

```bash
node scripts/collect-ipad-pro-logs.js
```

---

## 📄 脚本说明

### collect-ipad-pro-logs.js

**功能**: 通过 CDP 连接到 Responsively App，收集游戏的实时控制台日志

**工作流程:**

```
1. 获取 CDP 端点
   ↓
2. 连接到 WebSocket
   ↓
3. 启用 Runtime 和 Console 域
   ↓
4. 监听控制台消息
   ↓
5. 等待 10 秒收集日志
   ↓
6. 获取游戏信息 (分辨率、DPR 等)
   ↓
7. 提取关键日志 (v57.0, v58.0 等)
   ↓
8. 保存到 JSON 文件
```

**输出文件:**
- `reports/cdp-logs/ipad-pro-1024x1366-debug.json` (完整日志)

**关键代码:**

```javascript
// 1. 获取游戏页面的 WebSocket 端点
const pages = await getGamePageWebSocket();
const gamePage = pages.find(p => p.url && p.url.includes('match-up-game'));

// 2. 连接到 CDP
ws = new WebSocket(gamePage.webSocketDebuggerUrl);

// 3. 启用 Console 域
await sendCommand(ws, messageId++, 'Console.enable', {});

// 4. 监听控制台消息
ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.method === 'Console.messageAdded') {
        consoleLogs.push(message.params.message);
    }
});

// 5. 评估 JavaScript
const gameInfo = await evaluateInPage(ws, messageId++, () => {
    return {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
    };
});
```

---

## ❓ 常见问题

### Q1: 如何修改收集的设备尺寸?

**A:** 编辑 `scripts/collect-ipad-pro-logs.js` 中的配置:

```javascript
const CONFIG = {
    CDP_ENDPOINT: 'http://127.0.0.1:9222',
    OUTPUT_DIR: 'reports/cdp-logs',
    LOG_FILE: 'ipad-pro-1024x1366-debug.json'  // 修改文件名
};
```

### Q2: 如何收集特定版本的日志?

**A:** 修改日志过滤条件:

```javascript
const keyLogs = consoleLogs.filter(log => 
    log.text.includes('[v57') ||  // 修改版本号
    log.text.includes('[v58') ||
    log.text.includes('你的关键词')
);
```

### Q3: 如何增加日志收集时间?

**A:** 修改等待时间:

```javascript
// 等待日志收集 (10 秒 -> 20 秒)
await new Promise(resolve => setTimeout(resolve, 20000));
```

---

## 🔧 故障排除

### 问题 1: "CDP 端点暂不可用"

**原因**: Responsively App 没有启用 CDP

**解决方案**:
```bash
# 确保使用了 --remote-debugging-port 参数
"C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe" --remote-debugging-port=9222
```

### 问题 2: "找不到游戏页面"

**原因**: 游戏还没有在 Responsively App 中打开

**解决方案**:
1. 在 Responsively App 中手动打开游戏 URL
2. 等待 3-5 秒确保加载完成
3. 再运行脚本

### 问题 3: "WebSocket 连接失败"

**原因**: CDP 端点不可用或已关闭

**解决方案**:
```bash
# 检查 CDP 端点
$response = Invoke-WebRequest -Uri "http://127.0.0.1:9222/json" -TimeoutSec 5
if ($response) { Write-Host "✅ CDP 可用" } else { Write-Host "❌ CDP 不可用" }
```

### 问题 4: "日志为空"

**原因**: 游戏还没有初始化或日志已经输出

**解决方案**:
1. 增加等待时间 (改为 20 秒)
2. 刷新游戏页面后重新运行
3. 检查浏览器控制台是否有错误

---

## 📊 日志分析

### 查看收集的日志

```bash
# 使用 Node.js 分析日志
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('reports/cdp-logs/ipad-pro-1024x1366-debug.json', 'utf8'));
console.log('总日志数:', data.totalLogs);
console.log('关键日志数:', data.keyLogsCount);
console.log('游戏信息:', data.gameInfo);
console.log('关键日志:', data.keyLogs.map(l => l.text).join('\n'));
"
```

### 搜索特定日志

```bash
# 搜索包含 "v57" 的日志
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('reports/cdp-logs/ipad-pro-1024x1366-debug.json', 'utf8'));
const v57Logs = data.consoleLogs.filter(l => l.text.includes('[v57'));
console.log('v57.0 日志:', v57Logs.length);
v57Logs.forEach(l => console.log(l.text));
"
```

---

## 📝 最佳实践

1. **定期收集日志**
   - 在每次代码更新后收集日志
   - 对比不同版本的日志差异

2. **保存日志历史**
   - 使用时间戳命名日志文件
   - 便于追踪问题演变

3. **自动化收集**
   - 创建 CI/CD 流程自动收集日志
   - 集成到测试流程中

4. **文档记录**
   - 记录每次收集的目的
   - 记录发现的问题和解决方案

---

## 🔗 相关文件

- 📄 `scripts/collect-ipad-pro-logs.js` - 日志收集脚本
- 📄 `scripts/launch-responsively-ipad-pro.ps1` - 启动脚本
- 📄 `reports/IPAD-PRO-1024x1366-DEBUG-REPORT.md` - 调试报告示例
- 📄 `reports/cdp-logs/ipad-pro-1024x1366-debug.json` - 日志示例

---

## 📞 支持

如有问题，请参考:
- [Responsively App 文档](https://responsively.app/)
- [Chrome DevTools Protocol 文档](https://chromedevtools.github.io/devtools-protocol/)
- [WebSocket API 文档](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**最后更新**: 2025-11-09  
**版本**: 1.0

