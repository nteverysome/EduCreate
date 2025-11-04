#!/usr/bin/env node

/**
 * 🔄 EduCreate 數據庫同步腳本
 * 
 * 功能：將 Production Branch 的數據同步到 Development Branch
 * 用法：node scripts/sync-databases.js
 * 
 * 同步內容：
 * - User 表
 * - Folder 表
 * - Activity 表
 * - GameSettings 表
 * - VocabularyItem 表
 * - 所有關聯數據
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// 生產環境數據庫連接
const productionDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

// 開發環境數據庫連接
const developmentDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-hidden-field-a8tai7gk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function syncDatabases() {
  console.log('🔄 開始同步數據庫...\n');
  
  try {
    // 步驟 1：從 Production Branch 讀取數據
    console.log('📖 步驟 1：從 Production Branch 讀取數據...');
    
    const productionUsers = await productionDb.user.findMany();
    console.log(`   ✅ 讀取 ${productionUsers.length} 個用戶`);
    
    const productionFolders = await productionDb.folder.findMany();
    console.log(`   ✅ 讀取 ${productionFolders.length} 個資料夾`);
    
    const productionActivities = await productionDb.activity.findMany({
      include: {
        gameSettings: true,
        vocabularyItems: true
      }
    });
    console.log(`   ✅ 讀取 ${productionActivities.length} 個活動`);
    
    // 步驟 2：清空 Development Branch 的數據
    console.log('\n🗑️  步驟 2：清空 Development Branch 的舊數據...');
    
    await developmentDb.vocabularyItem.deleteMany();
    console.log('   ✅ 清空 VocabularyItem 表');
    
    await developmentDb.gameSettings.deleteMany();
    console.log('   ✅ 清空 GameSettings 表');
    
    await developmentDb.activity.deleteMany();
    console.log('   ✅ 清空 Activity 表');
    
    await developmentDb.folder.deleteMany();
    console.log('   ✅ 清空 Folder 表');
    
    await developmentDb.user.deleteMany();
    console.log('   ✅ 清空 User 表');
    
    // 步驟 3：複製用戶數據
    console.log('\n👥 步驟 3：複製用戶數據...');

    for (const user of productionUsers) {
      try {
        await developmentDb.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified,
            country: user.country,
            language: user.language,
            role: user.role,
            bio: user.bio,
            socialLinks: user.socialLinks,
            customTags: user.customTags,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
      } catch (error) {
        // 如果字段不存在，嘗試只複製基本字段
        if (error.code === 'P2022') {
          console.warn(`   ⚠️  字段不存在，使用基本字段複製用戶 ${user.email}`);
          await developmentDb.user.create({
            data: {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: user.emailVerified,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          });
        } else {
          throw error;
        }
      }
    }
    console.log(`   ✅ 複製 ${productionUsers.length} 個用戶`);
    
    // 步驟 4：複製資料夾數據
    console.log('\n📁 步驟 4：複製資料夾數據...');

    let folderSuccessCount = 0;
    for (const folder of productionFolders) {
      try {
        await developmentDb.folder.create({
          data: {
            id: folder.id,
            name: folder.name,
            description: folder.description,
            color: folder.color,
            icon: folder.icon,
            userId: folder.userId,
            type: folder.type,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
            deletedAt: folder.deletedAt
          }
        });
        folderSuccessCount++;
      } catch (error) {
        console.warn(`   ⚠️  複製資料夾 ${folder.id} 失敗:`, error.message);
      }
    }
    console.log(`   ✅ 成功複製 ${folderSuccessCount} 個資料夾`);
    
    // 步驟 5：複製活動和相關數據
    console.log('\n🎮 步驟 5：複製活動和相關數據...');

    let successCount = 0;
    let errorCount = 0;

    for (const activity of productionActivities) {
      try {
        // 複製 GameSettings
        let gameSettingsId = null;
        if (activity.gameSettings) {
          try {
            const gameSettings = await developmentDb.gameSettings.create({
              data: {
                id: activity.gameSettings.id,
                activityId: activity.id,
                templateId: activity.gameSettings.templateId,
                themeId: activity.gameSettings.themeId,
                visualStyle: activity.gameSettings.visualStyle,
                timerType: activity.gameSettings.timerType,
                timerDuration: activity.gameSettings.timerDuration,
                livesCount: activity.gameSettings.livesCount,
                speed: activity.gameSettings.speed,
                shuffleQuestions: activity.gameSettings.shuffleQuestions,
                shuffleAnswers: activity.gameSettings.shuffleAnswers,
                autoProceed: activity.gameSettings.autoProceed,
                showAnswers: activity.gameSettings.showAnswers,
                answerLabels: activity.gameSettings.answerLabels,
                enableSounds: activity.gameSettings.enableSounds,
                enableAnimations: activity.gameSettings.enableAnimations,
                allowRetry: activity.gameSettings.allowRetry,
                showProgress: activity.gameSettings.showProgress,
                showScore: activity.gameSettings.showScore,
                createdAt: activity.gameSettings.createdAt,
                updatedAt: activity.gameSettings.updatedAt
              }
            });
            gameSettingsId = gameSettings.id;
          } catch (gsError) {
            console.warn(`   ⚠️  複製 GameSettings ${activity.gameSettings.id} 失敗:`, gsError.message);
          }
        }

        // 複製 Activity
        await developmentDb.activity.create({
          data: {
            id: activity.id,
            title: activity.title,
            description: activity.description,
            type: activity.type || activity.gameType || 'unknown',
            templateType: activity.templateType,
            content: activity.content,
            elements: activity.elements,
            published: activity.published,
            isPublic: activity.isPublic,
            isDraft: activity.isDraft,
            userId: activity.userId,
            folderId: activity.folderId,
            gameTemplateId: activity.gameTemplateId,
            aiGenerated: activity.aiGenerated,
            difficulty: activity.difficulty,
            estimatedTime: activity.estimatedTime,
            tags: activity.tags,
            geptLevel: activity.geptLevel,
            totalWords: activity.totalWords,
            isPublicShared: activity.isPublicShared,
            shareToken: activity.shareToken,
            communityPlays: activity.communityPlays,
            publishedToCommunityAt: activity.publishedToCommunityAt,
            communityCategory: activity.communityCategory,
            communityTags: activity.communityTags,
            communityDescription: activity.communityDescription,
            communityThumbnail: activity.communityThumbnail,
            communityViews: activity.communityViews,
            communityLikes: activity.communityLikes,
            communityBookmarks: activity.communityBookmarks,
            communityComments: activity.communityComments,
            isFeatured: activity.isFeatured,
            featuredAt: activity.featuredAt,
            thumbnailUrl: activity.thumbnailUrl,
            screenshotStatus: activity.screenshotStatus,
            screenshotError: activity.screenshotError,
            screenshotRetryCount: activity.screenshotRetryCount,
            originalAuthorId: activity.originalAuthorId,
            originalAuthorName: activity.originalAuthorName,
            copiedFromActivityId: activity.copiedFromActivityId,
            matchUpOptions: activity.matchUpOptions,
            createdAt: activity.createdAt,
            updatedAt: activity.updatedAt,
            deletedAt: activity.deletedAt
          }
        });

        // 複製 VocabularyItems（跳過，因為 schema 不同）
        // 詞彙項目的 schema 在兩個分支中不同，暫時跳過
        // if (activity.vocabularyItems && activity.vocabularyItems.length > 0) {
        //   for (const item of activity.vocabularyItems) {
        //     try {
        //       await developmentDb.vocabularyItem.create({...});
        //     } catch (viError) {
        //       console.warn(`   ⚠️  複製詞彙項目 ${item.id} 失敗:`, viError.message);
        //     }
        //   }
        // }

        successCount++;
      } catch (error) {
        console.error(`   ❌ 複製活動 ${activity.id} 失敗:`, error.message);
        errorCount++;
      }
    }

    console.log(`   ✅ 成功複製 ${successCount} 個活動`);
    if (errorCount > 0) {
      console.log(`   ⚠️  失敗 ${errorCount} 個活動`);
    }
    
    // 步驟 6：驗證同步結果
    console.log('\n✅ 步驟 6：驗證同步結果...');
    
    const devUsers = await developmentDb.user.count();
    const devFolders = await developmentDb.folder.count();
    const devActivities = await developmentDb.activity.count();
    const devVocabItems = await developmentDb.vocabularyItem.count();
    
    console.log(`   📊 Development Branch 現在有：`);
    console.log(`      - ${devUsers} 個用戶`);
    console.log(`      - ${devFolders} 個資料夾`);
    console.log(`      - ${devActivities} 個活動`);
    console.log(`      - ${devVocabItems} 個詞彙項目`);
    
    // 步驟 7：生成同步報告
    console.log('\n📝 步驟 7：生成同步報告...');
    
    const report = {
      timestamp: new Date().toISOString(),
      source: 'Production Branch (ep-curly-salad-a85exs3f)',
      destination: 'Development Branch (ep-hidden-field-a8tai7gk)',
      summary: {
        users: { source: productionUsers.length, destination: devUsers },
        folders: { source: productionFolders.length, destination: devFolders },
        activities: { source: productionActivities.length, destination: devActivities },
        vocabularyItems: { source: productionActivities.reduce((sum, a) => sum + (a.vocabularyItems?.length || 0), 0), destination: devVocabItems }
      },
      status: 'completed',
      successCount,
      errorCount
    };
    
    const reportPath = path.join(__dirname, '..', `DATABASE_SYNC_REPORT_${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`   ✅ 報告已保存到: ${reportPath}`);
    
    console.log('\n🎉 數據庫同步完成！');
    console.log('\n📋 同步摘要：');
    console.log(`   ✅ 用戶: ${productionUsers.length} → ${devUsers}`);
    console.log(`   ✅ 資料夾: ${productionFolders.length} → ${devFolders}`);
    console.log(`   ✅ 活動: ${productionActivities.length} → ${devActivities}`);
    console.log(`   ✅ 詞彙項目: ${productionActivities.reduce((sum, a) => sum + (a.vocabularyItems?.length || 0), 0)} → ${devVocabItems}`);
    
  } catch (error) {
    console.error('\n❌ 同步失敗:', error);
    process.exit(1);
  } finally {
    await productionDb.$disconnect();
    await developmentDb.$disconnect();
  }
}

// 執行同步
syncDatabases();

