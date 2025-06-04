@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo    PostgreSQL 服務檢查和啟動工具
echo ==========================================
echo.

echo 🔍 檢查 PostgreSQL 服務狀態...
echo.

REM 檢查常見的 PostgreSQL 服務名稱
echo 📋 檢查 postgresql-x64-14 服務...
sc query postgresql-x64-14 2>nul
if %errorlevel% == 0 (
    echo ✅ 找到 postgresql-x64-14 服務
    sc query postgresql-x64-14 | findstr "STATE"
) else (
    echo ❌ 未找到 postgresql-x64-14 服務
)
echo.

echo 📋 檢查 postgresql-x64-13 服務...
sc query postgresql-x64-13 2>nul
if %errorlevel% == 0 (
    echo ✅ 找到 postgresql-x64-13 服務
    sc query postgresql-x64-13 | findstr "STATE"
) else (
    echo ❌ 未找到 postgresql-x64-13 服務
)
echo.

echo 📋 檢查 postgresql-x64-15 服務...
sc query postgresql-x64-15 2>nul
if %errorlevel% == 0 (
    echo ✅ 找到 postgresql-x64-15 服務
    sc query postgresql-x64-15 | findstr "STATE"
) else (
    echo ❌ 未找到 postgresql-x64-15 服務
)
echo.

echo 📋 檢查通用 postgresql 服務...
sc query postgresql 2>nul
if %errorlevel% == 0 (
    echo ✅ 找到 postgresql 服務
    sc query postgresql | findstr "STATE"
) else (
    echo ❌ 未找到 postgresql 服務
)
echo.

echo 🔧 嘗試啟動 PostgreSQL 服務...
echo.

REM 嘗試啟動最常見的服務
echo 📋 嘗試啟動 postgresql-x64-14...
net start postgresql-x64-14 2>nul
if %errorlevel% == 0 (
    echo ✅ postgresql-x64-14 啟動成功
    goto :success
) else (
    echo ⚠️  postgresql-x64-14 啟動失敗或已在運行
)
echo.

echo 📋 嘗試啟動 postgresql-x64-13...
net start postgresql-x64-13 2>nul
if %errorlevel% == 0 (
    echo ✅ postgresql-x64-13 啟動成功
    goto :success
) else (
    echo ⚠️  postgresql-x64-13 啟動失敗或已在運行
)
echo.

echo 📋 嘗試啟動 postgresql-x64-15...
net start postgresql-x64-15 2>nul
if %errorlevel% == 0 (
    echo ✅ postgresql-x64-15 啟動成功
    goto :success
) else (
    echo ⚠️  postgresql-x64-15 啟動失敗或已在運行
)
echo.

echo 📋 嘗試啟動 postgresql...
net start postgresql 2>nul
if %errorlevel% == 0 (
    echo ✅ postgresql 啟動成功
    goto :success
) else (
    echo ⚠️  postgresql 啟動失敗或已在運行
)
echo.

:success
echo 🔍 檢查端口 5432 是否被使用...
netstat -an | findstr :5432
if %errorlevel% == 0 (
    echo ✅ 端口 5432 正在使用中（PostgreSQL 可能正在運行）
) else (
    echo ❌ 端口 5432 未被使用
)
echo.

echo 💡 故障排除建議:
echo ==========================================
echo.
echo 如果 PostgreSQL 服務無法啟動:
echo 1. 檢查 PostgreSQL 是否已安裝
echo 2. 檢查服務名稱是否正確
echo 3. 以管理員身份運行此腳本
echo 4. 檢查 PostgreSQL 安裝目錄
echo 5. 查看 Windows 事件日誌中的錯誤
echo.
echo 如果仍有問題:
echo 1. 重新安裝 PostgreSQL
echo 2. 檢查防火牆設置
echo 3. 確保端口 5432 未被其他程序佔用
echo.
echo 測試數據庫連接:
echo npx prisma db pull
echo.
pause