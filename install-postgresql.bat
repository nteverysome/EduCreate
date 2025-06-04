@echo off
chcp 65001 >nul
echo ==========================================
echo      PostgreSQL 一鍵安裝工具
echo ==========================================
echo.
echo 正在啟動 PostgreSQL 自動安裝腳本...
echo.
pause

REM 以管理員權限運行 PowerShell 腳本
powershell -Command "Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File "%~dp0install-postgresql-auto.ps1"' -Verb RunAs"

echo.
echo 安裝腳本已啟動，請查看 PowerShell 窗口中的進度。
echo.
pause