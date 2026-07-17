const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getCart, addToCart, removeFromCart, updateCart } = require('../controllers/cartController');

router.use(verifyToken);
router.get('/get', getCart);
router.post('/add', addToCart);
router.post('/remove', removeFromCart);
router.post('/update', updateCart);

module.exports = router;
