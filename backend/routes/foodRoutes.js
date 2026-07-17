const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { listFoods, addFood, updateFood, removeFood } = require('../controllers/foodController');

router.get('/list', listFoods);
router.post('/add', verifyToken, requireAdmin, upload.single('image'), addFood);
router.put('/update/:id', verifyToken, requireAdmin, upload.single('image'), updateFood);
router.delete('/remove/:id', verifyToken, requireAdmin, removeFood);

module.exports = router;
