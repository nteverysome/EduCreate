#!/usr/bin/env python3
"""
簡化版本地記憶系統
為 Augment 提供基本的本地記憶功能
"""

import json
import os
import time
import hashlib
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

class SimpleLocalMemory:
    """簡化版本地記憶系統"""
    
    def __init__(self, data_dir: str = "augment_memory_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # 數據文件路徑
        self.memories_file = self.data_dir / "memories.json"
        self.preferences_file = self.data_dir / "preferences.json"
        self.knowledge_file = self.data_dir / "knowledge.json"
        self.stats_file = self.data_dir / "stats.json"
        
        # 初始化數據
        self.memories = self.load_json(self.memories_file, [])
        self.preferences = self.load_json(self.preferences_file, {})
        self.knowledge = self.load_json(self.knowledge_file, [])
        self.stats = self.load_json(self.stats_file, {"total_operations": 0})
        
        # 初始化 EduCreate 知識
        self.init_educreat_knowledge()
        
        print(f"✅ 簡化版本地記憶系統初始化完成: {self.data_dir}")
    
    def load_json(self, file_path: Path, default: Any) -> Any:
        """載入 JSON 文件"""
        try:
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"⚠️ 載入 {file_path} 失敗: {e}")
        return default
    
    def save_json(self, file_path: Path, data: Any):
        """保存 JSON 文件"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"❌ 保存 {file_path} 失敗: {e}")
    
    def init_educreat_knowledge(self):
        """初始化 EduCreate 項目知識"""
        
        if len(self.memories) == 0:  # 只在第一次初始化
            
            # 基本項目信息
            self.add_memory(
                content="EduCreate 是一個記憶科學驅動的智能教育遊戲 SaaS 平台",
                memory_type="knowledge",
                category="project",
                importance=10,
                tags=["educreat", "project", "memory_science"]
            )
            
            # 技術棧
            self.add_memory(
                content="技術棧: Next.js + React + TypeScript + Tailwind CSS + PostgreSQL + Prisma",
                memory_type="knowledge", 
                category="tech_stack",
                importance=9,
                tags=["tech_stack", "nextjs", "react", "typescript"]
            )
            
            # 核心概念
            concepts = [
                "間隔重複算法 - 基於遺忘曲線優化學習",
                "主動回憶技術 - 提升記憶鞏固效果",
                "認知負荷理論 - 優化學習體驗設計",
                "GEPT 三級分級 - 英語能力分級系統",
                "25 種記憶遊戲 - 多樣化學習體驗",
                "防止功能孤立 - 確保功能完整整合"
            ]
            
            for concept in concepts:
                self.add_memory(
                    content=concept,
                    memory_type="knowledge",
                    category="memory_science",
                    importance=8,
                    tags=["memory_science", "core_concept"]
                )
            
            # 設置預設偏好
            self.set_preference("coding_style", "typescript_strict")
            self.set_preference("test_framework", "playwright_jest")
            self.set_preference("ui_framework", "tailwind_css")
            self.set_preference("project_type", "educreat_platform")
            
            print("🎓 EduCreate 項目知識初始化完成")
    
    def add_memory(self, content: str, memory_type: str = "general", 
                   category: str = "general", importance: int = 5, 
                   tags: List[str] = None) -> str:
        """添加記憶"""
        
        if tags is None:
            tags = []
        
        memory_id = hashlib.md5(f"{content}{time.time()}".encode()).hexdigest()
        now = datetime.now().isoformat()
        
        memory = {
            "id": memory_id,
            "content": content,
            "memory_type": memory_type,
            "category": category,
            "importance": importance,
            "tags": tags,
            "created_at": now,
            "last_accessed": now,
            "access_count": 0
        }
        
        self.memories.append(memory)
        self.save_json(self.memories_file, self.memories)
        
        # 更新統計
        self.stats["total_operations"] += 1
        self.save_json(self.stats_file, self.stats)
        
        print(f"📝 添加記憶: {memory_type}/{category} - {content[:50]}...")
        return memory_id
    
    def search_memories(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """搜索記憶"""
        
        query_lower = query.lower()
        results = []
        
        for memory in self.memories:
            # 搜索內容、標籤和分類
            if (query_lower in memory["content"].lower() or
                any(query_lower in tag.lower() for tag in memory["tags"]) or
                query_lower in memory["category"].lower()):
                
                # 更新訪問記錄
                memory["last_accessed"] = datetime.now().isoformat()
                memory["access_count"] += 1
                
                results.append(memory)
        
        # 按重要性和訪問次數排序
        results.sort(key=lambda x: (x["importance"], x["access_count"]), reverse=True)
        
        # 保存更新的記憶
        self.save_json(self.memories_file, self.memories)
        
        return results[:limit]
    
    def get_memories(self, memory_type: str = None, category: str = None, 
                     limit: int = 50) -> List[Dict[str, Any]]:
        """獲取記憶"""
        
        filtered_memories = []
        
        for memory in self.memories:
            if memory_type and memory["memory_type"] != memory_type:
                continue
            if category and memory["category"] != category:
                continue
            filtered_memories.append(memory)
        
        # 按重要性排序
        filtered_memories.sort(key=lambda x: x["importance"], reverse=True)
        
        return filtered_memories[:limit]
    
    def set_preference(self, key: str, value: Any):
        """設置用戶偏好"""
        
        self.preferences[key] = {
            "value": value,
            "updated_at": datetime.now().isoformat()
        }
        
        self.save_json(self.preferences_file, self.preferences)
        print(f"⚙️ 設置偏好: {key} = {value}")
    
    def get_preference(self, key: str, default: Any = None) -> Any:
        """獲取用戶偏好"""
        
        if key in self.preferences:
            return self.preferences[key]["value"]
        return default
    
    def add_knowledge(self, file_path: str, knowledge_type: str, 
                     content: str, confidence: float = 0.5) -> str:
        """添加項目知識"""
        
        knowledge_id = hashlib.md5(f"{file_path}{knowledge_type}{content}".encode()).hexdigest()
        now = datetime.now().isoformat()
        
        knowledge_item = {
            "id": knowledge_id,
            "file_path": file_path,
            "knowledge_type": knowledge_type,
            "content": content,
            "confidence": confidence,
            "created_at": now,
            "updated_at": now
        }
        
        # 檢查是否已存在，如果存在則更新
        existing_index = None
        for i, item in enumerate(self.knowledge):
            if item["id"] == knowledge_id:
                existing_index = i
                break
        
        if existing_index is not None:
            self.knowledge[existing_index] = knowledge_item
        else:
            self.knowledge.append(knowledge_item)
        
        self.save_json(self.knowledge_file, self.knowledge)
        print(f"🧠 添加項目知識: {file_path} - {knowledge_type}")
        return knowledge_id
    
    def get_knowledge(self, file_path: str = None, 
                     knowledge_type: str = None) -> List[Dict[str, Any]]:
        """獲取項目知識"""
        
        filtered_knowledge = []
        
        for item in self.knowledge:
            if file_path and file_path not in item["file_path"]:
                continue
            if knowledge_type and item["knowledge_type"] != knowledge_type:
                continue
            filtered_knowledge.append(item)
        
        # 按信心度排序
        filtered_knowledge.sort(key=lambda x: x["confidence"], reverse=True)
        
        return filtered_knowledge
    
    def learn_from_conversation(self, user_input: str, ai_response: str = ""):
        """從對話中學習"""
        
        # 檢測偏好
        if any(keyword in user_input.lower() for keyword in ['喜歡', '偏好', '習慣', '通常']):
            self.add_memory(
                content=f"用戶偏好: {user_input}",
                memory_type="preference",
                category="user_preference",
                importance=7,
                tags=["user_preference", "conversation"]
            )
        
        # 檢測代碼相關討論
        if any(keyword in user_input.lower() for keyword in ['function', 'component', 'class', '函數', '組件']):
            self.add_memory(
                content=f"代碼討論: {user_input}",
                memory_type="code_pattern",
                category="programming",
                importance=6,
                tags=["code", "programming", "discussion"]
            )
        
        # 檢測 EduCreate 相關討論
        if any(keyword in user_input.lower() for keyword in ['educreat', '記憶', '遊戲', 'gept', 'memory']):
            self.add_memory(
                content=f"EduCreate 討論: {user_input}",
                memory_type="conversation",
                category="educreat",
                importance=8,
                tags=["educreat", "discussion", "feature"]
            )
    
    def get_user_context(self) -> Dict[str, Any]:
        """獲取用戶上下文"""
        
        # 獲取最近的高重要性記憶
        recent_memories = self.get_memories(limit=20)
        recent_memories = [m for m in recent_memories if m["importance"] >= 6]
        
        # 統計信息
        memory_types = {}
        categories = {}
        
        for memory in self.memories:
            memory_types[memory["memory_type"]] = memory_types.get(memory["memory_type"], 0) + 1
            categories[memory["category"]] = categories.get(memory["category"], 0) + 1
        
        return {
            "recent_memories": recent_memories,
            "user_preferences": {k: v["value"] for k, v in self.preferences.items()},
            "project_knowledge": self.knowledge[:10],  # 前 10 個
            "statistics": {
                "total_memories": len(self.memories),
                "memory_types": memory_types,
                "categories": categories,
                "total_preferences": len(self.preferences),
                "total_knowledge": len(self.knowledge)
            }
        }
    
    def get_statistics(self) -> Dict[str, Any]:
        """獲取統計信息"""
        
        memory_types = {}
        categories = {}
        total_importance = 0
        
        for memory in self.memories:
            memory_types[memory["memory_type"]] = memory_types.get(memory["memory_type"], 0) + 1
            categories[memory["category"]] = categories.get(memory["category"], 0) + 1
            total_importance += memory["importance"]
        
        avg_importance = total_importance / len(self.memories) if self.memories else 0
        
        return {
            "total_memories": len(self.memories),
            "memory_types": memory_types,
            "categories": categories,
            "avg_importance": round(avg_importance, 2),
            "total_preferences": len(self.preferences),
            "total_knowledge": len(self.knowledge),
            "data_directory": str(self.data_dir)
        }

def main():
    """測試簡化版本地記憶系統"""
    
    print("🧠 測試簡化版本地記憶系統...")
    
    # 創建記憶系統
    memory = SimpleLocalMemory()
    
    # 測試添加記憶
    memory.add_memory(
        content="用戶喜歡使用 React Hooks 進行狀態管理",
        memory_type="preference",
        category="programming",
        importance=8,
        tags=["react", "hooks", "state"]
    )
    
    # 測試搜索
    results = memory.search_memories("React")
    print(f"🔍 搜索 'React' 找到 {len(results)} 個結果")
    
    # 測試對話學習
    memory.learn_from_conversation("我通常使用 TypeScript 進行開發")
    
    # 測試用戶上下文
    context = memory.get_user_context()
    print(f"👤 用戶上下文包含 {len(context['recent_memories'])} 個記憶")
    
    # 測試統計
    stats = memory.get_statistics()
    print(f"📊 統計: {stats}")
    
    print("✅ 簡化版本地記憶系統測試完成！")

if __name__ == "__main__":
    main()
