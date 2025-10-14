import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 獲取遊戲統計
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    
    if (sessionId) {
      // 查詢特定會話
      const session = await prisma.gameSession.findUnique({
        where: { id: sessionId }
      });
      
      if (session) {
        return NextResponse.json(session);
      } else {
        return NextResponse.json(
          { error: '遊戲會話未找到' },
          { status: 404 }
        );
      }
    } else if (userId) {
      // 查詢用戶的所有會話
      const userSessions = await prisma.gameSession.findMany({
        where: { userId }
      });
      return NextResponse.json(userSessions);
    } else {
      // 返回總體統計
      const totalSessions = await prisma.gameSession.count();
      const stats = await prisma.gameSession.aggregate({
        _sum: {
          score: true,
          questionsAnswered: true,
          correctAnswers: true
        }
      });
      
      return NextResponse.json({
        totalSessions,
        averageScore: totalSessions > 0 ? (stats._sum.score || 0) / totalSessions : 0,
        totalQuestions: stats._sum.questionsAnswered || 0,
        overallAccuracy: (stats._sum.questionsAnswered || 0) > 0 
          ? ((stats._sum.correctAnswers || 0) / (stats._sum.questionsAnswered || 0)) * 100 
          : 0
      });
    }
  } catch (error) {
    console.error('獲取遊戲統計失敗:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}

// 保存遊戲統計
export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json();
    
    const newSession = await prisma.gameSession.create({
      data: {
        userId: sessionData.userId,
        gameType: sessionData.gameType || 'shimozurdo',
        score: sessionData.score || 0,
        questionsAnswered: sessionData.questionsAnswered || 0,
        correctAnswers: sessionData.correctAnswers || 0,
        wrongAnswers: sessionData.wrongAnswers || 0,
        vocabulary: sessionData.vocabulary || [],
        memoryData: sessionData.memoryData || [],
        startTime: new Date(sessionData.startTime || Date.now())
      }
    });
    
    console.log('✅ 遊戲會話已保存:', newSession.id);
    return NextResponse.json({ 
      sessionId: newSession.id, 
      message: '遊戲統計已保存' 
    }, { status: 201 });
  } catch (error) {
    console.error('保存遊戲統計失敗:', error);
    return NextResponse.json(
      { error: '保存失敗' },
      { status: 500 }
    );
  }
}
