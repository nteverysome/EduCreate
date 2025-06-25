@echo off
echo 🚀 Starting Wordwall Clone Development Environment...
echo.

echo 📋 Checking prerequisites...

echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!
echo.

echo 🔧 Starting MCP Servers...
echo Starting Filesystem MCP...
start "Filesystem MCP" cmd /k "npx @shtse8/filesystem-mcp"

echo Starting Memory Bank MCP...
start "Memory Bank MCP" cmd /k "npx @movibe/memory-bank-mcp"

echo Starting Prisma MCP...
start "Prisma MCP" cmd /k "npx prisma mcp"

echo.
echo 🎯 Initializing Wordwall Clone Project...

if not exist "wordwall-clone" (
    echo Creating project directory...
    call init-wordwall-clone.bat
) else (
    echo Project directory already exists.
)

echo.
echo 🌐 Starting development servers...

if exist "wordwall-clone\frontend" (
    echo Starting frontend development server...
    start "Frontend Dev Server" cmd /k "cd wordwall-clone\frontend && npm start"
)

if exist "wordwall-clone\backend" (
    echo Starting backend development server...
    start "Backend Dev Server" cmd /k "cd wordwall-clone\backend && npm run dev"
)

echo.
echo 🎉 Development environment started!
echo.
echo 📋 Available services:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo - MCP Servers: Running in separate windows
echo.
echo 💡 Next steps:
echo 1. Configure database connection in backend/.env
echo 2. Run database migrations: cd backend && npx prisma migrate dev
echo 3. Start developing your first game template!
echo.
echo Press any key to open project in VS Code...
pause >nul

if exist "wordwall-clone" (
    code wordwall-clone
)

echo.
echo 🎯 Happy coding! Building the next Wordwall...
pause
