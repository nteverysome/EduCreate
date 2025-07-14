#!/usr/bin/env python3
"""
Augment 檔案理解增強器
提升 Augment Context Engine 對檔案的理解和掌握度
"""

import os
import json
import ast
import re
from typing import Dict, List, Any, Optional
from pathlib import Path
import hashlib
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class FileAnalysis:
    """檔案分析結果"""
    path: str
    type: str
    size: int
    last_modified: str
    complexity_score: int
    dependencies: List[str]
    exports: List[str]
    imports: List[str]
    functions: List[str]
    classes: List[str]
    components: List[str]
    apis: List[str]
    tests: List[str]
    documentation: str
    business_logic: List[str]
    performance_notes: List[str]
    security_notes: List[str]
    accessibility_notes: List[str]
    memory_science_notes: List[str]

class AugmentFileUnderstandingEnhancer:
    """Augment 檔案理解增強器"""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.analysis_cache = {}
        self.project_knowledge = {}
        self.load_project_knowledge()
    
    def load_project_knowledge(self):
        """載入項目知識庫"""
        knowledge_file = self.project_root / "augment-project-knowledge.json"
        if knowledge_file.exists():
            with open(knowledge_file, 'r', encoding='utf-8') as f:
                self.project_knowledge = json.load(f)
        else:
            self.project_knowledge = {
                "project_type": "memory-science-education-platform",
                "tech_stack": {
                    "frontend": "Next.js + React + TypeScript + Tailwind",
                    "backend": "Node.js + Express + PostgreSQL + Prisma",
                    "ai": "OpenAI GPT-4 + 語音識別/合成",
                    "testing": "Jest + Playwright"
                },
                "key_concepts": [
                    "記憶科學", "間隔重複", "主動回憶", "認知負荷",
                    "GEPT分級", "無障礙設計", "AI對話", "遊戲引擎"
                ],
                "architecture_patterns": [
                    "防止功能孤立工作流程",
                    "五項同步開發",
                    "三層整合驗證",
                    "Playwright端到端測試"
                ]
            }
    
    def analyze_file(self, file_path: str) -> FileAnalysis:
        """深度分析單個檔案"""
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"檔案不存在: {file_path}")
        
        # 檢查緩存
        file_hash = self.get_file_hash(path)
        if file_hash in self.analysis_cache:
            return self.analysis_cache[file_hash]
        
        # 基本檔案信息
        stat = path.stat()
        file_type = self.determine_file_type(path)
        
        analysis = FileAnalysis(
            path=str(path),
            type=file_type,
            size=stat.st_size,
            last_modified=datetime.fromtimestamp(stat.st_mtime).isoformat(),
            complexity_score=0,
            dependencies=[],
            exports=[],
            imports=[],
            functions=[],
            classes=[],
            components=[],
            apis=[],
            tests=[],
            documentation="",
            business_logic=[],
            performance_notes=[],
            security_notes=[],
            accessibility_notes=[],
            memory_science_notes=[]
        )
        
        # 讀取檔案內容
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            # 二進制檔案
            analysis.documentation = "二進制檔案，無法分析內容"
            return analysis
        
        # 根據檔案類型進行專門分析
        if file_type == "typescript" or file_type == "javascript":
            self.analyze_typescript_javascript(content, analysis)
        elif file_type == "react":
            self.analyze_react_component(content, analysis)
        elif file_type == "api":
            self.analyze_api_route(content, analysis)
        elif file_type == "test":
            self.analyze_test_file(content, analysis)
        elif file_type == "markdown":
            self.analyze_markdown(content, analysis)
        elif file_type == "json":
            self.analyze_json_config(content, analysis)
        
        # EduCreate 專用分析
        self.analyze_educreat_specific(content, analysis)
        
        # 計算複雜度分數
        analysis.complexity_score = self.calculate_complexity_score(analysis)
        
        # 緩存結果
        self.analysis_cache[file_hash] = analysis
        
        return analysis
    
    def determine_file_type(self, path: Path) -> str:
        """判斷檔案類型"""
        suffix = path.suffix.lower()
        name = path.name.lower()
        
        if suffix in ['.ts', '.tsx']:
            if 'test' in name or 'spec' in name:
                return "test"
            elif suffix == '.tsx' or 'component' in name:
                return "react"
            elif 'api' in str(path) or 'route' in name:
                return "api"
            else:
                return "typescript"
        elif suffix in ['.js', '.jsx']:
            return "javascript"
        elif suffix == '.md':
            return "markdown"
        elif suffix == '.json':
            return "json"
        elif suffix in ['.css', '.scss']:
            return "stylesheet"
        else:
            return "other"
    
    def analyze_typescript_javascript(self, content: str, analysis: FileAnalysis):
        """分析 TypeScript/JavaScript 檔案"""
        
        # 提取 imports
        import_pattern = r'import\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]'
        analysis.imports = re.findall(import_pattern, content)
        
        # 提取 exports
        export_pattern = r'export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)'
        analysis.exports = re.findall(export_pattern, content)
        
        # 提取函數
        function_pattern = r'(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\()'
        matches = re.findall(function_pattern, content)
        analysis.functions = [match[0] or match[1] for match in matches if match[0] or match[1]]
        
        # 提取類別
        class_pattern = r'class\s+(\w+)'
        analysis.classes = re.findall(class_pattern, content)
        
        # 提取 API 調用
        api_pattern = r'(?:fetch|axios|api)\s*\(\s*[\'"]([^\'"]+)[\'"]'
        analysis.apis = re.findall(api_pattern, content)
    
    def analyze_react_component(self, content: str, analysis: FileAnalysis):
        """分析 React 組件"""
        self.analyze_typescript_javascript(content, analysis)
        
        # 提取組件名稱
        component_pattern = r'(?:export\s+default\s+)?(?:function|const)\s+(\w+)'
        analysis.components = re.findall(component_pattern, content)
        
        # 檢查無障礙設計
        if 'aria-' in content or 'role=' in content or 'data-testid' in content:
            analysis.accessibility_notes.append("包含無障礙設計屬性")
        
        # 檢查測試 ID
        testid_pattern = r'data-testid=[\'"]([^\'"]+)[\'"]'
        test_ids = re.findall(testid_pattern, content)
        if test_ids:
            analysis.tests.extend(test_ids)
    
    def analyze_api_route(self, content: str, analysis: FileAnalysis):
        """分析 API 路由"""
        self.analyze_typescript_javascript(content, analysis)
        
        # 提取 HTTP 方法
        http_methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        for method in http_methods:
            if f'export async function {method}' in content:
                analysis.apis.append(f"{method} endpoint")
        
        # 檢查身份驗證
        if 'getServerSession' in content or 'auth' in content:
            analysis.security_notes.append("包含身份驗證")
        
        # 檢查數據驗證
        if 'zod' in content or 'joi' in content or 'yup' in content:
            analysis.security_notes.append("包含數據驗證")
    
    def analyze_test_file(self, content: str, analysis: FileAnalysis):
        """分析測試檔案"""
        
        # 提取測試描述
        test_pattern = r'(?:test|it)\s*\(\s*[\'"]([^\'"]+)[\'"]'
        analysis.tests = re.findall(test_pattern, content)
        
        # 檢查測試類型
        if 'playwright' in content.lower():
            analysis.business_logic.append("Playwright 端到端測試")
        if 'jest' in content.lower():
            analysis.business_logic.append("Jest 單元測試")
        
        # 檢查防止功能孤立測試
        if '防止功能孤立' in content or 'anti-isolation' in content:
            analysis.business_logic.append("防止功能孤立驗證")
    
    def analyze_markdown(self, content: str, analysis: FileAnalysis):
        """分析 Markdown 文檔"""
        
        # 提取標題
        title_pattern = r'^#+\s+(.+)$'
        titles = re.findall(title_pattern, content, re.MULTILINE)
        analysis.documentation = f"包含 {len(titles)} 個標題: {', '.join(titles[:5])}"
        
        # 檢查是否為架構文檔
        if any(keyword in content.lower() for keyword in ['架構', 'architecture', '設計', 'design']):
            analysis.business_logic.append("架構設計文檔")
    
    def analyze_json_config(self, content: str, analysis: FileAnalysis):
        """分析 JSON 配置檔案"""
        try:
            data = json.loads(content)
            analysis.documentation = f"JSON 配置檔案，包含 {len(data)} 個頂級鍵"
            
            # 檢查特定配置類型
            if 'scripts' in data:
                analysis.business_logic.append("npm 腳本配置")
            if 'dependencies' in data:
                analysis.dependencies = list(data.get('dependencies', {}).keys())
        except json.JSONDecodeError:
            analysis.documentation = "無效的 JSON 格式"
    
    def analyze_educreat_specific(self, content: str, analysis: FileAnalysis):
        """EduCreate 專用分析"""
        
        # 記憶科學相關
        memory_keywords = [
            '間隔重複', 'spaced repetition', '主動回憶', 'active recall',
            '認知負荷', 'cognitive load', '記憶遊戲', 'memory game'
        ]
        
        for keyword in memory_keywords:
            if keyword.lower() in content.lower():
                analysis.memory_science_notes.append(f"包含記憶科學概念: {keyword}")
        
        # GEPT 分級相關
        if 'gept' in content.lower() or 'GEPTLevel' in content:
            analysis.business_logic.append("GEPT 分級系統相關")
        
        # AI 對話相關
        if 'ai' in content.lower() and ('dialogue' in content.lower() or '對話' in content):
            analysis.business_logic.append("AI 對話系統相關")
        
        # 無障礙設計
        accessibility_keywords = ['wcag', 'aria', 'accessibility', '無障礙']
        for keyword in accessibility_keywords:
            if keyword.lower() in content.lower():
                analysis.accessibility_notes.append(f"無障礙設計: {keyword}")
    
    def calculate_complexity_score(self, analysis: FileAnalysis) -> int:
        """計算檔案複雜度分數 (1-10)"""
        score = 1
        
        # 基於檔案大小
        if analysis.size > 10000:
            score += 2
        elif analysis.size > 5000:
            score += 1
        
        # 基於依賴數量
        score += min(len(analysis.dependencies), 3)
        
        # 基於函數和類別數量
        score += min(len(analysis.functions) + len(analysis.classes), 3)
        
        # 基於業務邏輯複雜度
        score += min(len(analysis.business_logic), 2)
        
        return min(score, 10)
    
    def get_file_hash(self, path: Path) -> str:
        """獲取檔案哈希值用於緩存"""
        stat = path.stat()
        content = f"{path}:{stat.st_size}:{stat.st_mtime}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def analyze_project(self) -> Dict[str, Any]:
        """分析整個項目"""
        
        print("🔍 開始分析 EduCreate 項目...")
        
        # 要分析的檔案模式
        patterns = [
            "**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx",
            "**/*.md", "**/*.json"
        ]
        
        all_files = []
        for pattern in patterns:
            all_files.extend(self.project_root.glob(pattern))
        
        # 過濾掉不需要的檔案
        exclude_patterns = [
            "node_modules", ".next", "dist", "build", 
            ".git", "coverage", "test-results"
        ]
        
        filtered_files = []
        for file_path in all_files:
            if not any(exclude in str(file_path) for exclude in exclude_patterns):
                filtered_files.append(file_path)
        
        print(f"📁 找到 {len(filtered_files)} 個檔案需要分析")
        
        # 分析每個檔案
        analyses = []
        for i, file_path in enumerate(filtered_files):
            try:
                analysis = self.analyze_file(str(file_path))
                analyses.append(analysis)
                
                if (i + 1) % 50 == 0:
                    print(f"   已分析 {i + 1}/{len(filtered_files)} 個檔案")
                    
            except Exception as e:
                print(f"   ⚠️ 分析檔案失敗 {file_path}: {e}")
        
        # 生成項目總結
        project_summary = self.generate_project_summary(analyses)
        
        # 保存分析結果
        self.save_analysis_results(analyses, project_summary)
        
        print("✅ 項目分析完成！")
        return project_summary
    
    def generate_project_summary(self, analyses: List[FileAnalysis]) -> Dict[str, Any]:
        """生成項目總結"""
        
        summary = {
            "total_files": len(analyses),
            "file_types": {},
            "complexity_distribution": {},
            "key_components": [],
            "api_endpoints": [],
            "test_coverage": [],
            "memory_science_features": [],
            "accessibility_features": [],
            "dependencies": set(),
            "recommendations": []
        }
        
        for analysis in analyses:
            # 檔案類型統計
            file_type = analysis.type
            summary["file_types"][file_type] = summary["file_types"].get(file_type, 0) + 1
            
            # 複雜度分布
            complexity = analysis.complexity_score
            summary["complexity_distribution"][complexity] = summary["complexity_distribution"].get(complexity, 0) + 1
            
            # 收集關鍵信息
            summary["key_components"].extend(analysis.components)
            summary["api_endpoints"].extend(analysis.apis)
            summary["test_coverage"].extend(analysis.tests)
            summary["memory_science_features"].extend(analysis.memory_science_notes)
            summary["accessibility_features"].extend(analysis.accessibility_notes)
            summary["dependencies"].update(analysis.dependencies)
        
        # 轉換 set 為 list
        summary["dependencies"] = list(summary["dependencies"])
        
        # 生成建議
        summary["recommendations"] = self.generate_recommendations(summary)
        
        return summary
    
    def generate_recommendations(self, summary: Dict[str, Any]) -> List[str]:
        """生成改進建議"""
        recommendations = []
        
        # 複雜度建議
        high_complexity_files = summary["complexity_distribution"].get(9, 0) + summary["complexity_distribution"].get(10, 0)
        if high_complexity_files > 0:
            recommendations.append(f"發現 {high_complexity_files} 個高複雜度檔案，建議重構")
        
        # 測試覆蓋率建議
        test_files = summary["file_types"].get("test", 0)
        total_files = summary["total_files"]
        if test_files / total_files < 0.3:
            recommendations.append("測試覆蓋率偏低，建議增加更多測試")
        
        # 記憶科學功能建議
        if len(summary["memory_science_features"]) < 10:
            recommendations.append("記憶科學功能實現較少，建議加強相關功能")
        
        # 無障礙設計建議
        if len(summary["accessibility_features"]) < 5:
            recommendations.append("無障礙設計功能較少，建議加強 WCAG 合規性")
        
        return recommendations
    
    def save_analysis_results(self, analyses: List[FileAnalysis], summary: Dict[str, Any]):
        """保存分析結果"""
        
        # 保存詳細分析結果
        results = {
            "timestamp": datetime.now().isoformat(),
            "project_summary": summary,
            "file_analyses": [asdict(analysis) for analysis in analyses]
        }
        
        output_file = self.project_root / "augment-file-analysis-results.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"📊 分析結果已保存到: {output_file}")

def main():
    """主函數"""
    project_root = "C:/Users/Administrator/Desktop/EduCreate"
    
    enhancer = AugmentFileUnderstandingEnhancer(project_root)
    summary = enhancer.analyze_project()
    
    print("\n📊 項目分析總結:")
    print(f"   總檔案數: {summary['total_files']}")
    print(f"   檔案類型: {summary['file_types']}")
    print(f"   關鍵組件: {len(summary['key_components'])} 個")
    print(f"   API 端點: {len(summary['api_endpoints'])} 個")
    print(f"   測試覆蓋: {len(summary['test_coverage'])} 個測試")
    print(f"   記憶科學功能: {len(summary['memory_science_features'])} 個")
    print(f"   無障礙功能: {len(summary['accessibility_features'])} 個")
    
    if summary['recommendations']:
        print("\n💡 改進建議:")
        for rec in summary['recommendations']:
            print(f"   • {rec}")

if __name__ == "__main__":
    main()
