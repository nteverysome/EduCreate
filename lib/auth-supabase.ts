import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

export const authOptionsSupabase: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "電子郵件", type: "email" },
        password: { label: "密碼", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 Supabase NextAuth authorize 被調用:', {
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
          
          const { data: user, error } = await supabaseAdmin
            .from('User')
            .select('id, email, name, password, role, image')
            .eq('email', credentials.email)
            .single();

          if (error || !user) {
            console.log('❌ 用戶不存在:', credentials.email, error?.message);
            return null;
          }

          if (!user.password) {
            console.log('❌ 用戶沒有密碼:', credentials.email);
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
          console.error('❌ Supabase NextAuth authorize 錯誤:', error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};