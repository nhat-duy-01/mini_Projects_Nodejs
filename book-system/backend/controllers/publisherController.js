const Book = require('../models/Book');
const Review = require('../models/Review');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');

exports.createBook = async (req, res) => {
  try {
    let coverImage = req.body.coverImage || '';
    if (req.file) {
      coverImage = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const price = req.body.price !== undefined ? Number(req.body.price) : 0;

    const newBook = await Book.create({
      ...req.body,
      price,
      coverImage,
      publisherId: req.user._id
    });
    res.status(201).json({ success: true, data: newBook });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPublisherBooks = async (req, res) => {
  try {
    const books = await Book.find({ publisherId: req.user._id });
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, ...safeBody } = req.body;

    const updateData = { ...safeBody, status: 'pending', rejectionReason: '' };
    if (req.body.price !== undefined) {
      updateData.price = Number(req.body.price);
    }
    if (req.file) {
      updateData.coverImage = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const updatedBook = await Book.findOneAndUpdate(
      { _id: id, publisherId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ success: false, message: 'Book not found or unauthorized' });
    }

    res.status(200).json({ success: true, data: updatedBook });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findOneAndDelete({ _id: id, publisherId: req.user._id });

    if (!deletedBook) {
      return res.status(404).json({ success: false, message: 'Book not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Book removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPublisherBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findOne({ _id: bookId, publisherId: req.user._id });
    if (!book) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to book reviews' });
    }

    const reviews = await Review.find({ bookId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Publisher trả lời một review của sách thuộc về mình
exports.replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung trả lời không được để trống' });
    }

    const review = await Review.findById(id).populate('bookId', 'publisherId title');
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (String(review.bookId.publisherId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn chỉ có thể trả lời review của sách mình' });
    }

    review.replies.push({ userId: req.user._id, comment: comment.trim() });
    await review.save();

    // Thông báo cho user sở hữu review
    await Notification.create({
      recipientId: review.userId,
      recipientRole: 'user',
      type: 'review',
      title: 'Publisher đã trả lời đánh giá của bạn',
      message: `${req.user.username} đã trả lời đánh giá của bạn về sách «${review.bookId.title}»`,
      refId: review._id,
      refModel: 'Review'
    });

    const updated = await Review.findById(id).populate('replies.userId', 'username avatar');
    res.status(201).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Publisher xóa một reply của chính mình
exports.deleteReply = async (req, res) => {
  try {
    const { id, replyId } = req.params;

    const review = await Review.findById(id).populate('bookId', 'publisherId');
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (String(review.bookId.publisherId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const reply = review.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    if (String(reply.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn chỉ có thể xóa trả lời của chính mình' });
    }

    reply.deleteOne();
    await review.save();

    const updated = await Review.findById(id).populate('replies.userId', 'username avatar');
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
