@echo off
REM PowerFit Gym - Next.js Migration Setup Script for Windows

echo.
echo 🏋️  PowerFit Gym - Next.js Setup
echo ==================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✓ Node.js version: %NODE_VERSION%
echo ✓ npm version: %NPM_VERSION%
echo.

REM Create directories
echo 📁 Creating project structure...
if not exist "nextjs-app\app\api\clients" mkdir nextjs-app\app\api\clients
if not exist "nextjs-app\app\api\payments" mkdir nextjs-app\app\api\payments
if not exist "nextjs-app\app\api\emails\send" mkdir nextjs-app\app\api\emails\send
if not exist "nextjs-app\app\api\admin\login" mkdir nextjs-app\app\api\admin\login
if not exist "nextjs-app\app\api\admin\logout" mkdir nextjs-app\app\api\admin\logout
if not exist "nextjs-app\app\api\scheduled\birthday" mkdir nextjs-app\app\api\scheduled\birthday
if not exist "nextjs-app\lib" mkdir nextjs-app\lib
if not exist "nextjs-app\components\gym" mkdir nextjs-app\components\gym
if not exist "nextjs-app\components\ui" mkdir nextjs-app\components\ui
if not exist "nextjs-app\context" mkdir nextjs-app\context
if not exist "nextjs-app\hooks" mkdir nextjs-app\hooks
if not exist "nextjs-app\utils" mkdir nextjs-app\utils
if not exist "nextjs-app\types" mkdir nextjs-app\types
if not exist "nextjs-app\styles" mkdir nextjs-app\styles
if not exist "nextjs-app\scripts" mkdir nextjs-app\scripts

echo ✓ Directories created
echo.

REM Install dependencies
echo 📦 Installing dependencies...
cd nextjs-app
call npm install
cd ..

echo ✓ Dependencies installed
echo.

REM Create .env.local
echo 🔐 Creating environment file...
(
echo # Email Configuration
echo EMAIL_USER=your-email@gmail.com
echo EMAIL_PASSWORD=your-app-password
echo.
echo # Admin Credentials
echo ADMIN_USERNAME=admin
echo ADMIN_PASSWORD=admin123
echo.
echo # Cron Secret
echo CRON_SECRET=your-secret-key
echo.
echo # Database
echo DATABASE_URL=./gym.db
echo.
echo # API URL
echo NEXT_PUBLIC_API_URL=http://localhost:3000
) > nextjs-app\.env.local

echo ✓ Environment file created (.env.local)
echo.

REM Summary
echo ✅ Setup Complete!
echo.
echo 📋 Next Steps:
echo 1. Update .env.local with your credentials
echo 2. Copy components from src/components to nextjs-app/components
echo 3. Copy context from src/context to nextjs-app/context
echo 4. Copy utilities from src/utils to nextjs-app/utils
echo 5. Create pages in nextjs-app/app/
echo.
echo 🚀 To start development:
echo    cd nextjs-app
echo    npm run dev
echo.
echo 📚 Documentation:
echo    - NEXTJS_MIGRATION_GUIDE.md - Complete migration guide
echo    - NEXTJS_PAGES_GUIDE.md - Pages implementation guide
echo.
