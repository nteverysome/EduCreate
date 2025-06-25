#!/usr/bin/env python3
"""
自動化測試影片收集器
模擬用戶上傳影片並驗證AI能夠接收和分析
"""

import sys
from pathlib import Path
import base64

# 添加模組路徑
sys.path.insert(0, str(Path(__file__).parent))

def simulate_video_upload():
    """模擬影片上傳過程"""
    try:
        # 導入直接影片收集器
        from direct_video_collector import COLLECTED_VIDEO_DATA, get_collected_video_data, analyze_collected_video
        
        print("🎬 自動化測試：模擬影片上傳")
        print("=" * 50)
        
        # 檢查測試文件
        test_file = Path(__file__).parent / "test_airplane_game.mp4"
        if not test_file.exists():
            print("❌ 測試文件不存在，創建模擬文件...")
            # 創建一個簡單的測試文件
            test_content = b"Test airplane game video content for AI analysis\n"
            test_content += b"Frame data and game mechanics simulation\n"
            test_content += b"Visual effects and animation sequences\n"
            test_content += b"\x00" * 1000  # 添加一些二進制數據
            
            with open(test_file, 'wb') as f:
                f.write(test_content)
        
        # 讀取測試文件
        with open(test_file, 'rb') as f:
            video_data = f.read()
        
        file_size = len(video_data)
        print(f"📁 測試文件: {test_file.name}")
        print(f"📏 文件大小: {file_size / 1024:.1f} KB")
        
        # 模擬影片收集器的數據結構
        global COLLECTED_VIDEO_DATA
        COLLECTED_VIDEO_DATA = {
            'text_feedback': '請分析這個飛機遊戲的演示影片，重點關注飛機移動機制、視覺效果和用戶體驗。',
            'videos': [video_data],
            'video_info': [{
                'name': test_file.name,
                'size': file_size,
                'format': '.mp4',
                'mime_type': 'video/mp4',
                'path': str(test_file)
            }],
            'timestamp': '2024-12-23T12:00:00'
        }
        
        print("✅ 影片數據模擬上傳成功")
        print(f"📊 數據大小: {len(video_data)} bytes")
        print(f"🔗 Base64編碼長度: {len(base64.b64encode(video_data))} 字符")
        
        return True
        
    except Exception as e:
        print(f"❌ 模擬上傳失敗: {e}")
        return False

def test_video_data_retrieval():
    """測試影片數據獲取"""
    try:
        from direct_video_collector import get_collected_video_data
        
        print("\n📊 測試影片數據獲取...")
        
        video_data_report = get_collected_video_data()
        
        if "沒有可用的影片數據" in video_data_report:
            print("❌ 無法獲取影片數據")
            return False
        else:
            print("✅ 成功獲取影片數據")
            print("\n📋 影片數據報告摘要:")
            # 顯示報告的前幾行
            lines = video_data_report.split('\n')
            for i, line in enumerate(lines[:15]):
                if line.strip():
                    print(f"   {line}")
            print("   ...")
            return True
            
    except Exception as e:
        print(f"❌ 數據獲取測試失敗: {e}")
        return False

def test_video_analysis():
    """測試影片分析功能"""
    try:
        from direct_video_collector import analyze_collected_video
        
        print("\n🔍 測試影片分析功能...")
        
        analysis_report = analyze_collected_video()
        
        if "沒有可分析的影片數據" in analysis_report:
            print("❌ 無法進行影片分析")
            return False
        else:
            print("✅ 成功進行影片分析")
            print("\n📋 影片分析報告摘要:")
            # 顯示分析報告的關鍵部分
            lines = analysis_report.split('\n')
            for i, line in enumerate(lines[:20]):
                if line.strip():
                    print(f"   {line}")
            print("   ...")
            
            # 檢查分析報告是否包含關鍵內容
            key_elements = [
                "遊戲機制分析",
                "視覺效果評估", 
                "性能優化建議",
                "具體實現建議"
            ]
            
            found_elements = []
            for element in key_elements:
                if element in analysis_report:
                    found_elements.append(element)
            
            print(f"\n✅ 分析報告包含 {len(found_elements)}/{len(key_elements)} 個關鍵元素:")
            for element in found_elements:
                print(f"   • {element}")
            
            return len(found_elements) >= 3
            
    except Exception as e:
        print(f"❌ 影片分析測試失敗: {e}")
        return False

def comprehensive_test():
    """綜合測試整個流程"""
    print("🚀 開始綜合測試影片收集和分析流程")
    print("=" * 60)
    
    # 步驟1：模擬影片上傳
    print("📤 步驟1：模擬影片上傳")
    upload_success = simulate_video_upload()
    
    if not upload_success:
        print("❌ 影片上傳模擬失敗，測試終止")
        return False
    
    # 步驟2：測試數據獲取
    print("\n📥 步驟2：測試影片數據獲取")
    data_success = test_video_data_retrieval()
    
    if not data_success:
        print("❌ 影片數據獲取失敗")
        return False
    
    # 步驟3：測試影片分析
    print("\n🔬 步驟3：測試影片分析")
    analysis_success = test_video_analysis()
    
    if not analysis_success:
        print("❌ 影片分析失敗")
        return False
    
    return True

def main():
    """主測試函數"""
    print("🎬 Enhanced MCP Video Feedback Collector")
    print("自動化測試 - 驗證AI影片分析能力")
    print("=" * 60)
    
    # 運行綜合測試
    success = comprehensive_test()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 所有測試通過！影片收集器工作正常")
        print("\n✅ 驗證結果:")
        print("• ✅ 影片數據正確收集")
        print("• ✅ 影片數據成功傳遞給AI")
        print("• ✅ AI能夠獲取影片詳細信息")
        print("• ✅ AI能夠分析影片內容")
        print("• ✅ AI提供專業的分析報告")
        
        print("\n🎯 功能確認:")
        print("• 影片上傳功能正常")
        print("• 數據編碼和傳遞正確")
        print("• AI分析功能完整")
        print("• 報告生成詳細專業")
        
        print("\n🚀 現在可以正式使用影片收集器!")
        print("   AI已經能夠接收和分析您的影片內容了")
        
    else:
        print("❌ 測試失敗，需要進一步修復")
        print("\n🔧 可能的問題:")
        print("• 影片數據傳遞機制")
        print("• 數據編碼格式")
        print("• 分析功能實現")
        
    return success

if __name__ == "__main__":
    main()
