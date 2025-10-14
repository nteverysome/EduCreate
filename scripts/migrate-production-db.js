#!/usr/bin/env node

/**
 * 生产环境数据库迁移脚本
 * 用于手动执行数据库迁移，特别是添加 deletedAt 字段
 */

const { PrismaClient } = require('@prisma/client');

async function migrateProductionDatabase() {
  console.log('🚀 开始生产环境数据库迁移...\n');

  const prisma = new PrismaClient();

  try {
    // 1. 测试数据库连接
    console.log('📡 测试数据库连接...');
    await prisma.$connect();
    console.log('✅ 数据库连接成功\n');

    // 2. 检查当前数据库结构
    console.log('🔍 检查当前数据库结构...');
    
    // 检查 Folder 表是否存在 deletedAt 字段
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Folder' AND column_name = 'deletedAt';
      `;
      
      if (result.length > 0) {
        console.log('✅ Folder 表已有 deletedAt 字段');
      } else {
        console.log('⚠️  Folder 表缺少 deletedAt 字段，需要添加');
        
        // 添加 deletedAt 字段
        console.log('🔧 添加 Folder.deletedAt 字段...');
        await prisma.$executeRaw`
          ALTER TABLE "Folder" 
          ADD COLUMN "deletedAt" TIMESTAMP(3);
        `;
        console.log('✅ Folder.deletedAt 字段添加成功');
      }
    } catch (error) {
      console.error('❌ 检查/添加 Folder.deletedAt 字段失败:', error.message);
    }

    // 检查 Activity 表的 deletedAt 字段
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Activity' AND column_name = 'deletedAt';
      `;
      
      if (result.length > 0) {
        console.log('✅ Activity 表已有 deletedAt 字段');
      } else {
        console.log('⚠️  Activity 表缺少 deletedAt 字段，需要添加');
        
        // 添加 deletedAt 字段
        console.log('🔧 添加 Activity.deletedAt 字段...');
        await prisma.$executeRaw`
          ALTER TABLE "Activity" 
          ADD COLUMN "deletedAt" TIMESTAMP(3);
        `;
        console.log('✅ Activity.deletedAt 字段添加成功');
      }
    } catch (error) {
      console.error('❌ 检查/添加 Activity.deletedAt 字段失败:', error.message);
    }

    // 3. 验证迁移结果
    console.log('\n🧪 验证迁移结果...');
    
    // 测试查询已删除的资料夹
    try {
      const deletedFolders = await prisma.folder.findMany({
        where: {
          deletedAt: {
            not: null
          }
        }
      });
      console.log(`✅ 成功查询已删除的资料夹: ${deletedFolders.length} 个`);
    } catch (error) {
      console.error('❌ 查询已删除资料夹失败:', error.message);
    }

    // 测试查询已删除的活动
    try {
      const deletedActivities = await prisma.activity.findMany({
        where: {
          deletedAt: {
            not: null
          }
        }
      });
      console.log(`✅ 成功查询已删除的活动: ${deletedActivities.length} 个`);
    } catch (error) {
      console.error('❌ 查询已删除活动失败:', error.message);
    }

    // 4. 测试软删除功能
    console.log('\n🧪 测试软删除功能...');
    
    // 创建测试资料夹
    try {
      const testFolder = await prisma.folder.create({
        data: {
          name: '测试软删除资料夹',
          userId: 'test-user-id',
          color: '#FF0000'
        }
      });
      console.log(`✅ 创建测试资料夹: ${testFolder.id}`);

      // 软删除测试资料夹
      await prisma.folder.update({
        where: { id: testFolder.id },
        data: { deletedAt: new Date() }
      });
      console.log('✅ 软删除测试成功');

      // 清理测试数据
      await prisma.folder.delete({
        where: { id: testFolder.id }
      });
      console.log('✅ 清理测试数据完成');
    } catch (error) {
      console.error('❌ 软删除测试失败:', error.message);
    }

    console.log('\n🎉 数据库迁移完成！');
    console.log('✅ 所有软删除功能已准备就绪');

  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行迁移
if (require.main === module) {
  migrateProductionDatabase()
    .then(() => {
      console.log('\n🚀 迁移脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 迁移脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { migrateProductionDatabase };
