#!/usr/bin/env python3
"""
修復代碼分析數據庫表結構問題
"""

import sqlite3
import os
import json
from pathlib import Path

def check_and_fix_analysis_db():
    """檢查並修復代碼分析數據庫結構"""
    
    print("🔍 檢查代碼分析數據庫結構...")
    
    if not os.path.exists('augment_analysis.db'):
        print("❌ 代碼分析數據庫不存在")
        return
    
    conn = sqlite3.connect('augment_analysis.db')
    cursor = conn.cursor()
    
    # 檢查現有表結構
    cursor.execute("PRAGMA table_info(code_analysis)")
    columns = cursor.fetchall()
    
    print("📊 code_analysis 表的實際結構:")
    column_names = []
    for col in columns:
        column_names.append(col[1])
        nullable = "NULLABLE" if not col[3] else "NOT NULL"
        default = col[4] if col[4] else "None"
        print(f"   {col[1]} ({col[2]}) - {nullable} - Default: {default}")
    
    # 檢查是否缺少 analyzed_at 欄位
    if 'analyzed_at' not in column_names:
        print("\n⚠️ 缺少 analyzed_at 欄位，正在添加...")
        
        try:
            cursor.execute('''
                ALTER TABLE code_analysis 
                ADD COLUMN analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ''')
            conn.commit()
            print("✅ 成功添加 analyzed_at 欄位")
        except Exception as e:
            print(f"❌ 添加欄位失敗: {e}")
    
    # 檢查其他可能需要的欄位
    expected_columns = [
        ('file_path', 'TEXT'),
        ('analysis_data', 'TEXT'),
        ('analyzed_at', 'TIMESTAMP'),
        ('file_size', 'INTEGER'),
        ('line_count', 'INTEGER'),
        ('complexity_score', 'REAL')
    ]
    
    for col_name, col_type in expected_columns:
        if col_name not in column_names:
            print(f"⚠️ 缺少 {col_name} 欄位，正在添加...")
            try:
                if col_name == 'analyzed_at':
                    cursor.execute(f'''
                        ALTER TABLE code_analysis 
                        ADD COLUMN {col_name} {col_type} DEFAULT CURRENT_TIMESTAMP
                    ''')
                elif col_name in ['file_size', 'line_count']:
                    cursor.execute(f'''
                        ALTER TABLE code_analysis 
                        ADD COLUMN {col_name} {col_type} DEFAULT 0
                    ''')
                elif col_name == 'complexity_score':
                    cursor.execute(f'''
                        ALTER TABLE code_analysis 
                        ADD COLUMN {col_name} {col_type} DEFAULT 0.0
                    ''')
                else:
                    cursor.execute(f'''
                        ALTER TABLE code_analysis 
                        ADD COLUMN {col_name} {col_type}
                    ''')
                conn.commit()
                print(f"✅ 成功添加 {col_name} 欄位")
            except Exception as e:
                print(f"❌ 添加 {col_name} 欄位失敗: {e}")
    
    # 重新檢查表結構
    cursor.execute("PRAGMA table_info(code_analysis)")
    columns = cursor.fetchall()
    
    print("\n📊 修復後的表結構:")
    for col in columns:
        nullable = "NULLABLE" if not col[3] else "NOT NULL"
        default = col[4] if col[4] else "None"
        print(f"   {col[1]} ({col[2]}) - {nullable} - Default: {default}")
    
    conn.close()
    return True

def test_enhanced_analysis():
    """測試增強的代碼分析功能"""
    
    print("\n🧪 測試增強的代碼分析功能...")
    
    conn = sqlite3.connect('augment_analysis.db')
    cursor = conn.cursor()
    
    # 分析一些測試檔案
    test_files = []
    for ext in ['*.py', '*.js', '*.ts']:
        test_files.extend(list(Path('.').glob(ext)))
    
    analyzed_count = 0
    for file_path in test_files[:5]:  # 只測試前5個檔案
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
                # 進行簡單的代碼分析
                analysis_data = {
                    'functions': content.count('function ') + content.count('def '),
                    'classes': content.count('class '),
                    'imports': content.count('import ') + content.count('from '),
                    'comments': content.count('//') + content.count('#'),
                    'lines': len(content.splitlines())
                }
                
                file_size = len(content)
                line_count = len(content.splitlines())
                complexity_score = min(line_count / 10, 10)  # 簡單複雜度評分
                
                # 插入或更新分析結果
                cursor.execute('''
                    INSERT OR REPLACE INTO code_analysis 
                    (file_path, analysis_data, analyzed_at, file_size, line_count, complexity_score) 
                    VALUES (?, ?, datetime('now'), ?, ?, ?)
                ''', (str(file_path), json.dumps(analysis_data), file_size, line_count, complexity_score))
                
                analyzed_count += 1
                print(f"✅ 分析完成: {file_path}")
                
        except Exception as e:
            print(f"⚠️ 無法分析 {file_path}: {e}")
    
    conn.commit()
    
    # 檢查分析結果
    cursor.execute('SELECT COUNT(*) FROM code_analysis')
    total_count = cursor.fetchone()[0]
    
    cursor.execute('''
        SELECT file_path, file_size, line_count, complexity_score 
        FROM code_analysis 
        ORDER BY analyzed_at DESC 
        LIMIT 5
    ''')
    recent_analyses = cursor.fetchall()
    
    print(f"\n📊 分析結果統計:")
    print(f"   總分析檔案數: {total_count}")
    print(f"   本次新增: {analyzed_count}")
    
    print(f"\n📋 最近分析的檔案:")
    for file_path, file_size, line_count, complexity in recent_analyses:
        print(f"   {file_path}: {file_size} bytes, {line_count} lines, complexity: {complexity:.1f}")
    
    conn.close()
    return analyzed_count

def main():
    """主函數"""
    
    print("🔧 Augment 代碼分析數據庫修復工具")
    print("=" * 50)
    
    # 修復數據庫結構
    if check_and_fix_analysis_db():
        # 測試增強功能
        analyzed_count = test_enhanced_analysis()
        
        print(f"\n✅ 數據庫修復完成!")
        print(f"   成功分析 {analyzed_count} 個檔案")
        
        # 重新運行性能測試
        print("\n🔄 重新測試 Augment 性能...")
        os.system('python test-augment-performance.py')
    else:
        print("❌ 數據庫修復失敗")

if __name__ == "__main__":
    main()
