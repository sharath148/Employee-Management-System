const pool = require('../models/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Mark Attendance
const markAttendance = async (req, res) => {
    const authHeader = req.headers.authorization;
    const { employee_id, status } = req.body;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header is missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!employee_id || decoded.id !== employee_id) {
            return res.status(401).json({ error: 'Invalid employee ID or token mismatch' });
        }

        // Check if attendance is already marked for today
        const existing = await pool.query(
            'SELECT * FROM attendance WHERE employee_id = $1 AND date = CURRENT_DATE',
            [employee_id]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Attendance already marked for today' });
        }

        // Insert attendance
        await pool.query(
            'INSERT INTO attendance (employee_id, date, status) VALUES ($1, CURRENT_DATE, $2)',
            [employee_id, status]
        );

        res.status(200).json({ message: 'Attendance marked successfully' });

    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Internal Server Error while marking attendance' });
    }
};

// Get Attendance Records
const getAttendance = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
    u.id,
    u.username AS name,
    u.department,
    a.date,
    a.status,
    COALESCE(present_summary.present_days, 0) AS present_days,
    COALESCE(absent_summary.absent_days, 0) AS absent_days
FROM attendance a
INNER JOIN users u ON a.employee_id = u.id

-- Join for present days count
LEFT JOIN (
    SELECT employee_id, COUNT(*) AS present_days
    FROM attendance
    WHERE status = 'Present'
    GROUP BY employee_id
) AS present_summary ON present_summary.employee_id = u.id

-- Join for absent days count
LEFT JOIN (
    SELECT employee_id, COUNT(*) AS absent_days
    FROM attendance
    WHERE status = 'Absent'
    GROUP BY employee_id
) AS absent_summary ON absent_summary.employee_id = u.id

ORDER BY a.date DESC;

        `);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({ error: 'Error fetching attendance records' });
    }
};

// Get Department Counts
const getDepartmentCounts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT department, COUNT(*) AS count
            FROM users
            WHERE role = 'employee'
            GROUP BY department;
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching department counts:', error);
        res.status(500).json({ error: 'Error fetching department counts' });
    }
};

const getDepartmentWiseAttendance = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.department,
                COUNT(*) AS present_count
            FROM attendance a
            INNER JOIN users u ON a.employee_id = u.id
            WHERE a.status = 'Present' AND a.date = CURRENT_DATE
            GROUP BY u.department;
        `);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching department-wise attendance:', error);
        res.status(500).json({ error: 'Error fetching department-wise attendance' });
    }
};

module.exports = { markAttendance, getAttendance, getDepartmentCounts,getDepartmentWiseAttendance  };
