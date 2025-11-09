# 🔬 Chrome DevTools Protocol (CDP) 技术深度指南

**最后更新**: 2025-11-09  
**目的**: 理解 CDP 如何工作以及如何使用它来调试 Responsively App 中的游戏

---

## 📋 目录

1. [CDP 基础](#cdp-基础)
2. [连接流程](#连接流程)
3. [协议详解](#协议详解)
4. [实现示例](#实现示例)
5. [高级用法](#高级用法)

---

## 🎯 CDP 基础

### 什么是 CDP?

**Chrome DevTools Protocol** 是一个低级调试协议，允许工具通过 WebSocket 连接与 Chrome/Chromium 浏览器通信。

### 为什么使用 CDP?

| 用途 | 说明 |
|------|------|
| **远程调试** | 从另一个进程调试浏览器 |
| **自动化测试** | 自动化浏览器操作和数据收集 |
| **性能分析** | 收集性能指标和追踪信息 |
| **日志收集** | 实时收集控制台日志 |
| **截图** | 捕获页面快照 |

### CDP 架构

```
┌─────────────────────────────────────────────────────┐
│         Responsively App (浏览器)                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  WebSocket Server (ws://127.0.0.1:9222)     │  │
│  │  - Runtime Domain                           │  │
│  │  - Console Domain                           │  │
│  │  - Page Domain                              │  │
│  │  - Network Domain                           │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        ↑
                        │ WebSocket
                        │ JSON-RPC
                        ↓
┌─────────────────────────────────────────────────────┐
│         Node.js 脚本 (调试客户端)                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  collect-ipad-pro-logs.js                   │  │
│  │  - 连接到 WebSocket                         │  │
│  │  - 发送命令                                 │  │
│  │  - 接收事件                                 │  │
│  │  - 处理日志                                 │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 连接流程

### 步骤 1: 获取 CDP 端点

```javascript
// 通过 HTTP 获取所有可用的页面
const http = require('http');
const pages = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
});

// 响应格式
[
    {
        "description": "",
        "devtoolsFrontendUrl": "/devtools/inspector.html?ws=127.0.0.1:9222/devtools/page/...",
        "id": "DBE6450976E772047A6CAB720B28E805",
        "title": "Responsively App",
        "type": "page",
        "url": "file:///C:/Users/Administrator/AppData/Local/Programs/ResponsivelyApp/...",
        "webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/page/DBE6450976E772047A6CAB720B28E805"
    },
    {
        "description": "",
        "devtoolsFrontendUrl": "/devtools/inspector.html?ws=127.0.0.1:9222/devtools/page/...",
        "id": "D1685CACAF6E3AE5D69F6849F8FFB2FD",
        "title": "EduCreate - 記憶科學驅動的智能教育遊戲平台",
        "type": "webview",
        "url": "https://edu-create.vercel.app/games/switcher?game=match-up-game&...",
        "webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/page/D1685CACAF6E3AE5D69F6849F8FFB2FD"
    }
]
```

### 步骤 2: 连接到 WebSocket

```javascript
const WebSocket = require('ws');

// 连接到游戏页面的 WebSocket
const wsEndpoint = 'ws://127.0.0.1:9222/devtools/page/D1685CACAF6E3AE5D69F6849F8FFB2FD';
const ws = new WebSocket(wsEndpoint);

ws.on('open', () => {
    console.log('✅ 已连接到 CDP');
});

ws.on('error', (error) => {
    console.error('❌ 连接错误:', error);
});

ws.on('close', () => {
    console.log('⚠️ 连接已关闭');
});
```

### 步骤 3: 启用 Domain

```javascript
// 发送命令启用 Console Domain
const command = {
    id: 1,
    method: 'Console.enable',
    params: {}
};

ws.send(JSON.stringify(command));

// 响应
{
    "id": 1,
    "result": {}
}
```

---

## 📡 协议详解

### 消息格式

#### 请求 (Client → Server)

```javascript
{
    "id": 1,                    // 唯一标识符
    "method": "Console.enable", // 方法名 (Domain.method)
    "params": {}                // 参数
}
```

#### 响应 (Server → Client)

```javascript
{
    "id": 1,                    // 对应请求的 id
    "result": {}                // 结果
}
```

#### 事件 (Server → Client)

```javascript
{
    "method": "Console.messageAdded",  // 事件名
    "params": {
        "message": {
            "source": "console-api",
            "level": "log",
            "text": "🔥 [v57.0] 平板直向列數計算",
            "timestamp": 1234567890.123,
            "url": "https://edu-create.vercel.app/...",
            "executionContextId": 1
        }
    }
}
```

### 常用 Domain

| Domain | 用途 | 常用方法 |
|--------|------|---------|
| **Console** | 控制台操作 | enable, disable, clearMessages |
| **Runtime** | JavaScript 执行 | evaluate, callFunctionOn |
| **Page** | 页面操作 | navigate, reload, captureScreenshot |
| **Network** | 网络监控 | enable, disable, getResponseBody |
| **Performance** | 性能分析 | enable, disable, getMetrics |

---

## 💻 实现示例

### 示例 1: 收集控制台日志

```javascript
const WebSocket = require('ws');

async function collectConsoleLogs() {
    const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/...');
    const consoleLogs = [];
    let messageId = 1;
    
    // 连接成功
    ws.on('open', () => {
        // 启用 Console Domain
        ws.send(JSON.stringify({
            id: messageId++,
            method: 'Console.enable',
            params: {}
        }));
    });
    
    // 接收消息
    ws.on('message', (data) => {
        const message = JSON.parse(data);
        
        // 处理控制台消息事件
        if (message.method === 'Console.messageAdded') {
            const msg = message.params.message;
            consoleLogs.push({
                type: msg.level,
                text: msg.text,
                timestamp: new Date(msg.timestamp * 1000).toISOString()
            });
            console.log(`📌 ${msg.text}`);
        }
    });
    
    // 等待 10 秒
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 关闭连接
    ws.close();
    
    return consoleLogs;
}
```

### 示例 2: 执行 JavaScript

```javascript
async function evaluateInPage(ws, expression) {
    return new Promise((resolve, reject) => {
        const id = 1;
        
        // 发送 evaluate 命令
        ws.send(JSON.stringify({
            id,
            method: 'Runtime.evaluate',
            params: {
                expression: expression,
                returnByValue: true
            }
        }));
        
        // 监听响应
        const handler = (data) => {
            const message = JSON.parse(data);
            if (message.id === id) {
                ws.removeListener('message', handler);
                if (message.result && message.result.result) {
                    resolve(message.result.result.value);
                } else {
                    reject(new Error('Evaluation failed'));
                }
            }
        };
        
        ws.on('message', handler);
    });
}

// 使用示例
const gameInfo = await evaluateInPage(ws, `
    ({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
    })
`);
```

### 示例 3: 截图

```javascript
async function takeScreenshot(ws) {
    return new Promise((resolve, reject) => {
        const id = 1;
        
        ws.send(JSON.stringify({
            id,
            method: 'Page.captureScreenshot',
            params: {
                format: 'png',
                quality: 80
            }
        }));
        
        const handler = (data) => {
            const message = JSON.parse(data);
            if (message.id === id) {
                ws.removeListener('message', handler);
                if (message.result) {
                    resolve(message.result.data);
                } else {
                    reject(new Error('Screenshot failed'));
                }
            }
        };
        
        ws.on('message', handler);
    });
}
```

---

## 🚀 高级用法

### 1. 性能监控

```javascript
// 启用 Performance Domain
ws.send(JSON.stringify({
    id: 1,
    method: 'Performance.enable',
    params: {}
}));

// 获取性能指标
ws.send(JSON.stringify({
    id: 2,
    method: 'Performance.getMetrics',
    params: {}
}));
```

### 2. 网络监控

```javascript
// 启用 Network Domain
ws.send(JSON.stringify({
    id: 1,
    method: 'Network.enable',
    params: {}
}));

// 监听网络请求
ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.method === 'Network.requestWillBeSent') {
        console.log('📡 请求:', message.params.request.url);
    }
});
```

### 3. 自动化测试

```javascript
// 导航到页面
ws.send(JSON.stringify({
    id: 1,
    method: 'Page.navigate',
    params: { url: 'https://example.com' }
}));

// 等待页面加载
await new Promise(resolve => {
    ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.method === 'Page.loadEventFired') {
            resolve();
        }
    });
});

// 执行测试
const result = await evaluateInPage(ws, 'document.title');
console.log('页面标题:', result);
```

---

## 📊 调试技巧

### 1. 打印所有消息

```javascript
ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('📨 收到消息:', JSON.stringify(message, null, 2));
});
```

### 2. 过滤特定日志

```javascript
ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.method === 'Console.messageAdded') {
        const text = message.params.message.text;
        if (text.includes('[v57') || text.includes('[v58')) {
            console.log('🔥 关键日志:', text);
        }
    }
});
```

### 3. 保存日志到文件

```javascript
const fs = require('fs');
const logs = [];

ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.method === 'Console.messageAdded') {
        logs.push(message.params.message);
    }
});

// 保存
fs.writeFileSync('logs.json', JSON.stringify(logs, null, 2));
```

---

## 🔗 相关资源

- [CDP 官方文档](https://chromedevtools.github.io/devtools-protocol/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Responsively App](https://responsively.app/)
- [Puppeteer 文档](https://pptr.dev/)

---

**最后更新**: 2025-11-09  
**版本**: 1.0

