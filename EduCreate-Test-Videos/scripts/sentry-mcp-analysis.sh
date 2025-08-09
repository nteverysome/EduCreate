#!/bin/bash
# Sentry MCP 智能錯誤分析腳本
# 使用方法: ./sentry-mcp-analysis.sh "問題描述"

echo "🤖 啟動 Sentry MCP 智能錯誤分析"

# 檢查參數
if [ -z "$1" ]; then
    echo "❌ 錯誤: 請提供問題描述"
    echo "使用方法: ./sentry-mcp-analysis.sh \"問題描述\""
    exit 1
fi

PROBLEM_DESCRIPTION="$1"

# 檢查 Sentry 環境變數
if [ -z "$SENTRY_AUTH_TOKEN" ]; then
    echo "⚠️ 警告: SENTRY_AUTH_TOKEN 環境變數未設定"
    echo "嘗試從 .env.sentry 文件讀取..."
    
    if [ -f ".env.sentry" ]; then
        source .env.sentry
        echo "✅ 已從 .env.sentry 載入環境變數"
    else
        echo "❌ 錯誤: 找不到 .env.sentry 文件"
        echo "請設定 SENTRY_AUTH_TOKEN 環境變數或創建 .env.sentry 文件"
        exit 1
    fi
fi

# 記錄分析開始時間
echo "$(date +%s)" > /tmp/sentry_analysis_start_time
echo "⏱️ 開始時間: $(date)"

echo "🔍 分析問題: $PROBLEM_DESCRIPTION"

# 執行 Sentry MCP 分析
echo "📡 連接 Sentry MCP Server..."
echo "$PROBLEM_DESCRIPTION" | npx @sentry/mcp-server --access-token="$SENTRY_AUTH_TOKEN" 2>/dev/null || {
    echo "⚠️ Sentry MCP Server 連接失敗，使用本地記憶系統分析"
    
    # 使用本地記憶系統進行分析
    echo "🧠 查詢本地記憶系統..."
    
    # 檢查 Phaser 3 錯誤模式
    if [[ "$PROBLEM_DESCRIPTION" == *"phaser"* || "$PROBLEM_DESCRIPTION" == *"game"* ]]; then
        echo "🎮 檢測到 Phaser 3 相關問題，查詢專門錯誤模式..."
        
        if [ -f "EduCreate-Test-Videos/local-memory/phaser3-error-patterns.json" ]; then
            echo "📋 Phaser 3 錯誤模式分析結果:"
            cat EduCreate-Test-Videos/local-memory/phaser3-error-patterns.json | jq '.phaser3_common_errors | to_entries[] | select(.value.error_pattern | test("'"$PROBLEM_DESCRIPTION"'"; "i")) | {error: .key, pattern: .value.error_pattern, solutions: .value.solutions}'
        fi
    fi
    
    # 檢查 Sentry 錯誤模式
    if [ -f "EduCreate-Test-Videos/local-memory/sentry-error-patterns.json" ]; then
        echo "🔍 Sentry 錯誤模式分析結果:"
        cat EduCreate-Test-Videos/local-memory/sentry-error-patterns.json | jq '.error_patterns[] | select(.description | test("'"$PROBLEM_DESCRIPTION"'"; "i"))'
    fi
}

# 生成分析報告
echo ""
echo "📊 生成智能分析報告..."
echo "=================================="
echo "🤖 Sentry MCP 智能錯誤分析報告"
echo "=================================="
echo "📅 分析時間: $(date)"
echo "🔍 問題描述: $PROBLEM_DESCRIPTION"
echo ""

# 提供通用建議
echo "💡 通用修復建議:"
echo "1. 檢查相關文件的語法錯誤"
echo "2. 驗證依賴項是否正確安裝"
echo "3. 查看瀏覽器控制台錯誤信息"
echo "4. 檢查網絡連接和資源載入"
echo ""

# 如果是 Phaser 3 相關問題，提供專門建議
if [[ "$PROBLEM_DESCRIPTION" == *"phaser"* || "$PROBLEM_DESCRIPTION" == *"game"* ]]; then
    echo "🎮 Phaser 3 專門建議:"
    echo "1. 確認使用 StandardPhaserConfig (89% 成功率配置)"
    echo "2. 檢查物理系統是否在配置中啟用"
    echo "3. 驗證精靈創建使用 this.physics.add.sprite()"
    echo "4. 確認 Scale.FIT 模式和 CENTER_BOTH 配置"
    echo "5. 使用 Phaser 內建 Scale 系統，避免複雜自定義管理器"
    echo ""
fi

echo "🔗 相關資源:"
echo "- 本地記憶系統: EduCreate-Test-Videos/local-memory/"
echo "- Phaser 3 錯誤模式: phaser3-error-patterns.json"
echo "- Sentry 錯誤模式: sentry-error-patterns.json"
echo ""

echo "✅ Sentry MCP 智能錯誤分析完成"
echo "⏱️ 結束時間: $(date)"

# 記錄分析結果到本地記憶系統
TIMESTAMP=$(date -Iseconds)
ANALYSIS_RESULT="{\"timestamp\": \"$TIMESTAMP\", \"problem\": \"$PROBLEM_DESCRIPTION\", \"analysis_completed\": true}"

# 確保目錄存在
mkdir -p EduCreate-Test-Videos/local-memory

# 記錄到 Sentry 錯誤模式文件
if [ -f "EduCreate-Test-Videos/local-memory/sentry-error-patterns.json" ]; then
    # 更新現有文件
    jq ".integration_logs += [$ANALYSIS_RESULT]" EduCreate-Test-Videos/local-memory/sentry-error-patterns.json > /tmp/sentry_temp.json
    mv /tmp/sentry_temp.json EduCreate-Test-Videos/local-memory/sentry-error-patterns.json
else
    # 創建新文件
    echo "{\"error_patterns\": [], \"fix_solutions\": [], \"performance_issues\": [], \"user_feedback\": [], \"integration_logs\": [$ANALYSIS_RESULT], \"last_updated\": \"$TIMESTAMP\"}" > EduCreate-Test-Videos/local-memory/sentry-error-patterns.json
fi

echo "🧠 分析結果已記錄到本地記憶系統"
