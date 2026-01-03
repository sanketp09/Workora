# Workora HR Management System - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Git

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/sanketp09/Workora.git
cd Workora
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Setup Database

#### Install PostgreSQL
- Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
- Remember the password you set for the `postgres` user
- Make sure PostgreSQL service is running

#### Configure Database Connection
```bash
# Copy environment example file
cd backend
cp .env.example .env
```

Edit the `.env` file with your database details:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=workora_hr
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_secure_secret_key
```

#### Initialize Database
```bash
# Run the database setup script
node setup-database-for-others.js
```

### 4. Start the Application

#### Option 1: Start both frontend and backend together
```bash
npm run dev:full
```

#### Option 2: Start separately (recommended for development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 6. Default Login Credentials

```
Email: admin@workora.com
Password: admin123
```

## Common Issues & Solutions

### Database Connection Errors

**Error**: `database "workora_hr" does not exist`
- **Solution**: Run the database setup script: `node setup-database-for-others.js`

**Error**: `password authentication failed for user "postgres"`
- **Solution**: Update the `DB_PASSWORD` in your `.env` file

**Error**: `connect ECONNREFUSED ::1:5432`
- **Solution**: Make sure PostgreSQL service is running

### Port Already in Use

**Error**: `Port 5173 is in use`
- **Solution**: The app will automatically use the next available port (5174, 5175, etc.)

**Error**: `Port 5000 is in use`
- **Solution**: Change the `PORT` value in `backend/.env`

### CORS Errors

**Error**: `Access to fetch blocked by CORS policy`
- **Solution**: Make sure both frontend and backend are running
- The backend is configured to allow requests from common development ports

## Project Structure

```
Workora/
├── src/                  # React frontend
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   └── context/         # React context
├── backend/             # Express.js backend
│   ├── config/         # Database configuration
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   └── server.js       # Main server file
├── public/             # Static assets
└── README.md
```

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run dev:backend` - Start backend development server
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/clock` - Clock in/out
- `GET /api/payroll` - Get payroll records
- `GET /api/reports` - Get various reports
- `GET /api/dashboard/stats` - Get dashboard statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you encounter any issues:

1. Check this setup guide
2. Look at the browser console for errors
3. Check the backend logs
4. Create an issue on GitHub with error details

## License

This project is licensed under the MIT License.