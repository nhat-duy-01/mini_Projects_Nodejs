const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
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
    score: {
      type: Number,
      required: [true, 'Rating score is required'],
      min: [1, 'Minimum score is 1'],
      max: [5, 'Maximum score is 5']
    }
  },
  { timestamps: true }
);

ratingSchema.index({ bookId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);