#!/usr/bin/env python3
"""
Enhanced MCP Feedback Collector 使用示例

演示如何在實際項目中使用增強版反饋收集器
"""

import sys
from pathlib import Path

# 添加源碼路徑
sys.path.insert(0, str(Path(__file__).parent / "src"))

from mcp_feedback_collector.enhanced_server import (
    collect_feedback,
    pick_image,
    pick_video,
    get_video_data,
    get_image_info,
    get_video_info
)

def example_game_development_feedback():
    """遊戲開發反饋收集示例"""
    print("🎮 遊戲開發反饋收集示例")
    print("-" * 40)
    
    # AI 完成遊戲開發任務後的工作汇报
    work_summary = """
🎮 飛機英文學習遊戲開發完成！

✅ 已完成的功能：
• 流暢的飛機物理引擎
• 3D 飛機模型和動畫
• 英文單字雲朵系統
• 碰撞檢測和爆炸效果
• 分數和生命值系統
• 響應式界面設計

🎯 遊戲特色：
• 教育性：幫助學習英文單字
• 互動性：流暢的飛機控制
• 視覺效果：3D 模型和粒子系統
• 性能優化：60FPS 流暢運行

請測試遊戲並提供您的反饋！
您可以：
📝 提供文字建議
📸 上傳遊戲截圖
🎬 錄製期望效果影片
    """
    
    try:
        # 收集用戶反饋
        feedback = collect_feedback(
            work_summary=work_summary,
            timeout_seconds=300  # 5分鐘超時
        )
        
        print(f"\n✅ 收到 {len(feedback)} 項反饋！")
        
        # 處理反饋內容
        for i, item in enumerate(feedback, 1):
            if hasattr(item, 'type'):
                if item.type == "text":
                    print(f"\n📝 文字反饋 {i}:")
                    print(f"   {item.text}")
                elif item.type == "image":
                    print(f"\n📸 圖片反饋 {i}:")
                    print(f"   大小: {len(item.data)} bytes")
                    print(f"   格式: {item.format}")
            else:
                print(f"\n📄 其他反饋 {i}:")
                print(f"   {str(item)[:200]}...")
        
        return feedback
        
    except Exception as e:
        print(f"❌ 反饋收集失敗: {e}")
        return None

def example_video_analysis_workflow():
    """影片分析工作流示例"""
    print("\n🎬 影片分析工作流示例")
    print("-" * 40)
    
    try:
        # 步驟1: 讓用戶選擇期望效果影片
        print("步驟1: 選擇期望效果影片")
        video_info = pick_video()
        print(f"✅ 影片選擇成功:\n{video_info}")
        
        # 步驟2: 獲取影片數據進行分析
        print("\n步驟2: 分析影片內容")
        # 這裡可以添加實際的影片分析邏輯
        print("🔍 正在分析影片中的遊戲機制...")
        print("🔍 檢測飛機移動模式...")
        print("🔍 分析視覺效果...")
        
        # 模擬分析結果
        analysis_result = """
🎯 影片分析結果：

遊戲機制分析：
• 飛機移動：流暢垂直移動
• 控制響應：高響應性
• 物理效果：慣性和摩擦力

視覺效果分析：
• 飛機設計：3D立體模型
• 動畫效果：傾斜和軌跡
• 爆炸特效：粒子系統
• 背景設計：多層視差

建議改進：
• 增強物理引擎
• 添加更多粒子效果
• 優化動畫流暢度
        """
        
        # 步驟3: 基於分析結果改進遊戲
        print("\n步驟3: 基於分析改進遊戲")
        print("🔧 正在應用改進...")
        
        # 步驟4: 收集用戶對改進結果的反饋
        print("\n步驟4: 收集改進反饋")
        feedback = collect_feedback(
            work_summary=f"""
🎬 基於您的影片分析，遊戲已改進！

{analysis_result}

🚀 已應用的改進：
• 實現了影片中的流暢移動
• 添加了3D視覺效果
• 增強了動畫系統
• 優化了性能表現

請測試改進後的遊戲並提供反饋！
            """,
            timeout_seconds=300
        )
        
        return feedback
        
    except Exception as e:
        print(f"❌ 影片分析工作流失敗: {e}")
        return None

def example_multi_media_feedback():
    """多媒體反饋收集示例"""
    print("\n📱 多媒體反饋收集示例")
    print("-" * 40)
    
    work_summary = """
🎨 UI/UX 設計改進完成！

改進內容：
• 現代化的界面設計
• 響應式布局
• 美觀的色彩搭配
• 流暢的動畫過渡
• 直觀的用戶交互

請提供您的設計反饋：
📝 文字建議和意見
📸 界面截圖和標註
🎬 操作流程錄製

您的反饋將幫助我們進一步優化用戶體驗！
    """
    
    try:
        feedback = collect_feedback(
            work_summary=work_summary,
            timeout_seconds=600  # 10分鐘，允許更多時間處理多媒體
        )
        
        # 分析反饋類型
        text_count = 0
        image_count = 0
        video_count = 0
        
        for item in feedback:
            if hasattr(item, 'type'):
                if item.type == "text":
                    text_count += 1
                elif item.type == "image":
                    image_count += 1
            elif "影片" in str(item):
                video_count += 1
        
        print(f"\n📊 反饋統計:")
        print(f"   📝 文字反饋: {text_count} 項")
        print(f"   📸 圖片反饋: {image_count} 項")
        print(f"   🎬 影片反饋: {video_count} 項")
        print(f"   📋 總計: {len(feedback)} 項")
        
        return feedback
        
    except Exception as e:
        print(f"❌ 多媒體反饋收集失敗: {e}")
        return None

def example_file_processing():
    """文件處理示例"""
    print("\n📁 文件處理示例")
    print("-" * 40)
    
    try:
        # 圖片處理示例
        print("1. 圖片信息獲取示例")
        image = pick_image()
        if image:
            print("✅ 圖片選擇成功")
            print(f"   數據大小: {len(image.data)} bytes")
            print(f"   格式: {image.format}")
        
        # 影片信息示例
        print("\n2. 影片信息獲取示例")
        video_info = pick_video()
        if video_info:
            print("✅ 影片信息獲取成功")
            print(video_info)
        
    except Exception as e:
        print(f"❌ 文件處理示例失敗: {e}")

def main():
    """主示例函數"""
    print("🚀 Enhanced MCP Feedback Collector 使用示例")
    print("=" * 60)
    
    examples = [
        ("遊戲開發反饋收集", example_game_development_feedback),
        ("影片分析工作流", example_video_analysis_workflow),
        ("多媒體反饋收集", example_multi_media_feedback),
        ("文件處理功能", example_file_processing)
    ]
    
    print("\n可用示例:")
    for i, (name, _) in enumerate(examples, 1):
        print(f"  {i}. {name}")
    
    print("\n選擇要運行的示例 (輸入數字，或 'all' 運行全部):")
    choice = input("您的選擇: ").strip()
    
    if choice.lower() == 'all':
        # 運行所有示例
        for name, func in examples:
            print(f"\n{'='*60}")
            print(f"運行示例: {name}")
            print('='*60)
            func()
            input("\n按 Enter 繼續下一個示例...")
    else:
        try:
            index = int(choice) - 1
            if 0 <= index < len(examples):
                name, func = examples[index]
                print(f"\n{'='*60}")
                print(f"運行示例: {name}")
                print('='*60)
                func()
            else:
                print("❌ 無效的選擇")
        except ValueError:
            print("❌ 請輸入有效的數字")
    
    print("\n🎉 示例演示完成！")
    print("\n💡 提示:")
    print("• 這些示例展示了 Enhanced MCP Feedback Collector 的主要功能")
    print("• 您可以根據自己的需求修改和擴展這些示例")
    print("• 更多詳細信息請查看 README.md 和源碼註釋")

if __name__ == "__main__":
    main()
