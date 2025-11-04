#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkActivity() {
    try {
        const activityId = 'cmh93tjuh0001l404hszkdf94';
        
        console.log(`🔍 檢查活動: ${activityId}\n`);
        
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        if (!activity) {
            console.log('❌ 活動不存在');
            return;
        }
        
        console.log('✅ 活動信息:');
        console.log(`   ID: ${activity.id}`);
        console.log(`   標題: ${activity.title}`);
        console.log(`   創建者: ${activity.user.email}`);
        console.log(`   是否公開: ${activity.isPublic}`);
        console.log(`   創建時間: ${activity.createdAt}`);
        console.log(`   更新時間: ${activity.updatedAt}`);
        console.log('');
        
        if (!activity.isPublic) {
            console.log('⚠️  活動不是公開的，需要設置為公開');
            console.log('');
            console.log('🔧 正在設置活動為公開...');
            
            const updated = await prisma.activity.update({
                where: { id: activityId },
                data: { isPublic: true }
            });
            
            console.log('✅ 活動已設置為公開');
            console.log(`   是否公開: ${updated.isPublic}`);
        } else {
            console.log('✅ 活動已是公開的');
        }
        
    } catch (error) {
        console.error('❌ 錯誤:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkActivity();

