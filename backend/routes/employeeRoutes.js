const express = require('express');
const router = express.Router();
const pool = require('../server');

// Get employee profile with resume and salary data
router.get('/:employeeId/profile', async (req, res) => {
  const { employeeId } = req.params;
  
  try {
    // Fetch employee resume data
    const employeeQuery = `
      SELECT 
        e.id,
        e.name,
        e.login_id,
        e.email,
        e.mobile,
        e.company,
        e.department,
        e.manager,
        e.location,
        e.about,
        e.job_description,
        e.interests,
        e.skills,
        e.certifications
      FROM employee_profiles e
      WHERE e.id = $1 OR e.login_id = $1
    `;
    
    const employeeResult = await pool.query(employeeQuery, [employeeId]);
    
    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const employeeData = employeeResult.rows[0];
    
    // Fetch salary data
    const salaryQuery = `
      SELECT 
        wage_type,
        monthly_wage,
        yearly_wage,
        working_days,
        break_time,
        pf_rate,
        professional_tax,
        salary_components
      FROM employee_salary
      WHERE employee_id = $1
    `;
    
    const salaryResult = await pool.query(salaryQuery, [employeeData.id]);
    
    let salaryData = null;
    if (salaryResult.rows.length > 0) {
      const salaryRow = salaryResult.rows[0];
      salaryData = {
        wageType: salaryRow.wage_type,
        monthlyWage: parseFloat(salaryRow.monthly_wage),
        yearlyWage: parseFloat(salaryRow.yearly_wage),
        workingDays: salaryRow.working_days,
        breakTime: salaryRow.break_time,
        pfRate: parseFloat(salaryRow.pf_rate),
        professionalTax: parseFloat(salaryRow.professional_tax),
        components: salaryRow.salary_components || []
      };
    }
    
    res.json({
      employeeData: {
        name: employeeData.name,
        loginId: employeeData.login_id,
        email: employeeData.email,
        mobile: employeeData.mobile || '',
        company: employeeData.company || '',
        department: employeeData.department || '',
        manager: employeeData.manager || '',
        location: employeeData.location || '',
        about: employeeData.about || '',
        jobDescription: employeeData.job_description || '',
        interests: employeeData.interests || '',
        skills: employeeData.skills || [],
        certifications: employeeData.certifications || []
      },
      salaryData
    });
    
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee profile with resume and salary data
router.put('/:employeeId/profile', async (req, res) => {
  const { employeeId } = req.params;
  const { employeeData, salaryData } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, get the actual employee ID if login_id was provided
    const idQuery = `
      SELECT id FROM employee_profiles 
      WHERE id = $1 OR login_id = $1
    `;
    const idResult = await client.query(idQuery, [employeeId]);
    
    if (idResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const actualEmployeeId = idResult.rows[0].id;
    
    // Update or insert employee profile
    const upsertEmployeeQuery = `
      INSERT INTO employee_profiles (
        id, name, login_id, email, mobile, company, department, 
        manager, location, about, job_description, interests, 
        skills, certifications, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        mobile = EXCLUDED.mobile,
        company = EXCLUDED.company,
        department = EXCLUDED.department,
        manager = EXCLUDED.manager,
        location = EXCLUDED.location,
        about = EXCLUDED.about,
        job_description = EXCLUDED.job_description,
        interests = EXCLUDED.interests,
        skills = EXCLUDED.skills,
        certifications = EXCLUDED.certifications,
        updated_at = NOW()
    `;
    
    await client.query(upsertEmployeeQuery, [
      actualEmployeeId,
      employeeData.name,
      employeeData.loginId,
      employeeData.email,
      employeeData.mobile,
      employeeData.company,
      employeeData.department,
      employeeData.manager,
      employeeData.location,
      employeeData.about,
      employeeData.jobDescription,
      employeeData.interests,
      JSON.stringify(employeeData.skills),
      JSON.stringify(employeeData.certifications)
    ]);
    
    // Update or insert salary data if provided
    if (salaryData) {
      // Calculate PF amounts based on basic salary
      const basicComponent = salaryData.components.find(c => c.name === 'Basic Salary');
      const basicSalary = basicComponent ? basicComponent.amount : 0;
      const pfEmployee = (basicSalary * salaryData.pfRate) / 100;
      const pfEmployer = pfEmployee;
      
      const upsertSalaryQuery = `
        INSERT INTO employee_salary (
          employee_id, wage_type, monthly_wage, yearly_wage, 
          working_days, break_time, salary_components,
          pf_employee, pf_employer, pf_rate, professional_tax, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (employee_id)
        DO UPDATE SET
          wage_type = EXCLUDED.wage_type,
          monthly_wage = EXCLUDED.monthly_wage,
          yearly_wage = EXCLUDED.yearly_wage,
          working_days = EXCLUDED.working_days,
          break_time = EXCLUDED.break_time,
          salary_components = EXCLUDED.salary_components,
          pf_employee = EXCLUDED.pf_employee,
          pf_employer = EXCLUDED.pf_employer,
          pf_rate = EXCLUDED.pf_rate,
          professional_tax = EXCLUDED.professional_tax,
          updated_at = NOW()
      `;
      
      await client.query(upsertSalaryQuery, [
        actualEmployeeId,
        salaryData.wageType,
        salaryData.monthlyWage,
        salaryData.yearlyWage,
        salaryData.workingDays,
        salaryData.breakTime,
        JSON.stringify(salaryData.components),
        pfEmployee,
        pfEmployer,
        salaryData.pfRate,
        salaryData.professionalTax
      ]);
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Employee profile updated successfully' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating employee profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
