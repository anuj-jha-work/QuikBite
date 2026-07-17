const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { placeOrder, getUserOrders, listOrders, updateOrderStatus } = require('../controllers/orderController');

router.use(verifyToken);
router.post('/place', placeOrder);
router.get('/userorders', getUserOrders);
router.get('/list', requireAdmin, listOrders);
router.post('/status', requireAdmin, updateOrderStatus);

module.exports = router;
