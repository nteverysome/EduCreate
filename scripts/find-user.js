const { PrismaClient } = require('@prisma/client');

const userId = 'cmgt4vj1y0000jr0434tf8ipd';

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-hidden-field-a8tai7gk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

(async () => {
  try {
    console.log(`🔍 Looking for user: ${userId}\n`);
    
    // Check Production Branch
    console.log('📍 Checking Production Branch...');
    const prodUser = await prodPrisma.user.findUnique({
      where: { id: userId }
    });
    
    if (prodUser) {
      console.log(`  ✅ Found: ${prodUser.name} (${prodUser.email})`);
      const prodActivities = await prodPrisma.activity.findMany({
        where: { userId: userId, deletedAt: null }
      });
      console.log(`  📊 Activities: ${prodActivities.length}`);
    } else {
      console.log(`  ❌ Not found in Production Branch`);
    }
    
    // Check Development Branch
    console.log('\n📍 Checking Development Branch...');
    const devUser = await devPrisma.user.findUnique({
      where: { id: userId }
    });
    
    if (devUser) {
      console.log(`  ✅ Found: ${devUser.name} (${devUser.email})`);
      const devActivities = await devPrisma.activity.findMany({
        where: { userId: userId, deletedAt: null }
      });
      console.log(`  📊 Activities: ${devActivities.length}`);
    } else {
      console.log(`  ❌ Not found in Development Branch`);
    }
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prodPrisma.$disconnect();
    await devPrisma.$disconnect();
  }
})();

