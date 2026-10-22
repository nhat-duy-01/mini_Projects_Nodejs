const Book = require('../models/Book');
const Review = require('../models/Review');
const Rating = require('../models/Rating');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const bcrypt = require('bcryptjs');


exports.getBookCount = async (req, res) => {
  try {
    const total = await Book.countDocuments();
    const approved = await Book.countDocuments({ status: 'approved' });
    const pending = await Book.countDocuments({ status: 'pending' });
    const rejected = await Book.countDocuments({ status: 'rejected' });

    res.status(200).json({
      success: true,
      data: { total, approved, pending, rejected }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPublishers = async (req, res) => {
  try {
    const publishers = await User.find({ role: 'publisher' }).select('-password');
    res.status(200).json({ success: true, data: publishers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin xem toàn bộ nội dung mà một publisher đã đăng (sách + review trên các sách đó)
exports.getPublisherContent = async (req, res) => {
  try {
    const { id } = req.params;

    const publisher = await User.findOne({ _id: id, role: 'publisher' }).select('-password');
    if (!publisher) {
      return res.status(404).json({ success: false, message: 'Publisher not found' });
    }

    const books = await Book.find({ publisherId: id }).sort({ createdAt: -1 });
    const bookIds = books.map((b) => b._id);

    const reviews = await Review.find({ bookId: { $in: bookIds } })
      .populate('userId', 'username')
      .populate('bookId', 'title')
      .populate('replies.userId', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { publisher, books, reviews }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addPublisher = async (req, res) => {
  try {
    const { username, email, password, zipCode, mobileNumber } = req.body;

    if (!username || !email || !password || !zipCode || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin publisher'
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let avatar = '';
    if (req.file) {
      avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const publisher = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'publisher',
      avatar,
      zipCode,
      mobileNumber
    });

    res.status(201).json({
      success: true,
      data: {
        _id: publisher._id,
        username: publisher.username,
        email: publisher.email,
        role: publisher.role,
        avatar: publisher.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.addUser = async (req, res) => {
  try {
    const { username, email, password, zipCode, mobileNumber } = req.body;

    if (!username || !email || !password || !zipCode || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin user'
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user', 
      zipCode,
      mobileNumber
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePublisher = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.findOneAndDelete({ _id: id, role: 'publisher' });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Publisher not found' });
    }

    // Xóa toàn bộ sách + review + rating của publisher này
    const books = await Book.find({ publisherId: id });
    const bookIds = books.map((b) => b._id);

    if (bookIds.length > 0) {
      await Review.deleteMany({ bookId: { $in: bookIds } });
      await Rating.deleteMany({ bookId: { $in: bookIds } });
      await Book.deleteMany({ publisherId: id });
    }

    res.status(200).json({
      success: true,
      message: `Publisher deleted successfully (cùng ${bookIds.length} sách)`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('publisherId', 'username email');
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndUpdate(
      id,
      { status: 'approved', rejectionReason: '' },
      { new: true }
    );
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do từ chối' });
    }
    const book = await Book.findByIdAndUpdate(
      id,
      { status: 'rejected', rejectionReason: reason.trim() },
      { new: true }
    );
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: 'pending' }).populate('publisherId', 'username email');
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    await Review.deleteMany({ bookId: id });
    await Rating.deleteMany({ bookId: id });

    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('bookId', 'title')
      .populate('userId', 'username');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find().populate('userId', 'username email');
    res.status(200).json({ success: true, data: feedbackList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.status(200).json({ success: true, data: updatedFeedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
