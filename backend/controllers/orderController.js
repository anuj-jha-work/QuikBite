const Food = require('../models/Food');
const Order = require('../models/Order');
const User = require('../models/User');

const allowedStatuses = ['Processing', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const deliveryFee = 2.99;

const generateOrderId = async () => {
  const lastOrder = await Order.findOne({}, { orderId: 1 }).sort({ createdAt: -1 });
  let nextNumber = 101;
  
  if (lastOrder && lastOrder.orderId) {
    const lastNumber = parseInt(lastOrder.orderId.replace(/[^\d]/g, ''));
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  return nextNumber.toString();
};

const buildOrderItems = async (itemsInput, cartData) => {
  const sourceItems = Array.isArray(itemsInput) && itemsInput.length > 0
    ? itemsInput
    : Object.entries(cartData || {}).map(([foodId, quantity]) => ({ foodId, quantity }));

  if (sourceItems.length === 0) {
    throw new Error('Order items are required');
  }

  const foodIds = sourceItems.map((item) => item.foodId || item._id);
  const foods = await Food.find({ _id: { $in: foodIds } });
  const foodMap = new Map(foods.map((food) => [food._id.toString(), food]));

  const orderItems = sourceItems.map((item) => {
    const foodId = (item.foodId || item._id || '').toString();
    const food = foodMap.get(foodId);

    if (!food) {
      throw new Error(`Food not found for cart item ${foodId}`);
    }

    const quantity = Math.max(1, Number(item.quantity) || 1);
    return {
      foodId: food._id,
      name: food.name,
      quantity,
      price: Number(food.price),
      image: food.image
    };
  });

  // Determine vegetarian tag
  const allVegetarian = orderItems.every((item) => {
    const food = foodMap.get((item.foodId || '').toString());
    return food && food.vegetarian;
  });

  const anyVegetarian = orderItems.some((item) => {
    const food = foodMap.get((item.foodId || '').toString());
    return food && food.vegetarian;
  });

  let vegTag = '';
  if (allVegetarian) {
    vegTag = 'V';
  } else if (!anyVegetarian) {
    vegTag = 'NV';
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    orderItems,
    amount: Number((subtotal + deliveryFee).toFixed(2)),
    vegTag
  };
};

const validateAddress = (address = {}) => {
  const required = ['name', 'phone', 'email', 'address', 'city', 'state', 'pinCode'];
  const missing = required.filter((field) => !String(address[field] || '').trim());
  if (missing.length > 0) {
    throw new Error(`Missing address fields: ${missing.join(', ')}`);
  }
};

const placeOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { address, payment, items } = req.body;
    validateAddress(address);

    const { orderItems, amount, vegTag } = await buildOrderItems(items, Object.fromEntries(user.cartData || new Map()));
    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      vegTag,
      userId: user._id,
      items: orderItems,
      amount,
      address: {
        name: address.name.trim(),
        phone: address.phone.trim(),
        email: address.email.trim(),
        address: address.address.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pinCode: address.pinCode.trim()
      },
      payment: {
        method: payment?.method || 'Cash on Delivery',
        paid: Boolean(payment?.paid),
        transactionId: payment?.transactionId || ''
      },
      status: 'Processing'
    });

    user.cartData = new Map();
    await user.save();

    return res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email isAdmin')
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: 'orderId and status are required' });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    return res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  listOrders,
  updateOrderStatus
};
