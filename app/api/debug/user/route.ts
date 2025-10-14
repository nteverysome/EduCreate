import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: '未授權',
        session: null 
      }, { status: 401 })
    }

    // 檢查用戶的活動
    const activities = await prisma.activity.findMany({
      where: {
        userId: session.user.email
      },
      select: {
        id: true,
        title: true,
        userId: true,
        createdAt: true
      },
      take: 5
    })

    // 檢查課業分配
    const assignments = await prisma.assignment.findMany({
      where: {
        activity: {
          userId: session.user.email
        }
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      },
      take: 5
    })

    // 檢查結果記錄
    const results = await prisma.assignmentResult.findMany({
      where: {
        assignment: {
          activity: {
            userId: session.user.email
          }
        }
      },
      include: {
        assignment: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                userId: true
              }
            }
          }
        }
      },
      take: 5
    })

    return NextResponse.json({
      user: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      },
      counts: {
        activities: activities.length,
        assignments: assignments.length,
        results: results.length
      },
      data: {
        activities,
        assignments,
        results
      }
    })

  } catch (error) {
    console.error('調試用戶信息失敗:', error)
    return NextResponse.json({ 
      error: '服務器錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}
