const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { dashboardStats, listUsers } = require('../controllers/adminController');

router.use(verifyToken, requireAdmin);
router.get('/dashboard', dashboardStats);
router.get('/users', listUsers);

module.exports = router;
