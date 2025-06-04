import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服務端使用的 Supabase 客戶端（具有服務角色權限）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 資料庫類型定義
export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          name: string | null
          email: string
          password: string
          emailVerified: string | null
          image: string | null
          createdAt: string
          updatedAt: string
          role: 'USER' | 'ADMIN'
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          password: string
          emailVerified?: string | null
          image?: string | null
          createdAt?: string
          updatedAt?: string
          role?: 'USER' | 'ADMIN'
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          password?: string
          emailVerified?: string | null
          image?: string | null
          createdAt?: string
          updatedAt?: string
          role?: 'USER' | 'ADMIN'
        }
      }
    }
  }
}