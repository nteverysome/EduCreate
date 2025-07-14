#!/usr/bin/env python3
"""
測試 Augment 效能提升的實際效果
"""

import sqlite3
import os
import json
import time
import psutil
from pathlib import Path

def check_databases():
    """檢查增強數據庫狀態"""
    
    print("🔍 檢查 Augment 增強數據庫...")
    
    results = {}
    
    # 檢查代碼分析數據庫
    if os.path.exists('augment_analysis.db'):
        conn = sqlite3.connect('augment_analysis.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM code_analysis")
        analysis_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM code_patterns")
        patterns_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM dependencies")
        deps_count = cursor.fetchone()[0]
        
        results['code_analysis'] = {
            'status': '✅ 可用',
            'analyzed_files': analysis_count,
            'patterns_found': patterns_count,
            'dependencies': deps_count
        }
        
        conn.close()
        print(f"✅ 代碼分析數據庫: {analysis_count} 個檔案已分析")
    else:
        results['code_analysis'] = {'status': '❌ 不存在'}
        print("❌ 代碼分析數據庫不存在")
    
    # 檢查向量數據庫
    if os.path.exists('augment_vectors.db'):
        conn = sqlite3.connect('augment_vectors.db')
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT COUNT(*) FROM file_vectors")
            vector_count = cursor.fetchone()[0]
            
            results['vector_search'] = {
                'status': '✅ 可用',
                'indexed_files': vector_count
            }
            print(f"✅ 向量搜索數據庫: {vector_count} 個檔案已索引")
        except:
            results['vector_search'] = {'status': '⚠️ 表結構問題'}
            print("⚠️ 向量搜索數據庫存在但表結構有問題")
        
        conn.close()
    else:
        results['vector_search'] = {'status': '❌ 不存在'}
        print("❌ 向量搜索數據庫不存在")
    
    # 檢查記憶系統
    memory_dir = Path("augment_memory_data")
    if memory_dir.exists():
        memories_file = memory_dir / "memories.json"
        preferences_file = memory_dir / "preferences.json"
        knowledge_file = memory_dir / "knowledge.json"
        
        memory_count = 0
        if memories_file.exists():
            with open(memories_file, 'r', encoding='utf-8') as f:
                memories = json.load(f)
                memory_count = len(memories)
        
        results['memory_system'] = {
            'status': '✅ 可用',
            'memories_count': memory_count,
            'has_preferences': preferences_file.exists(),
            'has_knowledge': knowledge_file.exists()
        }
        print(f"✅ 記憶系統: {memory_count} 條記憶")
    else:
        results['memory_system'] = {'status': '❌ 不存在'}
        print("❌ 記憶系統不存在")
    
    return results

def test_system_performance():
    """測試系統性能"""
    
    print("\n📊 測試系統性能...")
    
    # CPU 信息
    cpu_count = psutil.cpu_count()
    cpu_percent = psutil.cpu_percent(interval=1)
    
    # 記憶體信息
    memory = psutil.virtual_memory()
    memory_gb = memory.total / (1024**3)
    memory_used_percent = memory.percent
    
    # 磁碟信息
    disk = psutil.disk_usage('.')
    disk_free_gb = disk.free / (1024**3)
    
    performance = {
        'cpu': {
            'cores': cpu_count,
            'usage_percent': cpu_percent
        },
        'memory': {
            'total_gb': round(memory_gb, 1),
            'used_percent': memory_used_percent,
            'available_gb': round(memory.available / (1024**3), 1)
        },
        'disk': {
            'free_gb': round(disk_free_gb, 1)
        }
    }
    
    print(f"🖥️ CPU: {cpu_count} 核心, 使用率 {cpu_percent}%")
    print(f"💾 記憶體: {performance['memory']['total_gb']}GB 總量, {memory_used_percent}% 已使用")
    print(f"💿 磁碟: {performance['disk']['free_gb']}GB 可用空間")
    
    return performance

def test_code_analysis_speed():
    """測試代碼分析速度"""
    
    print("\n⚡ 測試代碼分析速度...")
    
    # 找一些測試檔案
    test_files = []
    for ext in ['*.py', '*.js', '*.ts', '*.tsx', '*.json']:
        test_files.extend(list(Path('.').glob(ext)))
    
    if not test_files:
        print("⚠️ 找不到測試檔案")
        return None
    
    # 選擇前 5 個檔案進行測試
    test_files = test_files[:5]
    
    start_time = time.time()
    
    # 模擬分析過程 (讀取檔案內容)
    analyzed_files = 0
    total_lines = 0
    
    for file_path in test_files:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = len(f.readlines())
                total_lines += lines
                analyzed_files += 1
        except:
            continue
    
    end_time = time.time()
    analysis_time = end_time - start_time
    
    result = {
        'files_analyzed': analyzed_files,
        'total_lines': total_lines,
        'analysis_time': round(analysis_time, 3),
        'files_per_second': round(analyzed_files / analysis_time, 2) if analysis_time > 0 else 0,
        'lines_per_second': round(total_lines / analysis_time, 2) if analysis_time > 0 else 0
    }
    
    print(f"📁 分析了 {analyzed_files} 個檔案")
    print(f"📄 總共 {total_lines} 行代碼")
    print(f"⏱️ 用時 {analysis_time} 秒")
    print(f"🚀 速度: {result['files_per_second']} 檔案/秒, {result['lines_per_second']} 行/秒")
    
    return result

def test_search_capabilities():
    """測試搜索能力"""
    
    print("\n🔍 測試搜索能力...")
    
    # 測試檔案搜索
    search_terms = ['function', 'class', 'import', 'export', 'const']
    search_results = {}
    
    for term in search_terms:
        start_time = time.time()
        
        # 在所有 Python 和 JavaScript 檔案中搜索
        matches = 0
        files_searched = 0
        
        for ext in ['*.py', '*.js', '*.ts', '*.tsx']:
            for file_path in Path('.').glob(ext):
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        if term in content:
                            matches += content.count(term)
                        files_searched += 1
                except:
                    continue
        
        search_time = time.time() - start_time
        
        search_results[term] = {
            'matches': matches,
            'files_searched': files_searched,
            'search_time': round(search_time, 3)
        }
    
    print("🔍 搜索結果:")
    for term, result in search_results.items():
        print(f"   '{term}': {result['matches']} 次匹配, {result['search_time']} 秒")
    
    return search_results

def generate_performance_report():
    """生成性能報告"""
    
    print("\n📋 生成 Augment 效能測試報告...")
    
    # 收集所有測試結果
    db_status = check_databases()
    system_perf = test_system_performance()
    analysis_speed = test_code_analysis_speed()
    search_results = test_search_capabilities()
    
    # 生成報告
    report = {
        'test_timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'database_status': db_status,
        'system_performance': system_perf,
        'code_analysis_speed': analysis_speed,
        'search_capabilities': search_results,
        'summary': {
            'databases_working': sum(1 for db in db_status.values() if '✅' in db.get('status', '')),
            'total_databases': len(db_status),
            'system_health': 'good' if system_perf['memory']['used_percent'] < 80 else 'warning'
        }
    }
    
    # 保存報告
    with open('augment_performance_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("✅ 性能報告已保存到 augment_performance_report.json")
    
    return report

def main():
    """主函數"""
    
    print("🎯 Augment 效能提升實際測試")
    print("=" * 50)
    
    # 生成完整報告
    report = generate_performance_report()
    
    print("\n📊 測試總結:")
    print(f"   數據庫狀態: {report['summary']['databases_working']}/{report['summary']['total_databases']} 正常")
    print(f"   系統健康: {report['summary']['system_health']}")
    
    if report['code_analysis_speed']:
        print(f"   分析速度: {report['code_analysis_speed']['files_per_second']} 檔案/秒")
    
    print(f"\n📁 詳細報告: augment_performance_report.json")

if __name__ == "__main__":
    main()
