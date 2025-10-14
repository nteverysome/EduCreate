import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "電子郵件", type: "email" },
        password: { label: "密碼", type: "password" }
      },
      async authorize(credentials) {
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
            image: user.image,
            role: user.role
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
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  // 允許 OAuth 帳號自動連結到相同電子郵件的現有帳號
  allowDangerousEmailAccountLinking: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      // 簡化登入邏輯，讓 NextAuth 和 PrismaAdapter 處理用戶創建和關聯
      console.log('🔍 NextAuth signIn callback:', {
        provider: account?.provider,
        email: profile?.email || user?.email,
        name: profile?.name || user?.name
      });
      return true;
    },
    async session({ session, user }) {
      // 使用數據庫會話策略時，user 來自數據庫
      if (user && session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    }
  }
};