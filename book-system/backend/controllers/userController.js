const Book = require('../models/Book');
const Review = require('../models/Review');
const Rating = require('../models/Rating');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

exports.getHomeBooks = async (req, res) => {
  try {
    const data = await Book.aggregate([
      { $match: { status: 'approved' } },

      { $lookup: { from: 'users', localField: 'publisherId',  foreignField: '_id',  as: 'publisher',  }, },
      { $unwind: { path: '$publisher', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'ratings', localField: '_id', foreignField: 'bookId', as: 'ratings', },},
      { $addFields: { averageRating: { $cond: [ { $gt: [{ $size: '$ratings' }, 0] }, { $avg: '$ratings.score' }, null, ], }, }, },
      { $unset: 'ratings' },
      { $project: { title: 1, author: 1, category: 1, price: 1, coverImage: 1, description: 1, isbn: 1,  averageRating: 1, 'publisher.username': 1, 'publisher.email': 1, }, }, ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const books = await Book.find({
      status: 'approved',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).populate('publisherId', 'username email');

    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id).populate('publisherId', 'username email');

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Book is not published yet' });
    }

    const reviews = await Review.find({ bookId: id }).populate('userId', 'username');
    const ratings = await Rating.find({ bookId: id });

    // Kiểm tra user hiện tại đã mua sách này chưa (chỉ user đã mua mới được đánh giá)
    let hasPurchased = false;
    if (req.user && req.user.role === 'user') {
      hasPurchased = await hasUserPurchased(req.user._id, id);
    }

    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        book,
        reviews,
        avgRating,
        totalRatings: ratings.length,
        hasPurchased
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Order = require('../models/Order');
const Notification = require('../models/Notification');

// Helper: user đã mua (đơn hàng hợp lệ, không bị hủy/trả) sách này chưa?
const hasUserPurchased = async (userId, bookId) => {
  const count = await Order.countDocuments({
    userId,
    'items.bookId': bookId,
    status: { $nin: ['cancelled', 'returned'] }
  });
  return count > 0;
};

exports.addReview = async (req, res) => {
  try {
    const { bookId, comment } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Chỉ user đã đặt hàng sách này mới được đánh giá
    if (!(await hasUserPurchased(req.user._id, bookId))) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể đánh giá sách mà bạn đã đặt hàng'
      });
    }

    const review = await Review.create({
      bookId,
      userId: req.user._id,
      comment
    });

    // Thông báo cho publisher của sách
    await Notification.create({
      recipientId: book.publisherId,
      recipientRole: 'publisher',
      type: 'review',
      title: 'Có đánh giá mới trên sách của bạn',
      message: `${req.user.username} đã đánh giá sách «${book.title}»`,
      refId: review._id,
      refModel: 'Review'
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.addRating = async (req, res) => {
  try {
    const { bookId, score } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Chỉ user đã đặt hàng sách này mới được chấm điểm
    if (!(await hasUserPurchased(req.user._id, bookId))) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể đánh giá sách mà bạn đã đặt hàng'
      });
    }

    const rating = await Rating.findOneAndUpdate(
      { bookId, userId: req.user._id },
      { score },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: rating });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// User xem tất cả đánh giá của mình
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('bookId', 'title coverImage')
      .populate('replies.userId', 'username avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User trả lời lại review của chính mình (ví dụ khi publisher đã trả lời)
exports.replyToMyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung trả lời không được để trống' });
    }

    const review = await Review.findById(id).populate('bookId', 'title publisherId');
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (String(review.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn chỉ có thể trả lời review của chính mình' });
    }

    review.replies.push({ userId: req.user._id, comment: comment.trim() });
    await review.save();

    // Thông báo cho publisher
    await Notification.create({
      recipientId: review.bookId.publisherId,
      recipientRole: 'publisher',
      type: 'review',
      title: 'User đã trả lời review của bạn',
      message: `${req.user.username} đã trả lời review về sách «${review.bookId.title}»`,
      refId: review._id,
      refModel: 'Review'
    });

    const updated = await Review.findById(id).populate('replies.userId', 'username avatar');
    res.status(201).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendFeedback = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject và message là bắt buộc'
      });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      subject,
      message
    });

    // Thông báo cho tất cả admin có feedback mới
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      if (admins.length > 0) {
        await Notification.insertMany(
          admins.map((admin) => ({
            recipientId: admin._id,
            recipientRole: 'admin',
            type: 'feedback',
            title: 'Có phản hồi mới từ người dùng',
            message: `${req.user.username} đã gửi phản hồi «${subject}»`,
            refId: feedback._id,
            refModel: 'Feedback'
          }))
        );
      }
    } catch (notifyErr) {
      console.error('notify feedback error:', notifyErr.message);
    }

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const list = await Feedback.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
