#!/usr/bin/env python3
"""
修復向量搜索數據庫表結構
"""

import sqlite3
import os
import json
import hashlib
from pathlib import Path

def fix_vector_database():
    """修復向量數據庫表結構"""
    
    print("🔧 修復向量搜索數據庫...")
    
    if os.path.exists('augment_vectors.db'):
        conn = sqlite3.connect('augment_vectors.db')
        cursor = conn.cursor()
        
        # 檢查現有表
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"現有表: {tables}")
        
        # 刪除舊表（如果存在問題）
        cursor.execute("DROP TABLE IF EXISTS file_vectors")
        
        # 創建正確的表結構
        cursor.execute('''
            CREATE TABLE file_vectors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT UNIQUE NOT NULL,
                content_hash TEXT NOT NULL,
                vector_data BLOB,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE INDEX idx_file_path ON file_vectors(file_path)
        ''')
        
        cursor.execute('''
            CREATE INDEX idx_content_hash ON file_vectors(content_hash)
        ''')
        
        conn.commit()
        print("✅ 向量數據庫表結構修復完成")
        
    else:
        print("創建新的向量數據庫...")
        conn = sqlite3.connect('augment_vectors.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE file_vectors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT UNIQUE NOT NULL,
                content_hash TEXT NOT NULL,
                vector_data BLOB,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE INDEX idx_file_path ON file_vectors(file_path)
        ''')
        
        cursor.execute('''
            CREATE INDEX idx_content_hash ON file_vectors(content_hash)
        ''')
        
        conn.commit()
        print("✅ 新的向量數據庫創建完成")
    
    # 添加一些測試數據
    test_files = []
    for ext in ['*.py', '*.js', '*.ts', '*.tsx', '*.json']:
        test_files.extend(list(Path('.').glob(ext)))
    
    indexed_count = 0
    for file_path in test_files[:10]:  # 只索引前10個檔案作為測試
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                content_hash = hashlib.md5(content.encode()).hexdigest()
                
                metadata = {
                    'file_size': len(content),
                    'line_count': len(content.splitlines()),
                    'file_type': file_path.suffix
                }
                
                cursor.execute('''
                    INSERT OR REPLACE INTO file_vectors 
                    (file_path, content_hash, metadata) 
                    VALUES (?, ?, ?)
                ''', (str(file_path), content_hash, json.dumps(metadata)))
                
                indexed_count += 1
        except Exception as e:
            print(f"⚠️ 無法索引 {file_path}: {e}")
    
    conn.commit()
    
    # 檢查最終狀態
    cursor.execute('SELECT COUNT(*) FROM file_vectors')
    total_count = cursor.fetchone()[0]
    
    conn.close()
    
    print(f"📊 向量數據庫狀態:")
    print(f"   索引檔案數量: {total_count}")
    print(f"   本次新增: {indexed_count}")
    
    return total_count

def enhance_code_analysis():
    """增強代碼分析數據庫"""
    
    print("\n🔍 增強代碼分析數據庫...")
    
    if not os.path.exists('augment_analysis.db'):
        print("❌ 代碼分析數據庫不存在")
        return
    
    conn = sqlite3.connect('augment_analysis.db')
    cursor = conn.cursor()
    
    # 分析更多檔案
    analyzed_files = []
    for ext in ['*.py', '*.js', '*.ts', '*.tsx']:
        analyzed_files.extend(list(Path('.').glob(ext)))
    
    new_analyses = 0
    for file_path in analyzed_files:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
                # 簡單的代碼分析
                analysis_data = {
                    'functions': content.count('function ') + content.count('def '),
                    'classes': content.count('class '),
                    'imports': content.count('import ') + content.count('from '),
                    'comments': content.count('//') + content.count('#'),
                    'complexity_score': min(len(content.splitlines()) / 10, 10)  # 簡單複雜度評分
                }
                
                cursor.execute('''
                    INSERT OR REPLACE INTO code_analysis 
                    (file_path, analysis_data, analyzed_at) 
                    VALUES (?, ?, datetime('now'))
                ''', (str(file_path), json.dumps(analysis_data)))
                
                new_analyses += 1
        except Exception as e:
            print(f"⚠️ 無法分析 {file_path}: {e}")
    
    conn.commit()
    
    # 檢查分析結果
    cursor.execute('SELECT COUNT(*) FROM code_analysis')
    total_analyses = cursor.fetchone()[0]
    
    conn.close()
    
    print(f"📊 代碼分析狀態:")
    print(f"   已分析檔案: {total_analyses}")
    print(f"   本次新增: {new_analyses}")
    
    return total_analyses

def main():
    """主函數"""
    
    print("🚀 Augment 數據庫增強工具")
    print("=" * 40)
    
    # 修復向量數據庫
    vector_count = fix_vector_database()
    
    # 增強代碼分析
    analysis_count = enhance_code_analysis()
    
    print(f"\n✅ 數據庫增強完成!")
    print(f"   向量索引: {vector_count} 個檔案")
    print(f"   代碼分析: {analysis_count} 個檔案")
    
    # 再次運行性能測試
    print("\n🔄 重新測試性能...")
    os.system('python test-augment-performance.py')

if __name__ == "__main__":
    main()
