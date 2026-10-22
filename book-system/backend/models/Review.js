const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: [true, 'Nội dung trả lời không được để trống'],
      trim: true,
      maxlength: [1000, 'Nội dung trả lời không được vượt quá 1000 ký tự']
    }
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book ID is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    replies: [replySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
