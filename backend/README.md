# Workora Backend API

Backend server for the Workora employee management system with PostgreSQL database.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env` file and update the following variables:
     ```
     PORT=5000
     DB_USER=postgres
     DB_HOST=localhost
     DB_NAME=workora
     DB_PASSWORD=your_postgres_password
     DB_PORT=5432
     ```

3. **Setup Database**
   
   Create the database:
   ```bash
   psql -U postgres
   CREATE DATABASE workora;
   \q
   ```

   Run the schema to create tables:
   ```bash
   psql -U postgres -d workora -f database/schema.sql
   ```
   
   Or manually run the SQL commands from `database/schema.sql` in your PostgreSQL client.

4. **Start the Server**
   
   Development mode (with auto-restart):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

   The server will start on `http://localhost:5000`

## API Endpoints

### Employee Profile Management

#### Get Employee Profile
```
GET /api/admin/employees/:employeeId/profile
```
Returns employee resume data and salary information.

**Response:**
```json
{
  "employeeData": {
    "name": "John Doe",
    "loginId": "OIJD2024001",
    "email": "john.doe@workora.com",
    "mobile": "+1234567890",
    "company": "Workora Inc.",
    "department": "Engineering",
    "manager": "Jane Smith",
    "location": "New York",
    "about": "...",
    "jobDescription": "...",
    "interests": "...",
    "skills": ["JavaScript", "React", "Node.js"],
    "certifications": ["AWS Certified"]
  },
  "salaryData": {
    "wageType": "monthly",
    "monthlyWage": 50000,
    "yearlyWage": 600000,
    "workingDays": 5,
    "breakTime": 60,
    "pfRate": 12,
    "professionalTax": 200,
    "components": [...]
  }
}
```

#### Update Employee Profile
```
PUT /api/admin/employees/:employeeId/profile
```
Updates employee resume and salary data.

**Request Body:**
```json
{
  "employeeData": {
    "name": "John Doe",
    "loginId": "OIJD2024001",
    "email": "john.doe@workora.com",
    ...
  },
  "salaryData": {
    "monthlyWage": 50000,
    "components": [...],
    ...
  }
}
```

## Database Schema

### Tables

1. **employee_profiles**
   - Stores employee personal and professional information
   - Fields: id, name, login_id, email, mobile, company, department, manager, location, about, job_description, interests, skills (JSONB), certifications (JSONB)

2. **employee_salary**
   - Stores employee salary and wage information
   - Fields: employee_id, wage_type, monthly_wage, yearly_wage, working_days, break_time, salary_components (JSONB), pf_employee, pf_employer, pf_rate, professional_tax

## Features

- ✅ PostgreSQL with pgcrypto extension for data encryption
- ✅ JSONB fields for flexible data storage (skills, certifications, salary components)
- ✅ Automatic timestamp updates with triggers
- ✅ Transactional data updates for data integrity
- ✅ RESTful API design
- ✅ Error handling and validation

## Security Notes

- Update `DB_PASSWORD` in `.env` file
- Use environment-specific configuration for production
- Enable SSL for PostgreSQL connections in production
- Implement authentication middleware before deploying

## Troubleshooting

**Connection Error:**
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

**Schema Error:**
- Run the schema file again
- Check PostgreSQL user permissions

## Development

To add new features:
1. Update schema in `database/schema.sql`
2. Add routes in `routes/`
3. Update API documentation in this README
