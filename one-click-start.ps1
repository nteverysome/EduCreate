
Write-Host "=============================="
Write-Host "  EduCreate One-Click Starter" -ForegroundColor Cyan
Write-Host "=============================="
Write-Host ""
Write-Host "[START] Running full initialization and launch..." -ForegroundColor Green
Write-Host ""

# Step 1: Check Node.js and npm
Write-Host "[CHECK] Step 1: Checking Node.js environment..." -ForegroundColor Cyan
Write-Host "------------------------------"
$nodeVersion = node --version
$npmVersion = npm --version

if ($LASTEXITCODE -eq 0 -and $nodeVersion -and $npmVersion) {
    Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host "[OK] npm version: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js or npm is not installed." -ForegroundColor Red
    Write-Host "[TIP] Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Step 2: Check PostgreSQL
Write-Host "[CHECK] Step 2: Checking PostgreSQL connection..." -ForegroundColor Cyan
Write-Host "------------------------------"
psql -U postgres -c "SELECT version();"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] PostgreSQL connection successful." -ForegroundColor Green
} else {
    Write-Host "[ERROR] PostgreSQL connection failed." -ForegroundColor Red
    Read-Host "Ensure PostgreSQL is running, Press Enter to exit"
    exit 1
}

Write-Host ""

# Step 3: Create educreate database if it doesn't exist
Write-Host "[CHECK] Step 3: Creating educreate database if needed..." -ForegroundColor Cyan
Write-Host "------------------------------"
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'educreate'" | Out-String | Findstr "1" >$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[INFO] educreate database already exists." -ForegroundColor Yellow
} else {
    psql -U postgres -c "CREATE DATABASE educreate;"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] educreate database created successfully." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to create educreate database." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""

# Step 4: Install npm dependencies
Write-Host "[CHECK] Step 4: Installing npm dependencies..." -ForegroundColor Cyan
Write-Host "------------------------------"
if (-Not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] npm install failed." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "[OK] node_modules already exist." -ForegroundColor Green
}

Write-Host ""

# Step 5: Initialize Prisma
Write-Host "[CHECK] Step 5: Initializing Prisma..." -ForegroundColor Cyan
Write-Host "------------------------------"
npx prisma db push --accept-data-loss
npx prisma generate

Write-Host ""

# Step 6: Start development server
Write-Host "[CHECK] Step 6: Starting development server..." -ForegroundColor Cyan
Write-Host "------------------------------"
Write-Host "[APP] Please wait, starting..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/c npm run dev"
