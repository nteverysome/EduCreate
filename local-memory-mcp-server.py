#!/usr/bin/env python3
"""
本地記憶 MCP 服務器
為 Augment 提供本地記憶功能，無需 API 密鑰
"""

import asyncio
import json
import sys
from typing import Dict, Any, List
import logging
# 導入本地記憶系統
try:
    from local_memory_system import AugmentMemoryIntegration, LocalMemorySystem
except ImportError:
    # 如果導入失敗，創建簡化版本
    import sqlite3
    import hashlib
    import time
    from datetime import datetime

    class LocalMemorySystem:
        def __init__(self, db_path="augment_memory.db"):
            self.db_path = db_path
            self.init_database()

        def init_database(self):
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS memories (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    memory_type TEXT NOT NULL,
                    category TEXT NOT NULL,
                    importance INTEGER DEFAULT 5,
                    created_at TEXT NOT NULL
                )
            ''')
            conn.commit()
            conn.close()

        def add_memory(self, content, memory_type, category, importance=5, tags=None, metadata=None):
            memory_id = hashlib.md5(f"{content}{time.time()}".encode()).hexdigest()
            now = datetime.now().isoformat()

            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO memories (id, content, memory_type, category, importance, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (memory_id, content, memory_type, category, importance, now))
            conn.commit()
            conn.close()
            return memory_id

        def search_memories(self, query, limit=20):
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM memories WHERE content LIKE ? LIMIT ?
            ''', (f"%{query}%", limit))
            rows = cursor.fetchall()
            conn.close()
            return [{"id": row[0], "content": row[1], "type": row[2], "category": row[3]} for row in rows]

        def get_statistics(self):
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM memories')
            total = cursor.fetchone()[0]
            conn.close()
            return {"total_memories": total, "database_path": self.db_path}

    class AugmentMemoryIntegration:
        def __init__(self):
            self.memory_system = LocalMemorySystem()

        def get_relevant_memories(self, query, limit=10):
            return self.memory_system.search_memories(query, limit)

        def learn_from_conversation(self, user_input, ai_response):
            self.memory_system.add_memory(
                content=f"對話: {user_input}",
                memory_type="conversation",
                category="general",
                importance=5
            )

        def get_user_context(self):
            stats = self.memory_system.get_statistics()
            return {
                "recent_memories": [],
                "user_preferences": {},
                "project_knowledge": [],
                "statistics": stats
            }

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LocalMemoryMCPServer:
    """本地記憶 MCP 服務器"""
    
    def __init__(self):
        self.memory_integration = AugmentMemoryIntegration()
        logger.info("🧠 本地記憶 MCP 服務器初始化完成")
    
    async def handle_mcp_request(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """處理 MCP 請求"""
        
        try:
            if method == "add_memory":
                return await self.add_memory(params)
            
            elif method == "search_memories":
                return await self.search_memories(params)
            
            elif method == "get_user_context":
                return await self.get_user_context(params)
            
            elif method == "learn_from_conversation":
                return await self.learn_from_conversation(params)
            
            elif method == "add_user_preference":
                return await self.add_user_preference(params)
            
            elif method == "get_user_preference":
                return await self.get_user_preference(params)
            
            elif method == "add_project_knowledge":
                return await self.add_project_knowledge(params)
            
            elif method == "get_project_knowledge":
                return await self.get_project_knowledge(params)
            
            elif method == "get_statistics":
                return await self.get_statistics(params)
            
            elif method == "cleanup_memories":
                return await self.cleanup_memories(params)
            
            else:
                return {
                    "success": False,
                    "error": f"未知方法: {method}",
                    "available_methods": [
                        "add_memory", "search_memories", "get_user_context",
                        "learn_from_conversation", "add_user_preference", 
                        "get_user_preference", "add_project_knowledge",
                        "get_project_knowledge", "get_statistics", "cleanup_memories"
                    ]
                }
        
        except Exception as e:
            logger.error(f"處理請求時發生錯誤: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def add_memory(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """添加記憶"""
        
        content = params.get("content", "")
        memory_type = params.get("memory_type", "conversation")
        category = params.get("category", "general")
        importance = params.get("importance", 5)
        tags = params.get("tags", [])
        metadata = params.get("metadata", {})
        
        if not content:
            return {"success": False, "error": "內容不能為空"}
        
        memory_id = self.memory_integration.memory_system.add_memory(
            content=content,
            memory_type=memory_type,
            category=category,
            importance=importance,
            tags=tags,
            metadata=metadata
        )
        
        return {
            "success": True,
            "memory_id": memory_id,
            "message": f"成功添加記憶: {memory_type}/{category}"
        }
    
    async def search_memories(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """搜索記憶"""
        
        query = params.get("query", "")
        limit = params.get("limit", 20)
        
        if not query:
            return {"success": False, "error": "搜索查詢不能為空"}
        
        memories = self.memory_integration.get_relevant_memories(query, limit)
        
        return {
            "success": True,
            "query": query,
            "count": len(memories),
            "memories": [
                {
                    "id": memory.id,
                    "content": memory.content,
                    "type": memory.memory_type,
                    "category": memory.category,
                    "importance": memory.importance,
                    "tags": memory.tags,
                    "created_at": memory.created_at,
                    "access_count": memory.access_count
                }
                for memory in memories
            ]
        }
    
    async def get_user_context(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """獲取用戶上下文"""
        
        context = self.memory_integration.get_user_context()
        
        return {
            "success": True,
            "context": context,
            "summary": {
                "total_memories": len(context["recent_memories"]),
                "preferences_count": len([p for p in context["user_preferences"].values() if p]),
                "knowledge_count": len(context["project_knowledge"])
            }
        }
    
    async def learn_from_conversation(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """從對話中學習"""
        
        user_input = params.get("user_input", "")
        ai_response = params.get("ai_response", "")
        
        if not user_input:
            return {"success": False, "error": "用戶輸入不能為空"}
        
        self.memory_integration.learn_from_conversation(user_input, ai_response)
        
        return {
            "success": True,
            "message": "已從對話中學習並更新記憶"
        }
    
    async def add_user_preference(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """添加用戶偏好"""
        
        key = params.get("key", "")
        value = params.get("value")
        
        if not key:
            return {"success": False, "error": "偏好鍵不能為空"}
        
        self.memory_integration.memory_system.add_user_preference(key, value)
        
        return {
            "success": True,
            "message": f"已更新用戶偏好: {key}"
        }
    
    async def get_user_preference(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """獲取用戶偏好"""
        
        key = params.get("key", "")
        default = params.get("default")
        
        if not key:
            return {"success": False, "error": "偏好鍵不能為空"}
        
        value = self.memory_integration.memory_system.get_user_preference(key, default)
        
        return {
            "success": True,
            "key": key,
            "value": value
        }
    
    async def add_project_knowledge(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """添加項目知識"""
        
        file_path = params.get("file_path", "")
        knowledge_type = params.get("knowledge_type", "general")
        content = params.get("content", "")
        confidence = params.get("confidence", 0.5)
        
        if not content:
            return {"success": False, "error": "知識內容不能為空"}
        
        knowledge_id = self.memory_integration.memory_system.add_project_knowledge(
            file_path=file_path,
            knowledge_type=knowledge_type,
            content=content,
            confidence=confidence
        )
        
        return {
            "success": True,
            "knowledge_id": knowledge_id,
            "message": f"已添加項目知識: {knowledge_type}"
        }
    
    async def get_project_knowledge(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """獲取項目知識"""
        
        file_path = params.get("file_path")
        knowledge_type = params.get("knowledge_type")
        
        knowledge = self.memory_integration.memory_system.get_project_knowledge(
            file_path=file_path,
            knowledge_type=knowledge_type
        )
        
        return {
            "success": True,
            "count": len(knowledge),
            "knowledge": knowledge
        }
    
    async def get_statistics(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """獲取統計信息"""
        
        stats = self.memory_integration.memory_system.get_statistics()
        
        return {
            "success": True,
            "statistics": stats
        }
    
    async def cleanup_memories(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """清理舊記憶"""
        
        days = params.get("days", 30)
        min_importance = params.get("min_importance", 3)
        
        deleted_count = self.memory_integration.memory_system.cleanup_old_memories(
            days=days,
            min_importance=min_importance
        )
        
        return {
            "success": True,
            "deleted_count": deleted_count,
            "message": f"已清理 {deleted_count} 個舊記憶"
        }

async def main():
    """主函數 - MCP 服務器入口點"""
    
    mcp_server = LocalMemoryMCPServer()
    
    logger.info("🚀 本地記憶 MCP 服務器啟動")
    logger.info("📋 可用方法:")
    logger.info("   - add_memory: 添加記憶")
    logger.info("   - search_memories: 搜索記憶")
    logger.info("   - get_user_context: 獲取用戶上下文")
    logger.info("   - learn_from_conversation: 從對話學習")
    logger.info("   - add_user_preference: 添加用戶偏好")
    logger.info("   - get_user_preference: 獲取用戶偏好")
    logger.info("   - add_project_knowledge: 添加項目知識")
    logger.info("   - get_project_knowledge: 獲取項目知識")
    logger.info("   - get_statistics: 獲取統計信息")
    logger.info("   - cleanup_memories: 清理舊記憶")
    
    # 模擬 MCP 協議處理
    while True:
        try:
            # 讀取標準輸入 (MCP 協議)
            line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
            if not line:
                break
            
            try:
                request = json.loads(line.strip())
                method = request.get("method")
                params = request.get("params", {})
                
                response = await mcp_server.handle_mcp_request(method, params)
                
                # 輸出響應
                print(json.dumps(response, ensure_ascii=False))
                sys.stdout.flush()
                
            except json.JSONDecodeError:
                error_response = {
                    "success": False,
                    "error": "無效的 JSON 請求"
                }
                print(json.dumps(error_response, ensure_ascii=False))
                sys.stdout.flush()
                
        except KeyboardInterrupt:
            logger.info("🛑 本地記憶 MCP 服務器停止")
            break
        except Exception as e:
            logger.error(f"❌ 錯誤: {e}")

if __name__ == "__main__":
    asyncio.run(main())
