const Food = require('../models/Food');
const User = require('../models/User');

const toPlainCart = (cartData) => Object.fromEntries(cartData || new Map());

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const getCart = async (req, res) => {
  try {
    const user = await getUser(req.user.id);
    return res.json({ success: true, cartData: toPlainCart(user.cartData) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;
    const amount = Math.max(1, Number(quantity) || 1);

    if (!foodId) {
      return res.status(400).json({ success: false, message: 'foodId is required' });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    const user = await getUser(req.user.id);
    const currentQuantity = Number(user.cartData.get(foodId.toString()) || 0);
    user.cartData.set(foodId.toString(), currentQuantity + amount);
    await user.save();

    return res.json({ success: true, message: 'Item added to cart', cartData: toPlainCart(user.cartData) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;
    const amount = Math.max(1, Number(quantity) || 1);

    if (!foodId) {
      return res.status(400).json({ success: false, message: 'foodId is required' });
    }

    const user = await getUser(req.user.id);
    const currentQuantity = Number(user.cartData.get(foodId.toString()) || 0);
    const nextQuantity = currentQuantity - amount;

    if (nextQuantity > 0) {
      user.cartData.set(foodId.toString(), nextQuantity);
    } else {
      user.cartData.delete(foodId.toString());
    }

    await user.save();
    return res.json({ success: true, message: 'Item removed from cart', cartData: toPlainCart(user.cartData) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    if (!foodId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'foodId and quantity are required' });
    }

    const user = await getUser(req.user.id);
    const nextQuantity = Number(quantity);

    if (Number.isNaN(nextQuantity) || nextQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a valid number' });
    }

    if (nextQuantity === 0) {
      user.cartData.delete(foodId.toString());
    } else {
      user.cartData.set(foodId.toString(), nextQuantity);
    }

    await user.save();
    return res.json({ success: true, message: 'Cart updated', cartData: toPlainCart(user.cartData) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCart
};
