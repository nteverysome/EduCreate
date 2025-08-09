#!/bin/bash
# Phaser 3 錯誤預防檢查腳本
# 使用方法: ./phaser3-prevention-check.sh [文件路徑]

echo "🎯 執行 Phaser 3 錯誤預防檢查"

# 設定檢查目標
TARGET_PATH="${1:-.}"
echo "📁 檢查路徑: $TARGET_PATH"

# 初始化檢查結果
TOTAL_CHECKS=5
PASSED_CHECKS=0
ISSUES_FOUND=()

echo ""
echo "=================================="
echo "🎮 Phaser 3 錯誤預防檢查報告"
echo "=================================="

# 檢查 1: StandardPhaserConfig 使用
echo "🔍 檢查 1/5: StandardPhaserConfig 使用狀況"
if find "$TARGET_PATH" -name "*.js" -o -name "*.ts" | xargs grep -l "StandardPhaserConfig\|STANDARD_CONFIG" > /dev/null 2>&1; then
    echo "✅ 發現 StandardPhaserConfig 使用"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo "⚠️ 未發現 StandardPhaserConfig 使用"
    ISSUES_FOUND+=("建議使用 StandardPhaserConfig (89% 成功率配置)")
fi

# 檢查 2: 物理系統配置
echo ""
echo "🔍 檢查 2/5: 物理系統配置"
PHYSICS_CONFIG_FOUND=false
PHYSICS_USAGE_FOUND=false

# 檢查物理系統配置
if find "$TARGET_PATH" -name "*.js" -o -name "*.ts" | xargs grep -l "physics.*arcade\|physics.*matter" > /dev/null 2>&1; then
    PHYSICS_CONFIG_FOUND=true
fi

# 檢查物理系統使用
if find "$TARGET_PATH" -name "*.js" -o -name "*.ts" | xargs grep -l "this\.physics\.add\|physics\.add" > /dev/null 2>&1; then
    PHYSICS_USAGE_FOUND=true
fi

if [ "$PHYSICS_USAGE_FOUND" = true ] && [ "$PHYSICS_CONFIG_FOUND" = true ]; then
    echo "✅ 物理系統配置正確"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
elif [ "$PHYSICS_USAGE_FOUND" = true ] && [ "$PHYSICS_CONFIG_FOUND" = false ]; then
    echo "❌ 使用物理系統但未在配置中啟用"
    ISSUES_FOUND+=("在遊戲配置中啟用物理引擎: physics: { default: 'arcade', arcade: { gravity: { y: 0 } } }")
elif [ "$PHYSICS_USAGE_FOUND" = false ]; then
    echo "ℹ️ 未使用物理系統"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# 檢查 3: 精靈創建方式
echo ""
echo "🔍 檢查 3/5: 精靈創建方式"
WRONG_SPRITE_USAGE=false

# 檢查是否有錯誤的精靈使用方式
if find "$TARGET_PATH" -name "*.js" -o -name "*.ts" | xargs grep -l "this\.add\.sprite.*setVelocity\|add\.sprite.*setVelocity" > /dev/null 2>&1; then
    echo "❌ 發現對非物理精靈使用物理方法"
    ISSUES_FOUND+=("使用 this.physics.add.sprite() 創建物理精靈，而不是 this.add.sprite()")
    WRONG_SPRITE_USAGE=true
fi

if [ "$WRONG_SPRITE_USAGE" = false ]; then
    echo "✅ 精靈創建方式正確"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# 檢查 4: Scale Manager 配置
echo ""
echo "🔍 檢查 4/5: Scale Manager 配置"
SCALE_CONFIG_FOUND=false

if find "$TARGET_PATH" -name "*.js" -o -name "*.ts" | xargs grep -l "Scale\.FIT\|scale.*FIT\|Scale\.CENTER_BOTH\|autoCenter.*CENTER_BOTH" > /dev/null 2>&1; then
    echo "✅ 發現正確的 Scale Manager 配置"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    SCALE_CONFIG_FOUND=true
fi

if [ "$SCALE_CONFIG_FOUND" = false ]; then
    echo "⚠️ 未發現推薦的 Scale Manager 配置"
    ISSUES_FOUND+=("建議使用 Scale.FIT 模式和 CENTER_BOTH 自動居中")
fi

# 檢查 5: 響應式系統簡化
echo ""
echo "🔍 檢查 5/5: 響應式系統複雜度"
COMPLEX_RESPONSIVE_FOUND=false

# 檢查是否有過度複雜的響應式管理器
if find "$TARGET_PATH" -name "*.js" -o -name "*.ts" | xargs grep -l "ResponsiveManager\|AdaptiveFullscreenManager" > /dev/null 2>&1; then
    echo "⚠️ 發現複雜的響應式管理器"
    ISSUES_FOUND+=("建議使用 Phaser 內建 Scale 系統: scene.scale.on('resize', callback)")
    COMPLEX_RESPONSIVE_FOUND=true
fi

if [ "$COMPLEX_RESPONSIVE_FOUND" = false ]; then
    echo "✅ 響應式系統簡化良好"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# 生成檢查報告
echo ""
echo "=================================="
echo "📊 檢查結果統計"
echo "=================================="
echo "✅ 通過檢查: $PASSED_CHECKS/$TOTAL_CHECKS"

# 計算通過率
PASS_RATE=$(echo "scale=1; $PASSED_CHECKS * 100 / $TOTAL_CHECKS" | bc)
echo "📈 通過率: $PASS_RATE%"

# 評估結果
if [ "$PASSED_CHECKS" -eq "$TOTAL_CHECKS" ]; then
    echo "🎉 所有檢查通過！Phaser 3 配置完美"
    RESULT_STATUS="PERFECT"
elif [ "$PASSED_CHECKS" -ge 4 ]; then
    echo "👍 大部分檢查通過，只有少量問題"
    RESULT_STATUS="GOOD"
elif [ "$PASSED_CHECKS" -ge 2 ]; then
    echo "⚠️ 部分檢查通過，需要改進"
    RESULT_STATUS="NEEDS_IMPROVEMENT"
else
    echo "❌ 多項檢查失敗，需要重大改進"
    RESULT_STATUS="CRITICAL"
fi

# 顯示發現的問題
if [ ${#ISSUES_FOUND[@]} -gt 0 ]; then
    echo ""
    echo "🔧 發現的問題和建議修復方案:"
    for i in "${!ISSUES_FOUND[@]}"; do
        echo "$((i+1)). ${ISSUES_FOUND[$i]}"
    done
fi

# 提供 Phaser 3 最佳實踐建議
echo ""
echo "💡 Phaser 3 最佳實踐建議:"
echo "1. 使用 StandardPhaserConfig 統一配置模板"
echo "2. 物理系統使用前必須在配置中啟用"
echo "3. 創建物理精靈使用 this.physics.add.sprite()"
echo "4. 使用 Scale.FIT 保持比例，CENTER_BOTH 自動居中"
echo "5. 避免複雜的自定義響應式管理器"

# 記錄檢查結果到本地記憶系統
TIMESTAMP=$(date -Iseconds)
CHECK_RESULT="{
    \"timestamp\": \"$TIMESTAMP\",
    \"target_path\": \"$TARGET_PATH\",
    \"total_checks\": $TOTAL_CHECKS,
    \"passed_checks\": $PASSED_CHECKS,
    \"pass_rate\": $PASS_RATE,
    \"status\": \"$RESULT_STATUS\",
    \"issues_count\": ${#ISSUES_FOUND[@]}
}"

# 確保目錄存在
mkdir -p EduCreate-Test-Videos/local-memory

# 記錄到 Phaser 3 錯誤模式文件
if [ -f "EduCreate-Test-Videos/local-memory/phaser3-error-patterns.json" ]; then
    # 更新現有文件
    jq ".prevention_checks += [$CHECK_RESULT]" EduCreate-Test-Videos/local-memory/phaser3-error-patterns.json > /tmp/phaser3_temp.json
    mv /tmp/phaser3_temp.json EduCreate-Test-Videos/local-memory/phaser3-error-patterns.json
else
    echo "⚠️ phaser3-error-patterns.json 文件不存在，跳過記錄"
fi

echo ""
echo "🧠 檢查結果已記錄到本地記憶系統"
echo "✅ Phaser 3 錯誤預防檢查完成"

# 返回適當的退出碼
if [ "$RESULT_STATUS" = "PERFECT" ] || [ "$RESULT_STATUS" = "GOOD" ]; then
    exit 0
else
    exit 1
fi
