const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      sparse: true
    },
    vegTag: {
      type: String,
      enum: ['V', 'NV', ''],
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    address: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pinCode: String
    },
    payment: {
      method: {
        type: String,
        default: 'Cash on Delivery'
      },
      paid: {
        type: Boolean,
        default: false
      },
      transactionId: String
    },
    status: {
      type: String,
      enum: ['Processing', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Processing'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
