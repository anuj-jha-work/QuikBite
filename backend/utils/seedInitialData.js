const bcrypt = require('bcrypt');
const Food = require('../models/Food');
const User = require('../models/User');

const sampleFoods = [
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil.',
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
    price: 12.99
  },
  {
    name: 'Double Cheeseburger',
    description: 'Juicy beef patties, cheddar, pickles, and house sauce.',
    category: 'Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    price: 10.49
  },
  {
    name: 'Veggie Sandwich',
    description: 'Toasted sandwich with crisp veggies, cheese, and herb mayo.',
    category: 'Sandwich',
    image: 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&w=900&q=80',
    price: 8.25
  },
  {
    name: 'Creamy Alfredo Pasta',
    description: 'Silky alfredo sauce tossed with pasta and parmesan.',
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
    price: 13.75
  },
  {
    name: 'Chicken Rolls',
    description: 'Spiced chicken rolls with crunchy vegetables and chutney.',
    category: 'Rolls',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    price: 9.95
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich layered chocolate cake with ganache frosting.',
    category: 'Cake',
    image: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=900&q=80',
    price: 7.5
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Sparkling citrus drink served chilled with mint.',
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',
    price: 4.5
  },
  {
    name: 'Garden Salad',
    description: 'Crisp greens, tomato, cucumber, olives, and vinaigrette.',
    category: 'Salad',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    price: 6.9
  },
  {
    name: 'Berry Cheesecake',
    description: 'Creamy cheesecake topped with fresh mixed berries.',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80',
    price: 8.95
  },
  {
    name: 'BBQ Chicken Pizza',
    description: 'Smoky barbecue sauce, chicken, onions, and mozzarella.',
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=80',
    price: 14.5
  },
  {
    name: 'Paneer Tikka',
    description: 'Chargrilled paneer cubes marinated in yogurt, spices, and herbs.',
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80',
    price: 11.99
  },
  {
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with spiced chicken and saffron.',
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=900&q=80',
    price: 13.99
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy South Indian crepe served with potato filling and chutneys.',
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5979?auto=format&fit=crop&w=900&q=80',
    price: 9.49
  },
  {
    name: 'Chole Bhature',
    description: 'Fluffy fried bread with spicy chickpea curry and onions.',
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=900&q=80',
    price: 10.99
  },
  {
    name: 'Vada Pav',
    description: 'Mumbai-style potato fritter burger with garlic chutney and chili.',
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=900&q=80',
    price: 5.99
  },
  {
    name: 'Aloo Paratha',
    description: 'Whole wheat flatbread stuffed with spiced mashed potatoes.',
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80',
    price: 7.49
  },
  {
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces.',
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
    price: 14.99
  },
  {
    name: 'Gulab Jamun',
    description: 'Soft milk-solid dumplings soaked in rose-scented syrup.',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1601302698621-6b8d2d2c2f06?auto=format&fit=crop&w=900&q=80',
    price: 4.99
  }
];

const seedInitialData = async () => {
  const existingFoods = await Food.find({}, { name: 1 });
  const existingNames = new Set(existingFoods.map((food) => food.name));
  const foodsToInsert = sampleFoods.filter((food) => !existingNames.has(food.name));

  if (foodsToInsert.length > 0) {
    await Food.insertMany(foodsToInsert);
    console.log('Seeded sample foods');
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@quikbite.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const adminExists = await User.findOne({ isAdmin: true });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await User.create({
      name: 'QuikBite Admin',
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
      cartData: {}
    });
    console.log(`Seeded admin user: ${adminEmail}`);
  }
};

module.exports = { seedInitialData };
