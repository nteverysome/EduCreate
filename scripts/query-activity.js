const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const activity = await prisma.activity.findUnique({
    where: { id: 'cmgwa35160001jo04y6elg5z8' },
    select: {
      id: true,
      title: true,
      thumbnailUrl: true,
      createdAt: true
    }
  });

  console.log('\n=== Activity Information ===');
  console.log(JSON.stringify(activity, null, 2));
  console.log('\n=== Thumbnail URL ===');
  console.log(activity?.thumbnailUrl || 'No thumbnail URL found');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

