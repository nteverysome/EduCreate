#!/bin/bash

echo "🚀 Wordwall Clone 快速啟動腳本"
echo "================================"
echo ""

echo "📋 檢查 Node.js 環境..."
if ! command -v node &> /dev/null; then
    echo "❌ 未檢測到 Node.js，請先安裝 Node.js"
    echo "📥 下載地址: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 環境正常 ($(node --version))"
echo ""

echo "🔧 啟動簡化服務器 (無需依賴)..."
echo "📍 當前目錄: $(pwd)"
echo ""

echo "🌐 服務器將在以下地址啟動:"
echo "   主頁: http://localhost:3000"
echo "   遊戲演示: http://localhost:3000/interactive-demo.html"
echo "   詞彙管理: http://localhost:3000/vocabulary-input.html"
echo "   Agent儀表板: http://localhost:3000/agent-dashboard.html"
echo ""

echo "💡 提示: 按 Ctrl+C 停止服務器"
echo ""

# 設置腳本可執行權限
chmod +x "$0"

# 啟動服務器
node simple-server.js
