const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log('🔍 檢查所有歷史數據...\n');

    // 檢查所有用戶（包括可能的舊帳號）
    console.log('📊 檢查所有用戶:');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            activities: true,
            folders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // 按創建時間升序，看最早的用戶
      },
    });

    console.log(`總用戶數: ${allUsers.length}\n`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   創建時間: ${user.createdAt}`);
      console.log(`   活動數: ${user._count.activities}`);
      console.log(`   資料夾數: ${user._count.folders}`);
      console.log('');
    });

    // 檢查所有活動（包括已刪除的）
    console.log('\n\n📊 檢查所有活動（包括已刪除）:');
    const allActivities = await prisma.activity.findMany({
      select: {
        id: true,
        title: true,
        userId: true,
        createdAt: true,
        deletedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // 按創建時間升序
      },
    });

    console.log(`總活動數: ${allActivities.length}\n`);
    allActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title}`);
      console.log(`   ID: ${activity.id}`);
      console.log(`   用戶: ${activity.user.name} (${activity.user.email})`);
      console.log(`   創建時間: ${activity.createdAt}`);
      console.log(`   已刪除: ${activity.deletedAt ? `是 (${activity.deletedAt})` : '否'}`);
      console.log('');
    });

    // 檢查所有資料夾（包括已刪除的）
    console.log('\n\n📊 檢查所有資料夾（包括已刪除）:');
    const allFolders = await prisma.folder.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        userId: true,
        createdAt: true,
        deletedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // 按創建時間升序
      },
    });

    console.log(`總資料夾數: ${allFolders.length}\n`);
    allFolders.forEach((folder, index) => {
      console.log(`${index + 1}. ${folder.name} (${folder.type})`);
      console.log(`   ID: ${folder.id}`);
      console.log(`   用戶: ${folder.user.name} (${folder.user.email})`);
      console.log(`   創建時間: ${folder.createdAt}`);
      console.log(`   已刪除: ${folder.deletedAt ? `是 (${folder.deletedAt})` : '否'}`);
      console.log('');
    });

    // 檢查所有課業分配
    console.log('\n\n📊 檢查所有課業分配:');
    const allAssignments = await prisma.assignment.findMany({
      select: {
        id: true,
        title: true,
        activityId: true,
        createdAt: true,
        activity: {
          select: {
            title: true,
            userId: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`總課業分配數: ${allAssignments.length}\n`);
    allAssignments.forEach((assignment, index) => {
      console.log(`${index + 1}. ${assignment.title}`);
      console.log(`   ID: ${assignment.id}`);
      console.log(`   活動: ${assignment.activity.title}`);
      console.log(`   用戶: ${assignment.activity.user.name} (${assignment.activity.user.email})`);
      console.log(`   創建時間: ${assignment.createdAt}`);
      console.log(`   結果數: ${assignment._count.results}`);
      console.log('');
    });

    // 檢查所有課業結果
    console.log('\n\n📊 檢查所有課業結果:');
    const allResults = await prisma.assignmentResult.findMany({
      select: {
        id: true,
        customTitle: true,
        resultNumber: true,
        assignmentId: true,
        createdAt: true,
        assignment: {
          select: {
            title: true,
            activity: {
              select: {
                userId: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`總課業結果數: ${allResults.length}\n`);
    allResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.customTitle || `結果${result.resultNumber}`}`);
      console.log(`   ID: ${result.id}`);
      console.log(`   課業: ${result.assignment.title}`);
      console.log(`   用戶: ${result.assignment.activity.user.name} (${result.assignment.activity.user.email})`);
      console.log(`   創建時間: ${result.createdAt}`);
      console.log(`   參與者數: ${result._count.participants}`);
      console.log('');
    });

    // 檢查所有遊戲參與者
    console.log('\n\n📊 檢查所有遊戲參與者:');
    const allParticipants = await prisma.gameParticipant.findMany({
      select: {
        id: true,
        studentName: true,
        score: true,
        completedAt: true,
        result: {
          select: {
            assignment: {
              select: {
                title: true,
                activity: {
                  select: {
                    title: true,
                    user: {
                      select: {
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'asc',
      },
      take: 50,
    });

    console.log(`總遊戲參與者數: ${allParticipants.length}\n`);
    allParticipants.forEach((participant, index) => {
      console.log(`${index + 1}. ${participant.studentName}`);
      console.log(`   ID: ${participant.id}`);
      console.log(`   分數: ${participant.score}`);
      console.log(`   課業: ${participant.result.assignment.title}`);
      console.log(`   活動: ${participant.result.assignment.activity.title}`);
      console.log(`   教師: ${participant.result.assignment.activity.user.name}`);
      console.log(`   完成時間: ${participant.completedAt}`);
      console.log('');
    });

    // 統計摘要
    console.log('\n\n📊 數據統計摘要:');
    console.log(`總用戶數: ${allUsers.length}`);
    console.log(`總活動數: ${allActivities.length}`);
    console.log(`  - 未刪除: ${allActivities.filter(a => !a.deletedAt).length}`);
    console.log(`  - 已刪除: ${allActivities.filter(a => a.deletedAt).length}`);
    console.log(`總資料夾數: ${allFolders.length}`);
    console.log(`  - 未刪除: ${allFolders.filter(f => !f.deletedAt).length}`);
    console.log(`  - 已刪除: ${allFolders.filter(f => f.deletedAt).length}`);
    console.log(`總課業分配數: ${allAssignments.length}`);
    console.log(`總課業結果數: ${allResults.length}`);
    console.log(`總遊戲參與者數: ${allParticipants.length}`);

    console.log('\n✅ 所有數據檢查完成！');
  } catch (error) {
    console.error('❌ 數據檢查失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();

