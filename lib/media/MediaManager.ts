/**
 * MediaManager - 多媒體支持系統
 * 實現圖片、音頻、視頻、動畫的完整多媒體支持，包含拖拽上傳和批量處理功能
 */

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'animation';
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // 音頻/視頻時長（秒）
  dimensions?: { width: number; height: number };
  uploadedAt: number;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    altText?: string; // 無障礙替代文本
  };
}

export interface MediaUploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface MediaUploadOptions {
  maxFileSize?: number; // 最大文件大小（字節）
  allowedTypes?: string[]; // 允許的 MIME 類型
  enableThumbnails?: boolean; // 是否生成縮略圖
  enableCompression?: boolean; // 是否啟用壓縮
  quality?: number; // 壓縮質量 (0-1)
}

export interface MediaLibraryFilter {
  type?: 'image' | 'audio' | 'video' | 'animation';
  searchQuery?: string;
  tags?: string[];
  dateRange?: { start: Date; end: Date };
  sizeRange?: { min: number; max: number };
}

export class MediaManager {
  private mediaFiles: Map<string, MediaFile> = new Map();
  private uploadProgress: Map<string, MediaUploadProgress> = new Map();
  private progressListeners: Set<(progress: MediaUploadProgress[]) => void> = new Set();
  private libraryListeners: Set<(files: MediaFile[]) => void> = new Set();

  // 支持的文件類型
  private readonly supportedTypes = {
    image: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'image/svg+xml', 'image/bmp', 'image/tiff'
    ],
    audio: [
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a',
      'audio/flac', 'audio/webm'
    ],
    video: [
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
      'video/wmv', 'video/flv', 'video/mkv'
    ],
    animation: [
      'image/gif', 'video/mp4', 'video/webm', 'application/json' // Lottie
    ]
  };

  private readonly defaultOptions: MediaUploadOptions = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: Object.values(this.supportedTypes).flat(),
    enableThumbnails: true,
    enableCompression: true,
    quality: 0.8
  };

  constructor(private options: MediaUploadOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
    this.loadMediaLibrary();
  }

  /**
   * 上傳單個文件
   */
  async uploadFile(file: File, metadata?: MediaFile['metadata']): Promise<string> {
    // 驗證文件
    this.validateFile(file);

    const fileId = this.generateId();
    const mediaType = this.getMediaType(file.type);

    // 創建上傳進度記錄
    const progress: MediaUploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'pending'
    };

    this.uploadProgress.set(fileId, progress);
    this.notifyProgressListeners();

    try {
      // 開始上傳
      progress.status = 'uploading';
      this.notifyProgressListeners();

      const uploadedUrl = await this.performUpload(file, fileId, (progressValue) => {
        progress.progress = progressValue;
        this.notifyProgressListeners();
      });

      // 處理文件
      progress.status = 'processing';
      progress.progress = 90;
      this.notifyProgressListeners();

      const processedFile = await this.processFile(file, uploadedUrl, mediaType, metadata);

      // 完成
      progress.status = 'complete';
      progress.progress = 100;
      this.notifyProgressListeners();

      // 添加到媒體庫
      this.mediaFiles.set(fileId, processedFile);
      this.saveMediaLibrary();
      this.notifyLibraryListeners();

      // 清理進度記錄
      setTimeout(() => {
        this.uploadProgress.delete(fileId);
        this.notifyProgressListeners();
      }, 3000);

      return fileId;

    } catch (error) {
      progress.status = 'error';
      progress.error = (error as Error).message;
      this.notifyProgressListeners();
      throw error;
    }
  }

  /**
   * 批量上傳文件
   */
  async uploadFiles(files: FileList | File[], metadata?: MediaFile['metadata']): Promise<string[]> {
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(file => this.uploadFile(file, metadata));
    
    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('批量上傳失敗:', error);
      throw error;
    }
  }

  /**
   * 驗證文件
   */
  private validateFile(file: File): void {
    // 檢查文件大小
    if (file.size > this.options.maxFileSize!) {
      throw new Error(`文件大小超過限制 (${this.formatFileSize(this.options.maxFileSize!)})`);
    }

    // 檢查文件類型
    if (!this.options.allowedTypes!.includes(file.type)) {
      throw new Error(`不支持的文件類型: ${file.type}`);
    }

    // 檢查文件名
    if (!file.name || file.name.length > 255) {
      throw new Error('文件名無效或過長');
    }
  }

  /**
   * 獲取媒體類型
   */
  private getMediaType(mimeType: string): MediaFile['type'] {
    if (this.supportedTypes.image.includes(mimeType)) return 'image';
    if (this.supportedTypes.audio.includes(mimeType)) return 'audio';
    if (this.supportedTypes.video.includes(mimeType)) return 'video';
    if (this.supportedTypes.animation.includes(mimeType)) return 'animation';
    throw new Error(`未知的媒體類型: ${mimeType}`);
  }

  /**
   * 執行文件上傳
   */
  private async performUpload(
    file: File, 
    fileId: string, 
    onProgress: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileId', fileId);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 80); // 上傳佔80%
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } catch (error) {
            reject(new Error('上傳響應解析失敗'));
          }
        } else {
          reject(new Error(`上傳失敗: HTTP ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('網絡錯誤'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('上傳超時'));
      });

      xhr.timeout = 300000; // 5分鐘超時
      xhr.open('POST', '/api/media/upload');
      xhr.send(formData);
    });
  }

  /**
   * 處理上傳的文件
   */
  private async processFile(
    file: File,
    url: string,
    type: MediaFile['type'],
    metadata?: MediaFile['metadata']
  ): Promise<MediaFile> {
    const mediaFile: MediaFile = {
      id: this.generateId(),
      name: file.name,
      type,
      mimeType: file.type,
      size: file.size,
      url,
      uploadedAt: Date.now(),
      metadata: metadata || {}
    };

    // 根據類型處理特定信息
    switch (type) {
      case 'image':
        mediaFile.dimensions = await this.getImageDimensions(file);
        if (this.options.enableThumbnails) {
          mediaFile.thumbnailUrl = await this.generateThumbnail(file);
        }
        break;

      case 'audio':
      case 'video':
        mediaFile.duration = await this.getMediaDuration(file);
        if (type === 'video' && this.options.enableThumbnails) {
          mediaFile.thumbnailUrl = await this.generateVideoThumbnail(file);
        }
        break;

      case 'animation':
        if (file.type === 'image/gif') {
          mediaFile.dimensions = await this.getImageDimensions(file);
        }
        break;
    }

    return mediaFile;
  }

  /**
   * 獲取圖片尺寸
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('無法讀取圖片尺寸'));
      };

      img.src = url;
    });
  }

  /**
   * 獲取媒體時長
   */
  private async getMediaDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const media = file.type.startsWith('audio/') ? new Audio() : document.createElement('video');
      const url = URL.createObjectURL(file);

      media.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(media.duration);
      });

      media.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('無法讀取媒體時長'));
      });

      media.src = url;
    });
  }

  /**
   * 生成縮略圖
   */
  private async generateThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // 設置縮略圖尺寸
        const maxSize = 200;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // 繪製縮略圖
        ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 轉換為 Data URL
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('縮略圖生成失敗'));
      };

      img.src = url;
    });
  }

  /**
   * 生成視頻縮略圖
   */
  private async generateVideoThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const url = URL.createObjectURL(file);

      video.addEventListener('loadeddata', () => {
        video.currentTime = Math.min(1, video.duration / 2); // 取中間幀
      });

      video.addEventListener('seeked', () => {
        URL.revokeObjectURL(url);

        // 設置縮略圖尺寸
        const maxSize = 200;
        const ratio = Math.min(maxSize / video.videoWidth, maxSize / video.videoHeight);
        canvas.width = video.videoWidth * ratio;
        canvas.height = video.videoHeight * ratio;

        // 繪製縮略圖
        ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 轉換為 Data URL
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      });

      video.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('視頻縮略圖生成失敗'));
      });

      video.src = url;
      video.load();
    });
  }

  /**
   * 搜索媒體文件
   */
  searchMedia(filter: MediaLibraryFilter = {}): MediaFile[] {
    let files = Array.from(this.mediaFiles.values());

    // 按類型過濾
    if (filter.type) {
      files = files.filter(file => file.type === filter.type);
    }

    // 按搜索查詢過濾
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      files = files.filter(file => 
        file.name.toLowerCase().includes(query) ||
        file.metadata?.title?.toLowerCase().includes(query) ||
        file.metadata?.description?.toLowerCase().includes(query) ||
        file.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 按標籤過濾
    if (filter.tags && filter.tags.length > 0) {
      files = files.filter(file => 
        filter.tags!.some(tag => file.metadata?.tags?.includes(tag))
      );
    }

    // 按日期範圍過濾
    if (filter.dateRange) {
      const { start, end } = filter.dateRange;
      files = files.filter(file => 
        file.uploadedAt >= start.getTime() && file.uploadedAt <= end.getTime()
      );
    }

    // 按大小範圍過濾
    if (filter.sizeRange) {
      const { min, max } = filter.sizeRange;
      files = files.filter(file => file.size >= min && file.size <= max);
    }

    // 按上傳時間排序（最新的在前）
    return files.sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  /**
   * 獲取媒體文件
   */
  getMediaFile(id: string): MediaFile | undefined {
    return this.mediaFiles.get(id);
  }

  /**
   * 刪除媒體文件
   */
  async deleteMediaFile(id: string): Promise<void> {
    const file = this.mediaFiles.get(id);
    if (!file) {
      throw new Error('文件不存在');
    }

    try {
      // 從服務器刪除文件
      await fetch(`/api/media/${id}`, { method: 'DELETE' });

      // 從本地移除
      this.mediaFiles.delete(id);
      this.saveMediaLibrary();
      this.notifyLibraryListeners();

    } catch (error) {
      throw new Error('刪除文件失敗');
    }
  }

  /**
   * 更新媒體文件元數據
   */
  updateMediaMetadata(id: string, metadata: MediaFile['metadata']): void {
    const file = this.mediaFiles.get(id);
    if (!file) {
      throw new Error('文件不存在');
    }

    file.metadata = { ...file.metadata, ...metadata };
    this.saveMediaLibrary();
    this.notifyLibraryListeners();
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 格式化時長
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 通知進度監聽器
   */
  private notifyProgressListeners(): void {
    const progress = Array.from(this.uploadProgress.values());
    this.progressListeners.forEach(listener => listener(progress));
  }

  /**
   * 通知媒體庫監聽器
   */
  private notifyLibraryListeners(): void {
    const files = Array.from(this.mediaFiles.values());
    this.libraryListeners.forEach(listener => listener(files));
  }

  /**
   * 保存媒體庫到本地存儲
   */
  private saveMediaLibrary(): void {
    try {
      const data = Array.from(this.mediaFiles.entries());
      localStorage.setItem('media_library', JSON.stringify(data));
    } catch (error) {
      console.error('保存媒體庫失敗:', error);
    }
  }

  /**
   * 從本地存儲載入媒體庫
   */
  private loadMediaLibrary(): void {
    try {
      // 檢查是否在瀏覽器環境中
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.log('📚 服務器端渲染，跳過媒體庫載入');
        return;
      }

      const saved = localStorage.getItem('media_library');
      if (saved) {
        const data = JSON.parse(saved);
        this.mediaFiles = new Map(data);
        console.log(`📚 載入媒體庫: ${this.mediaFiles.size} 個文件`);
      }
    } catch (error) {
      console.error('載入媒體庫失敗:', error);
    }
  }

  /**
   * 添加進度監聽器
   */
  addProgressListener(listener: (progress: MediaUploadProgress[]) => void): void {
    this.progressListeners.add(listener);
  }

  /**
   * 移除進度監聽器
   */
  removeProgressListener(listener: (progress: MediaUploadProgress[]) => void): void {
    this.progressListeners.delete(listener);
  }

  /**
   * 添加媒體庫監聽器
   */
  addLibraryListener(listener: (files: MediaFile[]) => void): void {
    this.libraryListeners.add(listener);
  }

  /**
   * 移除媒體庫監聽器
   */
  removeLibraryListener(listener: (files: MediaFile[]) => void): void {
    this.libraryListeners.delete(listener);
  }

  /**
   * 獲取所有媒體文件
   */
  getAllMediaFiles(): MediaFile[] {
    return Array.from(this.mediaFiles.values()).sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  /**
   * 獲取上傳進度
   */
  getUploadProgress(): MediaUploadProgress[] {
    return Array.from(this.uploadProgress.values());
  }

  /**
   * 清理資源
   */
  destroy(): void {
    this.progressListeners.clear();
    this.libraryListeners.clear();
    this.uploadProgress.clear();
  }
}
