/**
 * Chạy một lần để tạo tài khoản admin mặc định:
 *   node seedAdmin.js
 * Username: admin | Password: admin123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const run = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book_review_db';
  await mongoose.connect(uri);

  const exists = await User.findOne({ username: 'admin' });
  if (exists) {
    console.log('Admin đã tồn tại:', exists.username);
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('admin123', salt);
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashed,
      role: 'admin',
      zipCode: '10000',
      mobileNumber: '0900000000'
    });
    console.log('Đã tạo admin: username=admin / password=admin123');
  }
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
