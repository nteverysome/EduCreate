/**
 * CompressionManager - ZIP壓縮和數據優化系統
 * 基於 Wordwall 實測數據，實現2.5x壓縮比例的ZIP壓縮
 * 包含數據完整性驗證和哈希校驗機制
 */

import pako from 'pako';
import CryptoJS from 'crypto-js';

export interface CompressionResult {
  compressed: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  hash: string;
  algorithm: 'gzip' | 'deflate' | 'none';
  timestamp: number;
  integrity: boolean;
}

export interface CompressionOptions {
  level?: number; // 壓縮級別 1-9
  algorithm?: 'gzip' | 'deflate' | 'auto';
  enableIntegrityCheck?: boolean;
  enableMetrics?: boolean;
  targetRatio?: number; // 目標壓縮比例 (默認 2.5)
  maxSize?: number; // 最大處理大小 (默認 10MB)
}

export interface CompressionMetrics {
  totalCompressions: number;
  averageRatio: number;
  averageTime: number;
  successRate: number;
  algorithmStats: {
    gzip: { count: number; avgRatio: number };
    deflate: { count: number; avgRatio: number };
  };
}

export class CompressionManager {
  private metrics: CompressionMetrics;
  private readonly options: Required<CompressionOptions>;

  constructor(options: CompressionOptions = {}) {
    this.options = {
      level: options.level || 6, // 平衡壓縮率和速度
      algorithm: options.algorithm || 'auto',
      enableIntegrityCheck: options.enableIntegrityCheck ?? true,
      enableMetrics: options.enableMetrics ?? true,
      targetRatio: options.targetRatio || 2.5,
      maxSize: options.maxSize || 10 * 1024 * 1024 // 10MB
    };

    this.metrics = {
      totalCompressions: 0,
      averageRatio: 0,
      averageTime: 0,
      successRate: 100,
      algorithmStats: {
        gzip: { count: 0, avgRatio: 0 },
        deflate: { count: 0, avgRatio: 0 }
      }
    };
  }

  /**
   * 壓縮數據 - 主要方法
   */
  async compress(data: any): Promise<CompressionResult> {
    const startTime = performance.now();
    
    try {
      // 數據預處理
      const jsonData = JSON.stringify(data);
      const originalSize = new Blob([jsonData]).size;

      // 檢查大小限制
      if (originalSize > this.options.maxSize) {
        throw new Error(`數據大小 ${originalSize} 超過限制 ${this.options.maxSize}`);
      }

      // 選擇最佳壓縮算法
      const algorithm = this.selectOptimalAlgorithm(jsonData);
      
      // 執行壓縮
      const compressed = this.performCompression(jsonData, algorithm);
      const compressedSize = compressed.length;
      const compressionRatio = originalSize / compressedSize;

      // 生成哈希校驗
      const hash = this.generateHash(jsonData);

      // 數據完整性驗證
      const integrity = this.options.enableIntegrityCheck ? 
        await this.verifyIntegrity(jsonData, compressed, algorithm) : true;

      const result: CompressionResult = {
        compressed: this.encodeCompressedData(compressed),
        originalSize,
        compressedSize,
        compressionRatio,
        hash,
        algorithm,
        timestamp: Date.now(),
        integrity
      };

      // 更新指標
      if (this.options.enableMetrics) {
        this.updateMetrics(result, performance.now() - startTime);
      }

      return result;

    } catch (error) {
      console.error('壓縮失敗:', error);
      
      // 降級處理：返回未壓縮數據
      const jsonData = JSON.stringify(data);
      const size = new Blob([jsonData]).size;
      
      return {
        compressed: btoa(jsonData),
        originalSize: size,
        compressedSize: size,
        compressionRatio: 1.0,
        hash: this.generateHash(jsonData),
        algorithm: 'none',
        timestamp: Date.now(),
        integrity: true
      };
    }
  }

  /**
   * 解壓縮數據
   */
  async decompress(compressedData: string, algorithm: 'gzip' | 'deflate' | 'none', hash?: string): Promise<any> {
    try {
      let decompressed: string;

      if (algorithm === 'none') {
        decompressed = atob(compressedData);
      } else {
        const binaryData = this.decodeCompressedData(compressedData);
        decompressed = this.performDecompression(binaryData, algorithm);
      }

      // 驗證數據完整性
      if (hash && this.options.enableIntegrityCheck) {
        const calculatedHash = this.generateHash(decompressed);
        if (calculatedHash !== hash) {
          throw new Error('數據完整性驗證失敗');
        }
      }

      return JSON.parse(decompressed);

    } catch (error) {
      console.error('解壓縮失敗:', error);
      throw new Error(`解壓縮失敗: ${error.message}`);
    }
  }

  /**
   * 選擇最佳壓縮算法
   */
  private selectOptimalAlgorithm(data: string): 'gzip' | 'deflate' {
    if (this.options.algorithm !== 'auto') {
      return this.options.algorithm;
    }

    // 基於數據特徵選擇算法
    const size = data.length;
    const repetitionRate = this.calculateRepetitionRate(data);

    // 小數據或高重複率使用 deflate
    if (size < 1024 || repetitionRate > 0.7) {
      return 'deflate';
    }

    // 大數據或低重複率使用 gzip
    return 'gzip';
  }

  /**
   * 執行壓縮
   */
  private performCompression(data: string, algorithm: 'gzip' | 'deflate'): Uint8Array {
    const input = new TextEncoder().encode(data);
    
    switch (algorithm) {
      case 'gzip':
        return pako.gzip(input, { level: this.options.level });
      case 'deflate':
        return pako.deflate(input, { level: this.options.level });
      default:
        throw new Error(`不支持的壓縮算法: ${algorithm}`);
    }
  }

  /**
   * 執行解壓縮
   */
  private performDecompression(data: Uint8Array, algorithm: 'gzip' | 'deflate'): string {
    let decompressed: Uint8Array;
    
    switch (algorithm) {
      case 'gzip':
        decompressed = pako.ungzip(data);
        break;
      case 'deflate':
        decompressed = pako.inflate(data);
        break;
      default:
        throw new Error(`不支持的解壓縮算法: ${algorithm}`);
    }
    
    return new TextDecoder().decode(decompressed);
  }

  /**
   * 編碼壓縮數據為 Base64
   */
  private encodeCompressedData(data: Uint8Array): string {
    return btoa(String.fromCharCode(...data));
  }

  /**
   * 解碼 Base64 壓縮數據
   */
  private decodeCompressedData(data: string): Uint8Array {
    const binaryString = atob(data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * 生成數據哈希
   */
  private generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * 驗證數據完整性
   */
  private async verifyIntegrity(original: string, compressed: Uint8Array, algorithm: 'gzip' | 'deflate'): Promise<boolean> {
    try {
      const decompressed = this.performDecompression(compressed, algorithm);
      return original === decompressed;
    } catch {
      return false;
    }
  }

  /**
   * 計算重複率
   */
  private calculateRepetitionRate(data: string): number {
    const chars = new Set(data);
    return 1 - (chars.size / data.length);
  }

  /**
   * 更新壓縮指標
   */
  private updateMetrics(result: CompressionResult, processingTime: number): void {
    this.metrics.totalCompressions++;
    
    // 更新平均壓縮比
    const totalRatio = this.metrics.averageRatio * (this.metrics.totalCompressions - 1) + result.compressionRatio;
    this.metrics.averageRatio = totalRatio / this.metrics.totalCompressions;
    
    // 更新平均處理時間
    const totalTime = this.metrics.averageTime * (this.metrics.totalCompressions - 1) + processingTime;
    this.metrics.averageTime = totalTime / this.metrics.totalCompressions;
    
    // 更新算法統計
    const algoStats = this.metrics.algorithmStats[result.algorithm];
    if (algoStats) {
      algoStats.count++;
      const totalAlgoRatio = algoStats.avgRatio * (algoStats.count - 1) + result.compressionRatio;
      algoStats.avgRatio = totalAlgoRatio / algoStats.count;
    }
    
    // 更新成功率
    this.metrics.successRate = result.integrity ? 
      ((this.metrics.successRate * (this.metrics.totalCompressions - 1)) + 100) / this.metrics.totalCompressions :
      ((this.metrics.successRate * (this.metrics.totalCompressions - 1)) + 0) / this.metrics.totalCompressions;
  }

  /**
   * 獲取壓縮指標
   */
  getMetrics(): CompressionMetrics {
    return { ...this.metrics };
  }

  /**
   * 重置指標
   */
  resetMetrics(): void {
    this.metrics = {
      totalCompressions: 0,
      averageRatio: 0,
      averageTime: 0,
      successRate: 100,
      algorithmStats: {
        gzip: { count: 0, avgRatio: 0 },
        deflate: { count: 0, avgRatio: 0 }
      }
    };
  }

  /**
   * 檢查是否達到目標壓縮比例
   */
  isTargetRatioMet(): boolean {
    return this.metrics.averageRatio >= this.options.targetRatio;
  }
}
