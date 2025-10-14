import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 更新遊戲統計
export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const updateData = await request.json();
    
    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: updateData
    });
    
    return NextResponse.json({ 
      message: '遊戲統計已更新', 
      session: updatedSession 
    });
  } catch (error) {
    console.error('更新遊戲統計失敗:', error);
    return NextResponse.json(
      { error: '更新失敗' },
      { status: 500 }
    );
  }
}
