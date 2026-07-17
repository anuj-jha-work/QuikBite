const Food = require('../models/Food');
const Order = require('../models/Order');
const User = require('../models/User');

const dashboardStats = async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalFoods, revenueData] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Food.countDocuments(),
      Order.aggregate([
        {
          $match: {
            status: { $ne: 'Cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$amount' }
          }
        }
      ])
    ]);

    return res.json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalFoods,
        totalRevenue: revenueData[0]?.revenue || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  dashboardStats,
  listUsers
};
