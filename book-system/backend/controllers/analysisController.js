const Book = require('../models/Book');
const Review = require('../models/Review');
const Rating = require('../models/Rating');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

exports.getSummary = async (req, res) => {
  try {
    const [totalBooks, totalUsers, totalPublishers, totalReviews, totalRatings, totalFeedbacks] =
      await Promise.all([
        Book.countDocuments(),
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'publisher' }),
        Review.countDocuments(),
        Rating.countDocuments(),
        Feedback.countDocuments()
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        totalUsers,
        totalPublishers,
        totalReviews,
        totalRatings,
        totalFeedbacks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBooksAnalysis = async (req, res) => {
  try {
    const books = await Book.find().populate('publisherId', 'username');

    const analysis = await Promise.all(
      books.map(async (book) => {
        const [reviews, ratings] = await Promise.all([
          Review.find({ bookId: book._id }),
          Rating.find({ bookId: book._id })
        ]);

        const avgRating =
          ratings.length > 0
            ? Number((ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length).toFixed(1))
            : 0;

        return {
          bookId: book._id,
          title: book.title,
          author: book.author,
          category: book.category,
          publisher: book.publisherId?.username || 'N/A',
          avgRating,
          totalReviews: reviews.length,
          totalRatings: ratings.length
        };
      })
    );

    analysis.sort((a, b) => b.totalRatings + b.totalReviews - (a.totalRatings + a.totalReviews));

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategoryAnalysis = async (req, res) => {
  try {
    const result = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          totalBooks: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { totalBooks: -1 } }
    ]);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
