const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('=== DATABASE CONNECTION TEST ===\n');
    
    // 測試連接
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected successfully\n');
    
    // 獲取數據庫信息
    console.log('2. Getting database information...');
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as "user",
        version() as version
    `;
    console.log('   Database:', dbInfo[0].database);
    console.log('   User:', dbInfo[0].user);
    console.log('   Version:', dbInfo[0].version.split('\n')[0]);
    console.log('');
    
    // 檢查表是否存在
    console.log('3. Checking tables...');
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log(`   Found ${tables.length} tables:`);
    tables.forEach((table, i) => {
      console.log(`   ${i + 1}. ${table.tablename}`);
    });
    console.log('');
    
    // 檢查數據統計
    console.log('4. Checking data statistics...');
    
    const userCount = await prisma.user.count();
    console.log(`   Users: ${userCount}`);
    
    const activityCount = await prisma.activity.count();
    const activeActivityCount = await prisma.activity.count({
      where: { deletedAt: null },
    });
    console.log(`   Activities: ${activityCount} (${activeActivityCount} active, ${activityCount - activeActivityCount} deleted)`);
    
    const folderCount = await prisma.folder.count();
    const activeFolderCount = await prisma.folder.count({
      where: { deletedAt: null },
    });
    console.log(`   Folders: ${folderCount} (${activeFolderCount} active, ${folderCount - activeFolderCount} deleted)`);
    
    const assignmentCount = await prisma.assignment.count();
    console.log(`   Assignments: ${assignmentCount}`);
    
    const resultCount = await prisma.assignmentResult.count();
    console.log(`   Assignment Results: ${resultCount}`);
    
    const participantCount = await prisma.gameParticipant.count();
    console.log(`   Game Participants: ${participantCount}`);
    console.log('');
    
    // 檢查最早的記錄
    console.log('5. Checking earliest records...');
    
    const earliestUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
      select: {
        name: true,
        email: true,
        createdAt: true,
      },
    });
    if (earliestUser) {
      console.log(`   Earliest User: ${earliestUser.name} (${earliestUser.email})`);
      console.log(`   Created: ${earliestUser.createdAt.toISOString()}`);
    }
    
    const earliestActivity = await prisma.activity.findFirst({
      orderBy: { createdAt: 'asc' },
      select: {
        title: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    if (earliestActivity) {
      console.log(`   Earliest Activity: ${earliestActivity.title}`);
      console.log(`   Created: ${earliestActivity.createdAt.toISOString()}`);
      console.log(`   By: ${earliestActivity.user.name}`);
    } else {
      console.log('   No activities found');
    }
    console.log('');
    
    // 檢查數據庫大小
    console.log('6. Checking database size...');
    const dbSize = await prisma.$queryRaw`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as size
    `;
    console.log(`   Database Size: ${dbSize[0].size}`);
    console.log('');
    
    // 檢查連接信息
    console.log('7. Connection information...');
    const connectionInfo = await prisma.$queryRaw`
      SELECT 
        inet_server_addr() as server_ip,
        inet_server_port() as server_port,
        current_setting('server_version') as server_version
    `;
    console.log(`   Server IP: ${connectionInfo[0].server_ip || 'N/A'}`);
    console.log(`   Server Port: ${connectionInfo[0].server_port || 'N/A'}`);
    console.log(`   Server Version: ${connectionInfo[0].server_version}`);
    console.log('');
    
    console.log('=== TEST COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

