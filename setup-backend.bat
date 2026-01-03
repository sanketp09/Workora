@echo off
echo ====================================
echo Workora Backend Setup Script
echo ====================================
echo.

echo [1/4] Installing dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b %errorlevel%
)
echo ✓ Dependencies installed successfully
echo.

echo [2/4] Checking PostgreSQL connection...
psql -U postgres -c "SELECT version();" > nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Cannot connect to PostgreSQL
    echo Please ensure PostgreSQL is running and credentials are correct
    pause
    exit /b %errorlevel%
)
echo ✓ PostgreSQL connection successful
echo.

echo [3/4] Creating database...
psql -U postgres -c "CREATE DATABASE workora;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Database 'workora' created successfully
) else (
    echo ! Database 'workora' may already exist
)
echo.

echo [4/4] Running database schema...
psql -U postgres -d workora -f database/schema.sql
if %errorlevel% neq 0 (
    echo Error: Failed to run database schema
    pause
    exit /b %errorlevel%
)
echo ✓ Database schema applied successfully
echo.

echo ====================================
echo Setup completed successfully!
echo ====================================
echo.
echo To start the backend server, run:
echo   cd backend
echo   npm run dev
echo.
echo To start the frontend, run (in a new terminal):
echo   npm run dev
echo.
pause
