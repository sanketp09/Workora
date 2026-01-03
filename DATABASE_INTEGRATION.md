# PostgreSQL Database Integration

## ✅ Successfully Integrated!

Your teammate's PostgreSQL database has been successfully cherry-picked and integrated into the main branch.

## 📁 What Was Added

- **Backend Server**: Complete Express.js API in `/backend` folder
- **Database Schema**: 13 tables matching your requirements
- **API Service**: Frontend API connector in `/src/services/api.js`
- **Authentication**: JWT-based auth with bcrypt password hashing
- **RESTful Endpoints**: Full CRUD operations for all entities

## 🗄️ Database Tables Created

1. **employees** - Employee master data
2. **attendance** - Daily attendance tracking
3. **leave_requests** - Time off requests
4. **leave_balances** - Available leave days
5. **salaries** - Salary structure
6. **payroll** - Monthly payroll records
7. **departments** - Department management
8. **designations** - Job titles
9. **audit_logs** - System audit trail
10. **documents** - Employee document storage
11. **notifications** - System notifications
12. **holidays** - Company holidays
13. **users** - Authentication data

## 🚀 Setup Instructions

### 1. Database Setup

Make sure PostgreSQL is running with these credentials (from `backend/.env`):
```
DB_NAME: odoo_hrms
DB_USER: postgres
DB_PASSWORD: shravanya
DB_HOST: localhost
DB_PORT: 5432
```

### 2. Create Database Tables

```bash
cd backend
node setup-database.js
```

This will create all 13 tables with proper relationships.

### 3. Insert Mock Data (Optional)

```bash
node final-mock-data.js
```

This adds sample employees, attendance, leave requests, etc. for testing.

### 4. Start Both Servers

From the root directory:

**Option A: Run both together**
```bash
npm run dev:full
```

**Option B: Run separately**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:backend
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get one employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `GET /api/attendance` - Get all attendance
- `GET /api/attendance/employee/:id` - Get by employee
- `POST /api/attendance/checkin` - Check in
- `PUT /api/attendance/:id/checkout` - Check out

### Leave Requests
- `GET /api/leave-requests` - Get all requests
- `GET /api/leave-requests/employee/:id` - Get by employee
- `POST /api/leave-requests` - Create request
- `PUT /api/leave-requests/:id/status` - Approve/reject

### Salary & Payroll
- `GET /api/salaries` - Get all salaries
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll/generate` - Generate payroll

## 🔄 Frontend Integration

The frontend already has the API service configured. Update your contexts to use the API:

```javascript
import { authAPI, employeesAPI, attendanceAPI, leaveRequestsAPI } from '../services/api';

// Example: Login
const response = await authAPI.login({ email, password });

// Example: Get employees
const employees = await employeesAPI.getAll();

// Example: Submit leave request
const request = await leaveRequestsAPI.create(leaveData);
```

## 🔐 Environment Variables

**Frontend** (`.env` in root):
```
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```
DB_NAME=odoo_hrms
DB_USER=postgres  
DB_PASSWORD=your_password
PORT=5000
JWT_SECRET=your_secret_key
```

## ✨ Next Steps

1. **Setup PostgreSQL**: Ensure database is running
2. **Create Tables**: Run `setup-database.js`
3. **Add Mock Data**: Run `final-mock-data.js` (optional)
4. **Start Servers**: Run `npm run dev:full`
5. **Update Contexts**: Replace localStorage with API calls in DataContext

## 📝 Notes

- Frontend runs on: `http://localhost:5173`
- Backend API runs on: `http://localhost:5000`
- All API requests require JWT token (except login/register)
- CORS is enabled for frontend domain
- Passwords are hashed with bcrypt
- SQL injection protection enabled

## 🎉 Ready to Use!

Your Dayflow HRMS now has a complete PostgreSQL backend integrated!
