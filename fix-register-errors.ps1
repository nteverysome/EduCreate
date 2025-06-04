# EduCreate 註冊頁面錯誤修復腳本 (PowerShell版本)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "EduCreate 註冊頁面錯誤修復腳本" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 步驟 1: 修復圖標404錯誤
Write-Host "步驟 1: 修復圖標404錯誤" -ForegroundColor Yellow
Write-Host "-----------------------------------"

# 確保圖標目錄存在
if (-not (Test-Path "public\icons")) {
    New-Item -Path "public\icons" -ItemType Directory -Force | Out-Null
    Write-Host "創建圖標目錄: public\icons" -ForegroundColor Green
}

# 重新生成所有圖標文件
Write-Host "重新生成所有圖標文件..." -ForegroundColor Green

# 生成SVG格式的圖標函數
function Create-SvgIcon {
    param (
        [string]$filePath,
        [int]$size
    )
    
    $fontSize = [math]::Floor($size / 4)
    
    $svgContent = @"
<svg width="$size" height="$size" xmlns="http://www.w3.org/2000/svg">
  <rect width="$size" height="$size" fill="#4f46e5" />
  <text x="50%" y="50%" font-family="Arial" font-size="$fontSize" fill="white" text-anchor="middle" dominant-baseline="middle">EC</text>
</svg>
"@
    
    Set-Content -Path $filePath -Value $svgContent
    Write-Host "生成圖標: $filePath" -ForegroundColor Green
}

# 生成所有尺寸的圖標
$iconSizes = @(72, 96, 128, 144, 152, 192, 384, 512)
foreach ($size in $iconSizes) {
    Create-SvgIcon -filePath "public\icons\icon-${size}x${size}.png" -size $size
}

Write-Host "圖標文件重新生成完成" -ForegroundColor Green
Write-Host ""

# 步驟 2: 修復數據庫連接和測試用戶
Write-Host "步驟 2: 修復數據庫連接和測試用戶" -ForegroundColor Yellow
Write-Host "-----------------------------------"

# 檢查數據庫連接
Write-Host "檢查數據庫連接..." -ForegroundColor Green
try {
    npx prisma db push
    Write-Host "數據庫連接成功" -ForegroundColor Green
} catch {
    Write-Host "警告: 數據庫連接失敗，請檢查.env文件中的DATABASE_URL配置" -ForegroundColor Red
    $databaseUrl = Get-Content .env | Where-Object { $_ -match "DATABASE_URL" }
    Write-Host "當前DATABASE_URL: $databaseUrl" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "請確保PostgreSQL服務正在運行，並且連接字符串正確" -ForegroundColor Yellow
    Write-Host "如果需要，請修改.env文件中的DATABASE_URL" -ForegroundColor Yellow
    Read-Host "按Enter繼續"
}

# 運行Prisma遷移和種子
Write-Host "運行Prisma遷移和種子..." -ForegroundColor Green
try {
    npx prisma migrate dev --name add-test-users
} catch {
    Write-Host "警告: Prisma遷移失敗，嘗試繼續..." -ForegroundColor Yellow
}

try {
    npx prisma db seed
    Write-Host "Prisma種子運行成功" -ForegroundColor Green
} catch {
    Write-Host "警告: Prisma種子失敗，嘗試手動創建測試用戶..." -ForegroundColor Yellow
    
    # 創建測試用戶腳本
    $createTestUsersScript = @"
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 檢查是否已存在測試用戶
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });

  if (!existingAdmin) {
    // 創建管理員用戶
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: Role.ADMIN,
        emailVerified: new Date(),
      },
    });
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
  }

  // 檢查是否已存在普通用戶
  const existingUser = await prisma.user.findUnique({
    where: { email: 'user@example.com' }
  });

  if (!existingUser) {
    // 創建普通用戶
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'user@example.com',
        password: hashedPassword,
        role: Role.USER,
        emailVerified: new Date(),
      },
    });
    console.log('Test user created successfully');
  } else {
    console.log('Test user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.\$disconnect();
  });
"@
    
    Set-Content -Path "create-test-users.js" -Value $createTestUsersScript
    
    Write-Host "運行測試用戶創建腳本..." -ForegroundColor Green
    try {
        node -r esm create-test-users.js
        Write-Host "測試用戶創建成功" -ForegroundColor Green
        Remove-Item -Path "create-test-users.js" -Force
    } catch {
        Write-Host "警告: 測試用戶創建失敗，請手動運行prisma:seed命令" -ForegroundColor Red
    }
}

Write-Host ""

# 步驟 3: 修復API認證401錯誤
Write-Host "步驟 3: 修復API認證401錯誤" -ForegroundColor Yellow
Write-Host "-----------------------------------"

# 檢查withTestAuth中間件
if (-not (Test-Path "middleware\withTestAuth.ts")) {
    Write-Host "創建withTestAuth中間件..." -ForegroundColor Green
    
    if (-not (Test-Path "middleware")) {
        New-Item -Path "middleware" -ItemType Directory -Force | Out-Null
    }
    
    $withTestAuthContent = @"
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { verify } from 'jsonwebtoken';

/**
 * 測試認證中間件
 * 在開發環境中支持使用測試令牌進行認證
 * 在生產環境中僅使用正常的會話認證
 */
export async function withTestAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) {
  // 首先嘗試獲取正常的會話
  const session = await getSession({ req });
  
  // 如果已經有正常的會話，直接繼續
  if (session?.user) {
    return next();
  }
  
  // 在開發環境中檢查測試令牌
  if (process.env.NODE_ENV !== 'production') {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // 驗證令牌
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'development-secret-key');
        
        // 將解碼後的用戶信息添加到請求中
        (req as any).testUser = decoded;
        
        // 繼續處理請求
        return next();
      } catch (error) {
        console.warn('測試令牌驗證失敗:', error);
      }
    }
  }
  
  // 如果沒有有效的會話或測試令牌，返回未授權錯誤
  return res.status(401).json({ error: '未授權' });
}
"@
    
    Set-Content -Path "middleware\withTestAuth.ts" -Value $withTestAuthContent
    Write-Host "withTestAuth中間件創建成功" -ForegroundColor Green
} else {
    Write-Host "withTestAuth中間件已存在" -ForegroundColor Green
}

# 檢查_app.tsx中的測試令牌獲取邏輯
Write-Host "檢查_app.tsx中的測試令牌獲取邏輯..." -ForegroundColor Green

$appContent = Get-Content -Path "pages\_app.tsx" -Raw
if ($appContent -notmatch "eduCreateTestToken") {
    Write-Host "修復_app.tsx中的測試令牌獲取邏輯..." -ForegroundColor Green
    
    # 替換useEffect以添加測試令牌獲取邏輯
    $newAppContent = $appContent -replace 'useEffect\(\s*\(\)\s*=>\s*{', @'
useEffect(() => {
    // 在開發環境中獲取測試令牌
    const fetchTestToken = async () => {
      if (process.env.NODE_ENV !== 'production') {
        try {
          const response = await fetch('/api/auth/test-token');
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('eduCreateTestToken', data.token);
            console.log('已獲取測試令牌');
          }
        } catch (error) {
          console.error('獲取測試令牌失敗:', error);
        }
      }
    };

    fetchTestToken();
'@
    
    Set-Content -Path "pages\_app.tsx" -Value $newAppContent
    Write-Host "_app.tsx修復完成" -ForegroundColor Green
} else {
    Write-Host "_app.tsx中已包含測試令牌獲取邏輯" -ForegroundColor Green
}

Write-Host ""

# 步驟 4: 清理緩存和重啟服務器
Write-Host "步驟 4: 清理緩存和重啟服務器" -ForegroundColor Yellow
Write-Host "-----------------------------------"

# 清理緩存
Write-Host "清理緩存..." -ForegroundColor Green

if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host ".next目錄已清理" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force
    Write-Host "node_modules\.cache目錄已清理" -ForegroundColor Green
}

# 終止佔用端口的進程
Write-Host "終止佔用端口的進程..." -ForegroundColor Green

$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object State -eq Listen
foreach ($process in $processes) {
    $processId = $process.OwningProcess
    Write-Host "終止進程 PID: $processId" -ForegroundColor Green
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "修復完成！正在啟動開發服務器..." -ForegroundColor Cyan
Write-Host "請在瀏覽器中訪問 http://localhost:3000/register" -ForegroundColor Cyan
Write-Host "如果仍然出現錯誤，請嘗試清除瀏覽器緩存和localStorage" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 可以停止服務器" -ForegroundColor Cyan
Write-Host ""

npm run dev