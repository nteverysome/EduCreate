const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const audio = await prisma.tTSCache.findFirst({
    where: {
      text: 'a',
      language: 'en-US',
      voice: 'en-US-Neural2-D'
    }
  });
  console.log(audio.audioUrl);
  await prisma.$disconnect();
})();

