const express = require('express');
const router = express.Router();
const { addEmployee, getEmployees, deleteEmployee } = require('../controllers/employeeController');
const authenticateToken = require('../middleware/auth');

// ✅ Middleware to ensure admin role
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access Denied. Admins only.' });
    }
    next();
};

// ✅ Routes
router.get('/', authenticateToken, isAdmin, getEmployees);
router.post('/', authenticateToken, isAdmin, addEmployee);
router.delete('/:id', authenticateToken, isAdmin, deleteEmployee);

module.exports = router;
