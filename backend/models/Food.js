const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Food description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Food category is required'],
      enum: ['Pizza', 'Burger', 'Sandwich', 'Pasta', 'Rolls', 'Cake', 'Drinks', 'Salad', 'Dessert', 'Indian']
    },
    image: {
      type: String,
      required: [true, 'Food image is required']
    },
    price: {
      type: Number,
      required: [true, 'Food price is required'],
      min: [0, 'Price must be positive']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', foodSchema);
