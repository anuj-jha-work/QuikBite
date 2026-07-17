const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { registerUser, loginUser, getProfile } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', verifyToken, getProfile);

module.exports = router;
