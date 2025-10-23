#!/usr/bin/env python3
"""
去重並分級 GEPT 詞彙
從高級別中移除低級別的單字,獲得每個級別的獨特單字
"""

import sys

def load_words(file_path):
    """從文件加載單字"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            words = set(line.strip().lower() for line in f if line.strip())
        return words
    except Exception as e:
        print(f"❌ 讀取文件失敗 {file_path}: {e}")
        return set()

def save_words(words, file_path):
    """保存單字到文件"""
    try:
        sorted_words = sorted(words)
        with open(file_path, 'w', encoding='utf-8') as f:
            for word in sorted_words:
                f.write(f"{word}\n")
        print(f"✅ 保存 {len(sorted_words)} 個單字到: {file_path}")
        return len(sorted_words)
    except Exception as e:
        print(f"❌ 保存文件失敗 {file_path}: {e}")
        return 0

def deduplicate_gept_words():
    """去重並分級 GEPT 詞彙"""
    
    print("=== GEPT 詞彙去重與分級 ===\n")
    
    # 1. 加載所有級別的單字
    print("📖 正在加載單字...")
    elementary = load_words('data/word-lists/gept-elementary-pdf.txt')
    intermediate = load_words('data/word-lists/gept-intermediate-pdf.txt')
    high_intermediate = load_words('data/word-lists/gept-high-intermediate-pdf.txt')
    
    print(f"初級 (原始): {len(elementary)} 個單字")
    print(f"中級 (原始): {len(intermediate)} 個單字")
    print(f"中高級 (原始): {len(high_intermediate)} 個單字")
    print()
    
    # 2. 去重 - 從高級別中移除低級別的單字
    print("🔄 正在去重...")
    
    # 中級 = 中級 - 初級
    intermediate_unique = intermediate - elementary
    
    # 中高級 = 中高級 - 中級 - 初級
    high_intermediate_unique = high_intermediate - intermediate - elementary
    
    print(f"初級 (去重後): {len(elementary)} 個單字 (無變化)")
    print(f"中級 (去重後): {len(intermediate_unique)} 個單字 (移除了 {len(intermediate) - len(intermediate_unique)} 個)")
    print(f"中高級 (去重後): {len(high_intermediate_unique)} 個單字 (移除了 {len(high_intermediate) - len(high_intermediate_unique)} 個)")
    print()
    
    # 3. 保存去重後的單字
    print("💾 正在保存去重後的單字...")
    
    save_words(elementary, 'data/word-lists/gept-elementary-unique.txt')
    save_words(intermediate_unique, 'data/word-lists/gept-intermediate-unique.txt')
    save_words(high_intermediate_unique, 'data/word-lists/gept-high-intermediate-unique.txt')
    
    print()
    
    # 4. 統計總結
    total_unique = len(elementary) + len(intermediate_unique) + len(high_intermediate_unique)
    total_original = len(elementary) + len(intermediate) + len(high_intermediate)
    
    print("=" * 60)
    print("📊 統計總結")
    print("=" * 60)
    print(f"原始總單字數: {total_original}")
    print(f"去重後總單字數: {total_unique}")
    print(f"移除重複: {total_original - total_unique} 個")
    print()
    print("各級別獨特單字:")
    print(f"  - 初級: {len(elementary)} 個")
    print(f"  - 中級: {len(intermediate_unique)} 個")
    print(f"  - 中高級: {len(high_intermediate_unique)} 個")
    print("=" * 60)
    
    # 5. 顯示一些範例
    print("\n📝 範例單字:")
    print("\n初級 (前 10 個):")
    for word in sorted(elementary)[:10]:
        print(f"  - {word}")
    
    print("\n中級 (前 10 個):")
    for word in sorted(intermediate_unique)[:10]:
        print(f"  - {word}")
    
    print("\n中高級 (前 10 個):")
    for word in sorted(high_intermediate_unique)[:10]:
        print(f"  - {word}")

if __name__ == "__main__":
    deduplicate_gept_words()

