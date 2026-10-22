const Cart = require('../models/Cart');
const Book = require('../models/Book');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'items.bookId',
      select: 'title author price coverImage'
    });

    if (!cart) cart = { items: [] };

    const total = cart.items.reduce((acc, it) => acc + (it.bookId?.price || 0) * it.qty, 0);

    res.status(200).json({ success: true, data: { items: cart.items, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { bookId, qty = 1 } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

    const existing = cart.items.find((it) => it.bookId.toString() === bookId);
    if (existing) {
      existing.qty += Number(qty);
    } else {
      cart.items.push({ bookId, qty: Number(qty) });
    }
    await cart.save();

    res.status(200).json({ success: true, message: 'Đã thêm vào giỏ hàng', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { qty } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find((it) => it.bookId.toString() === bookId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    if (qty <= 0) {
      cart.items = cart.items.filter((it) => it.bookId.toString() !== bookId);
    } else {
      item.qty = qty;
    }
    await cart.save();

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { bookId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((it) => it.bookId.toString() !== bookId);
    await cart.save();

    res.status(200).json({ success: true, message: 'Đã xóa khỏi giỏ hàng', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });
    res.status(200).json({ success: true, message: 'Giỏ hàng đã trống' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
