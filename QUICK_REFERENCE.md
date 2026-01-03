# Workora Authentication System - Quick Reference

## 🚀 Quick Start Commands

### Start Everything (3 terminals)

**Terminal 1 - PostgreSQL (if using Docker):**
```bash
docker start workora-db
```

**Terminal 2 - Backend:**
```bash
cd backend
npm start
```

**Terminal 3 - Frontend:**
```bash
npm run dev
```

## 🔑 Default Login Credentials

| Role | Login ID | Password |
|------|----------|----------|
| Admin | OIADMI20220001 | Admin@123 |
| HR | OISAJO20220002 | HR@12345 |

## 📋 Login ID Format

**Format:** `OI[First2][Last2][Year][Serial]`

**Examples:**
- John Doe joining in 2024 (1st employee): `OIJODO20240001`
- Sarah Smith joining in 2024 (2nd employee): `SASM20240002`
- Alex Brown joining in 2025 (1st employee): `OIALBR20250001`

**Breakdown:**
- `OI` = Odoo India (Company prefix)
- `JO` = First 2 letters of first name (John)
- `DO` = First 2 letters of last name (Doe)
- `2024` = Year of joining
- `0001` = Serial number (auto-increments per year)

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |

## 📡 API Endpoints

### Authentication

```bash
# Login
POST /api/auth/login
Body: { "login_id": "OIADMI20220001", "password": "Admin@123" }

# Change Password  
POST /api/auth/change-password
Headers: { "Authorization": "Bearer <token>" }
Body: { "new_password": "newPassword123" }

# Get Profile
GET /api/auth/profile
Headers: { "Authorization": "Bearer <token>" }
```

### Employee Management (Admin/HR Only)

```bash
# Create Employee
POST /api/employees/create
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@company.com",
  "year_of_joining": 2024,
  "role": "employee"
}

# Get All Employees
GET /api/employees
Headers: { "Authorization": "Bearer <token>" }

# Get Employee by ID
GET /api/employees/:id
Headers: { "Authorization": "Bearer <token>" }
```

## 🗄️ Database Quick Commands

```bash
# Connect to database
psql -U postgres -d employee_auth_db

# Or with Docker
docker exec -it workora-db psql -U postgres -d employee_auth_db

# Useful SQL queries
SELECT * FROM employees;
SELECT * FROM employees WHERE role = 'admin';
SELECT generate_login_id('John', 'Doe', 2024);

# Reset admin password
UPDATE employees 
SET password_hash = crypt('Admin@123', gen_salt('bf'))
WHERE login_id = 'OIADMI20220001';
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=3001
```

### Database connection failed
```bash
# Check PostgreSQL is running
pg_isready

# Or with Docker
docker ps | grep postgres

# Restart PostgreSQL
docker restart workora-db
```

### Can't login
```bash
# Verify admin user exists
psql -U postgres -d employee_auth_db -c "SELECT login_id, email FROM employees;"

# Reset database
psql -U postgres -d employee_auth_db -f backend/database/schema.sql
```

### CORS errors
- Make sure both frontend (5173) and backend (3000) are running
- Check browser console for exact error
- Verify API_URL in src/services/api.js matches backend port

## 📝 Common Tasks

### Create a New Employee (via UI)
1. Login as Admin/HR
2. Go to Employees page
3. Click "Create New Employee"
4. Fill form and submit
5. Copy generated credentials
6. Share with new employee securely

### Change Password (via UI)
1. Login with any account
2. If first login, you'll be redirected automatically
3. Enter new password (min 8 characters)
4. Confirm and submit

### Add a New Role
1. Edit `backend/database/schema.sql`
2. Update CHECK constraint:
   ```sql
   role VARCHAR(20) DEFAULT 'employee' 
   CHECK (role IN ('admin', 'hr', 'employee', 'manager'))
   ```
3. Reload schema
4. Update frontend CreateEmployee.jsx dropdown

## 🔒 Security Best Practices

**For Production:**

1. Change JWT_SECRET to a strong random string:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. Use environment-specific .env files

3. Enable SSL/HTTPS

4. Set secure password policies

5. Add rate limiting:
   ```bash
   npm install express-rate-limit
   ```

6. Enable CORS only for your domain

7. Set up database backups

8. Use connection pooling

9. Add request logging

10. Implement audit trails

## 📦 Project Structure

```
Workora-main/
├── backend/                    # Backend API
│   ├── config/
│   │   └── database.js        # DB connection
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   └── employees.js       # Employee routes
│   ├── database/
│   │   └── schema.sql         # DB schema
│   ├── server.js              # Express server
│   ├── package.json
│   └── .env                   # Config (don't commit!)
│
├── src/                       # Frontend
│   ├── services/
│   │   └── api.js             # API client
│   ├── context/
│   │   └── AuthContext.jsx    # Auth state
│   ├── pages/
│   │   ├── SignIn.jsx
│   │   ├── ChangePassword.jsx
│   │   └── CreateEmployee.jsx
│   └── App.jsx
│
├── SETUP_GUIDE.md            # Full setup guide
├── SETUP_ALTERNATIVES.md     # Alternative setups
└── QUICK_REFERENCE.md        # This file
```

## 🎯 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors  
- [ ] Can access http://localhost:5173
- [ ] Can login with admin credentials
- [ ] Dashboard loads correctly
- [ ] Can navigate to Employees page
- [ ] "Create Employee" button visible (Admin/HR)
- [ ] Can create new employee
- [ ] Credentials are generated and displayed
- [ ] Can logout
- [ ] Can login with new employee credentials
- [ ] Forced to change password on first login
- [ ] After password change, redirected to dashboard
- [ ] Session persists after refresh

## 💡 Tips

1. **Keep terminals open**: You need 2-3 terminals running simultaneously

2. **Save credentials immediately**: Generated passwords are shown only once

3. **Use uppercase for Login ID**: System auto-converts, but it's clearer

4. **Development vs Production**: 
   - Dev: Both services on localhost
   - Prod: Update API_URL in src/services/api.js

5. **Database changes**: After modifying schema.sql, reload it:
   ```bash
   psql -U postgres -d employee_auth_db -f backend/database/schema.sql
   ```

## 📞 Need Help?

Check in order:

1. Read error message in terminal/console
2. Check SETUP_GUIDE.md for detailed instructions
3. Check SETUP_ALTERNATIVES.md for different setups
4. Verify all services are running
5. Check database connection
6. Review .env configuration

## 🎉 You're Ready!

With this system, you have:
✅ Secure authentication with auto-generated Login IDs  
✅ PostgreSQL backend with pgcrypto  
✅ JWT token-based auth  
✅ Role-based access control  
✅ Password change enforcement  
✅ Clean React frontend  

Happy coding! 🚀
