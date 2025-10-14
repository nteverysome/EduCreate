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
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        try {
          // 檢查是否已存在相同 Google 電子郵件的用戶
          let existingUser = await prisma.user.findUnique({
            where: { email: profile.email }
          });

          if (!existingUser) {
            // 創建新的 Google 用戶
            existingUser = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name || user.name,
                image: profile.picture || user.image,
                emailVerified: new Date(),
                role: 'USER'
              }
            });
            console.log('✅ 創建新 Google 用戶:', existingUser.email);
          } else {
            // 更新現有用戶的 Google 信息
            existingUser = await prisma.user.update({
              where: { email: profile.email },
              data: {
                name: profile.name || user.name,
                image: profile.picture || user.image,
                emailVerified: new Date()
              }
            });
            console.log('✅ 更新現有 Google 用戶:', existingUser.email);
          }

          // 更新 user 對象以確保正確的信息傳遞
          user.id = existingUser.id;
          user.email = existingUser.email;
          user.name = existingUser.name;
          user.role = existingUser.role;

          return true;
        } catch (error) {
          console.error('❌ Google 登入處理失敗:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // 保存提供者信息
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.provider = token.provider as string;
      }
      return session;
    }
  }
};