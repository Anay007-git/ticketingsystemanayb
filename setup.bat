@echo off
echo Installing Lux Ticketing Tools...

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Backend installation failed!
    pause
    exit /b 1
)

echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Frontend installation failed!
    pause
    exit /b 1
)

echo Setup complete!
echo.
echo Next steps:
echo 1. Configure your email settings in backend\.env
echo 2. Run 'npm start' in backend folder
echo 3. Run 'npm start' in frontend folder (in a new terminal)
echo.
pause