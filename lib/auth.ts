import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // 使用 PrismaAdapter 以正確處理 OAuth 用戶
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt', // 使用 JWT 策略
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  secret: process.env.NEXTAUTH_SECRET,
  // 本地開發使用 HTTP，需要禁用安全 Cookie
  useSecureCookies: process.env.NODE_ENV === 'production',
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "電子郵件", type: "email" },
        password: { label: "密碼", type: "password" }
      },
      async authorize(credentials, req) {
        console.log('🔐 NextAuth authorize 被調用:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ 缺少憑證:', {
            hasEmail: !!credentials?.email,
            hasPassword: !!credentials?.password
          });
          return null;
        }

        try {
          console.log('🔍 查找用戶:', credentials.email);
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            console.log('❌ 用戶不存在:', credentials.email);
            return null;
          }

          if (!user.password) {
            console.log('❌ 用戶沒有密碼:', credentials.email);
            return null;
          }

          // 檢查郵箱是否已驗證
          if (!user.emailVerified) {
            console.log('❌ 郵箱未驗證:', credentials.email);
            return null;
          }

          console.log('🔑 驗證密碼...');
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log('❌ 密碼不正確:', credentials.email);
            return null;
          }

          console.log('✅ 用戶驗證成功:', {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image || null,
          };
        } catch (error) {
          console.error('❌ NextAuth authorize 錯誤:', error);
          return null;
        }
      }
    }),
    // 只在環境變數存在時添加 OAuth 提供者
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    ] : []),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  // 允許 OAuth 帳號自動連結到相同電子郵件的現有帳號
  allowDangerousEmailAccountLinking: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 SignIn callback:', {
        provider: account?.provider,
        hasUser: !!user,
        email: user?.email
      });
      return true;
    },
    async jwt({ token, user, account }) {
      console.log('🔐 JWT callback:', { hasUser: !!user, hasAccount: !!account });
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('📋 Session callback:', {
        hasToken: !!token,
        hasSessionUser: !!session.user,
        tokenId: (token as any)?.id,
        tokenEmail: (token as any)?.email
      });

      // 🔥 [v54.0] 修復：確保 session.user 存在，即使初始為 undefined
      if (token) {
        // 如果 session.user 不存在，創建它
        if (!session.user) {
          session.user = {
            id: '',
            email: '',
            name: '',
            image: null
          };
        }

        // 從 token 填充 session.user
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = (token as any).image as string | null;
        (session.user as any).role = token.role as string;

        console.log('✅ Session 已更新:', {
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name
        });
      }
      return session;
    }
  }
};