#!/usr/bin/env python3
"""
Google Drive + Filesystem MCP 組合使用示例
展示如何替代 Unstructured MCP
"""

import os
from pathlib import Path
from google_drive_downloader import GoogleDriveDownloader

def process_google_drive_files():
    """
    示例：從 Google Drive 下載文件並使用 Filesystem MCP 處理
    """
    
    # 1. 初始化 Google Drive 下載器
    service_account_key = os.getenv('GOOGLEDRIVE_SERVICE_ACCOUNT_KEY')
    if not service_account_key:
        print("❌ 請設置 GOOGLEDRIVE_SERVICE_ACCOUNT_KEY 環境變數")
        return
    
    downloader = GoogleDriveDownloader(service_account_key)
    
    # 2. 列出並下載 PDF 文件
    print("📋 搜索 Google Drive 中的 PDF 文件...")
    pdf_files = downloader.list_files(file_type='pdf')
    
    downloaded_files = []
    for file in pdf_files[:3]:  # 下載前 3 個 PDF
        print(f"📥 下載: {file['name']}")
        file_path = downloader.download_file(file['id'])
        if file_path:
            downloaded_files.append(file_path)
    
    # 3. 現在可以使用 Filesystem MCP 處理這些本地文件
    print("\n📁 下載完成的文件:")
    for file_path in downloaded_files:
        file_info = Path(file_path)
        print(f"  📄 {file_info.name} ({file_info.stat().st_size} bytes)")
    
    print(f"\n💡 提示: 現在可以使用 Filesystem MCP 的以下功能處理這些文件:")
    print("  • read_file - 讀取文件內容")
    print("  • edit_file - 編輯文件")
    print("  • search_files - 搜索文件內容")
    print("  • get_file_info - 獲取文件信息")
    
    return downloaded_files

def demonstrate_filesystem_mcp_integration():
    """
    展示如何與 Filesystem MCP 集成
    """
    print("\n🔧 Filesystem MCP 集成示例:")
    print("由於 Filesystem MCP 是通過 Claude Desktop 配置運行的，")
    print("您可以在 Claude 中直接使用以下命令:")
    
    print("\n📖 讀取下載的文件:")
    print('  Claude: "請使用 read_file 讀取 ./google_drive_downloads/document.pdf"')
    
    print("\n🔍 搜索文件內容:")
    print('  Claude: "請在 ./google_drive_downloads/ 目錄中搜索包含 \'關鍵字\' 的文件"')
    
    print("\n📝 編輯文件:")
    print('  Claude: "請使用 edit_file 修改 ./google_drive_downloads/document.txt"')

if __name__ == "__main__":
    print("🚀 Google Drive + Filesystem MCP 組合方案示例")
    print("=" * 50)
    
    # 處理 Google Drive 文件
    downloaded_files = process_google_drive_files()
    
    # 展示 Filesystem MCP 集成
    demonstrate_filesystem_mcp_integration()
    
    print("\n✅ 示例完成！")
    print("💡 這個方案完全免費，無需 Unstructured 平台！")