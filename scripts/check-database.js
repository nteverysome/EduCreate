const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 開始檢查數據庫...\n');

    // 檢查用戶
    console.log('📊 檢查用戶數據:');
    const users = await prisma.user.findMany({
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
        createdAt: 'desc',
      },
      take: 10,
    });

    console.log(`總用戶數: ${users.length}\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   創建時間: ${user.createdAt}`);
      console.log(`   活動數: ${user._count.activities}`);
      console.log(`   資料夾數: ${user._count.folders}`);
      console.log('');
    });

    // 檢查特定用戶
    const targetUserId = 'cmgt4vj1y0000jr0434tf8ipd';
    console.log(`\n🎯 檢查特定用戶 (${targetUserId}):`);
    
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        _count: {
          select: {
            activities: true,
            folders: true,
          },
        },
      },
    });

    if (targetUser) {
      console.log(`✅ 用戶存在: ${targetUser.name} (${targetUser.email})`);
      console.log(`   活動數: ${targetUser._count.activities}`);
      console.log(`   資料夾數: ${targetUser._count.folders}`);
    } else {
      console.log(`❌ 用戶不存在`);
    }

    // 檢查所有活動
    console.log('\n\n📊 檢查活動數據:');
    const activities = await prisma.activity.findMany({
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
        createdAt: 'desc',
      },
      take: 20,
    });

    console.log(`總活動數: ${activities.length}\n`);
    activities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title}`);
      console.log(`   ID: ${activity.id}`);
      console.log(`   用戶: ${activity.user.name} (${activity.user.email})`);
      console.log(`   創建時間: ${activity.createdAt}`);
      console.log(`   已刪除: ${activity.deletedAt ? '是' : '否'}`);
      console.log('');
    });

    // 檢查特定用戶的活動
    console.log(`\n\n🎯 檢查特定用戶的活動 (${targetUserId}):`);
    const userActivities = await prisma.activity.findMany({
      where: {
        userId: targetUserId,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        deletedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`該用戶的活動數: ${userActivities.length}\n`);
    userActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title}`);
      console.log(`   ID: ${activity.id}`);
      console.log(`   創建時間: ${activity.createdAt}`);
      console.log(`   已刪除: ${activity.deletedAt ? '是' : '否'}`);
      console.log('');
    });

    // 檢查所有資料夾
    console.log('\n\n📊 檢查資料夾數據:');
    const folders = await prisma.folder.findMany({
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
        createdAt: 'desc',
      },
      take: 20,
    });

    console.log(`總資料夾數: ${folders.length}\n`);
    folders.forEach((folder, index) => {
      console.log(`${index + 1}. ${folder.name} (${folder.type})`);
      console.log(`   ID: ${folder.id}`);
      console.log(`   用戶: ${folder.user.name} (${folder.user.email})`);
      console.log(`   創建時間: ${folder.createdAt}`);
      console.log(`   已刪除: ${folder.deletedAt ? '是' : '否'}`);
      console.log('');
    });

    // 檢查特定用戶的資料夾
    console.log(`\n\n🎯 檢查特定用戶的資料夾 (${targetUserId}):`);
    const userFolders = await prisma.folder.findMany({
      where: {
        userId: targetUserId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        deletedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`該用戶的資料夾數: ${userFolders.length}\n`);
    userFolders.forEach((folder, index) => {
      console.log(`${index + 1}. ${folder.name} (${folder.type})`);
      console.log(`   ID: ${folder.id}`);
      console.log(`   創建時間: ${folder.createdAt}`);
      console.log(`   已刪除: ${folder.deletedAt ? '是' : '否'}`);
      console.log('');
    });

    console.log('\n✅ 數據庫檢查完成！');
  } catch (error) {
    console.error('❌ 數據庫檢查失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

