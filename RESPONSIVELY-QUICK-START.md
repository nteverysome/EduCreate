# 🚀 Responsively App + CDP 快速开始指南

## 📱 目标设备
- **设备**: iPad Pro 12.9"
- **分辨率**: 1024×1366px
- **DPR**: 2
- **模式**: 直向 (Portrait)

---

## ⚡ 3 步快速开始

### 1️⃣ 启动 Responsively App (15 秒)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-ipad-pro.ps1
```

**预期:**
```
✅ Responsively App 已启动 (PID: 12345)
✅ CDP 端点可用: http://127.0.0.1:9222/json
```

---

### 2️⃣ 在 Responsively App 中添加设备 (手动)

1. 点击 **"+ Add Device"**
2. 搜索 **"iPad Pro 12.9"** 或手动输入:
   - 宽度: **1024px**
   - 高度: **1366px**
   - DPR: **2**
3. 打开游戏 URL:
   ```
   https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20
   ```

---

### 3️⃣ 运行 CDP 控制器 (自动收集日志)

```bash
node scripts/cdp-ipad-pro-1024x1366.js
```

**预期:**
```
✅ 已连接到 Responsively App
✅ 游戏已加载
📝 开始收集控制台日志...
📌 🔥 [v57.0] 平板直向列數計算...
📌 🔥 [v58.0] 平板直向列數計算...
✅ 完成！共收集 627 条日志
📁 输出目录: reports/cdp-logs
```

---

## 📊 输出文件

| 文件 | 位置 | 内容 |
|------|------|------|
| 📄 日志 | `reports/cdp-logs/ipad-pro-1024x1366-logs.json` | 627 条日志 + 15 条关键日志 |
| 📸 截图 | `reports/cdp-logs/ipad-pro-1024x1366-screenshot.png` | 游戏当前状态 |

---

## 🔍 关键日志

### [v57.0] 平板直向列数计算

```json
{
  "width": 1024,
  "height": 1366,
  "calculatedCols": 7,
  "maxColsLimit": 8,
  "optimalCols": 7,
  "screenSize": "大屏幕"
}
```

✅ **结果**: 7 列卡片

### [v58.0] 目标卡片宽度

```json
{
  "width": 1024,
  "targetCardWidth": 145,
  "estimatedSquareSize": 130,
  "calculatedCols": 7,
  "optimalCols": 7
}
```

✅ **结果**: ~130×130px 卡片

---

## ✅ 预期结果

| 指标 | 值 |
|------|-----|
| **列数** | 7 列 (之前: 5 列) |
| **卡片尺寸** | ~130×130px |
| **可用宽度** | 944px |
| **效果** | ✅ 充分利用宽度 |

---

## 🛠️ 开发者工具

脚本会自动打开开发者工具 (F12)，你可以:

- 📝 查看控制台日志 (过滤: `[v57.0]` 或 `[v58.0]`)
- 🔍 检查元素 (验证卡片尺寸)
- ⚡ 性能分析 (检查渲染性能)

---

## 🐛 故障排除

| 问题 | 解决方案 |
|------|---------|
| 无法连接 CDP | 确保 Responsively App 已启动，等待 15 秒 |
| 没有找到页面 | 在 Responsively App 中打开游戏 URL |
| 开发者工具没打开 | 手动按 F12 或右键 → 检查元素 |

---

## 📚 详细文档

- 📄 `docs/RESPONSIVELY-IPAD-PRO-WORKFLOW.md` - 完整工作流程
- 📄 `reports/CDP-RESPONSIVELY-COMPLETE-REPORT.md` - 完整报告
- 📄 `docs/CDP-RESPONSIVELY-GUIDE.md` - CDP 使用指南

---

## 💡 提示

1. **实时调试**: 脚本保持连接打开，可继续在 Responsively App 中调试
2. **日志收集**: 所有日志自动保存到 JSON 文件
3. **自动截图**: 游戏状态自动截图保存
4. **多设备支持**: 可修改脚本支持其他设备

---

**快速命令参考:**

```bash
# 启动 Responsively App
powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-ipad-pro.ps1

# 运行 CDP 控制器
node scripts/cdp-ipad-pro-1024x1366.js

# 查看日志
cat reports/cdp-logs/ipad-pro-1024x1366-logs.json

# 查看截图
start reports/cdp-logs/ipad-pro-1024x1366-screenshot.png
```

---

**最后更新**: 2025-11-09  
**状态**: ✅ 完成并测试

