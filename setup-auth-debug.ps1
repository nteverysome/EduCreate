Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NextAuth 設定與除錯腳本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. 檢查 Node.js 版本..." -ForegroundColor Yellow
node --version
Write-Host ""

Write-Host "2. 檢查 npm 版本..." -ForegroundColor Yellow
npm --version
Write-Host ""

Write-Host "3. 檢查環境變數..." -ForegroundColor Yellow
if ($env:DATABASE_URL) {
    Write-Host "✅ DATABASE_URL 已設定" -ForegroundColor Green
} else {
    Write-Host "❌ DATABASE_URL 未設定" -ForegroundColor Red
}

if ($env:NEXTAUTH_URL) {
    Write-Host "✅ NEXTAUTH_URL 已設定" -ForegroundColor Green
} else {
    Write-Host "❌ NEXTAUTH_URL 未設定" -ForegroundColor Red
}

if ($env:NEXTAUTH_SECRET) {
    Write-Host "✅ NEXTAUTH_SECRET 已設定" -ForegroundColor Green
} else {
    Write-Host "❌ NEXTAUTH_SECRET 未設定" -ForegroundColor Red
}
Write-Host ""

Write-Host "4. 安裝/更新依賴..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ 依賴安裝成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 依賴安裝失敗: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "5. 生成 Prisma Client..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "✅ Prisma Client 生成成功" -ForegroundColor Green
} catch {
    Write-Host "❌ Prisma Client 生成失敗: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "6. 推送資料庫 schema..." -ForegroundColor Yellow
try {
    npx prisma db push
    Write-Host "✅ 資料庫 schema 推送成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 資料庫 schema 推送失敗: $_" -ForegroundColor Red
    Write-Host "請檢查 PostgreSQL 是否正在運行" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "7. 執行資料庫 seed..." -ForegroundColor Yellow
try {
    npx prisma db seed
    Write-Host "✅ 資料庫 seed 執行成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 資料庫 seed 執行失敗: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "8. 執行診斷腳本..." -ForegroundColor Yellow
try {
    node quick-auth-diagnosis.js
    Write-Host "✅ 診斷腳本執行成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 診斷腳本執行失敗: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "設定完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "1. 在新的終端視窗執行: npm run dev" -ForegroundColor White
Write-Host "2. 訪問: http://localhost:3000/login" -ForegroundColor White
Write-Host ""
Write-Host "測試帳號:" -ForegroundColor Yellow
Write-Host "Email: admin@example.com" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "如果遇到問題，請檢查:" -ForegroundColor Yellow
Write-Host "- PostgreSQL 服務是否運行" -ForegroundColor White
Write-Host "- .env 檔案設定是否正確" -ForegroundColor White
Write-Host "- 瀏覽器控制台和服務器日誌" -ForegroundColor White
Write-Host ""
Read-Host "按 Enter 鍵結束"