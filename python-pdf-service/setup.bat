@echo off
echo Setting up Python PDF Service...

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
pip install -r requirements.txt

echo.
echo Setup complete! 
echo.
echo To start the service, run:
echo   python run.py
echo.
echo The service will be available at http://localhost:8000
echo.
pause
