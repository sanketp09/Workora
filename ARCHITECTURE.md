# Workora Employee Authentication System - Architecture

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                     (React Frontend - Port 5173)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  SignIn.jsx │  │  Dashboard   │  │  CreateEmployee    │   │
│  │             │  │              │  │     (Admin/HR)     │   │
│  │ - Login ID  │  │ - User Info  │  │                    │   │
│  │ - Password  │  │ - Navigation │  │ - First/Last Name  │   │
│  └──────┬──────┘  └──────────────┘  │ - Email            │   │
│         │                            │ - Year/Role        │   │
│         │                            └─────────┬──────────┘   │
│         │                                      │              │
│  ┌──────┴────────────┐                       │              │
│  │ ChangePassword    │                       │              │
│  │                   │                       │              │
│  │ - Force on        │                       │              │
│  │   First Login     │                       │              │
│  └───────────────────┘                       │              │
│                                               │              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              AuthContext (State Management)             │  │
│  │                                                         │  │
│  │  - User State                                          │  │
│  │  - Token Management                                    │  │
│  │  - signIn(), changePassword(), createEmployee()       │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │                                       │
│  ┌────────────────────┴────────────────────────────────────┐  │
│  │              API Service (api.js)                       │  │
│  │                                                         │  │
│  │  HTTP Client with JWT Token Management                 │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │                                       │
└───────────────────────┼───────────────────────────────────────┘
                        │
                        │ REST API Calls (JSON)
                        │ Authorization: Bearer <JWT>
                        │
┌───────────────────────┼───────────────────────────────────────┐
│                       ▼                                       │
│                 BACKEND SERVER                                │
│           (Node.js + Express - Port 3000)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    server.js                            │  │
│  │                                                         │  │
│  │  - Express Configuration                               │  │
│  │  - CORS Setup                                          │  │
│  │  - Route Registration                                  │  │
│  │  - Error Handling                                      │  │
│  └─────────┬───────────────────────────────┬───────────────┘  │
│            │                               │                  │
│  ┌─────────┴─────────┐         ┌──────────┴─────────────┐   │
│  │  routes/auth.js   │         │  routes/employees.js   │   │
│  │                   │         │                        │   │
│  │  POST /login      │         │  POST /create          │   │
│  │  POST /change-pwd │         │  GET /employees        │   │
│  │  GET /profile     │         │  GET /employees/:id    │   │
│  └─────────┬─────────┘         └──────────┬─────────────┘   │
│            │                               │                  │
│            │         ┌─────────────────────┘                  │
│            │         │                                        │
│  ┌─────────┴─────────┴──────────────────────────────────┐   │
│  │           middleware/auth.js                         │   │
│  │                                                      │   │
│  │  - JWT Token Verification                           │   │
│  │  - Role-Based Access Control                        │   │
│  │  - adminOrHRMiddleware                              │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────┴─────────────────────────────────┐   │
│  │           config/database.js                         │   │
│  │                                                      │   │
│  │  PostgreSQL Connection Pool                         │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        │ SQL Queries (Parameterized)
                        │
┌───────────────────────┼──────────────────────────────────────┐
│                       ▼                                      │
│                   DATABASE                                   │
│            (PostgreSQL - Port 5432)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              employees TABLE                            │  │
│  │                                                         │  │
│  │  - id (SERIAL PRIMARY KEY)                             │  │
│  │  - login_id (UNIQUE, e.g., OIJODO20220001)            │  │
│  │  - email (UNIQUE)                                      │  │
│  │  - password_hash (pgcrypto bcrypt)                     │  │
│  │  - first_name                                          │  │
│  │  - last_name                                           │  │
│  │  - year_of_joining                                     │  │
│  │  - serial_number                                       │  │
│  │  - role (admin/hr/employee)                            │  │
│  │  - must_change_password (BOOLEAN)                      │  │
│  │  - created_at                                          │  │
│  │  - updated_at                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              DATABASE FUNCTIONS                         │  │
│  │                                                         │  │
│  │  generate_login_id(first, last, year)                  │  │
│  │  ├─ Format: OI + first2 + last2 + year + serial       │  │
│  │  └─ Example: OIJODO20240001                            │  │
│  │                                                         │  │
│  │  get_next_serial_number(year)                          │  │
│  │  └─ Auto-increment per year                            │  │
│  │                                                         │  │
│  │  verify_password(login_id, password)                   │  │
│  │  └─ Uses pgcrypto crypt() for verification            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. Employee Creation Flow (Admin/HR)

```
┌──────────┐                                                    
│  Admin   │                                                    
│    or    │                                                    
│    HR    │                                                    
└────┬─────┘                                                    
     │                                                          
     │ 1. Navigate to Create Employee                          
     │                                                          
     ▼                                                          
┌────────────────┐                                              
│  Fill Form     │                                              
│                │                                              
│  - First: John │                                              
│  - Last: Doe   │                                              
│  - Email       │                                              
│  - Year: 2024  │                                              
│  - Role        │                                              
└────┬───────────┘                                              
     │                                                          
     │ 2. Submit                                                
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Frontend (CreateEmployee.jsx)                         │    
│                                                         │    
│  POST /api/employees/create                            │    
│  Headers: { Authorization: Bearer <token> }            │    
│  Body: { first_name, last_name, email, year, role }   │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 3. API Call                                              
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Backend (routes/employees.js)                         │    
│                                                         │    
│  1. Verify JWT token (middleware/auth.js)              │    
│  2. Check role is admin/hr                             │    
│  3. Validate input                                     │    
│  4. Check email doesn't exist                          │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 4. Generate Credentials                                  
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Database Functions                                     │    
│                                                         │    
│  1. Call generate_login_id('John', 'Doe', 2024)       │    
│     └─ Returns: OIJODO20240001                         │    
│                                                         │    
│  2. Call get_next_serial_number(2024)                  │    
│     └─ Returns: 0001                                   │    
│                                                         │    
│  3. Generate random password                           │    
│     └─ Example: Xm@9kP2nQ7                             │    
│                                                         │    
│  4. Hash password with crypt()                         │    
│     └─ Uses bcrypt algorithm                           │    
│                                                         │    
│  5. INSERT INTO employees (...)                        │    
│     └─ must_change_password = TRUE                     │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 5. Return Credentials                                    
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Frontend Response                                      │    
│                                                         │    
│  ✅ Success!                                            │    
│                                                         │    
│  ┌─────────────────────────────────────────────────┐   │    
│  │  Login ID: OIJODO20240001                      │   │    
│  │  Password: Xm@9kP2nQ7                          │   │    
│  │                                                 │   │    
│  │  [Copy] buttons                                │   │    
│  └─────────────────────────────────────────────────┘   │    
│                                                         │    
│  ⚠️ Share these credentials securely!                  │    
└─────────────────────────────────────────────────────────┘    
```

### 2. Employee Login Flow

```
┌──────────┐                                                    
│ Employee │                                                    
└────┬─────┘                                                    
     │                                                          
     │ 1. Receive credentials from HR                           
     │    Login ID: OIJODO20240001                              
     │    Password: Xm@9kP2nQ7                                  
     │                                                          
     ▼                                                          
┌────────────────┐                                              
│  Login Page    │                                              
│                │                                              
│  Enter:        │                                              
│  - Login ID    │                                              
│  - Password    │                                              
└────┬───────────┘                                              
     │                                                          
     │ 2. Submit                                                
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Frontend (SignIn.jsx)                                 │    
│                                                         │    
│  POST /api/auth/login                                  │    
│  Body: {                                               │    
│    login_id: "OIJODO20240001",                        │    
│    password: "Xm@9kP2nQ7"                             │    
│  }                                                     │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 3. API Call                                              
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Backend (routes/auth.js)                              │    
│                                                         │    
│  1. Receive login_id and password                      │    
│  2. Call verify_password() function                    │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 4. Verify Password                                       
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Database (verify_password function)                   │    
│                                                         │    
│  SELECT * FROM employees                               │    
│  WHERE login_id = 'OIJODO20240001'                     │    
│  AND password_hash = crypt('Xm@9kP2nQ7', password_hash) │    
│                                                         │    
│  ✅ Match found!                                        │    
│                                                         │    
│  Returns:                                              │    
│  - id, login_id, email, first_name, last_name         │    
│  - role, must_change_password = TRUE                   │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 5. Generate JWT                                          
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Backend (JWT Creation)                                │    
│                                                         │    
│  jwt.sign({                                            │    
│    id, login_id, email, role                          │    
│  }, JWT_SECRET, { expiresIn: '7d' })                  │    
│                                                         │    
│  Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...        │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 6. Return Response                                       
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Frontend Response                                      │    
│                                                         │    
│  {                                                      │    
│    success: true,                                      │    
│    token: "eyJhbGciOi...",                             │    
│    user: {                                             │    
│      id, login_id, first_name, last_name,             │    
│      role, must_change_password: true                 │    
│    }                                                   │    
│  }                                                     │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 7. Save to localStorage                                  
     │    Store token & user data                               
     │                                                          
     ▼                                                          
┌────────────────┐                                              
│   Check Flag   │                                              
│                │                                              
│ must_change_   │                                              
│ password?      │                                              
│                │                                              
│  ✅ TRUE       │                                              
└────┬───────────┘                                              
     │                                                          
     │ 8. Redirect                                              
     │                                                          
     ▼                                                          
┌────────────────────┐                                          
│  Change Password   │                                          
│      Page          │                                          
│                    │                                          
│  ⚠️ You must change │                                          
│  your password     │                                          
│                    │                                          
│  [New Password]    │                                          
│  [Confirm]         │                                          
└────┬───────────────┘                                          
     │                                                          
     │ 9. Submit new password                                   
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Backend (change-password)                             │    
│                                                         │    
│  UPDATE employees                                      │    
│  SET password_hash = crypt(new_password, gen_salt())  │    
│      must_change_password = FALSE                      │    
│  WHERE id = user_id                                    │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 10. Password Changed                                     
     │                                                          
     ▼                                                          
┌────────────────┐                                              
│   Dashboard    │                                              
│                │                                              
│  ✅ Welcome!   │                                              
└────────────────┘                                              
```

### 3. Authentication Flow (Protected Routes)

```
┌──────────┐                                                    
│   User   │                                                    
│ (Logged) │                                                    
└────┬─────┘                                                    
     │                                                          
     │ 1. Navigate to /employees                                
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Frontend (ProtectedRoute)                             │    
│                                                         │    
│  1. Check if user exists in AuthContext                │    
│  2. Check if token exists in localStorage              │    
│  3. Check must_change_password flag                    │    
│                                                         │    
│  ✅ All checks passed                                   │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 2. Load Page                                             
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Page Component (e.g., Employees)                      │    
│                                                         │    
│  Needs data from API...                                │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 3. API Call                                              
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  API Service (api.js)                                  │    
│                                                         │    
│  GET /api/employees                                    │    
│  Headers: {                                            │    
│    Authorization: "Bearer eyJhbGciOi..."              │    
│  }                                                     │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 4. Backend receives request                              
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Backend Middleware (authMiddleware)                   │    
│                                                         │    
│  1. Extract token from Authorization header            │    
│  2. Verify JWT signature                               │    
│  3. Check expiration                                   │    
│  4. Decode user info                                   │    
│                                                         │    
│  ✅ Token valid                                         │    
│                                                         │    
│  req.user = { id, login_id, email, role }             │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 5. Check role (if needed)                                
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  adminOrHRMiddleware                                   │    
│                                                         │    
│  if (user.role !== 'admin' && user.role !== 'hr') {   │    
│    return 403 Forbidden                                │    
│  }                                                     │    
│                                                         │    
│  ✅ Role authorized                                     │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 6. Execute route handler                                 
     │                                                          
     ▼                                                          
┌─────────────────────────────────────────────────────────┐    
│  Route Handler (routes/employees.js)                   │    
│                                                         │    
│  Query database...                                     │    
│  Return data...                                        │    
└────┬────────────────────────────────────────────────────┘    
     │                                                          
     │ 7. Response                                              
     │                                                          
     ▼                                                          
┌────────────────┐                                              
│   Frontend     │                                              
│   Displays     │                                              
│     Data       │                                              
└────────────────┘                                              
```

---

## 🔐 Security Architecture

### Password Security

```
┌─────────────────────────────────────────────────────────┐
│  Password Lifecycle                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. CREATION                                            │
│     └─ Generate random password (12 chars)             │
│        Upper + Lower + Number + Special                │
│                                                         │
│  2. HASHING                                             │
│     └─ crypt(password, gen_salt('bf'))                 │
│        Uses bcrypt (Blowfish) algorithm                │
│        Cost factor: 8 (2^8 = 256 iterations)           │
│                                                         │
│  3. STORAGE                                             │
│     └─ Store only hash in database                     │
│        Original password never stored                  │
│                                                         │
│  4. VERIFICATION                                        │
│     └─ crypt(input_password, stored_hash)              │
│        Compare with stored hash                        │
│                                                         │
│  5. FIRST LOGIN                                         │
│     └─ Force password change                           │
│        Set must_change_password = FALSE                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### JWT Token Security

```
┌─────────────────────────────────────────────────────────┐
│  JWT Token Structure                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Header:                                                │
│  {                                                      │
│    "alg": "HS256",                                      │
│    "typ": "JWT"                                         │
│  }                                                      │
│                                                         │
│  Payload:                                               │
│  {                                                      │
│    "id": 1,                                             │
│    "login_id": "OIJODO20240001",                       │
│    "email": "john@company.com",                        │
│    "role": "employee",                                 │
│    "iat": 1234567890,    // Issued at                  │
│    "exp": 1234567890     // Expires in 7 days          │
│  }                                                      │
│                                                         │
│  Signature:                                             │
│  HMACSHA256(                                            │
│    base64(header) + "." + base64(payload),             │
│    JWT_SECRET                                           │
│  )                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### Entity Relationship

```
┌─────────────────────────────────────────────────────────┐
│                     employees                           │
├─────────────────────────────────────────────────────────┤
│  PK  id                    SERIAL                       │
│  UK  login_id              VARCHAR(50)                  │
│  UK  email                 VARCHAR(255)                 │
│      password_hash         TEXT                         │
│      first_name            VARCHAR(100)                 │
│      last_name             VARCHAR(100)                 │
│      year_of_joining       INTEGER                      │
│      serial_number         INTEGER                      │
│      role                  VARCHAR(20)                  │
│      must_change_password  BOOLEAN                      │
│      created_at            TIMESTAMP                    │
│      updated_at            TIMESTAMP                    │
└─────────────────────────────────────────────────────────┘

Indexes:
- idx_login_id ON (login_id)
- idx_email ON (email)
- idx_year_serial ON (year_of_joining, serial_number)
- idx_role ON (role)

Constraints:
- role CHECK (role IN ('admin', 'hr', 'employee'))
- login_id UNIQUE
- email UNIQUE

Functions:
- generate_login_id(first_name, last_name, year) → VARCHAR
- get_next_serial_number(year) → INTEGER
- verify_password(login_id, password) → TABLE(...)
```

---

## 📊 System Flows Summary

| Flow | Steps | Security |
|------|-------|----------|
| **Create Employee** | 1. Admin fills form<br>2. Backend generates Login ID<br>3. Generate temp password<br>4. Hash password<br>5. Store in DB<br>6. Return credentials | ✅ Role-based<br>✅ JWT auth<br>✅ Password hashing |
| **Employee Login** | 1. Enter credentials<br>2. Verify password<br>3. Generate JWT<br>4. Store token<br>5. Redirect based on flag | ✅ Password verification<br>✅ JWT generation<br>✅ Force pwd change |
| **Password Change** | 1. Submit new password<br>2. Hash password<br>3. Update DB<br>4. Clear flag<br>5. Continue to dashboard | ✅ Token required<br>✅ Bcrypt hashing<br>✅ Flag management |
| **API Request** | 1. Send with token<br>2. Verify JWT<br>3. Check role<br>4. Execute query<br>5. Return data | ✅ JWT verification<br>✅ Role authorization<br>✅ Parameterized queries |

---

This architecture ensures:
- ✅ Secure authentication
- ✅ Role-based access control
- ✅ Auto-generated unique Login IDs
- ✅ Strong password security
- ✅ Scalable and maintainable structure
