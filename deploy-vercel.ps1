# EduCreate Vercel Deploy Script
Write-Host "Starting EduCreate Vercel deployment..." -ForegroundColor Green
Write-Host ""

# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Check environment
Write-Host "Checking environment..." -ForegroundColor Cyan
Write-Host "Node.js version:"
node --version
Write-Host "npm version:"
npm --version
Write-Host ""

# Check Vercel CLI
Write-Host "Checking Vercel CLI..." -ForegroundColor Cyan
vercel --version
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install
Write-Host ""

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate
Write-Host ""

# Start deployment
Write-Host "Starting deployment to Vercel production..." -ForegroundColor Green
vercel --prod

Write-Host ""
Write-Host "Deployment script completed!" -ForegroundColor Green
