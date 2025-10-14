import { NextResponse } from 'next/server';

export async function POST() {
  // 登出主要在客戶端處理（清除 token）
  // 這裡只是提供一個端點確認
  return NextResponse.json({ message: '登出成功' });
}
