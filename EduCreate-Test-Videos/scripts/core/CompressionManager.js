// scripts/core/CompressionManager.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CompressionManager {
  constructor() {
    this.compressionSettings = {
      // 高質量設置 (用於重要測試和失敗分析)
      high: {
        videoCodec: 'libvpx-vp9',
        videoBitrate: '1.5M',
        audioCodec: 'libopus',
        audioBitrate: '128k',
        resolution: '1920x1080',
        frameRate: 30,
        quality: 'high',
        expectedSize: '8-12MB/min'
      },
      // 標準設置 (日常測試)
      standard: {
        videoCodec: 'libvpx-vp9',
        videoBitrate: '1M',
        audioCodec: 'libopus',
        audioBitrate: '96k',
        resolution: '1280x720',
        frameRate: 30,
        quality: 'standard',
        expectedSize: '4-6MB/min'
      },
      // 歸檔設置 (歷史歸檔)
      archive: {
        videoCodec: 'libvpx-vp9',
        videoBitrate: '600k',
        audioCodec: 'libopus',
        audioBitrate: '64k',
        resolution: '1280x720',
        frameRate: 24,
        quality: 'archive',
        expectedSize: '2-3MB/min'
      }
    };
  }

  // 壓縮單個影片
  async compressVideo(inputPath, outputPath, quality = 'standard') {
    const settings = this.compressionSettings[quality];
    
    if (!fs.existsSync(inputPath)) {
      throw new Error(`輸入文件不存在: ${inputPath}`);
    }

    // 確保輸出目錄存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 獲取原始文件大小
    const originalSize = fs.statSync(inputPath).size;

    // 構建 FFmpeg 命令
    const ffmpegCommand = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-c:v', settings.videoCodec,
      '-b:v', settings.videoBitrate,
      '-c:a', settings.audioCodec,
      '-b:a', settings.audioBitrate,
      '-vf', `scale=${settings.resolution}`,
      '-r', settings.frameRate,
      '-y', // 覆蓋輸出文件
      `"${outputPath}"`
    ].join(' ');

    try {
      const originalSizeMB = (originalSize / (1024 * 1024)).toFixed(2);

      console.log(`🎬 開始壓縮影片: ${path.basename(inputPath)}`);
      console.log(`   原始大小: ${originalSizeMB} MB`);
      console.log(`   質量設置: ${quality} (${settings.expectedSize})`);
      console.log(`   目標解析度: ${settings.resolution}`);

      // 檢查文件是否已經很小，不需要壓縮
      if (originalSize < 1024 * 1024) { // 小於 1MB
        console.log(`⚡ 文件已經很小，直接複製而不壓縮`);

        // 直接複製文件
        fs.copyFileSync(inputPath, outputPath);

        const result = {
          inputPath,
          outputPath,
          originalSize,
          compressedSize: originalSize,
          originalSizeMB: parseFloat(originalSizeMB),
          compressedSizeMB: parseFloat(originalSizeMB),
          compressionRatio: 0, // 沒有壓縮
          spaceSavedMB: 0,
          compressionTime: 0,
          quality: 'skipped',
          settings: { ...settings, note: 'File too small, copied directly' },
          timestamp: new Date().toISOString()
        };

        console.log(`✅ 文件複製完成: ${path.basename(outputPath)}`);
        console.log(`   大小: ${originalSizeMB} MB (未壓縮)`);

        // 更新壓縮統計
        await this.updateCompressionStats(result);
        return result;
      }

      // 執行壓縮
      const startTime = Date.now();
      execSync(ffmpegCommand, { stdio: 'pipe' });
      const compressionTime = ((Date.now() - startTime) / 1000).toFixed(1);

      // 獲取壓縮後文件大小
      const compressedSize = fs.statSync(outputPath).size;
      const compressedSizeMB = (compressedSize / (1024 * 1024)).toFixed(2);

      // 檢查壓縮是否有效（如果壓縮後更大，使用原始文件）
      let finalSize, finalPath, compressionRatio, spaceSaved, actualQuality;

      if (compressedSize >= originalSize) {
        console.log(`⚠️ 壓縮後文件更大 (${compressedSizeMB} MB >= ${originalSizeMB} MB)，使用原始文件`);

        // 刪除壓縮後的大文件
        fs.unlinkSync(outputPath);

        // 複製原始文件
        fs.copyFileSync(inputPath, outputPath);

        finalSize = originalSize;
        finalPath = outputPath;
        compressionRatio = 0;
        spaceSaved = 0;
        actualQuality = 'original';
      } else {
        finalSize = compressedSize;
        finalPath = outputPath;
        compressionRatio = parseFloat(((originalSize - compressedSize) / originalSize * 100).toFixed(1));
        spaceSaved = parseFloat(((originalSize - compressedSize) / (1024 * 1024)).toFixed(2));
        actualQuality = quality;
      }

      const result = {
        inputPath,
        outputPath: finalPath,
        originalSize,
        compressedSize: finalSize,
        originalSizeMB: parseFloat(originalSizeMB),
        compressedSizeMB: parseFloat((finalSize / (1024 * 1024)).toFixed(2)),
        compressionRatio,
        spaceSavedMB: spaceSaved,
        compressionTime: parseFloat(compressionTime),
        quality: actualQuality,
        settings,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ 壓縮完成: ${path.basename(outputPath)}`);
      console.log(`   壓縮後: ${(finalSize / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`   壓縮率: ${compressionRatio}%`);
      console.log(`   節省空間: ${spaceSaved} MB`);
      console.log(`   耗時: ${compressionTime} 秒`);

      // 更新壓縮統計
      await this.updateCompressionStats(result);

      return result;

    } catch (error) {
      console.error(`❌ 壓縮失敗: ${path.basename(inputPath)}`, error.message);
      throw error;
    }
  }

  // 批量壓縮影片
  async compressVideosInDirectory(inputDir, outputDir, quality = 'standard') {
    if (!fs.existsSync(inputDir)) {
      throw new Error(`輸入目錄不存在: ${inputDir}`);
    }

    const videoFiles = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.webm'))
      .map(file => path.join(inputDir, file));

    const results = [];

    for (const inputPath of videoFiles) {
      const fileName = path.basename(inputPath);
      const outputPath = path.join(outputDir, fileName);

      try {
        const result = await this.compressVideo(inputPath, outputPath, quality);
        results.push(result);
      } catch (error) {
        console.error(`跳過文件 ${fileName}: ${error.message}`);
        results.push({
          inputPath,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  // 智能壓縮 (根據文件大小和重要性選擇質量)
  async smartCompress(inputPath, outputPath, metadata) {
    let quality = 'standard';

    // 根據測試結果選擇質量
    if (metadata.result === 'failure') {
      quality = 'high'; // 失敗測試需要高質量以便分析
    } else if (metadata.module === 'games' && metadata.result === 'success') {
      quality = 'standard'; // 遊戲成功測試使用標準質量
    } else if (metadata.module === 'system') {
      quality = 'low'; // 系統測試可以使用低質量
    }

    // 根據文件大小調整
    const fileSize = fs.statSync(inputPath).size;
    const fileSizeMB = fileSize / (1024 * 1024);

    if (fileSizeMB > 50) {
      quality = 'low'; // 大文件強制使用低質量
    } else if (fileSizeMB < 5) {
      quality = 'high'; // 小文件可以使用高質量
    }

    console.log(`🧠 智能壓縮選擇質量: ${quality} (文件大小: ${fileSizeMB.toFixed(1)}MB, 結果: ${metadata.result})`);

    return await this.compressVideo(inputPath, outputPath, quality);
  }

  // 更新壓縮統計
  async updateCompressionStats(result) {
    const statsPath = 'EduCreate-Test-Videos/metadata/compression-stats.json';
    
    let stats = { compressions: [], totalStats: {} };
    if (fs.existsSync(statsPath)) {
      stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    }

    // 添加新的壓縮記錄
    stats.compressions.push(result);

    // 計算總體統計
    const validCompressions = stats.compressions.filter(c => !c.error);
    const totalOriginalSize = validCompressions.reduce((sum, c) => sum + c.originalSize, 0);
    const totalCompressedSize = validCompressions.reduce((sum, c) => sum + c.compressedSize, 0);
    const averageCompressionRatio = validCompressions.reduce((sum, c) => sum + c.compressionRatio, 0) / validCompressions.length;

    stats.totalStats = {
      totalCompressions: validCompressions.length,
      totalOriginalSize,
      totalCompressedSize,
      totalSpaceSaved: totalOriginalSize - totalCompressedSize,
      averageCompressionRatio: parseFloat(averageCompressionRatio.toFixed(1)),
      lastUpdated: new Date().toISOString()
    };

    // 保存統計
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // 獲取壓縮統計
  getCompressionStats() {
    const statsPath = 'EduCreate-Test-Videos/metadata/compression-stats.json';
    
    if (fs.existsSync(statsPath)) {
      return JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    }
    
    return { compressions: [], totalStats: {} };
  }

  // 清理壓縮緩存
  cleanupCompressionCache() {
    const tempDir = 'EduCreate-Test-Videos/temp';
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('✅ 壓縮緩存已清理');
    }
  }
}

module.exports = CompressionManager;
