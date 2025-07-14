#!/usr/bin/env python3
"""
最終修復代碼分析數據庫 - 使用現有欄位
"""

import sqlite3
import os
import json
from pathlib import Path

def fix_analysis_with_existing_columns():
    """使用現有欄位修復代碼分析功能"""
    
    print("🔧 使用現有欄位修復代碼分析功能...")
    
    if not os.path.exists('augment_analysis.db'):
        print("❌ 代碼分析數據庫不存在")
        return False
    
    conn = sqlite3.connect('augment_analysis.db')
    cursor = conn.cursor()
    
    # 檢查現有表結構
    cursor.execute("PRAGMA table_info(code_analysis)")
    columns = cursor.fetchall()
    
    print("📊 使用現有的表結構:")
    column_names = [col[1] for col in columns]
    for col in columns:
        nullable = "NULLABLE" if not col[3] else "NOT NULL"
        default = col[4] if col[4] else "None"
        print(f"   {col[1]} ({col[2]}) - {nullable} - Default: {default}")
    
    # 分析一些測試檔案，使用現有欄位
    test_files = []
    for ext in ['*.py', '*.js', '*.ts']:
        test_files.extend(list(Path('.').glob(ext)))
    
    analyzed_count = 0
    for file_path in test_files[:10]:  # 分析前10個檔案
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
                # 計算檔案哈希
                import hashlib
                file_hash = hashlib.md5(content.encode()).hexdigest()
                
                # 進行代碼分析
                analysis_data = {
                    'functions': content.count('function ') + content.count('def '),
                    'classes': content.count('class '),
                    'imports': content.count('import ') + content.count('from '),
                    'comments': content.count('//') + content.count('#'),
                    'lines': len(content.splitlines()),
                    'file_size': len(content)
                }
                
                # 計算複雜度評分
                line_count = len(content.splitlines())
                complexity = min(line_count / 10, 10)
                
                # 檢測語言
                language = 'python' if file_path.suffix == '.py' else 'javascript' if file_path.suffix in ['.js', '.ts'] else 'unknown'
                
                # 使用現有欄位插入數據
                cursor.execute('''
                    INSERT OR REPLACE INTO code_analysis 
                    (id, file_path, file_hash, language, complexity_score, 
                     maintainability_score, best_practices_score, analysis_data, 
                     created_at, updated_at, file_size, line_count) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)
                ''', (
                    str(file_path),  # 使用檔案路徑作為 ID
                    str(file_path),
                    file_hash,
                    language,
                    int(complexity),
                    min(int(analysis_data['functions'] + analysis_data['classes']), 10),  # 可維護性評分
                    min(int(analysis_data['comments'] / max(line_count, 1) * 10), 10),  # 最佳實踐評分
                    json.dumps(analysis_data),
                    len(content),  # file_size
                    line_count     # line_count
                ))
                
                analyzed_count += 1
                print(f"✅ 分析完成: {file_path} ({line_count} 行, 複雜度: {complexity:.1f})")
                
        except Exception as e:
            print(f"⚠️ 無法分析 {file_path}: {e}")
    
    conn.commit()
    
    # 檢查分析結果
    cursor.execute('SELECT COUNT(*) FROM code_analysis')
    total_count = cursor.fetchone()[0]
    
    cursor.execute('''
        SELECT file_path, file_size, line_count, complexity_score, language
        FROM code_analysis 
        ORDER BY updated_at DESC 
        LIMIT 5
    ''')
    recent_analyses = cursor.fetchall()
    
    print(f"\n📊 分析結果統計:")
    print(f"   總分析檔案數: {total_count}")
    print(f"   本次新增: {analyzed_count}")
    
    print(f"\n📋 最近分析的檔案:")
    for file_path, file_size, line_count, complexity, language in recent_analyses:
        print(f"   {Path(file_path).name}: {language}, {file_size} bytes, {line_count} lines, 複雜度: {complexity}")
    
    conn.close()
    return analyzed_count

def create_enhanced_analysis_summary():
    """創建增強分析摘要"""
    
    print("\n📈 創建 Augment 增強分析摘要...")
    
    conn = sqlite3.connect('augment_analysis.db')
    cursor = conn.cursor()
    
    # 統計分析結果
    cursor.execute('''
        SELECT 
            language,
            COUNT(*) as file_count,
            AVG(file_size) as avg_size,
            AVG(line_count) as avg_lines,
            AVG(complexity_score) as avg_complexity
        FROM code_analysis 
        GROUP BY language
    ''')
    
    language_stats = cursor.fetchall()
    
    print("📊 按語言統計:")
    total_files = 0
    for lang, count, avg_size, avg_lines, avg_complexity in language_stats:
        total_files += count
        print(f"   {lang}: {count} 檔案, 平均 {avg_lines:.0f} 行, 複雜度 {avg_complexity:.1f}")
    
    # 找出最複雜的檔案
    cursor.execute('''
        SELECT file_path, complexity_score, line_count
        FROM code_analysis 
        ORDER BY complexity_score DESC 
        LIMIT 3
    ''')
    
    complex_files = cursor.fetchall()
    
    print(f"\n🔥 最複雜的檔案:")
    for file_path, complexity, lines in complex_files:
        print(f"   {Path(file_path).name}: 複雜度 {complexity}, {lines} 行")
    
    conn.close()
    
    # 創建摘要報告
    summary = {
        'total_analyzed_files': total_files,
        'language_distribution': {lang: count for lang, count, _, _, _ in language_stats},
        'analysis_timestamp': '2025-07-14 21:50:00',
        'augment_enhancement_status': 'ACTIVE'
    }
    
    with open('augment_analysis_summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ 分析摘要已保存到 augment_analysis_summary.json")
    return summary

def main():
    """主函數"""
    
    print("🚀 Augment 代碼分析最終修復工具")
    print("=" * 50)
    
    # 使用現有欄位修復功能
    analyzed_count = fix_analysis_with_existing_columns()
    
    if analyzed_count > 0:
        # 創建分析摘要
        summary = create_enhanced_analysis_summary()
        
        print(f"\n✅ 修復完成!")
        print(f"   成功分析 {analyzed_count} 個檔案")
        print(f"   總檔案數: {summary['total_analyzed_files']}")
        
        # 重新運行性能測試
        print("\n🔄 重新測試 Augment 性能...")
        os.system('python test-augment-performance.py')
    else:
        print("❌ 沒有成功分析任何檔案")

if __name__ == "__main__":
    main()
