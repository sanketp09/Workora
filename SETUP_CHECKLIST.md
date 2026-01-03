# Workora Authentication System - Setup Checklist

Use this checklist to ensure everything is set up correctly.

## ✅ Prerequisites

- [ ] Node.js installed (v16 or higher)
- [ ] npm or yarn installed
- [ ] PostgreSQL installed OR Docker installed OR Cloud database account

## ✅ Database Setup

- [ ] PostgreSQL is running
- [ ] Database `employee_auth_db` created
- [ ] Schema loaded from `backend/database/schema.sql`
- [ ] Can connect: `psql -U postgres -d employee_auth_db`
- [ ] Default users exist: Run `SELECT login_id FROM employees;`
  - Should see: OIADMI20220001 and OISAJO20220002

## ✅ Backend Setup

- [ ] Navigated to backend folder
- [ ] Dependencies installed: `npm install`
- [ ] `.env` file created (from `.env.example`)
- [ ] `.env` configured with correct DATABASE_URL
- [ ] Backend starts without errors: `npm start`
- [ ] See "Database connected successfully" message
- [ ] Health check works: http://localhost:3000/health
- [ ] Test login works (see QUICK_REFERENCE.md)

## ✅ Frontend Setup

- [ ] Navigated to project root
- [ ] Dependencies installed: `npm install`
- [ ] Frontend starts: `npm run dev`
- [ ] No errors in terminal
- [ ] Can access: http://localhost:5173

## ✅ Testing

### Login Test
- [ ] Navigate to http://localhost:5173/signin
- [ ] Enter Login ID: `OIADMI20220001`
- [ ] Enter Password: `Admin@123`
- [ ] Click "Sign In"
- [ ] Successfully logged in to dashboard
- [ ] User name and role displayed correctly

### Create Employee Test (Admin/HR only)
- [ ] Logged in as Admin or HR
- [ ] Navigate to Employees page
- [ ] "Create New Employee" button visible
- [ ] Click "Create New Employee"
- [ ] Fill in employee form:
  - First Name: Test
  - Last Name: User
  - Email: test@company.com
  - Year: 2024
  - Role: Employee
- [ ] Submit form
- [ ] Success message displayed
- [ ] Login ID generated (e.g., OITEUS20240001)
- [ ] Temporary password generated
- [ ] Copy both credentials

### Password Change Test
- [ ] Logout from admin account
- [ ] Login with new employee credentials
- [ ] Automatically redirected to Change Password page
- [ ] Enter new password (min 8 characters)
- [ ] Confirm new password
- [ ] Submit
- [ ] Success message displayed
- [ ] Redirected to dashboard
- [ ] Can navigate normally

### Session Persistence Test
- [ ] Logged in
- [ ] Refresh page (F5)
- [ ] Still logged in
- [ ] User data persists

### Logout Test
- [ ] Click profile dropdown
- [ ] Click "Log Out"
- [ ] Redirected to login page
- [ ] Cannot access protected routes
- [ ] Must login again

## ✅ Final Checks

- [ ] All pages load without errors
- [ ] No console errors in browser
- [ ] Backend logs show no errors
- [ ] Database queries work correctly
- [ ] Toast notifications work
- [ ] Role-based permissions work
- [ ] Protected routes redirect correctly

## 📊 System Status

### Ports
- Backend: ☐ Running on port 3000
- Frontend: ☐ Running on port 5173
- Database: ☐ Running on port 5432

### Services
- PostgreSQL: ☐ Running
- Backend API: ☐ Running
- Frontend Dev Server: ☐ Running

### Database
- Connection: ☐ Working
- Schema Loaded: ☐ Yes
- Test Users: ☐ Exist

## 🐛 If Something Doesn't Work

### Backend won't start
1. Check if port 3000 is available
2. Verify .env file exists and is configured
3. Check PostgreSQL is running
4. Review backend terminal for error messages

### Frontend won't start
1. Check if port 5173 is available
2. Verify npm install completed successfully
3. Check for package.json errors
4. Review frontend terminal for error messages

### Database connection fails
1. Verify PostgreSQL is running: `pg_isready`
2. Test connection: `psql -U postgres -d employee_auth_db`
3. Check DATABASE_URL in .env
4. Verify password is correct

### Login fails
1. Verify schema is loaded
2. Check backend logs for errors
3. Test database: `SELECT * FROM employees;`
4. Try resetting admin password (see QUICK_REFERENCE.md)

### Create employee fails
1. Check browser console for errors
2. Verify you're logged in as Admin or HR
3. Check backend logs
4. Verify database connection

## 📝 Notes

Add any issues or observations here:

```
[Your notes]
```

---

## ✅ Checklist Complete?

If all items are checked, congratulations! Your system is fully functional.

**Next Steps:**
1. Customize the UI to your preferences
2. Add more features (see QUICK_REFERENCE.md)
3. Deploy to production (update security settings)
4. Add more employees and test workflows

---

**Need help?** Check:
- SETUP_GUIDE.md - Detailed instructions
- QUICK_REFERENCE.md - Commands and troubleshooting
- SETUP_ALTERNATIVES.md - Alternative setups

**Date Completed:** _______________

**Tested By:** _______________

**Status:** ☐ All tests passed ☐ Issues found (see notes)
