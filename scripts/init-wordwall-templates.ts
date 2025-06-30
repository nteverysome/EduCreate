/**
 * 初始化 WordWall 遊戲模板到數據庫
 * 執行: npx ts-node scripts/init-wordwall-templates.ts
 */

import { PrismaClient } from '@prisma/client';
import { WordWallTemplateManager } from '../lib/wordwall/TemplateManager';

const prisma = new PrismaClient();

async function initializeWordWallTemplates() {
  console.log('🚀 開始初始化 WordWall 遊戲模板...\n');

  try {
    // 獲取所有模板
    const templates = WordWallTemplateManager.getAllTemplates();
    console.log(`📋 找到 ${templates.length} 個模板需要初始化`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const template of templates) {
      try {
        // 檢查模板是否已存在
        const existingTemplate = await prisma.gameTemplate.findUnique({
          where: { name: template.name }
        });

        if (existingTemplate) {
          // 更新現有模板
          await prisma.gameTemplate.update({
            where: { id: existingTemplate.id },
            data: {
              displayName: template.displayName,
              description: template.description,
              icon: template.icon,
              category: template.category,
              difficulty: template.difficulty,
              estimatedTime: template.estimatedTime,
              features: template.features,
              minItems: template.minItems,
              maxItems: template.maxItems,
              requiresEvenItems: template.requiresEvenItems,
              isPremium: template.isPremium,
              isActive: true,
              sortOrder: createdCount + updatedCount
            }
          });
          updatedCount++;
          console.log(`✅ 更新模板: ${template.displayName}`);
        } else {
          // 創建新模板
          await prisma.gameTemplate.create({
            data: {
              name: template.name,
              displayName: template.displayName,
              description: template.description,
              icon: template.icon,
              category: template.category,
              difficulty: template.difficulty,
              estimatedTime: template.estimatedTime,
              features: template.features,
              minItems: template.minItems,
              maxItems: template.maxItems,
              requiresEvenItems: template.requiresEvenItems,
              isPremium: template.isPremium,
              isActive: true,
              sortOrder: createdCount + updatedCount
            }
          });
          createdCount++;
          console.log(`🆕 創建模板: ${template.displayName}`);
        }
      } catch (error) {
        console.error(`❌ 處理模板 ${template.displayName} 失敗:`, error);
      }
    }

    // 初始化默認視覺主題
    await initializeDefaultThemes();

    console.log('\n🎉 WordWall 模板初始化完成！');
    console.log(`📊 統計: 創建 ${createdCount} 個，更新 ${updatedCount} 個模板`);

    // 顯示分類統計
    const stats = await getTemplateStats();
    console.log('\n📈 模板分類統計:');
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 個`);
    });

    console.log('\n🎯 難度分布:');
    Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
      console.log(`  ${difficulty}: ${count} 個`);
    });

  } catch (error) {
    console.error('❌ 初始化失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function initializeDefaultThemes() {
  console.log('\n🎨 初始化默認視覺主題...');

  const defaultThemes = [
    {
      name: 'classic',
      displayName: '經典主題',
      description: '簡潔的經典設計風格',
      category: 'CLASSIC',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      backgroundColor: '#ffffff',
      textColor: '#212529',
      isPremium: false,
      isActive: true,
      sortOrder: 0
    },
    {
      name: 'dark',
      displayName: '暗黑主題',
      description: '護眼的暗色調設計',
      category: 'MODERN',
      primaryColor: '#0d6efd',
      secondaryColor: '#6c757d',
      backgroundColor: '#212529',
      textColor: '#ffffff',
      isPremium: false,
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'colorful',
      displayName: '彩色主題',
      description: '活潑的彩色設計風格',
      category: 'COLORFUL',
      primaryColor: '#ff6b6b',
      secondaryColor: '#4ecdc4',
      backgroundColor: '#f8f9fa',
      textColor: '#495057',
      isPremium: true,
      isActive: true,
      sortOrder: 2
    }
  ];

  for (const theme of defaultThemes) {
    try {
      await prisma.visualTheme.upsert({
        where: { name: theme.name },
        update: theme,
        create: theme
      });
      console.log(`🎨 主題: ${theme.displayName}`);
    } catch (error) {
      console.error(`❌ 創建主題 ${theme.displayName} 失敗:`, error);
    }
  }
}

async function getTemplateStats() {
  const templates = await prisma.gameTemplate.findMany({
    where: { isActive: true }
  });

  const stats = {
    total: templates.length,
    byCategory: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    premium: {
      free: templates.filter(t => !t.isPremium).length,
      premium: templates.filter(t => t.isPremium).length
    }
  };

  // 統計分類
  templates.forEach(template => {
    stats.byCategory[template.category] = (stats.byCategory[template.category] || 0) + 1;
    stats.byDifficulty[template.difficulty] = (stats.byDifficulty[template.difficulty] || 0) + 1;
  });

  return stats;
}

// 執行初始化
if (require.main === module) {
  initializeWordWallTemplates()
    .then(() => {
      console.log('\n✅ 初始化腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 初始化腳本執行失敗:', error);
      process.exit(1);
    });
}

export { initializeWordWallTemplates };
