#!/usr/bin/env python3
"""
Google Drive 文件下載器
替代 Unstructured MCP 的免費方案
結合 Filesystem MCP 使用
"""

import os
import json
import base64
from pathlib import Path
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

class GoogleDriveDownloader:
    def __init__(self, service_account_key_base64=None):
        """
        初始化 Google Drive 下載器
        
        Args:
            service_account_key_base64: Base64 編碼的服務帳戶金鑰
        """
        self.service = None
        self.download_dir = Path("./google_drive_downloads")
        self.download_dir.mkdir(exist_ok=True)
        
        if service_account_key_base64:
            self.setup_service(service_account_key_base64)
    
    def setup_service(self, service_account_key_base64):
        """設置 Google Drive 服務"""
        try:
            # 解碼 Base64 服務帳戶金鑰
            service_account_info = json.loads(
                base64.b64decode(service_account_key_base64).decode('utf-8')
            )
            
            # 創建憑證
            credentials = Credentials.from_service_account_info(
                service_account_info,
                scopes=['https://www.googleapis.com/auth/drive.readonly']
            )
            
            # 建立 Drive 服務
            self.service = build('drive', 'v3', credentials=credentials)
            print("✅ Google Drive 服務初始化成功")
            
        except Exception as e:
            print(f"❌ Google Drive 服務初始化失敗: {e}")
            raise
    
    def list_files(self, folder_id=None, file_type=None):
        """
        列出 Google Drive 文件
        
        Args:
            folder_id: 資料夾 ID (可選)
            file_type: 文件類型過濾 (可選，如 'pdf', 'docx')
        
        Returns:
            文件列表
        """
        if not self.service:
            raise Exception("Google Drive 服務未初始化")
        
        query = "trashed=false"
        
        if folder_id:
            query += f" and '{folder_id}' in parents"
        
        if file_type:
            mime_types = {
                'pdf': 'application/pdf',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'doc': 'application/msword',
                'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'txt': 'text/plain'
            }
            
            if file_type in mime_types:
                query += f" and mimeType='{mime_types[file_type]}'"
        
        try:
            results = self.service.files().list(
                q=query,
                fields="files(id, name, mimeType, size, modifiedTime)"
            ).execute()
            
            files = results.get('files', [])
            print(f"📁 找到 {len(files)} 個文件")
            return files
            
        except Exception as e:
            print(f"❌ 列出文件失敗: {e}")
            return []
    
    def download_file(self, file_id, file_name=None):
        """
        下載單個文件
        
        Args:
            file_id: Google Drive 文件 ID
            file_name: 本地文件名 (可選)
        
        Returns:
            本地文件路徑
        """
        if not self.service:
            raise Exception("Google Drive 服務未初始化")
        
        try:
            # 獲取文件元數據
            file_metadata = self.service.files().get(fileId=file_id).execute()
            
            if not file_name:
                file_name = file_metadata['name']
            
            # 下載文件
            request = self.service.files().get_media(fileId=file_id)
            file_path = self.download_dir / file_name
            
            with open(file_path, 'wb') as fh:
                downloader = MediaIoBaseDownload(fh, request)
                done = False
                while done is False:
                    status, done = downloader.next_chunk()
                    if status:
                        print(f"📥 下載進度: {int(status.progress() * 100)}%")
            
            print(f"✅ 文件下載完成: {file_path}")
            return str(file_path)
            
        except Exception as e:
            print(f"❌ 下載文件失敗: {e}")
            return None
    
    def download_folder(self, folder_id, file_types=None):
        """
        下載整個資料夾
        
        Args:
            folder_id: Google Drive 資料夾 ID
            file_types: 文件類型列表 (可選)
        
        Returns:
            下載的文件路徑列表
        """
        downloaded_files = []
        
        if file_types:
            for file_type in file_types:
                files = self.list_files(folder_id, file_type)
                for file in files:
                    file_path = self.download_file(file['id'], file['name'])
                    if file_path:
                        downloaded_files.append(file_path)
        else:
            files = self.list_files(folder_id)
            for file in files:
                file_path = self.download_file(file['id'], file['name'])
                if file_path:
                    downloaded_files.append(file_path)
        
        return downloaded_files

def main():
    """主函數 - 示例用法"""
    
    # 從環境變數讀取服務帳戶金鑰
    service_account_key = os.getenv('GOOGLEDRIVE_SERVICE_ACCOUNT_KEY')
    
    if not service_account_key:
        print("❌ 請設置 GOOGLEDRIVE_SERVICE_ACCOUNT_KEY 環境變數")
        print("💡 提示: 請參考之前提供的 Google Service Account 設置指南")
        return
    
    try:
        # 初始化下載器
        downloader = GoogleDriveDownloader(service_account_key)
        
        # 示例 1: 列出所有 PDF 文件
        print("\n📋 列出所有 PDF 文件:")
        pdf_files = downloader.list_files(file_type='pdf')
        for file in pdf_files[:5]:  # 只顯示前 5 個
            print(f"  📄 {file['name']} (ID: {file['id']})")
        
        # 示例 2: 下載特定文件 (需要提供實際的文件 ID)
        # file_id = "your_file_id_here"
        # downloaded_path = downloader.download_file(file_id)
        
        print(f"\n📁 下載目錄: {downloader.download_dir}")
        print("✅ Google Drive 下載器測試完成")
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")

if __name__ == "__main__":
    main()