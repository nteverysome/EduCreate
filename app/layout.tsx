import React from 'react';
import '../styles/globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata = {
  title: 'EduCreate - 記憶科學驅動的智能教育遊戲平台',
  description: '基於記憶科學原理的智能教育遊戲 SaaS 平台，支援 GEPT 分級詞彙系統',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
