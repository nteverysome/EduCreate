import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';

// 確保在服務器端運行
if (typeof window !== 'undefined') {
  throw new Error('此API只能在服務器端運行');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 註冊API被調用:', {
    method: req.method,
    body: req.body ? { ...req.body, password: '[HIDDEN]' } : null
  });

  if (req.method !== 'POST') {
    console.log('❌ 方法不允許:', req.method);
    return res.status(405).json({ message: '只允許POST請求' });
  }

  try {
    const { name, email, password } = req.body;
    console.log('📋 接收到的數據:', { name, email, password: password ? '[PROVIDED]' : '[MISSING]' });

    // 驗證輸入
    if (!name || !email || !password) {
      console.log('❌ 缺少必填欄位');
      return res.status(400).json({ message: '所有欄位都是必填的' });
    }

    if (password.length < 8) {
      console.log('❌ 密碼太短');
      return res.status(400).json({ message: '密碼必須至少8個字符' });
    }

    console.log('🔍 檢查用戶是否已存在...');
    // 測試數據庫連接
    try {
      await prisma.$connect();
      console.log('✅ 數據庫連接成功');
    } catch (connectError) {
      console.error('❌ 數據庫連接失敗:', connectError);
      return res.status(500).json({ 
        message: '數據庫連接失敗，請檢查PostgreSQL服務是否運行',
        error: process.env.NODE_ENV === 'development' ? connectError : undefined,
        details: 'DATABASE_CONNECTION_FAILED'
      });
    }

    // 檢查郵箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ 用戶已存在:', email);
      return res.status(400).json({ message: '此電子郵件已被註冊' });
    }

    console.log('🔐 加密密碼...');
    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('👤 創建新用戶...');
    // 創建用戶
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    console.log('✅ 用戶創建成功:', user.id);

    // 不返回密碼
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: '用戶創建成功',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('❌ 註冊錯誤詳情:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // 提供更詳細的錯誤信息用於調試
    if (error instanceof Error) {
      // 數據庫連接錯誤
      if (error.message.includes('connect') || error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
        return res.status(500).json({ 
          message: '數據庫連接失敗，請檢查PostgreSQL服務是否運行',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
          details: 'DATABASE_CONNECTION_ERROR'
        });
      }
      
      // 唯一約束錯誤
      if (error.message.includes('Unique constraint') || error.message.includes('unique constraint')) {
        return res.status(400).json({ 
          message: '此電子郵件已被註冊',
          details: 'EMAIL_ALREADY_EXISTS'
        });
      }

      // Prisma 客戶端錯誤
      if (error.message.includes('PrismaClientInitializationError')) {
        return res.status(500).json({ 
          message: 'Prisma 客戶端初始化失敗，請檢查數據庫配置',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
          details: 'PRISMA_INIT_ERROR'
        });
      }
    }
    
    return res.status(500).json({ 
      message: '服務器錯誤，請稍後再試',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : error) : undefined,
      details: 'INTERNAL_SERVER_ERROR'
    });
  } finally {
    // 確保斷開數據庫連接
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.warn('⚠️ 數據庫斷開連接時出現警告:', disconnectError);
    }
  }
}