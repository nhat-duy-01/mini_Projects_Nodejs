const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// ===== Cấu hình chống brute-force đăng nhập =====
const MAX_LOGIN_ATTEMPTS = 7;          // sai quá 7 lần...
const LOCK_TIME_MS = 15 * 60 * 1000;   // ...thì khóa 15 phút

const isLocked = (user) => user.lockUntil && user.lockUntil > new Date();

const lockResponse = (user) => {
  const remainMs = user.lockUntil - new Date();
  const minutes = Math.ceil(remainMs / 60000);
  return res => res.status(423).json({
    success: false,
    message: `Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá ${MAX_LOGIN_ATTEMPTS} lần. Vui lòng thử lại sau ${minutes} phút.`
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role, zipCode, mobileNumber } = req.body;

    if (!username || !email || !password || !zipCode || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ: username, email, password, zipCode, mobileNumber'
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'USER ID ALREADY EXISTS'
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    if (role === 'publisher' || role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không được phép tự đăng ký tài khoản Nhà xuất bản (Publisher). Chỉ Quản trị viên (Admin) mới có quyền tạo Publisher.'
      });
    }

    const allowedRole = 'user';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: allowedRole,
      zipCode,
      mobileNumber
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        zipCode: user.zipCode,
        mobileNumber: user.mobileNumber,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { email, mobileNumber, zipCode } = req.body;

    if (email && email.toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng bởi tài khoản khác'
        });
      }
      user.email = email.toLowerCase();
    }

    if (mobileNumber !== undefined) user.mobileNumber = mobileNumber.trim();
    if (zipCode !== undefined) user.zipCode = zipCode.trim();

    if (req.file) {
      user.avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ thành công!',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        zipCode: user.zipCode,
        mobileNumber: user.mobileNumber
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập username và password'
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'NOT A VALID USERNAME'
      });
    }

    // Đang bị khóa tạm thời?
    if (isLocked(user)) {
      return lockResponse(res);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Tăng số lần sai; đủ ngưỡng thì khóa 15 phút
      const attempts = user.loginAttempts + 1;
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        user.loginAttempts = attempts;
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        await user.save();
        return lockResponse(res);
      }
      user.loginAttempts = attempts;
      await user.save();
      return res.status(400).json({
        success: false,
        message: `Invalid password. Bạn còn ${MAX_LOGIN_ATTEMPTS - attempts} lần thử trước khi tài khoản bị khóa tạm thời.`
      });
    }

    // Đăng nhập thành công: reset số lần sai và mở khóa
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        zipCode: user.zipCode,
        mobileNumber: user.mobileNumber,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'OLD PASSWORD DOES NOT MATCH'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { username, mobileNumber, newPassword } = req.body;

    const user = await User.findOne({ username, mobileNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User details do not match our records'
      });
    }

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User verification successful. You can now reset your password.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
