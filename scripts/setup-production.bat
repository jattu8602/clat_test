@echo off
echo 🚀 Setting up Production-Ready PDF Processing...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not installed. Please install pip.
    pause
    exit /b 1
)

REM Create virtual environment for Python service
echo 📦 Setting up Python virtual environment...
cd python-pdf-service
python -m venv venv
call venv\Scripts\activate.bat

REM Install Python dependencies
echo 📥 Installing Python dependencies...
pip install -r requirements.txt

echo ✅ Python service setup complete!

REM Go back to root directory
cd ..

REM Install Node.js dependencies if not already installed
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

echo.
echo 🎉 Production setup complete!
echo.
echo To start the application:
echo   npm run dev
echo.
echo The PDF processing will work automatically without needing to run Python separately!
echo.
echo For production deployment:
echo   docker-compose up --build
echo.
pause
