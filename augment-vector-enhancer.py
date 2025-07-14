#!/usr/bin/env python3
"""
Augment 向量數據庫增強器
提供語義代碼搜索和智能理解能力
"""

import os
import json
import hashlib
import sqlite3
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
# import numpy as np  # 不使用 numpy，使用純 Python 實現
from datetime import datetime
import logging
import re

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleVectorDatabase:
    """簡化版向量數據庫 (不依賴外部庫)"""
    
    def __init__(self, db_path: str = "augment_vectors.db"):
        self.db_path = db_path
        self.init_database()
        self.vector_cache = {}  # 記憶體緩存
        
    def init_database(self):
        """初始化向量數據庫"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 代碼向量表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS code_vectors (
                id TEXT PRIMARY KEY,
                file_path TEXT NOT NULL,
                content_hash TEXT NOT NULL,
                content_text TEXT NOT NULL,
                vector_data TEXT NOT NULL,
                metadata TEXT,
                created_at TEXT,
                updated_at TEXT
            )
        ''')
        
        # 語義搜索索引表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS semantic_index (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                term TEXT NOT NULL,
                file_path TEXT NOT NULL,
                relevance_score REAL DEFAULT 1.0,
                context TEXT,
                created_at TEXT
            )
        ''')
        
        # 代碼相似性表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS code_similarity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_file TEXT NOT NULL,
                target_file TEXT NOT NULL,
                similarity_score REAL NOT NULL,
                similarity_type TEXT,
                created_at TEXT
            )
        ''')
        
        # 創建索引
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_vectors_file ON code_vectors(file_path)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_semantic_term ON semantic_index(term)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_similarity_source ON code_similarity(source_file)')
        
        conn.commit()
        conn.close()
        
        logger.info("🔍 向量數據庫初始化完成")
    
    def simple_text_to_vector(self, text: str, vector_size: int = 128) -> List[float]:
        """簡單的文本向量化 (基於字符頻率和 n-gram)"""
        
        # 清理文本
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        words = text.split()
        
        # 創建基礎向量
        vector = [0.0] * vector_size
        
        # 基於單詞哈希的向量化
        for i, word in enumerate(words[:vector_size//2]):
            hash_val = hash(word) % vector_size
            vector[hash_val] += 1.0
        
        # 基於 2-gram 的向量化
        for i in range(len(words) - 1):
            bigram = f"{words[i]}_{words[i+1]}"
            hash_val = hash(bigram) % vector_size
            vector[hash_val] += 0.5
        
        # 基於代碼特徵的向量化
        code_features = {
            'function': text.count('function'),
            'class': text.count('class'),
            'import': text.count('import'),
            'export': text.count('export'),
            'const': text.count('const'),
            'let': text.count('let'),
            'var': text.count('var'),
            'if': text.count('if'),
            'for': text.count('for'),
            'while': text.count('while')
        }
        
        # 將代碼特徵加入向量
        for i, (feature, count) in enumerate(code_features.items()):
            if i < vector_size//4:
                vector[-(i+1)] = count
        
        # 正規化向量
        magnitude = sum(x*x for x in vector) ** 0.5
        if magnitude > 0:
            vector = [x / magnitude for x in vector]
        
        return vector
    
    def add_code_vector(self, file_path: str, content: str, metadata: Dict[str, Any] = None):
        """添加代碼向量"""
        
        if metadata is None:
            metadata = {}
        
        # 生成向量
        vector = self.simple_text_to_vector(content)
        content_hash = hashlib.md5(content.encode()).hexdigest()
        vector_id = hashlib.md5(f"{file_path}{content_hash}".encode()).hexdigest()
        
        # 存儲到數據庫
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT OR REPLACE INTO code_vectors 
            (id, file_path, content_hash, content_text, vector_data, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            vector_id, file_path, content_hash, content[:1000],  # 只存前1000字符
            json.dumps(vector), json.dumps(metadata), now, now
        ))
        
        conn.commit()
        conn.close()
        
        # 緩存向量
        self.vector_cache[vector_id] = vector
        
        # 建立語義索引
        self.build_semantic_index(file_path, content)
        
        logger.info(f"📊 添加代碼向量: {file_path}")
        return vector_id
    
    def build_semantic_index(self, file_path: str, content: str):
        """建立語義索引"""
        
        # 提取關鍵詞
        keywords = self.extract_keywords(content)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        # 清除舊索引
        cursor.execute('DELETE FROM semantic_index WHERE file_path = ?', (file_path,))
        
        # 添加新索引
        for keyword, score in keywords.items():
            cursor.execute('''
                INSERT INTO semantic_index (term, file_path, relevance_score, context, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (keyword, file_path, score, self.get_keyword_context(content, keyword), now))
        
        conn.commit()
        conn.close()
    
    def extract_keywords(self, content: str) -> Dict[str, float]:
        """提取關鍵詞和相關性分數"""
        
        keywords = {}
        
        # 編程關鍵詞
        programming_keywords = [
            'function', 'class', 'interface', 'type', 'const', 'let', 'var',
            'import', 'export', 'default', 'async', 'await', 'promise',
            'react', 'component', 'hook', 'state', 'props', 'jsx', 'tsx',
            'typescript', 'javascript', 'node', 'express', 'api', 'database',
            'test', 'jest', 'playwright', 'cypress', 'mock', 'spec'
        ]
        
        content_lower = content.lower()
        
        for keyword in programming_keywords:
            count = content_lower.count(keyword)
            if count > 0:
                # 計算相關性分數 (基於頻率和位置)
                score = min(count / 10.0, 1.0)  # 最大分數為 1.0
                keywords[keyword] = score
        
        # 提取自定義標識符
        identifiers = re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', content)
        identifier_counts = {}
        
        for identifier in identifiers:
            if len(identifier) > 2 and identifier not in programming_keywords:
                identifier_counts[identifier] = identifier_counts.get(identifier, 0) + 1
        
        # 添加高頻標識符
        for identifier, count in identifier_counts.items():
            if count >= 3:  # 出現3次以上的標識符
                score = min(count / 20.0, 0.8)  # 自定義標識符最大分數為 0.8
                keywords[identifier] = score
        
        return keywords
    
    def get_keyword_context(self, content: str, keyword: str) -> str:
        """獲取關鍵詞上下文"""
        
        lines = content.split('\n')
        context_lines = []
        
        for line in lines:
            if keyword.lower() in line.lower():
                context_lines.append(line.strip())
                if len(context_lines) >= 3:  # 最多3行上下文
                    break
        
        return ' | '.join(context_lines)
    
    def semantic_search(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """語義搜索"""
        
        query_lower = query.lower()
        query_keywords = query_lower.split()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 搜索匹配的關鍵詞
        results = {}
        
        for keyword in query_keywords:
            cursor.execute('''
                SELECT file_path, relevance_score, context
                FROM semantic_index 
                WHERE term LIKE ? 
                ORDER BY relevance_score DESC
            ''', (f'%{keyword}%',))
            
            rows = cursor.fetchall()
            
            for file_path, score, context in rows:
                if file_path not in results:
                    results[file_path] = {
                        'file_path': file_path,
                        'total_score': 0.0,
                        'matched_terms': [],
                        'contexts': []
                    }
                
                results[file_path]['total_score'] += score
                results[file_path]['matched_terms'].append(keyword)
                results[file_path]['contexts'].append(context)
        
        conn.close()
        
        # 排序結果
        sorted_results = sorted(results.values(), key=lambda x: x['total_score'], reverse=True)
        
        return sorted_results[:limit]
    
    def find_similar_code(self, file_path: str, limit: int = 10) -> List[Dict[str, Any]]:
        """找到相似的代碼"""
        
        # 獲取目標檔案的向量
        target_vector = self.get_file_vector(file_path)
        if not target_vector:
            return []
        
        # 獲取所有其他向量
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT file_path, vector_data FROM code_vectors 
            WHERE file_path != ?
        ''', (file_path,))
        
        rows = cursor.fetchall()
        conn.close()
        
        similarities = []
        
        for other_file, vector_data in rows:
            try:
                other_vector = json.loads(vector_data)
                similarity = self.cosine_similarity(target_vector, other_vector)
                
                if similarity > 0.1:  # 只返回相似度 > 0.1 的結果
                    similarities.append({
                        'file_path': other_file,
                        'similarity': similarity
                    })
            except:
                continue
        
        # 排序並返回
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        return similarities[:limit]
    
    def get_file_vector(self, file_path: str) -> Optional[List[float]]:
        """獲取檔案向量"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT vector_data FROM code_vectors WHERE file_path = ?', (file_path,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            try:
                return json.loads(row[0])
            except:
                pass
        
        return None
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """計算餘弦相似度"""
        
        if len(vec1) != len(vec2):
            return 0.0
        
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = sum(a * a for a in vec1) ** 0.5
        magnitude2 = sum(b * b for b in vec2) ** 0.5
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)
    
    def get_statistics(self) -> Dict[str, Any]:
        """獲取統計信息"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM code_vectors')
        total_vectors = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM semantic_index')
        total_terms = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(DISTINCT term) FROM semantic_index')
        unique_terms = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_vectors': total_vectors,
            'total_indexed_terms': total_terms,
            'unique_terms': unique_terms,
            'cache_size': len(self.vector_cache),
            'database_path': self.db_path
        }

class AugmentVectorEnhancer:
    """Augment 向量增強器"""
    
    def __init__(self):
        self.vector_db = SimpleVectorDatabase()
        self.indexed_files = set()
        
    def index_project_files(self, project_root: str = "."):
        """索引項目檔案"""
        
        project_path = Path(project_root)
        
        # 要索引的檔案類型
        file_patterns = ["**/*.py", "**/*.js", "**/*.ts", "**/*.tsx", "**/*.jsx"]
        
        indexed_count = 0
        
        for pattern in file_patterns:
            for file_path in project_path.glob(pattern):
                if self.should_index_file(file_path):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # 添加到向量數據庫
                        self.vector_db.add_code_vector(
                            str(file_path),
                            content,
                            {
                                'language': self.detect_language(file_path),
                                'size': len(content),
                                'lines': len(content.split('\n'))
                            }
                        )
                        
                        self.indexed_files.add(str(file_path))
                        indexed_count += 1
                        
                        if indexed_count % 10 == 0:
                            logger.info(f"已索引 {indexed_count} 個檔案...")
                            
                    except Exception as e:
                        logger.warning(f"索引檔案失敗 {file_path}: {e}")
        
        logger.info(f"✅ 項目索引完成，共索引 {indexed_count} 個檔案")
        return indexed_count
    
    def should_index_file(self, file_path: Path) -> bool:
        """判斷是否應該索引檔案"""
        
        # 排除目錄
        exclude_dirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage']
        
        for exclude_dir in exclude_dirs:
            if exclude_dir in str(file_path):
                return False
        
        # 檔案大小限制 (最大 1MB)
        try:
            if file_path.stat().st_size > 1024 * 1024:
                return False
        except:
            return False
        
        return True
    
    def detect_language(self, file_path: Path) -> str:
        """檢測檔案語言"""
        suffix = file_path.suffix.lower()
        
        language_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.jsx': 'javascript'
        }
        
        return language_map.get(suffix, 'unknown')
    
    def smart_code_search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """智能代碼搜索"""
        
        results = self.vector_db.semantic_search(query, limit)
        
        # 增強結果信息
        enhanced_results = []
        
        for result in results:
            enhanced_result = result.copy()
            enhanced_result['search_query'] = query
            enhanced_result['relevance_percentage'] = min(100, int(result['total_score'] * 100))
            enhanced_results.append(enhanced_result)
        
        return enhanced_results
    
    def find_code_patterns(self, file_path: str) -> List[Dict[str, Any]]:
        """找到代碼模式"""
        
        similar_files = self.vector_db.find_similar_code(file_path)
        
        patterns = []
        for similar in similar_files:
            if similar['similarity'] > 0.5:  # 高相似度
                patterns.append({
                    'pattern_type': 'high_similarity',
                    'related_file': similar['file_path'],
                    'similarity_score': similar['similarity'],
                    'description': f"與 {similar['file_path']} 有 {similar['similarity']:.2%} 的相似度"
                })
        
        return patterns
    
    def get_enhancement_statistics(self) -> Dict[str, Any]:
        """獲取增強統計信息"""
        
        vector_stats = self.vector_db.get_statistics()
        
        return {
            'indexed_files': len(self.indexed_files),
            'vector_database': vector_stats,
            'search_capabilities': [
                '語義代碼搜索',
                '相似代碼檢測',
                '模式識別',
                '智能建議'
            ]
        }

def main():
    """測試向量增強器"""
    
    print("🔍 初始化 Augment 向量增強器...")
    
    enhancer = AugmentVectorEnhancer()
    
    # 索引當前項目
    print("📊 開始索引項目檔案...")
    indexed_count = enhancer.index_project_files()
    
    # 測試搜索
    print("\n🔍 測試語義搜索...")
    search_results = enhancer.smart_code_search("memory system database")
    
    print(f"找到 {len(search_results)} 個相關結果:")
    for result in search_results[:3]:
        print(f"  📄 {result['file_path']} (相關性: {result['relevance_percentage']}%)")
    
    # 獲取統計信息
    stats = enhancer.get_enhancement_statistics()
    print(f"\n📊 增強統計:")
    print(f"  索引檔案: {stats['indexed_files']}")
    print(f"  向量數量: {stats['vector_database']['total_vectors']}")
    print(f"  索引詞彙: {stats['vector_database']['unique_terms']}")
    
    print("✅ 向量增強器測試完成！")

if __name__ == "__main__":
    main()
