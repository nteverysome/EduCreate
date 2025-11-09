# ⚡ CDP 快速参考卡片

**快速查找常用命令和代码片段**

---

## 🚀 快速启动

### 启动 Responsively App + CDP

```bash
# PowerShell
powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-ipad-pro.ps1

# 或手动启动
"C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe" --remote-debugging-port=9222
```

### 收集日志

```bash
node scripts/collect-ipad-pro-logs.js
```

### 查看日志

```bash
node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('reports/cdp-logs/ipad-pro-1024x1366-debug.json', 'utf8')); console.log(JSON.stringify(data, null, 2));"
```

---

## 📡 CDP 命令速查表

### Console Domain

| 命令 | 说明 | 代码 |
|------|------|------|
| **enable** | 启用控制台 | `{id:1, method:'Console.enable', params:{}}` |
| **disable** | 禁用控制台 | `{id:1, method:'Console.disable', params:{}}` |
| **clearMessages** | 清除消息 | `{id:1, method:'Console.clearMessages', params:{}}` |

### Runtime Domain

| 命令 | 说明 | 代码 |
|------|------|------|
| **enable** | 启用运行时 | `{id:1, method:'Runtime.enable', params:{}}` |
| **evaluate** | 执行 JS | `{id:1, method:'Runtime.evaluate', params:{expression:'1+1', returnByValue:true}}` |
| **callFunctionOn** | 调用函数 | `{id:1, method:'Runtime.callFunctionOn', params:{...}}` |

### Page Domain

| 命令 | 说明 | 代码 |
|------|------|------|
| **navigate** | 导航 | `{id:1, method:'Page.navigate', params:{url:'https://...'}}` |
| **reload** | 刷新 | `{id:1, method:'Page.reload', params:{}}` |
| **captureScreenshot** | 截图 | `{id:1, method:'Page.captureScreenshot', params:{format:'png'}}` |

---

## 💻 代码片段

### 连接到 CDP

```javascript
const WebSocket = require('ws');
const http = require('http');

// 获取端点
const pages = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
});

const gamePage = pages.find(p => p.url.includes('match-up-game'));
const ws = new WebSocket(gamePage.webSocketDebuggerUrl);

ws.on('open', () => console.log('✅ 已连接'));
```

### 收集控制台日志

```javascript
const consoleLogs = [];

ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.method === 'Console.messageAdded') {
        consoleLogs.push(message.params.message);
        console.log(`📌 ${message.params.message.text}`);
    }
});

// 启用 Console
ws.send(JSON.stringify({id:1, method:'Console.enable', params:{}}));
```

### 执行 JavaScript

```javascript
function evaluateInPage(ws, expression) {
    return new Promise((resolve, reject) => {
        const id = Math.random();
        ws.send(JSON.stringify({
            id, method:'Runtime.evaluate',
            params:{expression, returnByValue:true}
        }));
        
        ws.once('message', (data) => {
            const msg = JSON.parse(data);
            if (msg.id === id) {
                resolve(msg.result?.result?.value);
            }
        });
    });
}

// 使用
const width = await evaluateInPage(ws, 'window.innerWidth');
```

### 发送命令

```javascript
function sendCommand(ws, id, method, params) {
    return new Promise((resolve, reject) => {
        ws.send(JSON.stringify({id, method, params}));
        ws.once('message', (data) => {
            const msg = JSON.parse(data);
            if (msg.id === id) {
                resolve(msg.result);
            }
        });
    });
}

// 使用
await sendCommand(ws, 1, 'Console.enable', {});
```

---

## 🔍 日志分析

### 搜索特定版本

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('reports/cdp-logs/ipad-pro-1024x1366-debug.json', 'utf8'));
const v57 = data.consoleLogs.filter(l => l.text.includes('[v57'));
console.log('v57.0 日志:', v57.length);
v57.forEach(l => console.log(l.text));
"
```

### 统计日志类型

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('reports/cdp-logs/ipad-pro-1024x1366-debug.json', 'utf8'));
const types = {};
data.consoleLogs.forEach(l => {
    types[l.type] = (types[l.type] || 0) + 1;
});
console.log('日志类型统计:', types);
"
```

### 导出特定日志

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('reports/cdp-logs/ipad-pro-1024x1366-debug.json', 'utf8'));
const filtered = data.consoleLogs.filter(l => l.text.includes('平板'));
fs.writeFileSync('filtered-logs.json', JSON.stringify(filtered, null, 2));
console.log('已导出', filtered.length, '条日志');
"
```

---

## 🐛 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `ECONNREFUSED` | CDP 端点不可用 | 启动 Responsively App 并添加 `--remote-debugging-port=9222` |
| `找不到游戏页面` | 游戏还没打开 | 在 Responsively App 中手动打开游戏 URL |
| `WebSocket 连接失败` | 端点错误 | 检查 `http://127.0.0.1:9222/json` 获取正确的 WebSocket URL |
| `日志为空` | 游戏还没初始化 | 增加等待时间或刷新页面 |
| `Protocol error` | 不支持的操作 | 检查 Responsively App 的 CDP 实现限制 |

---

## 📊 输出文件位置

| 文件 | 说明 |
|------|------|
| `reports/cdp-logs/ipad-pro-1024x1366-debug.json` | 完整日志 (JSON) |
| `reports/IPAD-PRO-1024x1366-DEBUG-REPORT.md` | 调试报告 |
| `reports/cdp-logs/` | 所有日志文件目录 |

---

## 🔗 相关文件

| 文件 | 说明 |
|------|------|
| `scripts/collect-ipad-pro-logs.js` | 日志收集脚本 |
| `scripts/launch-responsively-ipad-pro.ps1` | 启动脚本 |
| `docs/CDP-RESPONSIVELY-DEBUG-GUIDE.md` | 完整指南 |
| `docs/CDP-TECHNICAL-DEEP-DIVE.md` | 技术深度指南 |

---

## 💡 提示

- 📌 **保存日志**: 每次收集后保存日志，便于对比
- 🔄 **定期更新**: 代码更新后重新收集日志
- 📝 **记录目的**: 在报告中记录收集的目的
- 🔍 **版本追踪**: 使用版本号 (v57.0, v58.0) 追踪代码变化
- ⏱️ **增加等待**: 如果日志不完整，增加等待时间

---

**最后更新**: 2025-11-09  
**版本**: 1.0

