const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'secretkey123',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
