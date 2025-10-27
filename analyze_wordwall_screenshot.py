#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Wordwall Match-up 遊戲截圖分析腳本
使用 PIL 分析遊戲排版（不需要 OpenCV）
"""

from PIL import Image, ImageDraw
import sys
import os

def analyze_screenshot(image_path):
    """分析 Wordwall Match-up 遊戲截圖"""

    print(f"📸 正在分析圖片: {image_path}")

    # 檢查文件是否存在
    if not os.path.exists(image_path):
        print(f"❌ 錯誤：文件不存在 - {image_path}")
        return

    # 讀取圖片
    try:
        img = Image.open(image_path)
    except Exception as e:
        print(f"❌ 錯誤：無法讀取圖片 - {e}")
        return

    width, height = img.size
    print(f"✅ 圖片尺寸: {width} x {height}")

    # 轉換為 RGB 模式
    if img.mode != 'RGB':
        img = img.convert('RGB')

    # 獲取像素數據
    pixels = img.load()

    # 簡單的顏色分析：檢測白色區域（可能是卡片）
    # Wordwall 的卡片通常是白色或淺色背景

    print("🔍 正在分析圖片內容...")

    # 掃描圖片，查找可能的卡片區域
    # 策略：查找大塊的白色或淺色矩形區域

    # 將圖片分為左右兩半
    left_half_x = width // 2

    # 簡單統計：計算左右兩側的亮度分布
    left_brightness = []
    right_brightness = []

    # 每隔 10 行掃描一次
    for y in range(0, height, 10):
        # 左側
        left_row_brightness = 0
        for x in range(0, left_half_x, 10):
            r, g, b = pixels[x, y]
            brightness = (r + g + b) / 3
            left_row_brightness += brightness
        left_brightness.append(left_row_brightness / (left_half_x / 10))

        # 右側
        right_row_brightness = 0
        for x in range(left_half_x, width, 10):
            r, g, b = pixels[x, y]
            brightness = (r + g + b) / 3
            right_row_brightness += brightness
        right_brightness.append(right_row_brightness / ((width - left_half_x) / 10))

    # 檢測亮度變化（可能是卡片邊界）
    def detect_cards_from_brightness(brightness_list, threshold=20):
        """從亮度列表中檢測卡片數量"""
        cards = 0
        in_card = False

        for i in range(1, len(brightness_list)):
            diff = abs(brightness_list[i] - brightness_list[i-1])

            if diff > threshold:
                if not in_card and brightness_list[i] > 200:
                    # 進入亮區域（可能是卡片）
                    in_card = True
                    cards += 1
                elif in_card and brightness_list[i] < 200:
                    # 離開亮區域
                    in_card = False

        return cards

    left_cards_count = detect_cards_from_brightness(left_brightness)
    right_cards_count = detect_cards_from_brightness(right_brightness)

    print(f"📊 左側檢測到約 {left_cards_count} 個卡片")
    print(f"📊 右側檢測到約 {right_cards_count} 個卡片")

    # 基於 Wordwall 的設置推測
    print("\n" + "="*50)
    print("📊 基於 Wordwall 設置的推測")
    print("="*50)
    print("根據 'Matches per page' 滑桿值 = 7")
    print("詞彙總數 = 30")
    print("推測：")
    print("  - 每頁顯示 7 個配對")
    print("  - 左側 7 個英文卡片")
    print("  - 右側 7 個中文卡片")
    print("  - 總共 5 頁（30 ÷ 7 ≈ 5 頁）")
    print("  - 當前顯示第 1 頁")
    print("="*50)

    # 總結
    print("\n" + "="*50)
    print("📊 分析總結")
    print("="*50)
    print(f"圖片尺寸: {width} x {height}")
    print(f"左側卡片數量（估計）: {left_cards_count}")
    print(f"右側卡片數量（估計）: {right_cards_count}")
    print("="*50)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ 用法: python analyze_wordwall_screenshot.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    analyze_screenshot(image_path)

