const jwt = require('jsonwebtoken');

const createToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET || 'quikbite-demo-secret';

  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
};

module.exports = { createToken };
