@echo off
echo Starting SettleUp Frontend...
echo.
echo Make sure the backend is running on http://localhost:8080
echo.
echo Starting React development server...
echo.

cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo Starting the application...
npm start

pause 