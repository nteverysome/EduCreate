const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 檢查數據庫中的用戶和會話信息...\n');

    // 1. 查看所有用戶
    console.log('👥 數據庫中的所有用戶：');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    // 2. 查看活躍會話
    console.log('🔐 活躍會話：');
    const sessions = await prisma.session.findMany({
      where: {
        expires: {
          gt: new Date() // 未過期的會話
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        expires: 'desc'
      }
    });

    if (sessions.length === 0) {
      console.log('沒有找到活躍會話');
    } else {
      sessions.forEach((session, index) => {
        console.log(`${index + 1}. Session Token: ${session.sessionToken.substring(0, 20)}...`);
        console.log(`   User: ${session.user.name} (${session.user.email})`);
        console.log(`   User ID: ${session.user.id}`);
        console.log(`   Expires: ${session.expires.toISOString()}`);
        console.log('');
      });
    }

    // 3. 查看我們創建的測試數據
    console.log('📊 現有測試數據：');
    
    const activities = await prisma.activity.findMany({
      where: {
        title: {
          contains: 'E2E測試活動'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (activities.length === 0) {
      console.log('沒有找到測試活動');
    } else {
      console.log('找到的測試活動：');
      activities.forEach((activity, index) => {
        console.log(`${index + 1}. Activity: ${activity.title}`);
        console.log(`   ID: ${activity.id}`);
        console.log(`   Owner: ${activity.user.name} (${activity.user.email})`);
        console.log(`   Owner ID: ${activity.user.id}`);
        console.log('');
      });
    }

    const results = await prisma.assignmentResult.findMany({
      include: {
        assignment: {
          include: {
            activity: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (results.length === 0) {
      console.log('沒有找到測試結果');
    } else {
      console.log('找到的測試結果：');
      results.forEach((result, index) => {
        console.log(`${index + 1}. Result: ${result.id}`);
        console.log(`   Activity: ${result.assignment.activity.title}`);
        console.log(`   Owner: ${result.assignment.activity.user.name} (${result.assignment.activity.user.email})`);
        console.log(`   Owner ID: ${result.assignment.activity.user.id}`);
        console.log('');
      });
    }

    // 4. 建議
    console.log('💡 建議：');
    if (sessions.length > 0) {
      const activeUser = sessions[0].user;
      console.log(`為活躍會話用戶創建測試數據：${activeUser.name} (${activeUser.email})`);
      console.log(`用戶 ID: ${activeUser.id}`);
    } else if (users.length > 0) {
      const latestUser = users[0];
      console.log(`為最新用戶創建測試數據：${latestUser.name} (${latestUser.email})`);
      console.log(`用戶 ID: ${latestUser.id}`);
    } else {
      console.log('需要先創建用戶');
    }

  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  checkUsers()
    .then(() => {
      console.log('✅ 檢查完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 檢查失敗:', error);
      process.exit(1);
    });
}

module.exports = { checkUsers };
