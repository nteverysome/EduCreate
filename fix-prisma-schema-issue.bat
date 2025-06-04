@echo off
chcp 65001 >nul
echo ====================================
echo EduCreate Prisma Schema 修复工具
echo ====================================
echo.

echo 🔍 检查 Prisma Schema 文件...
if exist "prisma\schema.prisma" (
    echo ✅ schema.prisma 文件存在
) else (
    echo ❌ schema.prisma 文件不存在
    echo 正在创建基本的 schema.prisma 文件...
    mkdir prisma 2>nul
    echo generator client { > prisma\schema.prisma
    echo   provider = "prisma-client-js" >> prisma\schema.prisma
    echo } >> prisma\schema.prisma
    echo. >> prisma\schema.prisma
    echo datasource db { >> prisma\schema.prisma
    echo   provider = "postgresql" >> prisma\schema.prisma
    echo   url      = env("DATABASE_URL") >> prisma\schema.prisma
    echo } >> prisma\schema.prisma
    echo ✅ 已创建基本的 schema.prisma 文件
)

echo.
echo 🧹 清理旧的 Prisma 客户端文件...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma" 2>nul
    echo ✅ 已清理 .prisma 目录
)

if exist "node_modules\@prisma\client" (
    rmdir /s /q "node_modules\@prisma\client" 2>nul
    echo ✅ 已清理 @prisma/client 目录
)

echo.
echo 🔄 重新生成 Prisma 客户端...
npx prisma generate --schema=./prisma/schema.prisma
if %errorlevel% equ 0 (
    echo ✅ Prisma 客户端生成成功
) else (
    echo ❌ Prisma 客户端生成失败
    echo.
    echo 🔧 尝试替代方案...
    echo 1. 删除 node_modules 并重新安装依赖
    echo 2. 检查 PostgreSQL 服务是否运行
    echo 3. 验证 .env 文件中的 DATABASE_URL
)

echo.
echo 🧪 测试 Prisma 连接...
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => { console.log('✅ Prisma 连接成功'); prisma.$disconnect(); }).catch(err => { console.log('❌ Prisma 连接失败:', err.message); });"

echo.
echo 📋 修复完成！
echo 如果问题仍然存在，请尝试以下步骤：
echo 1. 运行: npm install
echo 2. 运行: npx prisma db push
echo 3. 运行: npm run dev
echo.
pause