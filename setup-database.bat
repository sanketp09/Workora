@echo off
echo ===================================
echo Database Setup Script
echo ===================================
echo.
echo PostgreSQL Password: postgres123
echo (Press Enter when prompted for password)
echo.
pause

set PGPASSWORD=postgres123

echo.
echo [1/4] Creating database...
psql -U postgres -c "CREATE DATABASE employee_auth_db;"

echo.
echo [2/4] Connecting to database...
psql -U postgres -d employee_auth_db -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

echo.
echo [3/4] Running schema...
cd backend
psql -U postgres -d employee_auth_db -f database/schema.sql

echo.
echo [4/4] Verifying setup...
psql -U postgres -d employee_auth_db -c "SELECT login_id, first_name, last_name, role FROM employees;"

echo.
echo ===================================
echo Database setup complete!
echo ===================================
echo.
echo Default users created:
echo - Admin: OIADMI20220001 / Admin@123
echo - HR: OISAJO20220002 / HR@12345
echo.
echo Now start the backend server:
echo   cd backend
echo   npm start
echo.
pause
