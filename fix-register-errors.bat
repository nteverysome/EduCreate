@echo off
echo ====================================
echo EduCreate 註冊頁面錯誤修復腳本
echo ====================================
echo.

:: 設置顏色
color 0B

echo 步驟 1: 修復圖標404錯誤
echo -----------------------------------

:: 確保圖標目錄存在
if not exist "public\icons" (
    mkdir "public\icons"
    echo 創建圖標目錄: public\icons
)

:: 重新生成所有圖標文件
echo 重新生成所有圖標文件...

:: 生成icon-144x144.png
echo ^<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg"^> > "public\icons\icon-144x144.png"
echo   ^<rect width="144" height="144" fill="#4f46e5" /^> >> "public\icons\icon-144x144.png"
echo   ^<text x="50%%" y="50%%" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle"^>EC^</text^> >> "public\icons\icon-144x144.png"
echo ^</svg^> >> "public\icons\icon-144x144.png"

:: 生成其他尺寸的圖標
for %%s in (72 96 128 152 192 384 512) do (
    echo ^<svg width="%%s" height="%%s" xmlns="http://www.w3.org/2000/svg"^> > "public\icons\icon-%%sx%%s.png"
    echo   ^<rect width="%%s" height="%%s" fill="#4f46e5" /^> >> "public\icons\icon-%%sx%%s.png"
    echo   ^<text x="50%%" y="50%%" font-family="Arial" font-size="%%~ns" fill="white" text-anchor="middle" dominant-baseline="middle"^>EC^</text^> >> "public\icons\icon-%%sx%%s.png"
    echo ^</svg^> >> "public\icons\icon-%%sx%%s.png"
    echo 生成圖標: icon-%%sx%%s.png
)

echo 圖標文件重新生成完成
echo.

echo 步驟 2: 修復數據庫連接和測試用戶
echo -----------------------------------

:: 檢查數據庫連接
echo 檢查數據庫連接...
npx prisma db push

if %ERRORLEVEL% NEQ 0 (
    echo 警告: 數據庫連接失敗，請檢查.env文件中的DATABASE_URL配置
    echo 當前DATABASE_URL: 
    findstr "DATABASE_URL" .env
    echo.
    echo 請確保PostgreSQL服務正在運行，並且連接字符串正確
    echo 如果需要，請修改.env文件中的DATABASE_URL
    pause
) else (
    echo 數據庫連接成功
)

:: 運行Prisma遷移和種子
echo 運行Prisma遷移和種子...
npx prisma migrate dev --name add-test-users

if %ERRORLEVEL% NEQ 0 (
    echo 警告: Prisma遷移失敗，嘗試繼續...
)

npx prisma db seed

if %ERRORLEVEL% NEQ 0 (
    echo 警告: Prisma種子失敗，嘗試手動創建測試用戶...
    
    :: 創建測試用戶腳本
    echo import { PrismaClient, Role } from '@prisma/client';> create-test-users.js
    echo import bcrypt from 'bcryptjs';>> create-test-users.js
    echo.>> create-test-users.js
    echo const prisma = new PrismaClient();>> create-test-users.js
    echo.>> create-test-users.js
    echo async function main() {>> create-test-users.js
    echo   // 檢查是否已存在測試用戶>> create-test-users.js
    echo   const existingAdmin = await prisma.user.findUnique({>> create-test-users.js
    echo     where: { email: 'admin@example.com' }>> create-test-users.js
    echo   });>> create-test-users.js
    echo.>> create-test-users.js
    echo   if (!existingAdmin) {>> create-test-users.js
    echo     // 創建管理員用戶>> create-test-users.js
    echo     const hashedPassword = await bcrypt.hash('password123', 10);>> create-test-users.js
    echo     await prisma.user.create({>> create-test-users.js
    echo       data: {>> create-test-users.js
    echo         name: 'Admin User',>> create-test-users.js
    echo         email: 'admin@example.com',>> create-test-users.js
    echo         password: hashedPassword,>> create-test-users.js
    echo         role: Role.ADMIN,>> create-test-users.js
    echo         emailVerified: new Date(),>> create-test-users.js
    echo       },>> create-test-users.js
    echo     });>> create-test-users.js
    echo     console.log('Admin user created successfully');>> create-test-users.js
    echo   } else {>> create-test-users.js
    echo     console.log('Admin user already exists');>> create-test-users.js
    echo   }>> create-test-users.js
    echo.>> create-test-users.js
    echo   // 檢查是否已存在普通用戶>> create-test-users.js
    echo   const existingUser = await prisma.user.findUnique({>> create-test-users.js
    echo     where: { email: 'user@example.com' }>> create-test-users.js
    echo   });>> create-test-users.js
    echo.>> create-test-users.js
    echo   if (!existingUser) {>> create-test-users.js
    echo     // 創建普通用戶>> create-test-users.js
    echo     const hashedPassword = await bcrypt.hash('password123', 10);>> create-test-users.js
    echo     await prisma.user.create({>> create-test-users.js
    echo       data: {>> create-test-users.js
    echo         name: 'Test User',>> create-test-users.js
    echo         email: 'user@example.com',>> create-test-users.js
    echo         password: hashedPassword,>> create-test-users.js
    echo         role: Role.USER,>> create-test-users.js
    echo         emailVerified: new Date(),>> create-test-users.js
    echo       },>> create-test-users.js
    echo     });>> create-test-users.js
    echo     console.log('Test user created successfully');>> create-test-users.js
    echo   } else {>> create-test-users.js
    echo     console.log('Test user already exists');>> create-test-users.js
    echo   }>> create-test-users.js
    echo }>> create-test-users.js
    echo.>> create-test-users.js
    echo main()>> create-test-users.js
    echo   .catch((e) => {>> create-test-users.js
    echo     console.error(e);>> create-test-users.js
    echo     process.exit(1);>> create-test-users.js
    echo   })>> create-test-users.js
    echo   .finally(async () => {>> create-test-users.js
    echo     await prisma.$disconnect();>> create-test-users.js
    echo   });>> create-test-users.js
    
    echo 運行測試用戶創建腳本...
    node -r esm create-test-users.js
    
    if %ERRORLEVEL% NEQ 0 (
        echo 警告: 測試用戶創建失敗，請手動運行prisma:seed命令
    ) else (
        echo 測試用戶創建成功
        del create-test-users.js
    )
)

echo.
echo 步驟 3: 修復API認證401錯誤
echo -----------------------------------

:: 檢查withTestAuth中間件
if not exist "middleware\withTestAuth.ts" (
    echo 創建withTestAuth中間件...
    
    if not exist "middleware" (
        mkdir middleware
    )
    
    echo import { NextApiRequest, NextApiResponse } from 'next';> middleware\withTestAuth.ts
    echo import { getSession } from 'next-auth/react';>> middleware\withTestAuth.ts
    echo import { verify } from 'jsonwebtoken';>> middleware\withTestAuth.ts
    echo.>> middleware\withTestAuth.ts
    echo /**>> middleware\withTestAuth.ts
    echo  * 測試認證中間件>> middleware\withTestAuth.ts
    echo  * 在開發環境中支持使用測試令牌進行認證>> middleware\withTestAuth.ts
    echo  * 在生產環境中僅使用正常的會話認證>> middleware\withTestAuth.ts
    echo  */>> middleware\withTestAuth.ts
    echo export async function withTestAuth(>> middleware\withTestAuth.ts
    echo   req: NextApiRequest,>> middleware\withTestAuth.ts
    echo   res: NextApiResponse,>> middleware\withTestAuth.ts
    echo   next: () =^> Promise^<void^>>> middleware\withTestAuth.ts
    echo ) {>> middleware\withTestAuth.ts
    echo   // 首先嘗試獲取正常的會話>> middleware\withTestAuth.ts
    echo   const session = await getSession({ req });>> middleware\withTestAuth.ts
    echo   >> middleware\withTestAuth.ts
    echo   // 如果已經有正常的會話，直接繼續>> middleware\withTestAuth.ts
    echo   if (session?.user) {>> middleware\withTestAuth.ts
    echo     return next();>> middleware\withTestAuth.ts
    echo   }>> middleware\withTestAuth.ts
    echo   >> middleware\withTestAuth.ts
    echo   // 在開發環境中檢查測試令牌>> middleware\withTestAuth.ts
    echo   if (process.env.NODE_ENV !== 'production') {>> middleware\withTestAuth.ts
    echo     const authHeader = req.headers.authorization;>> middleware\withTestAuth.ts
    echo     >> middleware\withTestAuth.ts
    echo     if (authHeader && authHeader.startsWith('Bearer ')) {>> middleware\withTestAuth.ts
    echo       const token = authHeader.substring(7);>> middleware\withTestAuth.ts
    echo       >> middleware\withTestAuth.ts
    echo       try {>> middleware\withTestAuth.ts
    echo         // 驗證令牌>> middleware\withTestAuth.ts
    echo         const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'development-secret-key');>> middleware\withTestAuth.ts
    echo         >> middleware\withTestAuth.ts
    echo         // 將解碼後的用戶信息添加到請求中>> middleware\withTestAuth.ts
    echo         (req as any).testUser = decoded;>> middleware\withTestAuth.ts
    echo         >> middleware\withTestAuth.ts
    echo         // 繼續處理請求>> middleware\withTestAuth.ts
    echo         return next();>> middleware\withTestAuth.ts
    echo       } catch (error) {>> middleware\withTestAuth.ts
    echo         console.warn('測試令牌驗證失敗:', error);>> middleware\withTestAuth.ts
    echo       }>> middleware\withTestAuth.ts
    echo     }>> middleware\withTestAuth.ts
    echo   }>> middleware\withTestAuth.ts
    echo   >> middleware\withTestAuth.ts
    echo   // 如果沒有有效的會話或測試令牌，返回未授權錯誤>> middleware\withTestAuth.ts
    echo   return res.status(401).json({ error: '未授權' });>> middleware\withTestAuth.ts
    echo }>> middleware\withTestAuth.ts
    
    echo withTestAuth中間件創建成功
) else (
    echo withTestAuth中間件已存在
)

:: 檢查_app.tsx中的測試令牌獲取邏輯
echo 檢查_app.tsx中的測試令牌獲取邏輯...

findstr /C:"eduCreateTestToken" pages\_app.tsx >nul
if %ERRORLEVEL% NEQ 0 (
    echo 修復_app.tsx中的測試令牌獲取邏輯...
    
    :: 創建臨時文件
    type pages\_app.tsx > _app.tsx.tmp
    
    :: 查找useEffect並添加測試令牌獲取邏輯
    powershell -Command "(Get-Content _app.tsx.tmp) -replace 'useEffect\(\s*\(\)\s*=>\s*{', 'useEffect(() => {\r\n    // 在開發環境中獲取測試令牌\r\n    const fetchTestToken = async () => {\r\n      if (process.env.NODE_ENV !== ''production'') {\r\n        try {\r\n          const response = await fetch(''/api/auth/test-token'');\r\n          if (response.ok) {\r\n            const data = await response.json();\r\n            localStorage.setItem(''eduCreateTestToken'', data.token);\r\n            console.log(''已獲取測試令牌'');\r\n          }\r\n        } catch (error) {\r\n          console.error(''獲取測試令牌失敗:'', error);\r\n        }\r\n      }\r\n    };\r\n\r\n    fetchTestToken();' | Set-Content pages\_app.tsx"
    
    :: 刪除臨時文件
    del _app.tsx.tmp
    
    echo _app.tsx修復完成
) else (
    echo _app.tsx中已包含測試令牌獲取邏輯
)

echo.
echo 步驟 4: 清理緩存和重啟服務器
echo -----------------------------------

:: 清理緩存
echo 清理緩存...

if exist ".next" (
    rmdir /s /q .next
    echo .next目錄已清理
)

if exist "node_modules\.cache" (
    rmdir /s /q node_modules\.cache
    echo node_modules\.cache目錄已清理
)

:: 終止佔用端口的進程
echo 終止佔用端口的進程...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 終止進程 PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo 修復完成！正在啟動開發服務器...
echo 請在瀏覽器中訪問 http://localhost:3000/register
echo 如果仍然出現錯誤，請嘗試清除瀏覽器緩存和localStorage
echo 按 Ctrl+C 可以停止服務器
echo.

npm run dev

pause