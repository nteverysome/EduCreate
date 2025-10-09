import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 創建測試用戶 API 被調用');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' });
  }
  
  try {
    const testEmail = 'test@educreate.com';
    const testPassword = 'test123456';
    
    // 檢查用戶是否已存在
    console.log('🔍 檢查測試用戶是否存在...');
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (existingUser) {
      console.log('✅ 測試用戶已存在');
      return res.status(200).json({
        success: true,
        message: '測試用戶已存在',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role
        }
      });
    }
    
    // 創建新的測試用戶
    console.log('➕ 創建新的測試用戶...');
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    const newUser = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: '測試用戶',
        role: 'ADMIN' // 給予 ADMIN 權限以便測試
      }
    });
    
    console.log('✅ 測試用戶創建成功:', newUser.id);
    
    return res.status(201).json({
      success: true,
      message: '測試用戶創建成功',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      credentials: {
        email: testEmail,
        password: testPassword
      }
    });
    
  } catch (error) {
    console.error('❌ 創建測試用戶失敗:', error);
    
    return res.status(500).json({
      success: false,
      message: '創建測試用戶失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}
