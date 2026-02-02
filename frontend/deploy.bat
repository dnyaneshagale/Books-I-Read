@echo off
echo ========================================
echo Books I Read - Firebase Deployment
echo ========================================
echo.

REM Check if .env.production exists
if not exist ".env.production" (
    echo ERROR: .env.production file not found!
    echo.
    echo Please create .env.production from .env.production.example
    echo and update VITE_API_URL with your backend URL.
    echo.
    pause
    exit /b 1
)

REM Build the project
echo [1/3] Building project...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Build completed successfully!
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Firebase CLI not found!
    echo.
    echo Please install Firebase CLI:
    echo npm install -g firebase-tools
    echo.
    pause
    exit /b 1
)

REM Deploy to Firebase
echo [3/3] Deploying to Firebase...
firebase deploy

if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
echo.
echo Your app is now live on Firebase!
echo.
pause
