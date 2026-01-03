# Workora Employee Authentication System - Complete Setup Guide

## 🎯 Overview

This system implements a secure employee authentication system with:
- **Auto-generated Login IDs**: Format `OI[First2][Last2][Year][Serial]` (e.g., OIJODO20220001)
- **PostgreSQL + pgcrypto**: Secure password hashing
- **JWT Authentication**: Token-based auth
- **Role-based Access**: Admin, HR, and Employee roles
- **Auto-generated passwords**: Secure random passwords for new employees
- **Forced password change**: On first login

---

## 📋 Prerequisites

Before starting, ensure you have installed:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
3. **npm** or **yarn** (comes with Node.js)

---

## 🚀 Step-by-Step Setup

### Step 1: Database Setup

#### 1.1 Install PostgreSQL

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run installer and remember your postgres password
- Default port: 5432

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 1.2 Create Database

Open PostgreSQL command line (psql):

```bash
# Connect to PostgreSQL
psql -U postgres

# Or on Mac/Linux
sudo -u postgres psql
```

Run these commands:

```sql
-- Create database
CREATE DATABASE employee_auth_db;

-- Connect to the database
\c employee_auth_db

-- You should see: "You are now connected to database "employee_auth_db""
```

#### 1.3 Run Database Schema

Navigate to backend folder and run the schema file:

```bash
cd backend
psql -U postgres -d employee_auth_db -f database/schema.sql
```

**Or** manually copy and paste the content from `backend/database/schema.sql` into psql.

You should see output like:
```
CREATE EXTENSION
CREATE TABLE
CREATE INDEX
...
Setup Complete!
```

#### 1.4 Verify Database Setup

In psql:

```sql
-- Check tables
\dt

-- Should show: employees table

-- Check test admin user
SELECT login_id, email, role FROM employees;

-- Should show: OIADMI20220001 | admin@workora.com | admin
```

---

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Folder

```bash
cd backend
```

#### 2.2 Install Dependencies

```bash
npm install
```

This will install:
- express (web server)
- pg (PostgreSQL client)
- jsonwebtoken (JWT auth)
- bcrypt (password hashing)
- dotenv (environment variables)
- cors (CORS handling)
- body-parser (request parsing)

#### 2.3 Configure Environment Variables

Create `.env` file in the `backend` folder:

```bash
cp .env.example .env
```

Edit `.env` and update with your settings:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/employee_auth_db
JWT_SECRET=change-this-to-a-long-random-string-for-production
NODE_ENV=development
```

**Important:** Replace `YOUR_PASSWORD` with your PostgreSQL password!

#### 2.4 Start Backend Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

You should see:

```
╔═══════════════════════════════════════════════╗
║   Workora Authentication Server Running       ║
║   Port: 3000                                   ║
║   Environment: development                     ║
║   Database: PostgreSQL + pgcrypto             ║
╚═══════════════════════════════════════════════╝
Server ready at http://localhost:3000
Health check: http://localhost:3000/health
✓ Database connected successfully
```

#### 2.5 Test Backend

Open browser or use curl:

```bash
# Health check
curl http://localhost:3000/health

# Should return: {"status":"ok","message":"Server is running"}

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login_id":"OIADMI20220001","password":"Admin@123"}'
```

---

### Step 3: Frontend Setup

#### 3.1 Open New Terminal (keep backend running)

Navigate to your project root:

```bash
cd c:\Users\Khushi\Downloads\Workora-main\Workora-main
```

#### 3.2 Install Frontend Dependencies

```bash
npm install
```

#### 3.3 Start Frontend

```bash
npm run dev
```

You should see:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### 3.4 Open Application

Open browser and go to: **http://localhost:5173**

---

## 🔐 Testing the System

### Default Test Credentials

**Admin User:**
- Login ID: `OIADMI20220001`
- Password: `Admin@123`

**HR User:**
- Login ID: `OISAJO20220002`
- Password: `HR@12345`

### Test Flow:

1. **Login**
   - Go to http://localhost:5173/signin
   - Enter Login ID: `OIADMI20220001`
   - Enter Password: `Admin@123`
   - Click "Sign In"

2. **Create New Employee**
   - Navigate to Employees page
   - Click "Create New Employee" (only visible to Admin/HR)
   - Fill in the form:
     - First Name: John
     - Last Name: Doe
     - Email: john.doe@company.com
     - Year of Joining: 2024
     - Role: Employee
   - Click "Create Employee"
   - **IMPORTANT:** Copy the generated credentials!
     - Login ID: OIJODO20240001
     - Password: (auto-generated)

3. **Test New Employee Login**
   - Logout
   - Login with new credentials
   - You'll be forced to change password
   - Set new password and login

---

## 📂 Project Structure

```
Workora-main/
├── backend/                    # Node.js backend
│   ├── config/
│   │   └── database.js        # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/
│   │   ├── auth.js            # Login, password change
│   │   └── employees.js       # Employee management
│   ├── database/
│   │   └── schema.sql         # Database schema
│   ├── server.js              # Express server
│   ├── package.json
│   └── .env                   # Environment variables
│
├── src/                       # React frontend
│   ├── services/
│   │   └── api.js             # API service
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── pages/
│   │   ├── SignIn.jsx         # Login page
│   │   ├── ChangePassword.jsx # Password change
│   │   └── CreateEmployee.jsx # Create employee
│   └── App.jsx                # Main app
│
└── package.json
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Connection refused" or "ECONNREFUSED"

**Problem:** Backend not running or wrong port

**Solution:**
```bash
# Check if backend is running on port 3000
netstat -ano | findstr :3000

# Start backend if not running
cd backend
npm start
```

### Issue 2: "Database does not exist"

**Problem:** Database not created

**Solution:**
```bash
psql -U postgres
CREATE DATABASE employee_auth_db;
\q
```

### Issue 3: "Password authentication failed"

**Problem:** Wrong PostgreSQL password in .env

**Solution:**
- Edit `backend/.env`
- Update `DATABASE_URL` with correct password
- Restart backend

### Issue 4: "Invalid Login ID or Password"

**Problem:** Database schema not loaded

**Solution:**
```bash
cd backend
psql -U postgres -d employee_auth_db -f database/schema.sql
```

### Issue 5: "Port 3000 already in use"

**Solution:**
- Change PORT in `backend/.env` to 3001
- Update API_URL in `src/services/api.js` to `http://localhost:3001/api`

### Issue 6: CORS errors

**Problem:** Frontend can't connect to backend

**Solution:**
- Make sure both frontend (5173) and backend (3000) are running
- Check browser console for exact error
- Backend CORS is already configured for all origins in development

---

## 🎨 Features Implemented

✅ Auto-generated Login IDs (OIJODO20220001 format)  
✅ Auto-generated secure passwords  
✅ Password hashing with pgcrypto  
✅ JWT token authentication  
✅ Role-based access (Admin, HR, Employee)  
✅ Force password change on first login  
✅ Protected routes  
✅ Employee creation (Admin/HR only)  
✅ Session persistence  
✅ Toast notifications  

---

## 📡 API Endpoints

### Authentication

**POST /api/auth/login**
```json
{
  "login_id": "OIADMI20220001",
  "password": "Admin@123"
}
```

**POST /api/auth/change-password**
```json
Headers: { "Authorization": "Bearer <token>" }
Body: { "new_password": "newPassword123" }
```

**GET /api/auth/profile**
```json
Headers: { "Authorization": "Bearer <token>" }
```

### Employee Management

**POST /api/employees/create** (Admin/HR only)
```json
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@company.com",
  "year_of_joining": 2024,
  "role": "employee"
}
```

**GET /api/employees** (Admin/HR only)
```json
Headers: { "Authorization": "Bearer <token>" }
```

---

## 🔒 Security Features

1. **Password Hashing**: Uses pgcrypto's bcrypt (bf algorithm)
2. **JWT Tokens**: 7-day expiration
3. **Parameterized Queries**: SQL injection protection
4. **Role-Based Access**: Middleware for admin/HR routes
5. **HTTPS Ready**: Configure for production
6. **Environment Variables**: Sensitive data not in code

---

## 🚀 Next Steps

1. **Customize Login ID Format**: Edit `generate_login_id` function in `schema.sql`
2. **Add More Fields**: Extend employees table (department, phone, etc.)
3. **Email Notifications**: Send credentials via email
4. **Password Policies**: Enforce complexity rules
5. **Session Management**: Add refresh tokens
6. **Audit Logging**: Track all authentications
7. **2FA**: Add two-factor authentication

---

## 📞 Support

If you encounter any issues:

1. Check both terminals (backend and frontend) for errors
2. Verify PostgreSQL is running: `pg_isready`
3. Check database connection: `psql -U postgres -d employee_auth_db`
4. Review `.env` file configuration
5. Check browser console for frontend errors

---

## ✅ Quick Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `employee_auth_db` created
- [ ] Database schema loaded (tables and functions)
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] `.env` file created and configured
- [ ] Backend running on port 3000
- [ ] Frontend dependencies installed (`npm install` in root)
- [ ] Frontend running on port 5173
- [ ] Can login with test credentials
- [ ] Can create new employee
- [ ] New employee can login and change password

---

**You're all set! 🎉**

The system is now fully functional with secure authentication, auto-generated credentials, and role-based access control.
