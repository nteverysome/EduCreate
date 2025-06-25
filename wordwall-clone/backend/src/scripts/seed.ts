import { PrismaClient, UserRole, TemplateType, SubscriptionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 開始插入種子數據...');

  // 清理現有數據 (開發環境)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 清理現有數據...');
    await prisma.activityLike.deleteMany();
    await prisma.activityShare.deleteMany();
    await prisma.assignmentSubmission.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.gameResult.deleteMany();
    await prisma.gameSession.deleteMany();
    await prisma.activityVersion.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.templateCategoryRelation.deleteMany();
    await prisma.templateCategory.deleteMany();
    await prisma.template.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
    await prisma.systemSetting.deleteMany();
  }

  // 創建系統設置
  console.log('⚙️ 創建系統設置...');
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'site_name',
        value: 'Wordwall Clone',
        description: '網站名稱',
        isPublic: true,
      },
      {
        key: 'site_description',
        value: '創建互動式教育遊戲的平台',
        description: '網站描述',
        isPublic: true,
      },
      {
        key: 'max_file_size',
        value: 10485760, // 10MB
        description: '最大文件上傳大小 (bytes)',
        isPublic: false,
      },
      {
        key: 'allowed_file_types',
        value: ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav'],
        description: '允許的文件類型',
        isPublic: false,
      },
      {
        key: 'enable_registration',
        value: true,
        description: '是否允許用戶註冊',
        isPublic: true,
      },
    ],
  });

  // 創建模板分類
  console.log('📂 創建模板分類...');
  const categories = await prisma.templateCategory.createMany({
    data: [
      {
        name: '測驗遊戲',
        description: '各種測驗和問答遊戲',
        color: '#3B82F6',
        icon: 'quiz',
        sortOrder: 1,
      },
      {
        name: '配對遊戲',
        description: '拖拽和配對類遊戲',
        color: '#10B981',
        icon: 'match',
        sortOrder: 2,
      },
      {
        name: '分類遊戲',
        description: '分組和排序類遊戲',
        color: '#F59E0B',
        icon: 'sort',
        sortOrder: 3,
      },
      {
        name: '記憶遊戲',
        description: '記憶和學習類遊戲',
        color: '#8B5CF6',
        icon: 'memory',
        sortOrder: 4,
      },
      {
        name: '互動遊戲',
        description: '互動和娛樂類遊戲',
        color: '#EF4444',
        icon: 'interactive',
        sortOrder: 5,
      },
    ],
  });

  // 創建遊戲模板
  console.log('🎮 創建遊戲模板...');
  const templates = await prisma.template.createMany({
    data: [
      {
        name: 'Quiz',
        type: TemplateType.QUIZ,
        description: '多選題測驗遊戲，支持圖片和音頻',
        iconUrl: '/icons/quiz.svg',
        config: {
          maxQuestions: 20,
          questionTypes: ['multiple_choice', 'true_false'],
          supportMedia: ['image', 'audio'],
          features: ['timer', 'scoring', 'feedback'],
        },
        defaultSettings: {
          timeLimit: 300,
          randomOrder: false,
          showCorrectAnswer: true,
          allowRetry: false,
          showScore: true,
        },
        isActive: true,
        isPremium: false,
        sortOrder: 1,
      },
      {
        name: 'Match Up',
        type: TemplateType.MATCH_UP,
        description: '拖拽配對遊戲，將相關項目配對',
        iconUrl: '/icons/match-up.svg',
        config: {
          maxPairs: 10,
          layoutTypes: ['grid', 'list', 'scattered'],
          supportMedia: ['image', 'text'],
          features: ['drag_drop', 'auto_check', 'hints'],
        },
        defaultSettings: {
          layout: 'grid',
          dragMode: 'snap',
          showHints: false,
          autoCheck: true,
        },
        isActive: true,
        isPremium: false,
        sortOrder: 2,
      },
      {
        name: 'Spin the Wheel',
        type: TemplateType.SPIN_WHEEL,
        description: '轉盤遊戲，隨機選擇答案或獎品',
        iconUrl: '/icons/spin-wheel.svg',
        config: {
          maxSegments: 12,
          customColors: true,
          supportMedia: ['text', 'image'],
          features: ['animation', 'sound', 'probability'],
        },
        defaultSettings: {
          spinDuration: 3000,
          showPointer: true,
          allowMultipleSpin: true,
          enableSound: true,
        },
        isActive: true,
        isPremium: false,
        sortOrder: 3,
      },
      {
        name: 'Group Sort',
        type: TemplateType.GROUP_SORT,
        description: '分組排序遊戲，將項目分類到正確組別',
        iconUrl: '/icons/group-sort.svg',
        config: {
          maxGroups: 6,
          maxItemsPerGroup: 10,
          supportMedia: ['text', 'image'],
          features: ['drag_drop', 'auto_sort', 'validation'],
        },
        defaultSettings: {
          maxItemsPerGroup: null,
          allowEmptyGroups: false,
          showGroupLabels: true,
          autoValidate: true,
        },
        isActive: true,
        isPremium: false,
        sortOrder: 4,
      },
      {
        name: 'Flash Cards',
        type: TemplateType.FLASH_CARDS,
        description: '記憶卡片遊戲，翻轉學習內容',
        iconUrl: '/icons/flash-cards.svg',
        config: {
          maxCards: 50,
          cardSides: 2,
          supportMedia: ['text', 'image', 'audio'],
          features: ['flip_animation', 'progress_tracking', 'shuffle'],
        },
        defaultSettings: {
          autoFlip: false,
          showProgress: true,
          shuffleCards: false,
          flipAnimation: 'slide',
        },
        isActive: true,
        isPremium: false,
        sortOrder: 5,
      },
      {
        name: 'Anagram',
        type: TemplateType.ANAGRAM,
        description: '字母重排遊戲，重新排列字母組成單詞',
        iconUrl: '/icons/anagram.svg',
        config: {
          maxWords: 20,
          difficultyLevels: ['easy', 'medium', 'hard'],
          supportMedia: ['text', 'image'],
          features: ['hints', 'timer', 'scoring'],
        },
        defaultSettings: {
          showHints: true,
          timeLimit: 60,
          caseSensitive: false,
          allowSkip: true,
        },
        isActive: true,
        isPremium: true,
        sortOrder: 6,
      },
      {
        name: 'Find the Match',
        type: TemplateType.FIND_MATCH,
        description: '找配對遊戲，在選項中找到正確配對',
        iconUrl: '/icons/find-match.svg',
        config: {
          maxPairs: 15,
          gridSizes: ['3x4', '4x4', '4x5', '5x6'],
          supportMedia: ['image', 'text'],
          features: ['memory_game', 'timer', 'attempts'],
        },
        defaultSettings: {
          gridSize: '4x4',
          timeLimit: 180,
          maxAttempts: null,
          showTimer: true,
        },
        isActive: true,
        isPremium: true,
        sortOrder: 7,
      },
      {
        name: 'Open the Box',
        type: TemplateType.OPEN_BOX,
        description: '開箱遊戲，點擊盒子揭示內容',
        iconUrl: '/icons/open-box.svg',
        config: {
          maxBoxes: 20,
          layoutTypes: ['grid', 'random'],
          supportMedia: ['text', 'image', 'audio'],
          features: ['animation', 'surprise', 'scoring'],
        },
        defaultSettings: {
          layout: 'grid',
          revealAnimation: 'bounce',
          allowMultipleOpen: true,
          showScore: false,
        },
        isActive: true,
        isPremium: true,
        sortOrder: 8,
      },
    ],
  });

  // 創建測試用戶
  console.log('👥 創建測試用戶...');
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@wordwall-clone.com',
      username: 'admin',
      passwordHash: hashedPassword,
      displayName: '系統管理員',
      role: UserRole.ADMIN,
      subscriptionType: SubscriptionType.SCHOOL,
      emailVerified: true,
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@wordwall-clone.com',
      username: 'teacher1',
      passwordHash: hashedPassword,
      displayName: '張老師',
      role: UserRole.TEACHER,
      subscriptionType: SubscriptionType.PREMIUM,
      emailVerified: true,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@wordwall-clone.com',
      username: 'student1',
      passwordHash: hashedPassword,
      displayName: '小明',
      role: UserRole.STUDENT,
      subscriptionType: SubscriptionType.FREE,
      emailVerified: true,
    },
  });

  // 獲取模板 ID
  const quizTemplate = await prisma.template.findFirst({
    where: { type: TemplateType.QUIZ },
  });

  const matchUpTemplate = await prisma.template.findFirst({
    where: { type: TemplateType.MATCH_UP },
  });

  // 創建示例活動
  console.log('📝 創建示例活動...');
  if (quizTemplate) {
    await prisma.activity.create({
      data: {
        userId: teacherUser.id,
        templateId: quizTemplate.id,
        title: '英語單字測驗',
        description: '測試基礎英語單字的理解',
        content: {
          questions: [
            {
              id: '1',
              text: 'What is the Chinese meaning of "apple"?',
              image: null,
              audio: null,
              options: [
                { id: 'a', text: '蘋果', isCorrect: true },
                { id: 'b', text: '香蕉', isCorrect: false },
                { id: 'c', text: '橘子', isCorrect: false },
                { id: 'd', text: '葡萄', isCorrect: false },
              ],
            },
            {
              id: '2',
              text: 'Which word means "書"?',
              image: null,
              audio: null,
              options: [
                { id: 'a', text: 'pen', isCorrect: false },
                { id: 'b', text: 'book', isCorrect: true },
                { id: 'c', text: 'desk', isCorrect: false },
                { id: 'd', text: 'chair', isCorrect: false },
              ],
            },
          ],
        },
        settings: {
          timeLimit: 300,
          randomOrder: false,
          showCorrectAnswer: true,
          allowRetry: true,
        },
        isPublic: true,
        tags: ['英語', '單字', '基礎'],
        language: 'zh-TW',
        difficultyLevel: 1,
        estimatedDuration: 300,
      },
    });
  }

  if (matchUpTemplate) {
    await prisma.activity.create({
      data: {
        userId: teacherUser.id,
        templateId: matchUpTemplate.id,
        title: '動物與聲音配對',
        description: '將動物與它們的叫聲配對',
        content: {
          pairs: [
            {
              id: '1',
              left: { type: 'text', content: '貓' },
              right: { type: 'text', content: '喵喵' },
            },
            {
              id: '2',
              left: { type: 'text', content: '狗' },
              right: { type: 'text', content: '汪汪' },
            },
            {
              id: '3',
              left: { type: 'text', content: '牛' },
              right: { type: 'text', content: '哞哞' },
            },
            {
              id: '4',
              left: { type: 'text', content: '羊' },
              right: { type: 'text', content: '咩咩' },
            },
          ],
        },
        settings: {
          layout: 'grid',
          dragMode: 'snap',
          showHints: false,
        },
        isPublic: true,
        tags: ['動物', '聲音', '配對'],
        language: 'zh-TW',
        difficultyLevel: 1,
        estimatedDuration: 180,
      },
    });
  }

  console.log('✅ 種子數據插入完成！');
  console.log(`👤 創建了 ${3} 個用戶`);
  console.log(`🎮 創建了 ${8} 個遊戲模板`);
  console.log(`📂 創建了 ${5} 個模板分類`);
  console.log(`📝 創建了 ${2} 個示例活動`);
  console.log(`⚙️ 創建了 ${5} 個系統設置`);
  
  console.log('\n🔑 測試用戶帳號:');
  console.log('管理員: admin@wordwall-clone.com / password123');
  console.log('教師: teacher@wordwall-clone.com / password123');
  console.log('學生: student@wordwall-clone.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ 種子數據插入失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
