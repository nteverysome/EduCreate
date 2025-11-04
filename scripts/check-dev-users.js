const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-hidden-field-a8tai7gk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

(async () => {
  try {
    console.log('🔍 Checking Development Branch Users...\n');
    
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true }
    });
    
    console.log('Development Branch Users:');
    users.forEach(u => {
      console.log(`  - ${u.id}: ${u.name} (${u.email})`);
    });
    
    // Check activities for each user
    console.log('\n📊 Activities per user:');
    for (const user of users) {
      const activities = await prisma.activity.findMany({
        where: { userId: user.id, deletedAt: null },
        select: { id: true, title: true }
      });
      console.log(`  ${user.name} (${user.id}): ${activities.length} activities`);
    }
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();

