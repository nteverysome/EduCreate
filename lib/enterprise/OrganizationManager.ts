/**
 * 企業級組織管理系統 - 第三階段
 * 提供組織架構、角色權限、批量操作等企業級功能
 */

export interface Organization {
  id: string;
  name: string;
  description?: string;
  type: 'school' | 'company' | 'institution' | 'government';
  settings: OrganizationSettings;
  subscription: SubscriptionInfo;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'suspended' | 'trial';
  metadata: OrganizationMetadata;
}

export interface OrganizationSettings {
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customDomain?: string;
  };
  features: {
    aiContentGeneration: boolean;
    advancedAnalytics: boolean;
    collaboration: boolean;
    apiAccess: boolean;
    sso: boolean;
    customIntegrations: boolean;
  };
  security: {
    passwordPolicy: PasswordPolicy;
    sessionTimeout: number;
    ipWhitelist?: string[];
    twoFactorRequired: boolean;
    dataRetention: number; // 天數
  };
  limits: {
    maxUsers: number;
    maxActivities: number;
    maxStorage: number; // MB
    apiCallsPerMonth: number;
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // 天數
  preventReuse: number; // 防止重複使用的密碼數量
}

export interface SubscriptionInfo {
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  currency: string;
}

export interface OrganizationMetadata {
  industry?: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  country: string;
  timezone: string;
  language: string;
  contactInfo: {
    email: string;
    phone?: string;
    address?: string;
  };
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  parentId?: string; // 支持嵌套部門
  managerId: string;
  members: string[]; // 用戶ID列表
  settings: DepartmentSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentSettings {
  permissions: DepartmentPermissions;
  quotas: {
    maxActivities: number;
    maxStorage: number;
    maxCollaborators: number;
  };
  features: {
    allowAIGeneration: boolean;
    allowExternalSharing: boolean;
    requireApproval: boolean;
  };
}

export interface DepartmentPermissions {
  canCreateActivities: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canManageIntegrations: boolean;
}

export interface Role {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: 'system' | 'custom';
  permissions: Permission[];
  level: number; // 權限級別 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  resource: string; // 資源類型
  action: string; // 操作類型
  scope: 'organization' | 'department' | 'self';
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
  value: any;
}

export interface User {
  id: string;
  organizationId: string;
  departmentId?: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: string[]; // 角色ID列表
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile: UserProfile;
}

export interface UserProfile {
  title?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  preferences: {
    language: string;
    timezone: string;
    notifications: NotificationSettings;
  };
  statistics: {
    totalActivities: number;
    totalTimeSpent: number;
    averageScore: number;
    lastActiveDate: Date;
  };
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  types: {
    assignments: boolean;
    achievements: boolean;
    reminders: boolean;
    updates: boolean;
  };
}

export interface BulkOperation {
  id: string;
  organizationId: string;
  type: 'user_import' | 'user_export' | 'activity_clone' | 'data_migration' | 'permission_update';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  parameters: any;
  results?: BulkOperationResult;
}

export interface BulkOperationResult {
  success: boolean;
  message: string;
  details: {
    created: number;
    updated: number;
    deleted: number;
    errors: BulkOperationError[];
  };
  downloadUrl?: string; // 結果文件下載鏈接
}

export interface BulkOperationError {
  item: any;
  error: string;
  code: string;
}

export class OrganizationManager {
  private static organizations: Map<string, Organization> = new Map();
  private static departments: Map<string, Department[]> = new Map();
  private static roles: Map<string, Role[]> = new Map();
  private static users: Map<string, User[]> = new Map();
  private static bulkOperations: Map<string, BulkOperation> = new Map();

  // 創建組織
  static async createOrganization(
    name: string,
    type: Organization['type'],
    adminUser: Partial<User>,
    settings?: Partial<OrganizationSettings>
  ): Promise<Organization> {
    const organizationId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const organization: Organization = {
      id: organizationId,
      name,
      type,
      settings: {
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6'
        },
        features: {
          aiContentGeneration: true,
          advancedAnalytics: true,
          collaboration: true,
          apiAccess: false,
          sso: false,
          customIntegrations: false
        },
        security: {
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
            maxAge: 90,
            preventReuse: 5
          },
          sessionTimeout: 3600,
          twoFactorRequired: false,
          dataRetention: 365
        },
        limits: {
          maxUsers: 100,
          maxActivities: 1000,
          maxStorage: 10240,
          apiCallsPerMonth: 10000
        },
        ...settings
      },
      subscription: {
        plan: 'trial',
        status: 'trial',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天試用
        autoRenew: false,
        billingCycle: 'monthly',
        price: 0,
        currency: 'USD'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'trial',
      metadata: {
        size: 'small',
        country: 'US',
        timezone: 'UTC',
        language: 'en',
        contactInfo: {
          email: adminUser.email || ''
        }
      }
    };

    this.organizations.set(organizationId, organization);

    // 創建默認角色
    await this.createDefaultRoles(organizationId);

    // 創建管理員用戶
    if (adminUser.email) {
      await this.createUser(organizationId, {
        ...adminUser,
        roles: ['admin']
      } as Partial<User>);
    }

    return organization;
  }

  // 創建默認角色
  private static async createDefaultRoles(organizationId: string): Promise<void> {
    const defaultRoles: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        organizationId,
        name: 'Admin',
        description: '組織管理員，擁有所有權限',
        type: 'system',
        level: 100,
        permissions: [
          { id: 'all', resource: '*', action: '*', scope: 'organization' }
        ]
      },
      {
        organizationId,
        name: 'Manager',
        description: '部門經理，可管理部門內用戶和內容',
        type: 'system',
        level: 80,
        permissions: [
          { id: 'manage_users', resource: 'user', action: 'manage', scope: 'department' },
          { id: 'manage_activities', resource: 'activity', action: 'manage', scope: 'department' },
          { id: 'view_analytics', resource: 'analytics', action: 'view', scope: 'department' }
        ]
      },
      {
        organizationId,
        name: 'Teacher',
        description: '教師，可創建和管理教學內容',
        type: 'system',
        level: 60,
        permissions: [
          { id: 'create_activities', resource: 'activity', action: 'create', scope: 'self' },
          { id: 'manage_own_activities', resource: 'activity', action: 'manage', scope: 'self' },
          { id: 'view_student_progress', resource: 'analytics', action: 'view', scope: 'self' }
        ]
      },
      {
        organizationId,
        name: 'Student',
        description: '學生，可參與學習活動',
        type: 'system',
        level: 20,
        permissions: [
          { id: 'participate_activities', resource: 'activity', action: 'participate', scope: 'self' },
          { id: 'view_own_progress', resource: 'analytics', action: 'view', scope: 'self' }
        ]
      }
    ];

    const roles = defaultRoles.map(role => ({
      ...role,
      id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    this.roles.set(organizationId, roles);
  }

  // 創建用戶
  static async createUser(organizationId: string, userData: Partial<User>): Promise<User> {
    const organization = this.organizations.get(organizationId);
    if (!organization) {
      throw new Error('組織不存在');
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user: User = {
      id: userId,
      organizationId,
      email: userData.email || '',
      username: userData.username || userData.email?.split('@')[0] || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      avatar: userData.avatar,
      roles: userData.roles || ['student'],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        skills: [],
        interests: [],
        preferences: {
          language: organization.metadata.language,
          timezone: organization.metadata.timezone,
          notifications: {
            email: true,
            push: true,
            sms: false,
            frequency: 'daily',
            types: {
              assignments: true,
              achievements: true,
              reminders: true,
              updates: false
            }
          }
        },
        statistics: {
          totalActivities: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          lastActiveDate: new Date()
        }
      },
      ...userData
    };

    const orgUsers = this.users.get(organizationId) || [];
    orgUsers.push(user);
    this.users.set(organizationId, orgUsers);

    return user;
  }

  // 創建部門
  static async createDepartment(
    organizationId: string,
    name: string,
    managerId: string,
    parentId?: string
  ): Promise<Department> {
    const organization = this.organizations.get(organizationId);
    if (!organization) {
      throw new Error('組織不存在');
    }

    const departmentId = `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const department: Department = {
      id: departmentId,
      organizationId,
      name,
      parentId,
      managerId,
      members: [managerId],
      settings: {
        permissions: {
          canCreateActivities: true,
          canManageUsers: false,
          canViewAnalytics: true,
          canExportData: false,
          canManageIntegrations: false
        },
        quotas: {
          maxActivities: Math.floor(organization.settings.limits.maxActivities / 10),
          maxStorage: Math.floor(organization.settings.limits.maxStorage / 10),
          maxCollaborators: 50
        },
        features: {
          allowAIGeneration: organization.settings.features.aiContentGeneration,
          allowExternalSharing: true,
          requireApproval: false
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orgDepartments = this.departments.get(organizationId) || [];
    orgDepartments.push(department);
    this.departments.set(organizationId, orgDepartments);

    return department;
  }

  // 批量導入用戶
  static async bulkImportUsers(
    organizationId: string,
    users: Partial<User>[],
    createdBy: string
  ): Promise<BulkOperation> {
    const operationId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const operation: BulkOperation = {
      id: operationId,
      organizationId,
      type: 'user_import',
      status: 'pending',
      progress: 0,
      totalItems: users.length,
      processedItems: 0,
      failedItems: 0,
      createdBy,
      parameters: { users }
    };

    this.bulkOperations.set(operationId, operation);

    // 異步處理批量操作
    this.processBulkOperation(operationId);

    return operation;
  }

  // 處理批量操作
  private static async processBulkOperation(operationId: string): Promise<void> {
    const operation = this.bulkOperations.get(operationId);
    if (!operation) return;

    operation.status = 'running';
    operation.startedAt = new Date();

    const errors: BulkOperationError[] = [];
    let created = 0;

    try {
      if (operation.type === 'user_import') {
        const users = operation.parameters.users as Partial<User>[];
        
        for (let i = 0; i < users.length; i++) {
          try {
            await this.createUser(operation.organizationId, users[i]);
            created++;
          } catch (error) {
            errors.push({
              item: users[i],
              error: error instanceof Error ? error.message : '未知錯誤',
              code: 'CREATE_FAILED'
            });
            operation.failedItems++;
          }
          
          operation.processedItems++;
          operation.progress = Math.round((operation.processedItems / operation.totalItems) * 100);
        }
      }

      operation.status = 'completed';
      operation.results = {
        success: errors.length === 0,
        message: `成功處理 ${operation.processedItems} 項，失敗 ${operation.failedItems} 項`,
        details: {
          created,
          updated: 0,
          deleted: 0,
          errors
        }
      };

    } catch (error) {
      operation.status = 'failed';
      operation.results = {
        success: false,
        message: error instanceof Error ? error.message : '批量操作失敗',
        details: {
          created: 0,
          updated: 0,
          deleted: 0,
          errors: [{
            item: null,
            error: error instanceof Error ? error.message : '未知錯誤',
            code: 'OPERATION_FAILED'
          }]
        }
      };
    } finally {
      operation.completedAt = new Date();
    }
  }

  // 檢查權限
  static hasPermission(
    userId: string,
    resource: string,
    action: string,
    scope: 'organization' | 'department' | 'self' = 'self'
  ): boolean {
    // 簡化的權限檢查邏輯
    // 實際實現需要更複雜的權限驗證
    
    const user = this.getUserById(userId);
    if (!user) return false;

    const orgRoles = this.roles.get(user.organizationId) || [];
    const userRoles = orgRoles.filter(role => user.roles.includes(role.id));

    for (const role of userRoles) {
      for (const permission of role.permissions) {
        if (
          (permission.resource === '*' || permission.resource === resource) &&
          (permission.action === '*' || permission.action === action) &&
          (permission.scope === scope || permission.scope === 'organization')
        ) {
          return true;
        }
      }
    }

    return false;
  }

  // 獲取組織
  static getOrganization(organizationId: string): Organization | null {
    return this.organizations.get(organizationId) || null;
  }

  // 獲取組織用戶
  static getOrganizationUsers(organizationId: string): User[] {
    return this.users.get(organizationId) || [];
  }

  // 獲取組織部門
  static getOrganizationDepartments(organizationId: string): Department[] {
    return this.departments.get(organizationId) || [];
  }

  // 獲取組織角色
  static getOrganizationRoles(organizationId: string): Role[] {
    return this.roles.get(organizationId) || [];
  }

  // 根據ID獲取用戶
  static getUserById(userId: string): User | null {
    for (const users of this.users.values()) {
      const user = users.find(u => u.id === userId);
      if (user) return user;
    }
    return null;
  }

  // 獲取批量操作
  static getBulkOperation(operationId: string): BulkOperation | null {
    return this.bulkOperations.get(operationId) || null;
  }

  // 獲取組織統計
  static getOrganizationStats(organizationId: string): any {
    const users = this.getOrganizationUsers(organizationId);
    const departments = this.getOrganizationDepartments(organizationId);
    const roles = this.getOrganizationRoles(organizationId);

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalDepartments: departments.length,
      totalRoles: roles.length,
      storageUsed: 0, // 簡化
      apiCallsThisMonth: 0 // 簡化
    };
  }
}
