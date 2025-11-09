# 1024×1366 布局调试指南

## 快速开始

### 方法 1：使用 Playwright 自动调试（推荐）

```bash
npm run debug:match-up:1024x1366
```

这个命令会：
1. ✅ 启动 Next.js 开发服务器
2. ✅ 启动 Chromium 浏览器，设置 1024×1366 分辨率
3. ✅ 自动打开开发者工具 (F12)
4. ✅ 注入调试脚本
5. ✅ 显示布局检查结果

### 方法 2：手动使用 Responsively App

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **打开 Responsively App**：
   ```bash
   C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe
   ```

3. **在 Responsively App 中**：
   - 输入 URL: `http://localhost:3000/games/match-up-game`
   - 设置分辨率为 1024×1366
   - 按 F12 打开开发者工具

## 调试工具

### 在浏览器控制台中执行

```javascript
// 检查当前布局
window.DEBUG_LAYOUT.checkLayout()

// 输出示例：
{
  "totalCards": 20,
  "estimatedCols": 5,
  "cardWidth": 150,
  "cardHeight": 150,
  "viewport": {
    "width": 1024,
    "height": 1366
  }
}
```

## 关键日志消息

在浏览器控制台中查找以下日志消息：

- **🔥 [v57.0]** - 平板直向列数计算（动态最大列数）
- **🔥 [v58.0]** - 平板直向列数计算（动态目标卡片宽度）
- **📱 [v49.0]** - iPad 平板直向动态卡片尺寸
- **🎮** - 游戏容器信息

## 问题排查

### 问题：浏览器没有打开

**解决方案**：
1. 确保 Playwright 已安装：`npx playwright install`
2. 检查端口 3000 是否被占用
3. 查看控制台错误信息

### 问题：页面加载超时

**解决方案**：
1. 确保 Next.js 服务器已启动
2. 检查网络连接
3. 尝试手动导航到 `http://localhost:3000`

### 问题：卡片显示不正确

**解决方案**：
1. 在控制台执行 `window.DEBUG_LAYOUT.checkLayout()`
2. 检查 `estimatedCols` 是否为 6-7
3. 查看 🔥 日志消息了解计算过程

## 修改代码后的测试

1. **修改代码**（例如：`public/games/match-up-game/scenes/game.js`）
2. **保存文件** - Next.js 会自动重新加载
3. **刷新浏览器** - Ctrl+R 或 Cmd+R
4. **检查布局** - 在控制台执行 `window.DEBUG_LAYOUT.checkLayout()`

## 关键代码位置

### 平板直向模式列数计算
- **文件**: `public/games/match-up-game/scenes/game.js`
- **行号**: 2541-2600
- **关键变量**:
  - `isTabletPortrait` - 是否为平板直向模式
  - `targetCardWidth` - 目标卡片宽度
  - `maxColsLimit` - 最大列数限制
  - `optimalCols` - 最终列数

### 最小卡片尺寸计算
- **文件**: `public/games/match-up-game/scenes/game.js`
- **行号**: 2479-2528
- **关键变量**:
  - `minSquareSize` - 最小卡片尺寸
  - `width` - 屏幕宽度

## 预期结果

### 1024×1366 (iPad Pro 12.9" 直向)
- ✅ 显示 6-7 列
- ✅ 卡片大小合适
- ✅ 充分利用宽度

### 820×1180 (iPad Air 直向)
- ✅ 显示 6-7 列
- ✅ 卡片大小合适
- ✅ 与 1024×1366 效果相似

## 性能提示

- 使用 `npm run debug:match-up:1024x1366` 时，浏览器会自动打开
- 按 Ctrl+C 关闭调试会话
- 开发者工具会自动打开，可以查看网络、控制台等

## 更多帮助

如果遇到问题，请检查：
1. 浏览器控制台中的错误信息
2. 网络标签中的请求状态
3. 元素检查器中的 DOM 结构
4. 计算样式中的 CSS 值

