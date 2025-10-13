import { NextRequest, NextResponse } from 'next/server';

interface GameParticipant {
  id: string;
  studentName: string;
  score: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  gameData?: any;
}

interface AssignmentResult {
  id: string;
  title: string;
  activityName: string;
  activityId: string;
  assignmentId: string;
  participantCount: number;
  createdAt: string;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  gameType: string;
  shareLink: string;
  participants: GameParticipant[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const { resultId } = params;

    // TODO: 從數據庫查詢真實數據
    // const result = await prisma.assignmentResult.findUnique({
    //   where: { id: resultId },
    //   include: {
    //     participants: true,
    //     assignment: {
    //       include: {
    //         activity: true
    //       }
    //     }
    //   }
    // });

    // 暫時使用模擬數據
    const mockResult: AssignmentResult = {
      id: resultId,
      title: `"無標題活動"的結果1`,
      activityName: '無標題活動',
      activityId: 'cmgman4s00004jj04qwxdfwu1',
      assignmentId: '1760329085361',
      participantCount: 1,
      createdAt: '2025-10-13T14:08:00Z',
      status: 'active',
      gameType: '快閃記憶體卡',
      shareLink: 'https://edu-create.vercel.app/play/cmgman4s00004jj04qwxdfwu1/1760329085361',
      participants: [
        {
          id: 'participant1',
          studentName: '測試學生',
          score: 85,
          timeSpent: 120,
          correctAnswers: 8,
          totalQuestions: 10,
          completedAt: '2025-10-13T14:10:00Z'
        }
      ]
    };

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('獲取結果詳情失敗:', error);
    return NextResponse.json(
      { error: '獲取結果詳情失敗' },
      { status: 500 }
    );
  }
}
