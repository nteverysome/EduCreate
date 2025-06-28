/**
 * 企業級管理 API
 * 提供基礎的企業管理功能
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'free' | 'pro' | 'enterprise';
  userLimit: number;
  features: string[];
  createdAt: string;
  settings: {
    allowSelfRegistration: boolean;
    requireEmailVerification: boolean;
    enableSSO: boolean;
    customBranding: boolean;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'teacher' | 'student';
  organizationId: string;
  permissions: string[];
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'user' | 'analytics' | 'system';
  level: 'read' | 'write' | 'admin';
}

// 模擬數據存儲
const organizations: Organization[] = [
  {
    id: 'org-1',
    name: '示範學校',
    domain: 'demo-school.edu',
    plan: 'enterprise',
    userLimit: 1000,
    features: ['analytics', 'sso', 'custom_branding', 'api_access'],
    createdAt: new Date().toISOString(),
    settings: {
      allowSelfRegistration: true,
      requireEmailVerification: true,
      enableSSO: false,
      customBranding: true
    }
  }
];

const users: User[] = [
  {
    id: 'user-1',
    email: 'admin@demo-school.edu',
    name: '系統管理員',
    role: 'admin',
    organizationId: 'org-1',
    permissions: ['*'],
    lastActive: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'user-2',
    email: 'teacher@demo-school.edu',
    name: '張老師',
    role: 'teacher',
    organizationId: 'org-1',
    permissions: ['content:read', 'content:write', 'analytics:read'],
    lastActive: new Date().toISOString(),
    status: 'active'
  }
];

const permissions: Permission[] = [
  { id: 'content:read', name: '查看內容', description: '可以查看教學內容', category: 'content', level: 'read' },
  { id: 'content:write', name: '編輯內容', description: '可以創建和編輯教學內容', category: 'content', level: 'write' },
  { id: 'content:admin', name: '管理內容', description: '可以管理所有教學內容', category: 'content', level: 'admin' },
  { id: 'user:read', name: '查看用戶', description: '可以查看用戶信息', category: 'user', level: 'read' },
  { id: 'user:write', name: '管理用戶', description: '可以創建和編輯用戶', category: 'user', level: 'write' },
  { id: 'analytics:read', name: '查看分析', description: '可以查看學習分析數據', category: 'analytics', level: 'read' },
  { id: 'system:admin', name: '系統管理', description: '可以管理系統設置', category: 'system', level: 'admin' }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { action } = req.query;

    switch (req.method) {
      case 'GET':
        return handleGet(req, res, action as string);
      case 'POST':
        return handlePost(req, res, action as string);
      case 'PUT':
        return handlePut(req, res, action as string);
      case 'DELETE':
        return handleDelete(req, res, action as string);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('企業管理 API 錯誤:', error);
    return res.status(500).json({
      error: '企業管理服務錯誤',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 處理 GET 請求
function handleGet(req: NextApiRequest, res: NextApiResponse, action: string) {
  switch (action) {
    case 'organizations':
      return getOrganizations(req, res);
    case 'users':
      return getUsers(req, res);
    case 'permissions':
      return getPermissions(req, res);
    case 'dashboard':
      return getDashboard(req, res);
    default:
      return getOverview(req, res);
  }
}

// 處理 POST 請求
function handlePost(req: NextApiRequest, res: NextApiResponse, action: string) {
  switch (action) {
    case 'organizations':
      return createOrganization(req, res);
    case 'users':
      return createUser(req, res);
    case 'invite':
      return inviteUser(req, res);
    default:
      return res.status(400).json({ error: '不支持的操作' });
  }
}

// 處理 PUT 請求
function handlePut(req: NextApiRequest, res: NextApiResponse, action: string) {
  switch (action) {
    case 'organizations':
      return updateOrganization(req, res);
    case 'users':
      return updateUser(req, res);
    default:
      return res.status(400).json({ error: '不支持的操作' });
  }
}

// 處理 DELETE 請求
function handleDelete(req: NextApiRequest, res: NextApiResponse, action: string) {
  switch (action) {
    case 'users':
      return deleteUser(req, res);
    default:
      return res.status(400).json({ error: '不支持的操作' });
  }
}

// 獲取組織列表
function getOrganizations(req: NextApiRequest, res: NextApiResponse) {
  const { limit = 10, offset = 0 } = req.query;
  
  const limitNum = parseInt(limit as string, 10);
  const offsetNum = parseInt(offset as string, 10);
  
  const paginatedOrgs = organizations.slice(offsetNum, offsetNum + limitNum);
  
  return res.status(200).json({
    success: true,
    data: paginatedOrgs,
    total: organizations.length,
    limit: limitNum,
    offset: offsetNum
  });
}

// 獲取用戶列表
function getUsers(req: NextApiRequest, res: NextApiResponse) {
  const { organizationId, role, status, limit = 50, offset = 0 } = req.query;
  
  let filteredUsers = [...users];
  
  if (organizationId) {
    filteredUsers = filteredUsers.filter(u => u.organizationId === organizationId);
  }
  
  if (role) {
    filteredUsers = filteredUsers.filter(u => u.role === role);
  }
  
  if (status) {
    filteredUsers = filteredUsers.filter(u => u.status === status);
  }
  
  const limitNum = parseInt(limit as string, 10);
  const offsetNum = parseInt(offset as string, 10);
  
  const paginatedUsers = filteredUsers.slice(offsetNum, offsetNum + limitNum);
  
  return res.status(200).json({
    success: true,
    data: paginatedUsers,
    total: filteredUsers.length,
    limit: limitNum,
    offset: offsetNum
  });
}

// 獲取權限列表
function getPermissions(req: NextApiRequest, res: NextApiResponse) {
  const { category } = req.query;
  
  let filteredPermissions = [...permissions];
  
  if (category) {
    filteredPermissions = filteredPermissions.filter(p => p.category === category);
  }
  
  return res.status(200).json({
    success: true,
    data: filteredPermissions,
    categories: ['content', 'user', 'analytics', 'system']
  });
}

// 獲取管理儀表板數據
function getDashboard(req: NextApiRequest, res: NextApiResponse) {
  const { organizationId } = req.query;
  
  const orgUsers = organizationId 
    ? users.filter(u => u.organizationId === organizationId)
    : users;
  
  const dashboard = {
    overview: {
      totalOrganizations: organizations.length,
      totalUsers: orgUsers.length,
      activeUsers: orgUsers.filter(u => u.status === 'active').length,
      totalPermissions: permissions.length
    },
    usersByRole: {
      admin: orgUsers.filter(u => u.role === 'admin').length,
      manager: orgUsers.filter(u => u.role === 'manager').length,
      teacher: orgUsers.filter(u => u.role === 'teacher').length,
      student: orgUsers.filter(u => u.role === 'student').length
    },
    usersByStatus: {
      active: orgUsers.filter(u => u.status === 'active').length,
      inactive: orgUsers.filter(u => u.status === 'inactive').length,
      suspended: orgUsers.filter(u => u.status === 'suspended').length
    },
    organizationsByPlan: {
      free: organizations.filter(o => o.plan === 'free').length,
      pro: organizations.filter(o => o.plan === 'pro').length,
      enterprise: organizations.filter(o => o.plan === 'enterprise').length
    },
    recentActivity: generateRecentActivity(orgUsers)
  };
  
  return res.status(200).json({
    success: true,
    dashboard,
    timestamp: new Date().toISOString()
  });
}

// 獲取總覽
function getOverview(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    success: true,
    message: '企業級管理 API 可用',
    features: [
      '組織管理',
      '用戶管理',
      '權限控制',
      '角色管理',
      '儀表板分析'
    ],
    endpoints: {
      organizations: '/api/admin/enterprise?action=organizations',
      users: '/api/admin/enterprise?action=users',
      permissions: '/api/admin/enterprise?action=permissions',
      dashboard: '/api/admin/enterprise?action=dashboard'
    },
    timestamp: new Date().toISOString()
  });
}

// 創建組織
function createOrganization(req: NextApiRequest, res: NextApiResponse) {
  const { name, domain, plan = 'free' } = req.body;
  
  if (!name || !domain) {
    return res.status(400).json({
      error: '缺少必要參數',
      required: ['name', 'domain']
    });
  }
  
  const newOrg: Organization = {
    id: `org-${Date.now()}`,
    name,
    domain,
    plan,
    userLimit: plan === 'enterprise' ? 1000 : plan === 'pro' ? 100 : 10,
    features: plan === 'enterprise' ? ['analytics', 'sso', 'custom_branding', 'api_access'] : 
              plan === 'pro' ? ['analytics', 'api_access'] : ['basic'],
    createdAt: new Date().toISOString(),
    settings: {
      allowSelfRegistration: true,
      requireEmailVerification: true,
      enableSSO: plan === 'enterprise',
      customBranding: plan !== 'free'
    }
  };
  
  organizations.push(newOrg);
  
  return res.status(201).json({
    success: true,
    data: newOrg,
    message: '組織創建成功'
  });
}

// 創建用戶
function createUser(req: NextApiRequest, res: NextApiResponse) {
  const { email, name, role = 'student', organizationId, permissions = [] } = req.body;
  
  if (!email || !name || !organizationId) {
    return res.status(400).json({
      error: '缺少必要參數',
      required: ['email', 'name', 'organizationId']
    });
  }
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    role,
    organizationId,
    permissions,
    lastActive: new Date().toISOString(),
    status: 'active'
  };
  
  users.push(newUser);
  
  return res.status(201).json({
    success: true,
    data: newUser,
    message: '用戶創建成功'
  });
}

// 邀請用戶
function inviteUser(req: NextApiRequest, res: NextApiResponse) {
  const { email, organizationId, role = 'student' } = req.body;
  
  if (!email || !organizationId) {
    return res.status(400).json({
      error: '缺少必要參數',
      required: ['email', 'organizationId']
    });
  }
  
  // 模擬發送邀請郵件
  const inviteToken = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return res.status(200).json({
    success: true,
    message: '邀請已發送',
    inviteToken,
    inviteUrl: `${process.env.NEXTAUTH_URL}/invite?token=${inviteToken}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 天後過期
  });
}

// 更新組織
function updateOrganization(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const updates = req.body;
  
  const orgIndex = organizations.findIndex(o => o.id === id);
  if (orgIndex === -1) {
    return res.status(404).json({ error: '組織不存在' });
  }
  
  organizations[orgIndex] = { ...organizations[orgIndex], ...updates };
  
  return res.status(200).json({
    success: true,
    data: organizations[orgIndex],
    message: '組織更新成功'
  });
}

// 更新用戶
function updateUser(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const updates = req.body;
  
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: '用戶不存在' });
  }
  
  users[userIndex] = { ...users[userIndex], ...updates };
  
  return res.status(200).json({
    success: true,
    data: users[userIndex],
    message: '用戶更新成功'
  });
}

// 刪除用戶
function deleteUser(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: '用戶不存在' });
  }
  
  users.splice(userIndex, 1);
  
  return res.status(200).json({
    success: true,
    message: '用戶刪除成功'
  });
}

// 生成最近活動
function generateRecentActivity(orgUsers: User[]) {
  return orgUsers.slice(0, 5).map(user => ({
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'user_login',
    description: `${user.name} 登入系統`,
    userId: user.id,
    timestamp: user.lastActive
  }));
}
