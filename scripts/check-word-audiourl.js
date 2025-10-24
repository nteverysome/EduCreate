const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWordAudioUrl() {
  try {
    const progress = await prisma.userWordProgress.findFirst({
      where: {
        userId: 'cmgt4vj1y0000jr0434tf8ipd'
      },
      include: {
        word: true
      }
    });

    console.log('Sample word:', JSON.stringify(progress, null, 2));

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWordAudioUrl();

