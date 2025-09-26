# Page snapshot

```yaml
- heading "📱 手機 PostMessage 通信測試工具" [level=1]
- strong: 🔍 環境信息：
- text: "📱 移動設備: 是 🍎 Safari: 是 📱 iOS: 是 🤖 Android: 否 📐 螢幕: 390x844 🪟 視窗: 390x844 📡 PostMessage: 支援"
- heading "📡 通信狀態" [level=3]
- text: 🔄 測試基本通信中...
- heading "🧪 測試功能" [level=3]
- button "📤 測試基本通信"
- button "🔧 測試強化通信"
- button "🍎 測試全螢幕請求"
- button "📊 監控通信狀態"
- button "🗑️ 清除日誌"
- heading "📋 測試日誌" [level=3]
- text: "[10:42:22 AM] 🚀 手機 PostMessage 測試工具初始化\\n[10:42:22 AM] 🔍 環境檢測完成: { \"userAgent\": \"Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1\", \"isMobile\": true, \"isSafari\": true, \"isIOS\": true, \"isAndroid\": false, \"screenWidth\": 390, \"screenHeight\": 844, \"windowWidth\": 390, \"windowHeight\": 844, \"hasPostMessage\": true, \"timestamp\": \"2025-09-26T02:42:22.347Z\" }\\n[10:42:22 AM] 📡 設置父頁面 PostMessage 監聽器\\n[10:42:22 AM] ✅ 父頁面 PostMessage 監聽器已設置\\n[10:42:22 AM] ✅ 測試工具初始化完成\\n[10:42:23 AM] 📨 父頁面收到消息: {\"type\":\"DIAGNOSTIC_REQUEST\",\"action\":\"COMMUNICATION_TEST\",\"timestamp\":\"2025-09-26T02:42:22.836Z\",\"testId\":\"l7otn0pa5\"}\\n[10:42:23 AM] ✅ 遊戲 iframe 已載入\\n[10:42:23 AM] 📨 父頁面收到消息: {\"type\":\"SETUP_PARENT_LISTENER\",\"timestamp\":1758854543842,\"userAgent\":\"Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1\",\"location\":\"http://localhost:3000/games/starshake-game/dist/index.html\"}\\n[10:42:23 AM] 🔧 處理監聽器設置請求\\n[10:42:23 AM] ✅ 父頁面監聽器就緒響應已發送\\n[10:42:23 AM] 📨 父頁面收到消息: {\"type\":\"COMMUNICATION_TEST\",\"testId\":\"test_1758854543861\",\"timestamp\":1758854543862,\"userAgent\":\"Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1\",\"isMobile\":true,\"isSafari\":true,\"isIOS\":true}\\n[10:42:23 AM] 🧪 處理通信測試: test_1758854543861\\n[10:42:23 AM] ✅ 通信測試響應已發送\\n[10:42:25 AM] 🧪 開始測試基本 PostMessage 通信\\n[10:42:25 AM] 📤 發送基本測試消息: {\"type\":\"BASIC_COMMUNICATION_TEST\",\"timestamp\":1758854545432,\"testId\":\"basic_1758854545432\"}"
- heading "🎮 遊戲 iframe 測試" [level=3]
- iframe
```