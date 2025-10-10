/**
 * AuthProvider 組件
 * 為整個應用程序提供 NextAuth 會話管理
 */
'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
