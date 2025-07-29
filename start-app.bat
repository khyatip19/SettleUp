@echo off
echo Starting Splitwise Clone Application...
echo.
echo Make sure PostgreSQL is running on localhost:5432
echo Database: settle_up
echo Username: postgres
echo Password: newpassword
echo.
echo Starting application...
echo.

REM Try to use Maven if available
where mvn >nul 2>nul
if %errorlevel% equ 0 (
    echo Using Maven...
    mvn spring-boot:run
) else (
    echo Maven not found in PATH.
    echo Please run the application from your IDE:
    echo 1. Open the project in your IDE
    echo 2. Run SettleUpApplication.java
    echo.
    pause
) 