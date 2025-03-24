const pool = require('../models/db');

// ✅ Get All Employees
const getEmployees = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.id, e.name, e.department, e.email, u.role
            FROM employees e
            INNER JOIN users u ON e.user_id = u.id
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching employees' });
    }
};

// ✅ Add a New Employee (and User)
const addEmployee = async (req, res) => {
    const { username, password, role, department, name, email } = req.body;

    try {
        // Insert into users table (including department)
        const userResult = await pool.query(
            'INSERT INTO users (username, password, role, department) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, password, role, department]
        );
        const userId = userResult.rows[0].id;

        // Insert into employees table (linked with user_id)
        const employeeResult = await pool.query(
            'INSERT INTO employees (name, department, email, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, department, email, userId]
        );

        res.status(201).json(employeeResult.rows[0]);
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ error: 'Error adding employee' });
    }
};

// ✅ Delete Employee (from both tables)
const deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        // First, find the user_id linked to the employee
        const result = await pool.query('SELECT user_id FROM employees WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found.' });
        }

        const userId = result.rows[0].user_id;

        // Delete from Employees table
        await pool.query('DELETE FROM employees WHERE id = $1', [id]);

        // Also delete from Users table using user_id
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        res.status(200).json({ message: 'Employee deleted successfully.' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Error deleting employee.' });
    }
};

module.exports = { getEmployees, addEmployee, deleteEmployee };
