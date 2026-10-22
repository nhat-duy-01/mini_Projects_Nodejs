const Favorite = require('../models/Favorite');
const Book = require('../models/Book');

exports.getFavorites = async (req, res) => {
  try {
    const fav = await Favorite.findOne({ userId: req.user._id }).populate({
      path: 'books',
      populate: { path: 'publisherId', select: 'username' }
    });

    res.status(200).json({ success: true, data: fav?.books || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    let fav = await Favorite.findOne({ userId: req.user._id });
    if (!fav) fav = await Favorite.create({ userId: req.user._id, books: [] });

    const idx = fav.books.findIndex((b) => b.toString() === bookId);
    let added;
    if (idx >= 0) {
      fav.books.splice(idx, 1);
      added = false;
    } else {
      fav.books.push(bookId);
      added = true;
    }
    await fav.save();

    res.status(200).json({
      success: true,
      message: added ? 'Đã thêm vào yêu thích' : 'Đã gỡ khỏi yêu thích',
      data: { bookId, added }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFavoriteIds = async (req, res) => {
  try {
    const fav = await Favorite.findOne({ userId: req.user._id });
    res.status(200).json({ success: true, data: fav?.books || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
};
