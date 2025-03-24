const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');
require('dotenv').config();

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = result.rows[0];

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: 'JWT_SECRET is not defined in .env' });
        }

        // Generate Token including employee_id explicitly
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, employee_id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send employee_id explicitly
        res.status(200).json({ token, role: user.role, employee_id: user.id });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
