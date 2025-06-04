import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../../../lib/supabase';

// 確保在服務器端運行
if (typeof window !== 'undefined') {
  throw new Error('此API只能在服務器端運行');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 Supabase 註冊API被調用:', {
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
    
    // 檢查郵箱是否已存在
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('User')
      .select('id, email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ 檢查用戶時發生錯誤:', checkError);
      return res.status(500).json({ 
        message: '檢查用戶時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? checkError.message : undefined
      });
    }

    if (existingUser) {
      console.log('❌ 用戶已存在:', email);
      return res.status(400).json({ message: '此電子郵件已被註冊' });
    }

    console.log('🔐 加密密碼...');
    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('👤 創建新用戶...');
    // 創建用戶
    const { data: user, error: createError } = await supabaseAdmin
      .from('User')
      .insert({
        name,
        email,
        password: hashedPassword,
        role: 'USER'
      })
      .select('id, name, email, role, createdAt')
      .single();

    if (createError) {
      console.error('❌ 創建用戶失敗:', createError);
      return res.status(500).json({ 
        message: '創建用戶失敗',
        error: process.env.NODE_ENV === 'development' ? createError.message : undefined
      });
    }

    console.log('✅ 用戶創建成功:', user.id);

    return res.status(201).json({
      message: '用戶創建成功',
      user: user
    });
  } catch (error) {
    console.error('❌ 註冊錯誤詳情:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({ 
      message: '服務器內部錯誤',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
}