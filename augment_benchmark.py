
import time
import multiprocessing
import json
from pathlib import Path

def cpu_intensive_task(n):
    """CPU 密集型任務"""
    total = 0
    for i in range(n):
        total += i * i
    return total

def memory_intensive_task(n):
    """記憶體密集型任務"""
    data = list(range(100000))
    for _ in range(100):
        sorted_data = sorted(data, reverse=True)
        _ = 50000 in sorted_data
    return len(data)

def benchmark_cpu_performance(workers=30):
    """CPU 性能基準測試"""
    start_time = time.time()
    
    with multiprocessing.Pool(processes=workers) as pool:
        tasks = [1000000] * workers
        results = pool.map(cpu_intensive_task, tasks)
    
    end_time = time.time()
    return {
        'duration': end_time - start_time,
        'workers': workers,
        'total_operations': sum(results)
    }

def benchmark_memory_performance():
    """記憶體性能基準測試"""
    start_time = time.time()
    
    # 並行記憶體操作
    with multiprocessing.Pool(processes=8) as pool:
        results = pool.map(memory_intensive_task, range(8))
    
    end_time = time.time()
    return {
        'duration': end_time - start_time,
        'operations': sum(results)
    }

def run_full_benchmark():
    """運行完整基準測試"""
    print("🚀 開始性能基準測試...")
    
    # CPU 測試
    print("📊 CPU 性能測試...")
    cpu_results = benchmark_cpu_performance()
    print(f"   完成時間: {cpu_results['duration']:.2f}秒")
    print(f"   工作進程: {cpu_results['workers']}")
    
    # 記憶體測試
    print("💾 記憶體性能測試...")
    memory_results = benchmark_memory_performance()
    print(f"   完成時間: {memory_results['duration']:.2f}秒")
    
    # 保存結果
    results = {
        'cpu_benchmark': cpu_results,
        'memory_benchmark': memory_results,
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    with open('benchmark_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("✅ 基準測試完成，結果已保存到 benchmark_results.json")
    return results

if __name__ == "__main__":
    run_full_benchmark()
