# Backend Only Setup (If You Don't Want to Install PostgreSQL Locally)

If you don't want to install PostgreSQL on your Windows machine, you have these alternatives:

## Option 1: Use Docker (Recommended)

### Install Docker Desktop for Windows
1. Download from https://www.docker.com/products/docker-desktop
2. Install and restart your computer
3. Open Docker Desktop

### Run PostgreSQL in Docker

```bash
# Run PostgreSQL container
docker run --name workora-postgres \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=employee_auth_db \
  -p 5432:5432 \
  -d postgres:15

# Check if running
docker ps

# Access PostgreSQL
docker exec -it workora-postgres psql -U postgres -d employee_auth_db
```

### Load Database Schema

```bash
# Copy schema file to container
docker cp backend/database/schema.sql workora-postgres:/tmp/schema.sql

# Execute schema
docker exec -it workora-postgres psql -U postgres -d employee_auth_db -f /tmp/schema.sql
```

### Update .env

```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/employee_auth_db
```

---

## Option 2: Use Cloud PostgreSQL (Free Tier)

### Neon.tech (Recommended - 0.5GB Free)

1. Go to https://neon.tech
2. Sign up for free
3. Create new project
4. Copy connection string
5. Use their SQL Editor to paste schema.sql

### ElephantSQL (20MB Free)

1. Go to https://www.elephantsql.com
2. Sign up for free (Tiny Turtle plan)
3. Create new instance
4. Copy connection string
5. Use their browser tool to run schema.sql

### Supabase (500MB Free)

1. Go to https://supabase.com
2. Sign up and create project
3. Go to SQL Editor
4. Paste schema.sql and run
5. Get connection string from Project Settings

### Update .env with Cloud URL

```env
# Example with Neon
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb

# Example with ElephantSQL  
DATABASE_URL=postgres://user:password@jelani.db.elephantsql.com/user

# Example with Supabase
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

---

## Option 3: Use PostgreSQL Portable (No Installation)

1. Download from https://www.postgresql.org/download/windows/
2. Extract to a folder (e.g., C:\PostgreSQL)
3. Run `pgsql\bin\initdb.exe -D pgsql\data`
4. Start server: `pgsql\bin\pg_ctl.exe -D pgsql\data start`

---

## Which Option Should You Choose?

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Docker** | Easy, professional, portable | Requires Docker Desktop | Development |
| **Neon/Cloud** | No installation, accessible anywhere | Requires internet | Testing, demos |
| **Local Install** | Full control, fastest | Takes disk space | Production-like dev |
| **Portable** | No admin rights needed | Manual setup | Restricted machines |

---

## Minimal Backend-Only Testing

If you just want to test the API without the frontend:

### 1. Start Backend

```bash
cd backend
npm install
npm start
```

### 2. Test with cURL

```bash
# Test health
curl http://localhost:3000/health

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"login_id\":\"OIADMI20220001\",\"password\":\"Admin@123\"}"

# Save the token from response, then:

# Test create employee
curl -X POST http://localhost:3000/api/employees/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"first_name\":\"John\",\"last_name\":\"Doe\",\"email\":\"john@test.com\",\"year_of_joining\":2024,\"role\":\"employee\"}"
```

### 3. Or Use Postman

1. Download Postman: https://www.postman.com/downloads/
2. Import these requests:

**Login:**
- Method: POST
- URL: http://localhost:3000/api/auth/login
- Body (JSON):
```json
{
  "login_id": "OIADMI20220001",
  "password": "Admin@123"
}
```

**Create Employee:**
- Method: POST
- URL: http://localhost:3000/api/employees/create
- Headers: `Authorization: Bearer <token_from_login>`
- Body (JSON):
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@company.com",
  "year_of_joining": 2024,
  "role": "employee"
}
```

---

## Quick Start with Docker (Complete Commands)

```bash
# 1. Install Docker Desktop from docker.com

# 2. Start PostgreSQL
docker run --name workora-db \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=employee_auth_db \
  -p 5432:5432 \
  -d postgres:15

# 3. Wait 5 seconds for database to start
timeout /t 5

# 4. Load schema
docker cp backend/database/schema.sql workora-db:/schema.sql
docker exec workora-db psql -U postgres -d employee_auth_db -f /schema.sql

# 5. Update backend/.env
echo DATABASE_URL=postgresql://postgres:password123@localhost:5432/employee_auth_db > backend/.env
echo PORT=3000 >> backend/.env
echo JWT_SECRET=your-secret-key-here >> backend/.env
echo NODE_ENV=development >> backend/.env

# 6. Start backend
cd backend
npm install
npm start

# 7. In new terminal, start frontend
cd ..
npm install
npm run dev
```

Done! Visit http://localhost:5173 and login with OIADMI20220001 / Admin@123

---

## Stopping and Starting

### Docker

```bash
# Stop
docker stop workora-db

# Start again
docker start workora-db

# Remove completely
docker rm -f workora-db
```

### Backend

```bash
# Stop: Press Ctrl+C in terminal

# Start:
cd backend
npm start
```

### Frontend

```bash
# Stop: Press Ctrl+C in terminal

# Start:
npm run dev
```
