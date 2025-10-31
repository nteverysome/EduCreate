#!/usr/bin/env python3
"""
演示如何使用 Playwright 連接到已運行的 Chrome 實例
方式 B：連接到已運行的實例
"""

import asyncio
from playwright.async_api import async_playwright
import json
import requests

async def connect_to_existing_chrome():
    """連接到已運行的 Chrome 實例"""
    
    # 1. 檢查 Chrome 調試端口是否可用
    try:
        response = requests.get('http://localhost:9222/json/version', timeout=5)
        chrome_info = response.json()
        print(f"✅ 找到 Chrome 實例:")
        print(f"   瀏覽器: {chrome_info.get('Browser', 'Unknown')}")
        print(f"   用戶代理: {chrome_info.get('User-Agent', 'Unknown')}")
        print(f"   WebSocket 調試 URL: {chrome_info.get('webSocketDebuggerUrl', 'Unknown')}")
    except Exception as e:
        print(f"❌ 無法連接到 Chrome 調試端口 9222: {e}")
        print("請確保 Chrome 以 --remote-debugging-port=9222 參數啟動")
        return

    # 2. 使用 Playwright 連接到 Chrome
    async with async_playwright() as p:
        try:
            # 連接到已運行的 Chrome 實例
            browser = await p.chromium.connect_over_cdp("http://localhost:9222")
            print("✅ Playwright 成功連接到 Chrome!")
            
            # 獲取所有上下文和頁面
            contexts = browser.contexts
            print(f"📋 找到 {len(contexts)} 個瀏覽器上下文")
            
            for i, context in enumerate(contexts):
                pages = context.pages
                print(f"   上下文 {i+1}: {len(pages)} 個頁面")
                
                for j, page in enumerate(pages):
                    try:
                        title = await page.title()
                        url = page.url
                        print(f"     頁面 {j+1}: {title} ({url})")
                    except Exception as e:
                        print(f"     頁面 {j+1}: 無法獲取信息 ({e})")
            
            # 如果沒有頁面，創建一個新頁面
            if not any(context.pages for context in contexts):
                print("📄 沒有找到現有頁面，創建新頁面...")
                if contexts:
                    page = await contexts[0].new_page()
                else:
                    context = await browser.new_context()
                    page = await context.new_page()
            else:
                # 使用第一個可用頁面
                page = None
                for context in contexts:
                    if context.pages:
                        page = context.pages[0]
                        break
            
            if page:
                print(f"🎯 使用頁面: {await page.title()}")
                
                # 演示一些操作
                print("🚀 演示操作...")
                
                # 導航到 EduCreate
                await page.goto('https://edu-create.vercel.app')
                await page.wait_for_load_state('networkidle')
                
                title = await page.title()
                print(f"📄 頁面標題: {title}")
                
                # 截圖
                screenshot_path = "chrome-connection-test.png"
                await page.screenshot(path=screenshot_path)
                print(f"📸 截圖已保存: {screenshot_path}")
                
                # 獲取頁面文本
                text_content = await page.inner_text('body')
                print(f"📝 頁面文本長度: {len(text_content)} 字符")
                
                # 嘗試點擊操作
                try:
                    await page.click('text=進入遊戲中心', timeout=5000)
                    print("🖱️ 成功點擊 '進入遊戲中心'")
                    await page.wait_for_load_state('networkidle')
                    new_title = await page.title()
                    print(f"📄 新頁面標題: {new_title}")
                except Exception as e:
                    print(f"⚠️ 點擊操作失敗: {e}")
            
            print("✅ 所有操作完成!")
            
        except Exception as e:
            print(f"❌ Playwright 連接失敗: {e}")
        finally:
            # 注意：不要關閉瀏覽器，因為它不是我們啟動的
            print("🔄 保持 Chrome 實例運行...")

def check_chrome_debug_port():
    """檢查 Chrome 調試端口狀態"""
    try:
        response = requests.get('http://localhost:9222/json', timeout=5)
        tabs = response.json()
        print(f"🔍 Chrome 調試信息:")
        print(f"   活動標籤頁數量: {len(tabs)}")
        for i, tab in enumerate(tabs[:3]):  # 只顯示前3個
            print(f"   標籤頁 {i+1}: {tab.get('title', 'Unknown')} - {tab.get('url', 'Unknown')}")
        if len(tabs) > 3:
            print(f"   ... 還有 {len(tabs) - 3} 個標籤頁")
        return True
    except Exception as e:
        print(f"❌ Chrome 調試端口不可用: {e}")
        return False

if __name__ == "__main__":
    print("🔍 檢查 Chrome 調試端口...")
    if check_chrome_debug_port():
        print("\n🚀 開始連接到 Chrome...")
        asyncio.run(connect_to_existing_chrome())
    else:
        print("\n📋 使用方式:")
        print("1. 運行 start-chrome-debug.bat 啟動 Chrome")
        print("2. 或手動啟動: chrome --remote-debugging-port=9222")
        print("3. 然後運行此腳本")