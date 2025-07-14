/**
 * 檔案夾分享和協作管理器
 * 實現三層分享模式的檔案夾協作權限系統
 */

export interface CollaborationPermission {
  userId: string;
  userName: string;
  userEmail: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
  isActive: boolean;
}

export interface ShareSettings {
  shareType: 'private' | 'class' | 'public';
  shareUrl: string;
  shortUrl?: string;
  isPasswordProtected: boolean;
  password?: string;
  expiresAt?: Date;
  allowDownload: boolean;
  allowCopy: boolean;
  allowPrint: boolean;
  requireSignIn: boolean;
  trackAccess: boolean;
  maxAccessCount?: number;
  currentAccessCount: number;
}

export interface CollaborationActivity {
  id: string;
  folderId: string;
  userId: string;
  userName: string;
  action: 'view' | 'edit' | 'comment' | 'share' | 'download' | 'copy';
  details: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface FolderCollaboration {
  folderId: string;
  folderName: string;
  ownerId: string;
  ownerName: string;
  permissions: CollaborationPermission[];
  shareSettings: ShareSettings;
  activities: CollaborationActivity[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CollaborationInvitation {
  id: string;
  folderId: string;
  folderName: string;
  inviterName: string;
  inviteeEmail: string;
  role: 'editor' | 'viewer' | 'commenter';
  message?: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  acceptedAt?: Date;
}

export interface CollaborationStats {
  totalCollaborations: number;
  activeCollaborations: number;
  totalCollaborators: number;
  totalShares: number;
  publicShares: number;
  classShares: number;
  privateShares: number;
  totalViews: number;
  totalDownloads: number;
  averageCollaboratorsPerFolder: number;
  mostActiveFolder: {
    folderId: string;
    folderName: string;
    activityCount: number;
  };
  recentActivities: CollaborationActivity[];
}

export interface FolderCollaborationManager {
  // 分享管理
  createShare(folderId: string, shareSettings: Partial<ShareSettings>): Promise<ShareSettings>;
  updateShareSettings(folderId: string, settings: Partial<ShareSettings>): Promise<ShareSettings>;
  deleteShare(folderId: string): Promise<boolean>;
  getShareSettings(folderId: string): Promise<ShareSettings | null>;
  generateShareUrl(folderId: string, shareType: ShareSettings['shareType']): Promise<string>;
  
  // 權限管理
  addCollaborator(folderId: string, permission: Omit<CollaborationPermission, 'grantedAt' | 'isActive'>): Promise<CollaborationPermission>;
  updateCollaboratorRole(folderId: string, userId: string, role: CollaborationPermission['role']): Promise<CollaborationPermission>;
  removeCollaborator(folderId: string, userId: string): Promise<boolean>;
  getCollaborators(folderId: string): Promise<CollaborationPermission[]>;
  checkPermission(folderId: string, userId: string, action: string): Promise<boolean>;
  
  // 邀請管理
  sendInvitation(invitation: Omit<CollaborationInvitation, 'id' | 'invitedAt' | 'status'>): Promise<CollaborationInvitation>;
  acceptInvitation(invitationId: string, userId: string): Promise<CollaborationPermission>;
  declineInvitation(invitationId: string): Promise<boolean>;
  getInvitations(userId: string): Promise<CollaborationInvitation[]>;
  getPendingInvitations(folderId: string): Promise<CollaborationInvitation[]>;
  
  // 活動追蹤
  logActivity(activity: Omit<CollaborationActivity, 'id' | 'timestamp'>): Promise<CollaborationActivity>;
  getActivities(folderId: string, limit?: number): Promise<CollaborationActivity[]>;
  getUserActivities(userId: string, limit?: number): Promise<CollaborationActivity[]>;
  
  // 統計分析
  getCollaborationStats(userId: string): Promise<CollaborationStats>;
  getFolderStats(folderId: string): Promise<{
    totalCollaborators: number;
    totalViews: number;
    totalEdits: number;
    recentActivities: CollaborationActivity[];
  }>;
  
  // 批量操作
  bulkUpdatePermissions(folderId: string, updates: Array<{userId: string; role: CollaborationPermission['role']}>): Promise<CollaborationPermission[]>;
  bulkRemoveCollaborators(folderId: string, userIds: string[]): Promise<boolean>;
  
  // 安全和合規
  validateShareSettings(settings: ShareSettings): Promise<{isValid: boolean; errors: string[]}>;
  auditCollaborationAccess(folderId: string): Promise<{
    suspiciousActivities: CollaborationActivity[];
    securityRecommendations: string[];
  }>;
  
  // 通知系統
  notifyCollaborators(folderId: string, message: string, excludeUserIds?: string[]): Promise<boolean>;
  sendShareNotification(shareUrl: string, recipientEmails: string[], message?: string): Promise<boolean>;
}

export class FolderCollaborationManagerImpl implements FolderCollaborationManager {
  private collaborations: Map<string, FolderCollaboration> = new Map();
  private invitations: Map<string, CollaborationInvitation> = new Map();

  async createShare(folderId: string, shareSettings: Partial<ShareSettings>): Promise<ShareSettings> {
    const defaultSettings: ShareSettings = {
      shareType: 'private',
      shareUrl: await this.generateShareUrl(folderId, shareSettings.shareType || 'private'),
      isPasswordProtected: false,
      allowDownload: true,
      allowCopy: true,
      allowPrint: true,
      requireSignIn: false,
      trackAccess: true,
      currentAccessCount: 0
    };

    const finalSettings = { ...defaultSettings, ...shareSettings };
    
    // 更新或創建協作記錄
    const collaboration = this.collaborations.get(folderId) || {
      folderId,
      folderName: `Folder ${folderId}`,
      ownerId: 'current-user',
      ownerName: 'Current User',
      permissions: [],
      shareSettings: finalSettings,
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    collaboration.shareSettings = finalSettings;
    collaboration.updatedAt = new Date();
    this.collaborations.set(folderId, collaboration);

    // 記錄活動
    await this.logActivity({
      folderId,
      userId: 'current-user',
      userName: 'Current User',
      action: 'share',
      details: `Created ${finalSettings.shareType} share`
    });

    return finalSettings;
  }

  async updateShareSettings(folderId: string, settings: Partial<ShareSettings>): Promise<ShareSettings> {
    const collaboration = this.collaborations.get(folderId);
    if (!collaboration) {
      throw new Error('Folder collaboration not found');
    }

    collaboration.shareSettings = { ...collaboration.shareSettings, ...settings };
    collaboration.updatedAt = new Date();

    await this.logActivity({
      folderId,
      userId: 'current-user',
      userName: 'Current User',
      action: 'edit',
      details: 'Updated share settings'
    });

    return collaboration.shareSettings;
  }

  async deleteShare(folderId: string): Promise<boolean> {
    const collaboration = this.collaborations.get(folderId);
    if (!collaboration) {
      return false;
    }

    collaboration.shareSettings.shareType = 'private';
    collaboration.updatedAt = new Date();

    await this.logActivity({
      folderId,
      userId: 'current-user',
      userName: 'Current User',
      action: 'edit',
      details: 'Deleted share'
    });

    return true;
  }

  async getShareSettings(folderId: string): Promise<ShareSettings | null> {
    const collaboration = this.collaborations.get(folderId);
    return collaboration?.shareSettings || null;
  }

  async generateShareUrl(folderId: string, shareType: ShareSettings['shareType']): Promise<string> {
    const baseUrl = 'https://educreate.app';
    const shareId = Math.random().toString(36).substring(2, 15);
    
    switch (shareType) {
      case 'public':
        return `${baseUrl}/public/${shareId}`;
      case 'class':
        return `${baseUrl}/class/${shareId}`;
      case 'private':
      default:
        return `${baseUrl}/shared/${shareId}`;
    }
  }

  async addCollaborator(folderId: string, permission: Omit<CollaborationPermission, 'grantedAt' | 'isActive'>): Promise<CollaborationPermission> {
    const collaboration = this.collaborations.get(folderId);
    if (!collaboration) {
      throw new Error('Folder collaboration not found');
    }

    const newPermission: CollaborationPermission = {
      ...permission,
      grantedAt: new Date(),
      isActive: true
    };

    // 檢查是否已存在
    const existingIndex = collaboration.permissions.findIndex(p => p.userId === permission.userId);
    if (existingIndex >= 0) {
      collaboration.permissions[existingIndex] = newPermission;
    } else {
      collaboration.permissions.push(newPermission);
    }

    collaboration.updatedAt = new Date();

    await this.logActivity({
      folderId,
      userId: 'current-user',
      userName: 'Current User',
      action: 'share',
      details: `Added ${permission.userName} as ${permission.role}`
    });

    return newPermission;
  }

  async updateCollaboratorRole(folderId: string, userId: string, role: CollaborationPermission['role']): Promise<CollaborationPermission> {
    const collaboration = this.collaborations.get(folderId);
    if (!collaboration) {
      throw new Error('Folder collaboration not found');
    }

    const permission = collaboration.permissions.find(p => p.userId === userId);
    if (!permission) {
      throw new Error('Collaborator not found');
    }

    const oldRole = permission.role;
    permission.role = role;
    collaboration.updatedAt = new Date();

    await this.logActivity({
      folderId,
      userId: 'current-user',
      userName: 'Current User',
      action: 'edit',
      details: `Changed ${permission.userName} role from ${oldRole} to ${role}`
    });

    return permission;
  }

  async removeCollaborator(folderId: string, userId: string): Promise<boolean> {
    const collaboration = this.collaborations.get(folderId);
    if (!collaboration) {
      return false;
    }

    const permissionIndex = collaboration.permissions.findIndex(p => p.userId === userId);
    if (permissionIndex === -1) {
      return false;
    }

    const permission = collaboration.permissions[permissionIndex];
    collaboration.permissions.splice(permissionIndex, 1);
    collaboration.updatedAt = new Date();

    await this.logActivity({
      folderId,
      userId: 'current-user',
      userName: 'Current User',
      action: 'edit',
      details: `Removed ${permission.userName} from collaboration`
    });

    return true;
  }

  async getCollaborators(folderId: string): Promise<CollaborationPermission[]> {
    const collaboration = this.collaborations.get(folderId);
    return collaboration?.permissions || [];
  }

  async checkPermission(folderId: string, userId: string, action: string): Promise<boolean> {
    const collaboration = this.collaborations.get(folderId);
    if (!collaboration) {
      return false;
    }

    // 檢查是否為擁有者
    if (collaboration.ownerId === userId) {
      return true;
    }

    const permission = collaboration.permissions.find(p => p.userId === userId && p.isActive);
    if (!permission) {
      return false;
    }

    // 檢查權限是否過期
    if (permission.expiresAt && permission.expiresAt < new Date()) {
      return false;
    }

    // 根據角色檢查權限
    switch (permission.role) {
      case 'owner':
        return true;
      case 'editor':
        return ['view', 'edit', 'comment', 'download'].includes(action);
      case 'commenter':
        return ['view', 'comment', 'download'].includes(action);
      case 'viewer':
        return ['view', 'download'].includes(action);
      default:
        return false;
    }
  }

  async sendInvitation(invitation: Omit<CollaborationInvitation, 'id' | 'invitedAt' | 'status'>): Promise<CollaborationInvitation> {
    const newInvitation: CollaborationInvitation = {
      ...invitation,
      id: Math.random().toString(36).substring(2, 15),
      invitedAt: new Date(),
      status: 'pending'
    };

    this.invitations.set(newInvitation.id, newInvitation);

    await this.logActivity({
      folderId: invitation.folderId,
      userId: 'current-user',
      userName: 'Current User',
      action: 'share',
      details: `Sent invitation to ${invitation.inviteeEmail}`
    });

    return newInvitation;
  }

  async acceptInvitation(invitationId: string, userId: string): Promise<CollaborationPermission> {
    const invitation = this.invitations.get(invitationId);
    if (!invitation || invitation.status !== 'pending') {
      throw new Error('Invalid or expired invitation');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      throw new Error('Invitation has expired');
    }

    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();

    // 添加協作者
    const permission = await this.addCollaborator(invitation.folderId, {
      userId,
      userName: invitation.inviteeEmail,
      userEmail: invitation.inviteeEmail,
      role: invitation.role,
      grantedBy: 'invitation'
    });

    return permission;
  }

  async declineInvitation(invitationId: string): Promise<boolean> {
    const invitation = this.invitations.get(invitationId);
    if (!invitation || invitation.status !== 'pending') {
      return false;
    }

    invitation.status = 'declined';
    return true;
  }

  async getInvitations(userId: string): Promise<CollaborationInvitation[]> {
    return Array.from(this.invitations.values()).filter(
      inv => inv.inviteeEmail.includes(userId) && inv.status === 'pending'
    );
  }

  async getPendingInvitations(folderId: string): Promise<CollaborationInvitation[]> {
    return Array.from(this.invitations.values()).filter(
      inv => inv.folderId === folderId && inv.status === 'pending'
    );
  }

  async logActivity(activity: Omit<CollaborationActivity, 'id' | 'timestamp'>): Promise<CollaborationActivity> {
    const newActivity: CollaborationActivity = {
      ...activity,
      id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date()
    };

    const collaboration = this.collaborations.get(activity.folderId);
    if (collaboration) {
      collaboration.activities.unshift(newActivity);
      // 保持最近100個活動
      if (collaboration.activities.length > 100) {
        collaboration.activities = collaboration.activities.slice(0, 100);
      }
    }

    return newActivity;
  }

  async getActivities(folderId: string, limit: number = 50): Promise<CollaborationActivity[]> {
    const collaboration = this.collaborations.get(folderId);
    if (!collaboration) {
      return [];
    }

    return collaboration.activities.slice(0, limit);
  }

  async getUserActivities(userId: string, limit: number = 50): Promise<CollaborationActivity[]> {
    const allActivities: CollaborationActivity[] = [];
    
    for (const collaboration of this.collaborations.values()) {
      const userActivities = collaboration.activities.filter(a => a.userId === userId);
      allActivities.push(...userActivities);
    }

    return allActivities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getCollaborationStats(userId: string): Promise<CollaborationStats> {
    const userCollaborations = Array.from(this.collaborations.values()).filter(
      c => c.ownerId === userId || c.permissions.some(p => p.userId === userId)
    );

    const totalCollaborators = new Set(
      userCollaborations.flatMap(c => c.permissions.map(p => p.userId))
    ).size;

    const allActivities = userCollaborations.flatMap(c => c.activities);
    const mostActiveFolder = userCollaborations.reduce((max, current) => 
      current.activities.length > max.activityCount 
        ? { folderId: current.folderId, folderName: current.folderName, activityCount: current.activities.length }
        : max
    , { folderId: '', folderName: '', activityCount: 0 });

    return {
      totalCollaborations: userCollaborations.length,
      activeCollaborations: userCollaborations.filter(c => c.isActive).length,
      totalCollaborators,
      totalShares: userCollaborations.filter(c => c.shareSettings.shareType !== 'private').length,
      publicShares: userCollaborations.filter(c => c.shareSettings.shareType === 'public').length,
      classShares: userCollaborations.filter(c => c.shareSettings.shareType === 'class').length,
      privateShares: userCollaborations.filter(c => c.shareSettings.shareType === 'private').length,
      totalViews: allActivities.filter(a => a.action === 'view').length,
      totalDownloads: allActivities.filter(a => a.action === 'download').length,
      averageCollaboratorsPerFolder: totalCollaborators / Math.max(userCollaborations.length, 1),
      mostActiveFolder,
      recentActivities: allActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
    };
  }

  async getFolderStats(folderId: string): Promise<{
    totalCollaborators: number;
    totalViews: number;
    totalEdits: number;
    recentActivities: CollaborationActivity[];
  }> {
    const collaboration = this.collaborations.get(folderId);
    if (!collaboration) {
      return {
        totalCollaborators: 0,
        totalViews: 0,
        totalEdits: 0,
        recentActivities: []
      };
    }

    return {
      totalCollaborators: collaboration.permissions.length,
      totalViews: collaboration.activities.filter(a => a.action === 'view').length,
      totalEdits: collaboration.activities.filter(a => a.action === 'edit').length,
      recentActivities: collaboration.activities.slice(0, 10)
    };
  }

  async bulkUpdatePermissions(folderId: string, updates: Array<{userId: string; role: CollaborationPermission['role']}>): Promise<CollaborationPermission[]> {
    const results: CollaborationPermission[] = [];
    
    for (const update of updates) {
      try {
        const permission = await this.updateCollaboratorRole(folderId, update.userId, update.role);
        results.push(permission);
      } catch (error) {
        console.error(`Failed to update permission for user ${update.userId}:`, error);
      }
    }

    return results;
  }

  async bulkRemoveCollaborators(folderId: string, userIds: string[]): Promise<boolean> {
    let allSuccess = true;
    
    for (const userId of userIds) {
      const success = await this.removeCollaborator(folderId, userId);
      if (!success) {
        allSuccess = false;
      }
    }

    return allSuccess;
  }

  async validateShareSettings(settings: ShareSettings): Promise<{isValid: boolean; errors: string[]}> {
    const errors: string[] = [];

    if (settings.isPasswordProtected && !settings.password) {
      errors.push('Password is required when password protection is enabled');
    }

    if (settings.expiresAt && settings.expiresAt <= new Date()) {
      errors.push('Expiration date must be in the future');
    }

    if (settings.maxAccessCount && settings.maxAccessCount <= 0) {
      errors.push('Maximum access count must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async auditCollaborationAccess(folderId: string): Promise<{
    suspiciousActivities: CollaborationActivity[];
    securityRecommendations: string[];
  }> {
    const collaboration = this.collaborations.get(folderId);
    if (!collaboration) {
      return { suspiciousActivities: [], securityRecommendations: [] };
    }

    const suspiciousActivities: CollaborationActivity[] = [];
    const recommendations: string[] = [];

    // 檢查異常活動
    const recentActivities = collaboration.activities.filter(
      a => a.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    // 檢查過度訪問
    const accessCounts = new Map<string, number>();
    recentActivities.forEach(a => {
      const count = accessCounts.get(a.userId) || 0;
      accessCounts.set(a.userId, count + 1);
    });

    for (const [userId, count] of accessCounts) {
      if (count > 100) {
        suspiciousActivities.push(...recentActivities.filter(a => a.userId === userId));
      }
    }

    // 安全建議
    if (collaboration.shareSettings.shareType === 'public' && !collaboration.shareSettings.isPasswordProtected) {
      recommendations.push('Consider adding password protection for public shares');
    }

    if (!collaboration.shareSettings.expiresAt) {
      recommendations.push('Consider setting an expiration date for shares');
    }

    if (collaboration.permissions.some(p => !p.expiresAt)) {
      recommendations.push('Consider setting expiration dates for collaborator permissions');
    }

    return {
      suspiciousActivities,
      securityRecommendations: recommendations
    };
  }

  async notifyCollaborators(folderId: string, message: string, excludeUserIds: string[] = []): Promise<boolean> {
    const collaboration = this.collaborations.get(folderId);
    if (!collaboration) {
      return false;
    }

    const collaborators = collaboration.permissions.filter(
      p => p.isActive && !excludeUserIds.includes(p.userId)
    );

    // 模擬通知發送
    console.log(`Sending notification to ${collaborators.length} collaborators: ${message}`);

    await this.logActivity({
      folderId,
      userId: 'system',
      userName: 'System',
      action: 'share',
      details: `Sent notification to ${collaborators.length} collaborators`
    });

    return true;
  }

  async sendShareNotification(shareUrl: string, recipientEmails: string[], message?: string): Promise<boolean> {
    // 模擬郵件發送
    console.log(`Sending share notification to ${recipientEmails.length} recipients: ${shareUrl}`);
    if (message) {
      console.log(`Message: ${message}`);
    }

    return true;
  }
}
