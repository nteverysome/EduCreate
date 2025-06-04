@echo off
chcp 65001 >nul
echo ==========================================
echo      PostgreSQL 狀態檢查
echo ==========================================
echo.

echo 🔍 檢查 PostgreSQL 服務...
sc query postgresql-x64-14 2>nul
if %errorlevel% equ 0 (
    echo ✅ 找到 PostgreSQL 14 服務
) else (
    echo ❌ 未找到 PostgreSQL 14 服務
    sc query postgresql-x64-15 2>nul
    if %errorlevel% equ 0 (
        echo ✅ 找到 PostgreSQL 15 服務
    ) else (
        echo ❌ 未找到 PostgreSQL 15 服務
        sc query postgresql-x64-16 2>nul
        if %errorlevel% equ 0 (
            echo ✅ 找到 PostgreSQL 16 服務
        ) else (
            echo ❌ 未找到 PostgreSQL 16 服務
            sc query postgresql-x64-17 2>nul
            if %errorlevel% equ 0 (
                echo ✅ 找到 PostgreSQL 17 服務
            ) else (
                echo ❌ 未找到任何 PostgreSQL 服務
            )
        )
    )
)

echo.
echo 🔍 檢查端口 5432...
netstat -an | findstr :5432
if %errorlevel% equ 0 (
    echo ✅ 端口 5432 正在使用
) else (
    echo ❌ 端口 5432 未使用
)

echo.
echo 🔍 檢查 PostgreSQL 安裝路徑...
if exist "C:\Program Files\PostgreSQL" (
    echo ✅ 找到 PostgreSQL 安裝目錄
    dir "C:\Program Files\PostgreSQL" /b
) else (
    echo ❌ 未找到 PostgreSQL 安裝目錄
)

echo.
echo 🔍 檢查 Chocolatey...
choco --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Chocolatey 已安裝
    choco --version
) else (
    echo ❌ Chocolatey 未安裝
)

echo.
echo 🔍 檢查 Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js 已安裝
    node --version
) else (
    echo ❌ Node.js 未安裝
)

echo.
echo 🔍 檢查 npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm 已安裝
    npm --version
) else (
    echo ❌ npm 未安裝
)

echo.
echo 🔍 檢查項目文件...
if exist "package.json" (
    echo ✅ 找到 package.json
) else (
    echo ❌ 未找到 package.json
)

if exist "prisma\schema.prisma" (
    echo ✅ 找到 Prisma schema
) else (
    echo ❌ 未找到 Prisma schema
)

if exist ".env.local" (
    echo ✅ 找到 .env.local
) else (
    echo ❌ 未找到 .env.local
)

echo.
echo ==========================================
echo 檢查完成！請查看上述結果。
echo ==========================================
echo.
pause