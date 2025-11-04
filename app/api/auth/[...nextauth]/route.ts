import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

console.log('🔐 NextAuth 路由已加載');
console.log('📝 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('🔑 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '已設置' : '未設置');
console.log('🔑 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '已設置' : '未設置');

const handler = NextAuth(authOptions);

// 添加錯誤處理
const wrappedHandler = async (req: any, res: any) => {
  try {
    console.log('📨 NextAuth 請求:', {
      method: req.method,
      url: req.url,
      path: req.nextUrl?.pathname
    });
    return await handler(req, res);
  } catch (error) {
    console.error('❌ NextAuth 錯誤:', error);
    throw error;
  }
};

export { wrappedHandler as GET, wrappedHandler as POST };
