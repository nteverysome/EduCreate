import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * PATCH /api/srs/sessions/[id]
 * 完成學習會話
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const sessionId = params.id;
    const body = await request.json();
    const { correctAnswers, totalAnswers, duration } = body;

    console.log('🏁 完成 SRS 學習會話');
    console.log(`  - 會話 ID: ${sessionId}`);
    console.log(`  - 正確答案: ${correctAnswers}/${totalAnswers}`);
    console.log(`  - 學習時間: ${duration} 秒`);

    // 2. 驗證會話所有權
    const learningSession = await prisma.learningSession.findUnique({
      where: { id: sessionId }
    });

    if (!learningSession) {
      return NextResponse.json(
        { error: '會話不存在' },
        { status: 404 }
      );
    }

    if (learningSession.userId !== userId) {
      return NextResponse.json(
        { error: '無權限' },
        { status: 403 }
      );
    }

    // 3. 計算正確率
    const accuracy = totalAnswers > 0 
      ? (correctAnswers / totalAnswers * 100) 
      : 0;

    // 4. 更新會話
    const updatedSession = await prisma.learningSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        duration,
        correctAnswers,
        totalAnswers,
        accuracy
      }
    });

    console.log('✅ 會話完成');
    console.log(`  - 正確率: ${accuracy.toFixed(1)}%`);

    return NextResponse.json({
      success: true,
      session: updatedSession
    });

  } catch (error) {
    console.error('❌ 完成會話失敗:', error);
    return NextResponse.json(
      { error: '完成會話失敗' },
      { status: 500 }
    );
  }
}

