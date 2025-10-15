import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * 更新课业分配的截止日期
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = params;
    const body = await request.json() as { deadline?: string | null };

    // 验证用户权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    console.log('🔄 更新课业分配截止日期:', assignmentId, body);

    // 检查课业分配是否存在并验证权限
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        activity: true
      }
    });

    if (!existingAssignment) {
      return NextResponse.json({ error: '课业分配不存在' }, { status: 404 });
    }

    // 检查用户权限
    if (existingAssignment.activity.userId !== session.user.id) {
      return NextResponse.json({ error: '无权限修改此课业分配' }, { status: 403 });
    }

    // 准备更新数据
    const updateData: any = {};

    // 处理截止日期更新
    if (body.deadline !== undefined) {
      if (body.deadline === null || body.deadline === '') {
        // 清除截止日期
        updateData.deadline = null;
      } else {
        // 设置新的截止日期
        const deadlineDate = new Date(body.deadline);
        if (isNaN(deadlineDate.getTime())) {
          return NextResponse.json({ error: '无效的截止日期格式' }, { status: 400 });
        }
        updateData.deadline = deadlineDate;
      }
    }

    // 根据截止日期自动更新状态
    if (updateData.deadline) {
      const now = new Date();
      if (updateData.deadline > now) {
        updateData.status = 'ACTIVE';
      } else {
        updateData.status = 'EXPIRED';
      }
    } else {
      // 没有截止日期时，设为活跃状态
      updateData.status = 'ACTIVE';
    }

    // 执行更新
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: {
        activity: true
      }
    });

    console.log('✅ 课业分配截止日期更新成功:', {
      assignmentId,
      deadline: updatedAssignment.deadline?.toISOString(),
      status: updatedAssignment.status
    });

    // 返回更新后的信息
    return NextResponse.json({
      id: updatedAssignment.id,
      deadline: updatedAssignment.deadline?.toISOString(),
      status: updatedAssignment.status,
      activityTitle: updatedAssignment.activity.title,
      updatedAt: updatedAssignment.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('❌ 更新课业分配截止日期失败:', error);
    return NextResponse.json(
      { error: '更新截止日期失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取课业分配的截止日期信息
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = params;

    // 验证用户权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 获取课业分配信息
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        activity: true
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: '课业分配不存在' }, { status: 404 });
    }

    // 检查用户权限
    if (assignment.activity.userId !== session.user.id) {
      return NextResponse.json({ error: '无权限访问此课业分配' }, { status: 403 });
    }

    // 返回截止日期信息
    return NextResponse.json({
      id: assignment.id,
      deadline: assignment.deadline?.toISOString(),
      status: assignment.status,
      activityTitle: assignment.activity.title,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('❌ 获取课业分配截止日期失败:', error);
    return NextResponse.json(
      { error: '获取截止日期失败' },
      { status: 500 }
    );
  }
}
