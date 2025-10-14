const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🚀 開始創建測試數據...');

    // 1. 查找最新的用戶（通常是當前活躍的演示用戶）
    console.log('🔍 查找最新的演示用戶...');

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // 取最新的5個用戶
    });

    console.log(`找到 ${users.length} 個用戶：`);
    users.forEach((u, index) => {
      console.log(`${index + 1}. ${u.name} (${u.email}) - ID: ${u.id} - Created: ${u.createdAt.toISOString()}`);
    });

    // 使用最新的用戶（通常是當前登入的用戶）
    const user = users[0];
    if (!user) {
      throw new Error('沒有找到任何用戶，請先登入系統');
    }

    console.log(`✅ 選擇用戶: ${user.name} (${user.email}) - ID: ${user.id}`);

    // 2. 創建測試活動
    console.log('📝 創建測試活動...');
    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        title: 'E2E測試活動 - 可共用結果連結演示',
        description: '用於測試可共用結果連結功能的演示活動',
        type: 'vocabulary_game',
        templateType: 'vocabulary',
        content: {
          gameTemplateId: 'shimozurdo-game',
          vocabularyItems: [
            { english: 'Dog', chinese: '狗' },
            { english: 'Cat', chinese: '貓' },
            { english: 'Apple', chinese: '蘋果' }
          ]
        },
        elements: [
          { english: 'Dog', chinese: '狗' },
          { english: 'Cat', chinese: '貓' },
          { english: 'Apple', chinese: '蘋果' }
        ],
        published: true,
        isPublic: false,
        isDraft: false,
        playCount: 0,
        shareCount: 0,
        difficulty: 'EASY',
        estimatedTime: '5-10 分鐘',
        geptLevel: 'ELEMENTARY',
        totalWords: 3,
        tags: ['測試', '演示', 'E2E']
      }
    });
    console.log('✅ 測試活動創建成功:', activity.id);

    // 3. 創建詞彙項目
    console.log('📝 創建詞彙項目...');
    const vocabularyItems = await Promise.all([
      prisma.vocabularyItem.create({
        data: {
          activityId: activity.id,
          english: 'Dog',
          chinese: '狗',
          phonetic: 'dɔːɡ',
          difficultyLevel: 1
        }
      }),
      prisma.vocabularyItem.create({
        data: {
          activityId: activity.id,
          english: 'Cat',
          chinese: '貓',
          phonetic: 'kæt',
          difficultyLevel: 1
        }
      }),
      prisma.vocabularyItem.create({
        data: {
          activityId: activity.id,
          english: 'Apple',
          chinese: '蘋果',
          phonetic: 'ˈæpəl',
          difficultyLevel: 1
        }
      })
    ]);
    console.log('✅ 詞彙項目創建成功:', vocabularyItems.length, '個');

    // 4. 創建課業分配
    console.log('📝 創建課業分配...');
    const assignment = await prisma.assignment.create({
      data: {
        activityId: activity.id,
        title: `${activity.title} - 課業分配`,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天後
        registrationType: 'NAME',
        status: 'ACTIVE',
        gameEndSettings: {
          allowRetry: true,
          showCorrectAnswers: true,
          randomizeQuestions: false
        }
      }
    });
    console.log('✅ 課業分配創建成功:', assignment.id);

    // 5. 創建結果記錄
    console.log('📝 創建結果記錄...');
    const result = await prisma.assignmentResult.create({
      data: {
        assignmentId: assignment.id,
        resultNumber: 1,
        status: 'ACTIVE'
      }
    });
    console.log('✅ 結果記錄創建成功:', result.id);

    // 6. 創建測試參與者數據
    console.log('📝 創建測試參與者數據...');
    const participants = await Promise.all([
      prisma.gameParticipant.create({
        data: {
          resultId: result.id,
          studentName: '測試學生王小華',
          score: 67, // 2/3 = 67%
          timeSpent: 120, // 2分鐘
          correctAnswers: 2,
          totalQuestions: 3,
          gameData: {
            questions: [
              {
                questionNumber: 1,
                questionText: 'Dog',
                correctAnswer: '狗',
                studentAnswer: '狗',
                isCorrect: true,
                timeSpent: 30
              },
              {
                questionNumber: 2,
                questionText: 'Cat',
                correctAnswer: '貓',
                studentAnswer: '貓',
                isCorrect: true,
                timeSpent: 45
              },
              {
                questionNumber: 3,
                questionText: 'Apple',
                correctAnswer: '蘋果',
                studentAnswer: '水果',
                isCorrect: false,
                timeSpent: 45
              }
            ],
            totalScore: 67,
            completionTime: 120
          }
        }
      }),
      prisma.gameParticipant.create({
        data: {
          resultId: result.id,
          studentName: '測試學生李小明',
          score: 100, // 3/3 = 100%
          timeSpent: 90, // 1.5分鐘
          correctAnswers: 3,
          totalQuestions: 3,
          gameData: {
            questions: [
              {
                questionNumber: 1,
                questionText: 'Dog',
                correctAnswer: '狗',
                studentAnswer: '狗',
                isCorrect: true,
                timeSpent: 25
              },
              {
                questionNumber: 2,
                questionText: 'Cat',
                correctAnswer: '貓',
                studentAnswer: '貓',
                isCorrect: true,
                timeSpent: 30
              },
              {
                questionNumber: 3,
                questionText: 'Apple',
                correctAnswer: '蘋果',
                studentAnswer: '蘋果',
                isCorrect: true,
                timeSpent: 35
              }
            ],
            totalScore: 100,
            completionTime: 90
          }
        }
      })
    ]);
    console.log('✅ 測試參與者創建成功:', participants.length, '個');

    console.log('\n🎉 測試數據創建完成！');
    console.log('📊 創建的數據：');
    console.log(`- 用戶: ${user.name} (${user.email})`);
    console.log(`- 活動: ${activity.title} (${activity.id})`);
    console.log(`- 詞彙項目: ${vocabularyItems.length} 個`);
    console.log(`- 課業分配: ${assignment.id}`);
    console.log(`- 結果記錄: ${result.id}`);
    console.log(`- 參與者: ${participants.length} 個`);
    console.log(`\n🔗 測試連結:`);
    console.log(`- 我的活動: https://edu-create.vercel.app/my-activities`);
    console.log(`- 我的結果: https://edu-create.vercel.app/my-results`);
    console.log(`- 結果詳情: https://edu-create.vercel.app/my-results/${result.id}`);
    console.log(`- 學生遊戲: https://edu-create.vercel.app/play/${activity.id}/${assignment.id}`);

    return {
      user,
      activity,
      vocabularyItems,
      assignment,
      result,
      participants
    };

  } catch (error) {
    console.error('❌ 創建測試數據失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  createTestData()
    .then(() => {
      console.log('✅ 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = { createTestData };
