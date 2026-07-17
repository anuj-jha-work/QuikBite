const Food = require('../models/Food');

const createImagePath = (file) => (file ? `/images/${file.filename}` : null);

const listFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    return res.json({ success: true, foods });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addFood = async (req, res) => {
  try {
    const { name, description, category, price } = req.body;
    const image = createImagePath(req.file);

    if (!name || !description || !category || !price || !image) {
      return res.status(400).json({ success: false, message: 'All food fields and an image are required' });
    }

    const food = await Food.create({
      name: name.trim(),
      description: description.trim(),
      category,
      image,
      price: Number(price)
    });

    return res.status(201).json({ success: true, message: 'Food created successfully', food });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, image } = req.body;
    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    food.name = name ? name.trim() : food.name;
    food.description = description ? description.trim() : food.description;
    food.category = category || food.category;
    food.price = price !== undefined ? Number(price) : food.price;
    food.image = req.file ? createImagePath(req.file) : image || food.image;

    await food.save();

    return res.json({ success: true, message: 'Food updated successfully', food });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findByIdAndDelete(id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    return res.json({ success: true, message: 'Food removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listFoods,
  addFood,
  updateFood,
  removeFood
};
