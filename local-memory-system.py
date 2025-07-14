#!/usr/bin/env python3
"""
本地記憶系統 - 替代 Mem0 API
提供 Augment 長期記憶功能，無需 API 密鑰
"""

import sqlite3
import json
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import re
from dataclasses import dataclass, asdict
import logging

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Memory:
    """記憶項目"""
    id: str
    content: str
    memory_type: str  # 'conversation', 'code_pattern', 'preference', 'knowledge'
    category: str     # 'educreat', 'programming', 'user_preference', 'project_knowledge'
    importance: int   # 1-10, 10 最重要
    created_at: str
    last_accessed: str
    access_count: int
    tags: List[str]
    metadata: Dict[str, Any]

class LocalMemorySystem:
    """本地記憶系統"""
    
    def __init__(self, db_path: str = "augment_memory.db"):
        self.db_path = db_path
        self.init_database()
        
    def init_database(self):
        """初始化數據庫"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 創建記憶表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                memory_type TEXT NOT NULL,
                category TEXT NOT NULL,
                importance INTEGER DEFAULT 5,
                created_at TEXT NOT NULL,
                last_accessed TEXT NOT NULL,
                access_count INTEGER DEFAULT 0,
                tags TEXT,  -- JSON array
                metadata TEXT  -- JSON object
            )
        ''')
        
        # 創建索引
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_memory_type ON memories(memory_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_category ON memories(category)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_importance ON memories(importance)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_created_at ON memories(created_at)')
        
        # 創建用戶偏好表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_preferences (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        ''')
        
        # 創建項目知識表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS project_knowledge (
                id TEXT PRIMARY KEY,
                file_path TEXT,
                knowledge_type TEXT,  -- 'pattern', 'architecture', 'business_logic'
                content TEXT NOT NULL,
                confidence REAL DEFAULT 0.5,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        ''')
        
        conn.commit()
        conn.close()
        
        logger.info(f"✅ 本地記憶系統初始化完成: {self.db_path}")
    
    def add_memory(self, content: str, memory_type: str, category: str, 
                   importance: int = 5, tags: List[str] = None, 
                   metadata: Dict[str, Any] = None) -> str:
        """添加記憶"""
        
        if tags is None:
            tags = []
        if metadata is None:
            metadata = {}
        
        # 生成唯一 ID
        memory_id = hashlib.md5(f"{content}{time.time()}".encode()).hexdigest()
        
        now = datetime.now().isoformat()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO memories 
            (id, content, memory_type, category, importance, created_at, last_accessed, access_count, tags, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            memory_id, content, memory_type, category, importance, 
            now, now, 0, json.dumps(tags), json.dumps(metadata)
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"📝 添加記憶: {memory_type}/{category} - {content[:50]}...")
        return memory_id
    
    def get_memories(self, memory_type: str = None, category: str = None, 
                     limit: int = 50, min_importance: int = 1) -> List[Memory]:
        """獲取記憶"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = '''
            SELECT id, content, memory_type, category, importance, 
                   created_at, last_accessed, access_count, tags, metadata
            FROM memories 
            WHERE importance >= ?
        '''
        params = [min_importance]
        
        if memory_type:
            query += ' AND memory_type = ?'
            params.append(memory_type)
        
        if category:
            query += ' AND category = ?'
            params.append(category)
        
        query += ' ORDER BY importance DESC, last_accessed DESC LIMIT ?'
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        memories = []
        for row in rows:
            memory = Memory(
                id=row[0],
                content=row[1],
                memory_type=row[2],
                category=row[3],
                importance=row[4],
                created_at=row[5],
                last_accessed=row[6],
                access_count=row[7],
                tags=json.loads(row[8]) if row[8] else [],
                metadata=json.loads(row[9]) if row[9] else {}
            )
            memories.append(memory)
        
        conn.close()
        return memories
    
    def search_memories(self, query: str, limit: int = 20) -> List[Memory]:
        """搜索記憶"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 簡單的文本搜索 (可以升級為 FTS)
        search_query = f"%{query}%"
        
        cursor.execute('''
            SELECT id, content, memory_type, category, importance, 
                   created_at, last_accessed, access_count, tags, metadata
            FROM memories 
            WHERE content LIKE ? OR tags LIKE ?
            ORDER BY importance DESC, access_count DESC
            LIMIT ?
        ''', (search_query, search_query, limit))
        
        rows = cursor.fetchall()
        
        memories = []
        for row in rows:
            memory = Memory(
                id=row[0],
                content=row[1],
                memory_type=row[2],
                category=row[3],
                importance=row[4],
                created_at=row[5],
                last_accessed=row[6],
                access_count=row[7],
                tags=json.loads(row[8]) if row[8] else [],
                metadata=json.loads(row[9]) if row[9] else {}
            )
            memories.append(memory)
            
            # 更新訪問記錄
            self.update_access(row[0])
        
        conn.close()
        return memories
    
    def update_access(self, memory_id: str):
        """更新訪問記錄"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        cursor.execute('''
            UPDATE memories 
            SET last_accessed = ?, access_count = access_count + 1
            WHERE id = ?
        ''', (now, memory_id))
        
        conn.commit()
        conn.close()
    
    def add_user_preference(self, key: str, value: Any):
        """添加用戶偏好"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_preferences (key, value, updated_at)
            VALUES (?, ?, ?)
        ''', (key, json.dumps(value), now))
        
        conn.commit()
        conn.close()
        
        logger.info(f"⚙️ 更新用戶偏好: {key} = {value}")
    
    def get_user_preference(self, key: str, default: Any = None) -> Any:
        """獲取用戶偏好"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT value FROM user_preferences WHERE key = ?', (key,))
        row = cursor.fetchone()
        
        conn.close()
        
        if row:
            return json.loads(row[0])
        return default
    
    def add_project_knowledge(self, file_path: str, knowledge_type: str, 
                             content: str, confidence: float = 0.5) -> str:
        """添加項目知識"""
        
        knowledge_id = hashlib.md5(f"{file_path}{knowledge_type}{content}".encode()).hexdigest()
        now = datetime.now().isoformat()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO project_knowledge 
            (id, file_path, knowledge_type, content, confidence, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (knowledge_id, file_path, knowledge_type, content, confidence, now, now))
        
        conn.commit()
        conn.close()
        
        logger.info(f"🧠 添加項目知識: {file_path} - {knowledge_type}")
        return knowledge_id
    
    def get_project_knowledge(self, file_path: str = None, 
                             knowledge_type: str = None) -> List[Dict[str, Any]]:
        """獲取項目知識"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = 'SELECT * FROM project_knowledge WHERE 1=1'
        params = []
        
        if file_path:
            query += ' AND file_path LIKE ?'
            params.append(f"%{file_path}%")
        
        if knowledge_type:
            query += ' AND knowledge_type = ?'
            params.append(knowledge_type)
        
        query += ' ORDER BY confidence DESC, updated_at DESC'
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        knowledge = []
        for row in rows:
            knowledge.append({
                'id': row[0],
                'file_path': row[1],
                'knowledge_type': row[2],
                'content': row[3],
                'confidence': row[4],
                'created_at': row[5],
                'updated_at': row[6]
            })
        
        conn.close()
        return knowledge
    
    def cleanup_old_memories(self, days: int = 30, min_importance: int = 3):
        """清理舊記憶"""
        
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            DELETE FROM memories 
            WHERE created_at < ? AND importance < ? AND access_count < 2
        ''', (cutoff_date, min_importance))
        
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()
        
        logger.info(f"🧹 清理了 {deleted_count} 個舊記憶")
        return deleted_count
    
    def get_statistics(self) -> Dict[str, Any]:
        """獲取統計信息"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 記憶統計
        cursor.execute('SELECT COUNT(*) FROM memories')
        total_memories = cursor.fetchone()[0]
        
        cursor.execute('SELECT memory_type, COUNT(*) FROM memories GROUP BY memory_type')
        memory_types = dict(cursor.fetchall())
        
        cursor.execute('SELECT category, COUNT(*) FROM memories GROUP BY category')
        categories = dict(cursor.fetchall())
        
        cursor.execute('SELECT AVG(importance) FROM memories')
        avg_importance = cursor.fetchone()[0] or 0
        
        # 用戶偏好統計
        cursor.execute('SELECT COUNT(*) FROM user_preferences')
        total_preferences = cursor.fetchone()[0]
        
        # 項目知識統計
        cursor.execute('SELECT COUNT(*) FROM project_knowledge')
        total_knowledge = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_memories': total_memories,
            'memory_types': memory_types,
            'categories': categories,
            'avg_importance': round(avg_importance, 2),
            'total_preferences': total_preferences,
            'total_knowledge': total_knowledge,
            'database_path': self.db_path
        }

class AugmentMemoryIntegration:
    """Augment 記憶系統整合"""
    
    def __init__(self):
        self.memory_system = LocalMemorySystem()
        self.init_educreat_knowledge()
    
    def init_educreat_knowledge(self):
        """初始化 EduCreate 項目知識"""
        
        # 添加項目基本信息
        self.memory_system.add_memory(
            content="EduCreate 是一個記憶科學驅動的智能教育遊戲 SaaS 平台",
            memory_type="knowledge",
            category="educreat",
            importance=10,
            tags=["educreat", "project", "memory_science", "education"]
        )
        
        # 添加技術棧信息
        self.memory_system.add_memory(
            content="技術棧: Next.js + React + TypeScript + Tailwind CSS + Node.js + PostgreSQL",
            memory_type="knowledge",
            category="educreat",
            importance=9,
            tags=["tech_stack", "nextjs", "react", "typescript"]
        )
        
        # 添加核心概念
        concepts = [
            "間隔重複算法 - 基於遺忘曲線的學習優化",
            "主動回憶技術 - 提升記憶鞏固效果",
            "認知負荷理論 - 優化學習體驗設計",
            "GEPT 三級分級系統 - 英語能力分級",
            "25 種記憶遊戲模式 - 多樣化學習體驗",
            "防止功能孤立工作流程 - 確保功能完整整合"
        ]
        
        for concept in concepts:
            self.memory_system.add_memory(
                content=concept,
                memory_type="knowledge",
                category="educreat",
                importance=8,
                tags=["memory_science", "core_concept"]
            )
        
        # 設置用戶偏好
        self.memory_system.add_user_preference("coding_style", "typescript_strict")
        self.memory_system.add_user_preference("test_framework", "playwright_jest")
        self.memory_system.add_user_preference("ui_framework", "tailwind_css")
        self.memory_system.add_user_preference("project_type", "educreat_platform")
        
        logger.info("🎓 EduCreate 項目知識初始化完成")
    
    def learn_from_conversation(self, user_input: str, ai_response: str):
        """從對話中學習"""
        
        # 提取關鍵信息
        if any(keyword in user_input.lower() for keyword in ['喜歡', '偏好', '習慣', '通常']):
            self.memory_system.add_memory(
                content=f"用戶偏好: {user_input}",
                memory_type="preference",
                category="user_preference",
                importance=7,
                tags=["user_preference", "conversation"]
            )
        
        # 記錄代碼模式
        if 'function' in user_input or 'component' in user_input or 'class' in user_input:
            self.memory_system.add_memory(
                content=f"代碼討論: {user_input[:200]}",
                memory_type="code_pattern",
                category="programming",
                importance=6,
                tags=["code", "pattern", "discussion"]
            )
        
        # 記錄 EduCreate 相關討論
        if any(keyword in user_input.lower() for keyword in ['educreat', '記憶', '遊戲', 'gept']):
            self.memory_system.add_memory(
                content=f"EduCreate 討論: {user_input}",
                memory_type="conversation",
                category="educreat",
                importance=8,
                tags=["educreat", "discussion", "feature"]
            )
    
    def get_relevant_memories(self, query: str, limit: int = 10) -> List[Memory]:
        """獲取相關記憶"""
        return self.memory_system.search_memories(query, limit)
    
    def get_user_context(self) -> Dict[str, Any]:
        """獲取用戶上下文"""
        
        # 獲取最近的記憶
        recent_memories = self.memory_system.get_memories(limit=20, min_importance=6)
        
        # 獲取用戶偏好
        preferences = {
            'coding_style': self.memory_system.get_user_preference('coding_style'),
            'test_framework': self.memory_system.get_user_preference('test_framework'),
            'ui_framework': self.memory_system.get_user_preference('ui_framework'),
            'project_type': self.memory_system.get_user_preference('project_type')
        }
        
        # 獲取項目知識
        project_knowledge = self.memory_system.get_project_knowledge()
        
        return {
            'recent_memories': [asdict(memory) for memory in recent_memories],
            'user_preferences': preferences,
            'project_knowledge': project_knowledge[:10],  # 最相關的 10 個
            'statistics': self.memory_system.get_statistics()
        }

def main():
    """測試本地記憶系統"""
    
    print("🧠 初始化本地記憶系統...")
    
    # 創建記憶系統
    memory_integration = AugmentMemoryIntegration()
    
    # 測試添加記憶
    memory_integration.learn_from_conversation(
        "我喜歡使用 TypeScript 和 Tailwind CSS",
        "好的，我會記住您的偏好"
    )
    
    # 測試搜索
    memories = memory_integration.get_relevant_memories("TypeScript")
    print(f"🔍 找到 {len(memories)} 個相關記憶")
    
    # 獲取統計信息
    stats = memory_integration.memory_system.get_statistics()
    print(f"📊 記憶系統統計: {stats}")
    
    # 獲取用戶上下文
    context = memory_integration.get_user_context()
    print(f"👤 用戶上下文包含 {len(context['recent_memories'])} 個記憶")
    
    print("✅ 本地記憶系統測試完成！")

if __name__ == "__main__":
    main()
