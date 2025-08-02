const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================');
console.log('EduCreate Prisma 完整修复工具');
console.log('====================================\n');

// 1. 检查 Prisma Schema 文件
console.log('🔍 检查 Prisma Schema 文件...');
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
    console.log('✅ schema.prisma 文件存在');
    
    // 读取并验证 schema 内容
    try {
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        if (schemaContent.includes('generator client') && schemaContent.includes('datasource db')) {
            console.log('✅ schema.prisma 配置正确');
        } else {
            console.log('⚠️  schema.prisma 配置可能有问题');
        }
    } catch (error) {
        console.log('❌ 读取 schema.prisma 失败:', error.message);
    }
} else {
    console.log('❌ schema.prisma 文件不存在');
    console.log('正在创建基本的 schema.prisma 文件...');
    
    // 创建 prisma 目录
    const prismaDir = path.join(process.cwd(), 'prisma');
    if (!fs.existsSync(prismaDir)) {
        fs.mkdirSync(prismaDir, { recursive: true });
    }
    
    // 创建基本的 schema.prisma
    const basicSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
    
    fs.writeFileSync(schemaPath, basicSchema);
    console.log('✅ 已创建基本的 schema.prisma 文件');
}

// 2. 清理旧的 Prisma 客户端文件
console.log('\n🧹 清理旧的 Prisma 客户端文件...');
const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma');
const prismaModulePath = path.join(process.cwd(), 'node_modules', '@prisma', 'client');

try {
    if (fs.existsSync(prismaClientPath)) {
        fs.rmSync(prismaClientPath, { recursive: true, force: true });
        console.log('✅ 已清理 .prisma 目录');
    }
    
    if (fs.existsSync(prismaModulePath)) {
        fs.rmSync(prismaModulePath, { recursive: true, force: true });
        console.log('✅ 已清理 @prisma/client 目录');
    }
} catch (error) {
    console.log('⚠️  清理文件时出现问题:', error.message);
}

// 3. 重新生成 Prisma 客户端
console.log('\n🔄 重新生成 Prisma 客户端...');
try {
    execSync('npx prisma generate --schema=./prisma/schema.prisma', { 
        stdio: 'inherit',
        cwd: process.cwd()
    });
    console.log('✅ Prisma 客户端生成成功');
} catch (error) {
    console.log('❌ Prisma 客户端生成失败:', error.message);
    console.log('\n🔧 尝试替代方案...');
    
    try {
        // 尝试不指定 schema 路径
        execSync('npx prisma generate', { 
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log('✅ 使用默认路径生成成功');
    } catch (altError) {
        console.log('❌ 替代方案也失败了:', altError.message);
        console.log('\n📋 手动修复步骤:');
        console.log('1. 删除 node_modules 目录');
        console.log('2. 运行: npm install');
        console.log('3. 运行: npx prisma generate');
        console.log('4. 运行: npx prisma db push');
    }
}

// 4. 测试 Prisma 连接
console.log('\n🧪 测试 Prisma 连接...');
try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    prisma.$connect()
        .then(() => {
            console.log('✅ Prisma 连接成功');
            return prisma.$disconnect();
        })
        .catch(err => {
            console.log('❌ Prisma 连接失败:', err.message);
            if (err.message.includes('P1000')) {
                console.log('💡 这是数据库认证问题，请检查 .env 文件中的 DATABASE_URL');
            }
        });
} catch (error) {
    console.log('❌ 无法加载 Prisma 客户端:', error.message);
    console.log('💡 请先运行 npx prisma generate');
}

console.log('\n📋 修复完成！');
console.log('如果问题仍然存在，请尝试以下步骤：');
console.log('1. 运行: npm install');
console.log('2. 运行: npx prisma db push');
console.log('3. 运行: npm run dev');
console.log('4. 检查 PostgreSQL 服务是否运行');
console.log('5. 验证 .env 文件中的 DATABASE_URL');