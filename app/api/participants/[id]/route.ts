import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// DELETE /api/participants/[id] - 刪除參與者記錄
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const participantId = params.id;

    console.log('🗑️ 刪除參與者記錄:', {
      participantId,
      userEmail: session.user.email
    });

    // 查找參與者記錄
    const participant = await prisma.gameParticipant.findUnique({
      where: { id: participantId },
      include: {
        assignment: {
          include: {
            activity: {
              select: {
                userId: true
              }
            }
          }
        }
      }
    });

    if (!participant) {
      console.log('❌ 參與者記錄不存在:', participantId);
      return NextResponse.json(
        { error: '參與者記錄不存在' },
        { status: 404 }
      );
    }

    // 驗證權限：只有活動創建者可以刪除參與者記錄
    if (participant.assignment.activity.userId !== session.user.email) {
      console.log('❌ 無權限刪除參與者記錄:', {
        activityOwner: participant.assignment.activity.userId,
        currentUser: session.user.email
      });
      return NextResponse.json(
        { error: '無權限刪除此參與者記錄' },
        { status: 403 }
      );
    }

    // 刪除參與者記錄（硬刪除）
    await prisma.gameParticipant.delete({
      where: { id: participantId }
    });

    console.log('✅ 參與者記錄已刪除:', {
      participantId,
      studentName: participant.studentName
    });

    return NextResponse.json({
      success: true,
      message: '參與者記錄已刪除'
    });

  } catch (error) {
    console.error('❌ 刪除參與者記錄失敗:', error);
    return NextResponse.json(
      { error: '刪除參與者記錄失敗' },
      { status: 500 }
    );
  }
}

