const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSummary() {
  try {
    console.log('=== DATABASE SUMMARY ===\n');

    // Count users
    const userCount = await prisma.user.count();
    console.log(`Total Users: ${userCount}`);

    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log('\nAll Users:');
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
    });

    // Count activities
    const activityCount = await prisma.activity.count();
    const deletedActivityCount = await prisma.activity.count({
      where: { deletedAt: { not: null } },
    });
    console.log(`\nTotal Activities: ${activityCount}`);
    console.log(`  - Active: ${activityCount - deletedActivityCount}`);
    console.log(`  - Deleted: ${deletedActivityCount}`);

    // List all activities
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
        createdAt: 'asc',
      },
    });

    console.log('\nAll Activities:');
    activities.forEach((activity, i) => {
      console.log(`${i + 1}. ${activity.title}`);
      console.log(`   ID: ${activity.id}`);
      console.log(`   User: ${activity.user.name} (${activity.user.email})`);
      console.log(`   Created: ${activity.createdAt.toISOString()}`);
      console.log(`   Deleted: ${activity.deletedAt ? activity.deletedAt.toISOString() : 'No'}`);
    });

    // Count folders
    const folderCount = await prisma.folder.count();
    const deletedFolderCount = await prisma.folder.count({
      where: { deletedAt: { not: null } },
    });
    console.log(`\nTotal Folders: ${folderCount}`);
    console.log(`  - Active: ${folderCount - deletedFolderCount}`);
    console.log(`  - Deleted: ${deletedFolderCount}`);

    // Count assignments
    const assignmentCount = await prisma.assignment.count();
    console.log(`\nTotal Assignments: ${assignmentCount}`);

    // Count assignment results
    const resultCount = await prisma.assignmentResult.count();
    console.log(`Total Assignment Results: ${resultCount}`);

    // Count participants
    const participantCount = await prisma.gameParticipant.count();
    console.log(`Total Game Participants: ${participantCount}`);

    console.log('\n=== END OF SUMMARY ===');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSummary();

