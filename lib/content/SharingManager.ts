/**
 * 分享管理器 - 第二階段
 * 實現公開分享、嵌入代碼生成、權限控制、分享統計等功能
 */

export interface ShareSettings {
  id: string;
  activityId: string;
  shareCode: string;
  shareUrl: string;
  embedCode: string;
  isPublic: boolean;
  allowCopy: boolean;
  allowEdit: boolean;
  allowComments: boolean;
  requirePassword: boolean;
  password?: string;
  expiresAt?: Date;
  maxViews?: number;
  currentViews: number;
  allowedDomains?: string[];
  customization: ShareCustomization;
  analytics: ShareAnalytics;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ShareCustomization {
  showBranding: boolean;
  customTitle?: string;
  customDescription?: string;
  customLogo?: string;
  customColors?: {
    primary: string;
    secondary: string;
    background: string;
  };
  hideControls?: string[]; // 隱藏的控制項
  autoStart?: boolean;
  showResults?: boolean;
  allowRestart?: boolean;
}

export interface ShareAnalytics {
  totalViews: number;
  uniqueViews: number;
  completions: number;
  averageScore: number;
  averageTime: number;
  viewsByDate: Record<string, number>;
  viewsByCountry: Record<string, number>;
  viewsByDevice: Record<string, number>;
  referrers: Record<string, number>;
  lastViewedAt?: Date;
}

export interface EmbedOptions {
  width?: string | number;
  height?: string | number;
  responsive?: boolean;
  autoResize?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showBranding?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  customCSS?: string;
}

export interface SocialShareOptions {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email' | 'copy';
  title?: string;
  description?: string;
  hashtags?: string[];
  via?: string; // Twitter only
}

export class SharingManager {
  private static readonly BASE_SHARE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://educreate.app';
  private static readonly EMBED_SCRIPT_URL = `${this.BASE_SHARE_URL}/embed.js`;

  // 創建分享
  static async createShare(
    activityId: string,
    settings: Partial<ShareSettings>,
    userId: string
  ): Promise<ShareSettings> {
    const shareCode = this.generateShareCode();
    const shareUrl = `${this.BASE_SHARE_URL}/play/${shareCode}`;
    
    const shareSettings: ShareSettings = {
      id: this.generateShareId(),
      activityId,
      shareCode,
      shareUrl,
      embedCode: this.generateEmbedCode(shareCode, settings.customization?.showBranding !== false),
      isPublic: settings.isPublic ?? true,
      allowCopy: settings.allowCopy ?? false,
      allowEdit: settings.allowEdit ?? false,
      allowComments: settings.allowComments ?? false,
      requirePassword: settings.requirePassword ?? false,
      password: settings.password,
      expiresAt: settings.expiresAt,
      maxViews: settings.maxViews,
      currentViews: 0,
      allowedDomains: settings.allowedDomains,
      customization: {
        showBranding: true,
        autoStart: false,
        showResults: true,
        allowRestart: true,
        ...settings.customization
      },
      analytics: {
        totalViews: 0,
        uniqueViews: 0,
        completions: 0,
        averageScore: 0,
        averageTime: 0,
        viewsByDate: {},
        viewsByCountry: {},
        viewsByDevice: {},
        referrers: {}
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId
    };

    // 保存到數據庫
    await this.saveShareToDatabase(shareSettings);

    return shareSettings;
  }

  // 更新分享設置
  static async updateShare(
    shareId: string,
    updates: Partial<ShareSettings>
  ): Promise<ShareSettings> {
    const existingShare = await this.getShareById(shareId);
    if (!existingShare) {
      throw new Error('分享不存在');
    }

    const updatedShare: ShareSettings = {
      ...existingShare,
      ...updates,
      updatedAt: new Date()
    };

    // 如果更新了自定義設置，重新生成嵌入代碼
    if (updates.customization) {
      updatedShare.embedCode = this.generateEmbedCode(
        updatedShare.shareCode,
        updatedShare.customization.showBranding
      );
    }

    await this.updateShareInDatabase(updatedShare);
    return updatedShare;
  }

  // 生成嵌入代碼
  static generateEmbedCode(
    shareCode: string,
    showBranding = true,
    options: EmbedOptions = {}
  ): string {
    const {
      width = '100%',
      height = '600px',
      responsive = true,
      autoResize = true,
      showTitle = true,
      showDescription = false,
      theme = 'auto',
      language = 'zh-TW'
    } = options;

    const embedUrl = `${this.BASE_SHARE_URL}/embed/${shareCode}`;
    const params = new URLSearchParams({
      branding: showBranding.toString(),
      title: showTitle.toString(),
      description: showDescription.toString(),
      theme,
      lang: language,
      responsive: responsive.toString(),
      autoResize: autoResize.toString()
    });

    const iframeCode = `<iframe
  src="${embedUrl}?${params.toString()}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allowfullscreen
  ${responsive ? 'style="max-width: 100%;"' : ''}
></iframe>`;

    const scriptCode = responsive ? `
<script>
  (function() {
    var iframe = document.querySelector('iframe[src*="${shareCode}"]');
    if (iframe && ${autoResize}) {
      window.addEventListener('message', function(e) {
        if (e.origin === '${this.BASE_SHARE_URL}' && e.data.type === 'resize') {
          iframe.style.height = e.data.height + 'px';
        }
      });
    }
  })();
</script>` : '';

    return iframeCode + scriptCode;
  }

  // 生成社交分享鏈接
  static generateSocialShareUrl(
    shareUrl: string,
    options: SocialShareOptions
  ): string {
    const { platform, title, description, hashtags, via } = options;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title || '');
    const encodedDescription = encodeURIComponent(description || '');

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

      case 'twitter':
        const twitterParams = new URLSearchParams({
          url: shareUrl,
          text: title || '',
          ...(hashtags && { hashtags: hashtags.join(',') }),
          ...(via && { via })
        });
        return `https://twitter.com/intent/tweet?${twitterParams.toString()}`;

      case 'linkedin':
        const linkedinParams = new URLSearchParams({
          url: shareUrl,
          title: title || '',
          summary: description || ''
        });
        return `https://www.linkedin.com/sharing/share-offsite/?${linkedinParams.toString()}`;

      case 'whatsapp':
        const whatsappText = `${title || ''}\n${shareUrl}`;
        return `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

      case 'email':
        const emailParams = new URLSearchParams({
          subject: title || '',
          body: `${description || ''}\n\n${shareUrl}`
        });
        return `mailto:?${emailParams.toString()}`;

      case 'copy':
        return shareUrl;

      default:
        throw new Error('不支持的社交平台');
    }
  }

  // 記錄分享訪問
  static async recordShareView(
    shareCode: string,
    viewerInfo: {
      ip?: string;
      userAgent?: string;
      referrer?: string;
      country?: string;
    }
  ): Promise<void> {
    const share = await this.getShareByCode(shareCode);
    if (!share) return;

    // 檢查分享是否過期
    if (share.expiresAt && share.expiresAt < new Date()) {
      throw new Error('分享已過期');
    }

    // 檢查訪問次數限制
    if (share.maxViews && share.currentViews >= share.maxViews) {
      throw new Error('分享訪問次數已達上限');
    }

    // 更新統計信息
    const today = new Date().toISOString().split('T')[0];
    const device = this.detectDevice(viewerInfo.userAgent || '');
    
    share.currentViews++;
    share.analytics.totalViews++;
    share.analytics.viewsByDate[today] = (share.analytics.viewsByDate[today] || 0) + 1;
    
    if (viewerInfo.country) {
      share.analytics.viewsByCountry[viewerInfo.country] = 
        (share.analytics.viewsByCountry[viewerInfo.country] || 0) + 1;
    }
    
    share.analytics.viewsByDevice[device] = 
      (share.analytics.viewsByDevice[device] || 0) + 1;
    
    if (viewerInfo.referrer) {
      const domain = this.extractDomain(viewerInfo.referrer);
      share.analytics.referrers[domain] = (share.analytics.referrers[domain] || 0) + 1;
    }
    
    share.analytics.lastViewedAt = new Date();

    await this.updateShareInDatabase(share);
  }

  // 記錄分享完成
  static async recordShareCompletion(
    shareCode: string,
    score: number,
    timeSpent: number
  ): Promise<void> {
    const share = await this.getShareByCode(shareCode);
    if (!share) return;

    share.analytics.completions++;
    
    // 更新平均分數
    const totalScore = share.analytics.averageScore * (share.analytics.completions - 1) + score;
    share.analytics.averageScore = totalScore / share.analytics.completions;
    
    // 更新平均時間
    const totalTime = share.analytics.averageTime * (share.analytics.completions - 1) + timeSpent;
    share.analytics.averageTime = totalTime / share.analytics.completions;

    await this.updateShareInDatabase(share);
  }

  // 獲取分享統計
  static async getShareAnalytics(shareId: string): Promise<ShareAnalytics> {
    const share = await this.getShareById(shareId);
    if (!share) {
      throw new Error('分享不存在');
    }
    return share.analytics;
  }

  // 批量分享
  static async createBulkShare(
    activityIds: string[],
    settings: Partial<ShareSettings>,
    userId: string
  ): Promise<ShareSettings[]> {
    const shares: ShareSettings[] = [];
    
    for (const activityId of activityIds) {
      const share = await this.createShare(activityId, settings, userId);
      shares.push(share);
    }
    
    return shares;
  }

  // 刪除分享
  static async deleteShare(shareId: string): Promise<void> {
    await this.deleteShareFromDatabase(shareId);
  }

  // 檢查分享權限
  static async checkSharePermission(
    shareCode: string,
    action: 'view' | 'copy' | 'edit' | 'comment',
    password?: string
  ): Promise<boolean> {
    const share = await this.getShareByCode(shareCode);
    if (!share) return false;

    // 檢查是否公開
    if (!share.isPublic) return false;

    // 檢查密碼
    if (share.requirePassword && share.password !== password) return false;

    // 檢查過期時間
    if (share.expiresAt && share.expiresAt < new Date()) return false;

    // 檢查具體權限
    switch (action) {
      case 'view':
        return true;
      case 'copy':
        return share.allowCopy;
      case 'edit':
        return share.allowEdit;
      case 'comment':
        return share.allowComments;
      default:
        return false;
    }
  }

  // 工具方法
  private static generateShareCode(): string {
    return Math.random().toString(36).substr(2, 12).toUpperCase();
  }

  private static generateShareId(): string {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static detectDevice(userAgent: string): string {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'mobile';
    } else if (/Tablet/.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'direct';
    }
  }

  // 數據庫操作方法（需要實現）
  private static async saveShareToDatabase(share: ShareSettings): Promise<void> {
    // 實現數據庫保存邏輯
  }

  private static async updateShareInDatabase(share: ShareSettings): Promise<void> {
    // 實現數據庫更新邏輯
  }

  private static async getShareById(shareId: string): Promise<ShareSettings | null> {
    // 實現數據庫查詢邏輯
    return null;
  }

  private static async getShareByCode(shareCode: string): Promise<ShareSettings | null> {
    // 實現數據庫查詢邏輯
    return null;
  }

  private static async deleteShareFromDatabase(shareId: string): Promise<void> {
    // 實現數據庫刪除邏輯
  }
}
