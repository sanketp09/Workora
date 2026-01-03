@echo off
echo ===================================
echo PostgreSQL Password Reset Script
echo ===================================
echo.
echo This script will:
echo 1. Stop PostgreSQL service
echo 2. Enable trust authentication temporarily
echo 3. Reset password to: postgres123
echo 4. Restore security settings
echo 5. Restart PostgreSQL service
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [1/5] Stopping PostgreSQL service...
net stop postgresql-x64-18

echo.
echo [2/5] Backing up pg_hba.conf...
copy "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup"

echo.
echo [3/5] Enabling trust authentication...
powershell -Command "(Get-Content 'C:\Program Files\PostgreSQL\18\data\pg_hba.conf') -replace 'scram-sha-256', 'trust' -replace 'md5', 'trust' | Set-Content 'C:\Program Files\PostgreSQL\18\data\pg_hba.conf'"

echo.
echo [4/5] Starting PostgreSQL...
net start postgresql-x64-18
timeout /t 3 /nobreak >nul

echo.
echo [5/5] Resetting password...
psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres123';"

echo.
echo [6/5] Restoring security settings...
copy "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"

echo.
echo [7/5] Restarting PostgreSQL...
net stop postgresql-x64-18
net start postgresql-x64-18

echo.
echo ===================================
echo Password has been reset to: postgres123
echo ===================================
echo.
echo Now run: setup-database.bat
pause
