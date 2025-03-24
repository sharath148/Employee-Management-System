const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');

router.post('/', authenticateToken, attendanceController.markAttendance);
router.get('/', authenticateToken, attendanceController.getAttendance);
router.get('/department-counts', authenticateToken, attendanceController.getDepartmentCounts);
router.get('/department-attendance', authenticateToken, attendanceController.getDepartmentWiseAttendance);

module.exports = router;
