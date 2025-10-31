#!/usr/bin/env python3
"""
🧪 Google Drive MCP 測試腳本
測試 Google Service Account 配置和 Google Drive API 連接
"""

import os
import sys
import json
import base64
from pathlib import Path
from dotenv import load_dotenv

def load_environment():
    """載入環境變數"""
    print("🔄 載入環境變數...")
    
    # 載入 .env 文件
    env_path = Path('.env')
    if not env_path.exists():
        print("❌ 找不到 .env 文件")
        return False
    
    load_dotenv(env_path)
    
    # 檢查必要的環境變數
    service_account_key = os.getenv('GOOGLEDRIVE_SERVICE_ACCOUNT_KEY')
    if not service_account_key or service_account_key == "YOUR_BASE64_ENCODED_SERVICE_ACCOUNT_KEY_HERE":
        print("❌ GOOGLEDRIVE_SERVICE_ACCOUNT_KEY 未設置或使用預設值")
        print("   請按照 setup-google-service-account.md 指南設置")
        return False
    
    print("✅ 環境變數載入成功")
    return True

def test_service_account_key():
    """測試 Service Account 金鑰格式"""
    print("\n🔑 測試 Service Account 金鑰格式...")
    
    try:
        service_account_key = os.getenv('GOOGLEDRIVE_SERVICE_ACCOUNT_KEY')
        
        # 解碼 Base64
        decoded_key = base64.b64decode(service_account_key)
        key_data = json.loads(decoded_key)
        
        # 檢查必要欄位
        required_fields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email']
        missing_fields = [field for field in required_fields if field not in key_data]
        
        if missing_fields:
            print(f"❌ Service Account 金鑰缺少必要欄位: {missing_fields}")
            return False, None
        
        if key_data['type'] != 'service_account':
            print(f"❌ 金鑰類型錯誤: {key_data['type']} (應該是 'service_account')")
            return False, None
        
        print("✅ Service Account 金鑰格式正確")
        print(f"   📧 服務帳戶郵箱: {key_data['client_email']}")
        print(f"   🏗️  專案 ID: {key_data['project_id']}")
        
        return True, key_data
        
    except base64.binascii.Error:
        print("❌ Base64 解碼失敗 - 請檢查金鑰格式")
        return False, None
    except json.JSONDecodeError:
        print("❌ JSON 解析失敗 - 請檢查金鑰內容")
        return False, None
    except Exception as e:
        print(f"❌ 金鑰驗證失敗: {str(e)}")
        return False, None

def test_google_drive_api(key_data):
    """測試 Google Drive API 連接"""
    print("\n🌐 測試 Google Drive API 連接...")
    
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        
        # 創建憑證
        credentials = service_account.Credentials.from_service_account_info(
            key_data, 
            scopes=['https://www.googleapis.com/auth/drive.readonly']
        )
        
        # 建立 Drive 服務
        service = build('drive', 'v3', credentials=credentials)
        
        # 測試 API 調用 - 列出文件（限制 1 個）
        print("   🔍 嘗試列出 Google Drive 文件...")
        results = service.files().list(pageSize=1).execute()
        
        print("✅ Google Drive API 連接成功")
        print(f"   📁 可存取的文件數量: {len(results.get('files', []))}")
        
        if results.get('files'):
            file_info = results['files'][0]
            print(f"   📄 範例文件: {file_info.get('name', 'Unknown')}")
        else:
            print("   ⚠️  沒有找到可存取的文件")
            print("   💡 請確保已將服務帳戶添加到 Google Drive 文件夾的共享列表")
        
        return True, service
        
    except ImportError as e:
        print(f"❌ 缺少必要的 Python 套件: {str(e)}")
        print("   請運行: pip install -r requirements-google-drive.txt")
        return False, None
    except Exception as e:
        print(f"❌ Google Drive API 連接失敗: {str(e)}")
        print("   💡 可能的原因:")
        print("   - Google Drive API 未啟用")
        print("   - 服務帳戶權限不足")
        print("   - 網路連接問題")
        return False, None

def test_google_drive_downloader():
    """測試 Google Drive 下載器"""
    print("\n📥 測試 Google Drive 下載器...")
    
    try:
        # 導入我們的下載器
        sys.path.append('.')
        from google_drive_downloader import GoogleDriveDownloader
        
        downloader = GoogleDriveDownloader()
        print("✅ Google Drive 下載器初始化成功")
        
        # 測試列出文件功能
        print("   🔍 測試列出文件功能...")
        files = downloader.list_files(max_results=5)
        
        if files:
            print(f"✅ 成功列出 {len(files)} 個文件")
            for i, file_info in enumerate(files[:3], 1):
                print(f"   {i}. {file_info['name']} ({file_info['mimeType']})")
        else:
            print("⚠️  沒有找到文件，但連接正常")
        
        return True
        
    except ImportError:
        print("❌ 找不到 google_drive_downloader.py")
        print("   請確保文件存在於當前目錄")
        return False
    except Exception as e:
        print(f"❌ 下載器測試失敗: {str(e)}")
        return False

def test_filesystem_mcp():
    """檢查 Filesystem MCP 配置"""
    print("\n📁 檢查 Filesystem MCP 配置...")
    
    try:
        # 檢查 claude_desktop_config.json
        config_path = Path('claude_desktop_config.json')
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            if 'mcpServers' in config and 'filesystem-mcp' in config['mcpServers']:
                print("✅ Filesystem MCP 已在 Claude Desktop 中配置")
                return True
            else:
                print("⚠️  Filesystem MCP 未在 Claude Desktop 中配置")
                return False
        else:
            print("⚠️  找不到 claude_desktop_config.json")
            return False
            
    except Exception as e:
        print(f"❌ Filesystem MCP 檢查失敗: {str(e)}")
        return False

def main():
    """主測試函數"""
    print("🧪 Google Drive MCP 配置測試")
    print("=" * 50)
    
    # 測試步驟
    tests = [
        ("環境變數", load_environment),
        ("Service Account 金鑰", test_service_account_key),
    ]
    
    results = {}
    key_data = None
    
    # 執行基本測試
    for test_name, test_func in tests:
        if test_name == "Service Account 金鑰":
            success, key_data = test_func()
        else:
            success = test_func()
        
        results[test_name] = success
        
        if not success:
            print(f"\n❌ {test_name} 測試失敗，停止後續測試")
            break
    
    # 如果基本測試通過，繼續進階測試
    if all(results.values()) and key_data:
        print("\n🚀 基本測試通過，繼續進階測試...")
        
        # Google Drive API 測試
        api_success, service = test_google_drive_api(key_data)
        results["Google Drive API"] = api_success
        
        # 下載器測試
        if api_success:
            downloader_success = test_google_drive_downloader()
            results["Google Drive 下載器"] = downloader_success
        
        # Filesystem MCP 測試
        filesystem_success = test_filesystem_mcp()
        results["Filesystem MCP"] = filesystem_success
    
    # 顯示測試結果摘要
    print("\n" + "=" * 50)
    print("📊 測試結果摘要:")
    print("=" * 50)
    
    for test_name, success in results.items():
        status = "✅ 通過" if success else "❌ 失敗"
        print(f"{test_name:<20} {status}")
    
    # 總結和建議
    print("\n" + "=" * 50)
    if all(results.values()):
        print("🎉 所有測試通過！您的 Google Drive MCP 配置已就緒")
        print("\n📋 下一步:")
        print("1. 在 Claude 中使用 Filesystem MCP 處理本地文件")
        print("2. 使用 Google Drive 下載器獲取雲端文件")
        print("3. 結合兩者實現完整的文件處理流程")
    else:
        print("⚠️  部分測試失敗，請檢查配置")
        print("\n🔧 建議:")
        
        if not results.get("環境變數", True):
            print("- 請按照 setup-google-service-account.md 設置環境變數")
        
        if not results.get("Service Account 金鑰", True):
            print("- 請檢查 GOOGLEDRIVE_SERVICE_ACCOUNT_KEY 的 Base64 編碼")
        
        if not results.get("Google Drive API", True):
            print("- 請確保 Google Drive API 已啟用")
            print("- 請將服務帳戶添加到 Google Drive 文件夾共享")
        
        if not results.get("Filesystem MCP", True):
            print("- 請檢查 Claude Desktop 配置")

if __name__ == "__main__":
    main()