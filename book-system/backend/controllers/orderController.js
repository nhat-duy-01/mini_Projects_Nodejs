const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const User = require('../models/User');
const Notification = require('../models/Notification');

const notifyNewOrder = async (order) => {
  try {
    const bookIds = order.items.map((it) => it.bookId);
    const books = await Book.find({ _id: { $in: bookIds } }).select('publisherId title');

    const notifiedPublishers = new Set();
    for (const book of books) {
      if (!book.publisherId || notifiedPublishers.has(String(book.publisherId))) continue;
      notifiedPublishers.add(String(book.publisherId));

      const soldItems = order.items.filter(
        (it) => String(it.bookId) === String(book._id)
      );
      const soldQty = soldItems.reduce((acc, it) => acc + it.qty, 0);

      await Notification.create({
        recipientId: book.publisherId,
        recipientRole: 'publisher',
        type: 'order',
        title: 'Có đơn hàng mới',
        message: `Sách "${book.title}" vừa được bán với số lượng ${soldQty}.`,
        refId: order._id,
        refModel: 'Order'
      });
    }

    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins.length > 0) {
      const orderItemsText = books.map((b) => b.title).join(', ');
      await Notification.insertMany(
        admins.map((admin) => ({
          recipientId: admin._id,
          recipientRole: 'admin',
          type: 'order',
          title: 'Đơn hàng mới trên hệ thống',
          message: `Khách hàng vừa đặt mua: ${orderItemsText}. Tổng tiền: ${order.totalAmount.toLocaleString('vi-VN')} đ.`,
          refId: order._id,
          refModel: 'Order'
        }))
      );
    }
  } catch (err) {
    console.error('notifyNewOrder error:', err.message);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { fullName, address, phone } = req.body.shippingInfo || {};

    if (!fullName || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin giao hàng (tên, địa chỉ, SĐT)'
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.bookId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }

    const items = cart.items.map((it) => {
      if (!it.bookId) throw new Error('Một sách trong giỏ không còn tồn tại');
      return {
        bookId: it.bookId._id,
        title: it.bookId.title,
        price: it.bookId.price,
        qty: it.qty
      };
    });

    const totalAmount = items.reduce((acc, it) => acc + it.price * it.qty, 0);

    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount,
      status: 'paid',
      shippingInfo: { fullName, address, phone }
    });

    await Cart.findOneAndDelete({ userId: req.user._id });

    await notifyNewOrder(order);

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.buyNow = async (req, res) => {
  try {
    const { bookId, qty = 1, shippingInfo } = req.body;
    const { fullName, address, phone } = shippingInfo || {};

    if (!fullName || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin giao hàng'
      });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const q = Math.max(1, Number(qty));
    const totalAmount = book.price * q;

    const order = await Order.create({
      userId: req.user._id,
      items: [{ bookId: book._id, title: book.title, price: book.price, qty: q }],
      totalAmount,
      status: 'paid',
      shippingInfo
    });

    // Gửi thông báo cho publisher + admin
    await notifyNewOrder(order);

    res.status(201).json({
      success: true,
      message: 'Mua hàng thành công!',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy đơn hàng ở trạng thái '${order.status}'`
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ success: true, message: 'Đã hủy đơn hàng', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== PUBLISHER SIDE ==================

// GET /api/publisher/orders - đơn hàng chứa sách của publisher này
exports.getPublisherOrders = async (req, res) => {
  try {
    // Sách thuộc quyền publisher
    const myBooks = await Book.find({ publisherId: req.user._id }).select('_id');
    const myBookIds = myBooks.map((b) => b._id);

    // Đơn hàng chứa ít nhất 1 cuốn sách của publisher
    const orders = await Order.find({ 'items.bookId': { $in: myBookIds } })
      .sort({ createdAt: -1 });

    // Gắn thêm cờ hasMyBook cho mỗi item để frontend biết item nào là của mình
    const data = orders.map((o) => ({
      ...o.toObject(),
      items: o.items.map((it) => ({
        ...it.toObject(),
        isMine: myBookIds.some((id) => String(id) === String(it.bookId))
      }))
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/publisher/orders/:id/ship - publisher xác nhận ĐÃ GỬI hàng
exports.markShipped = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.status !== 'paid' && order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Không thể xác nhận gửi hàng ở trạng thái '${order.status}'`
      });
    }

    // Chỉ publisher có sách trong đơn mới được xác nhận
    const bookIds = order.items.map((it) => it.bookId);
    const myBook = await Book.findOne({ _id: { $in: bookIds }, publisherId: req.user._id });
    if (!myBook) {
      return res.status(403).json({ success: false, message: 'Bạn không có sách trong đơn hàng này' });
    }

    order.status = 'shipped';
    order.shippedByPublisherId = req.user._id;
    order.shippedAt = new Date();
    await order.save();

    // Thông báo cho user: hàng đã được gửi
    await Notification.create({
      recipientId: order.userId,
      recipientRole: 'user',
      type: 'order',
      title: 'Đơn hàng đã được gửi',
      message: `Publisher đã gửi đơn #${order._id.toString().slice(-8).toUpperCase()}. Vui lòng xác nhận khi nhận được hàng.`,
      refId: order._id,
      refModel: 'Order'
    });

    res.status(200).json({ success: true, message: 'Đã xác nhận gửi hàng', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== USER SIDE ==================

// PATCH /api/user/orders/:id/confirm - user xác nhận ĐÃ NHẬN hàng
exports.confirmDelivery = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.status !== 'shipped') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể xác nhận nhận hàng khi đơn đã được gửi (hiện tại: '${order.status}')`
      });
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    // Thông báo cho publisher: user đã nhận hàng
    if (order.shippedByPublisherId) {
      await Notification.create({
        recipientId: order.shippedByPublisherId,
        recipientRole: 'publisher',
        type: 'order',
        title: 'Khách hàng đã nhận hàng',
        message: `Đơn #${order._id.toString().slice(-8).toUpperCase()} đã được khách hàng xác nhận nhận thành công.`,
        refId: order._id,
        refModel: 'Order'
      });
    }

    res.status(200).json({ success: true, message: 'Đã xác nhận nhận hàng', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/user/orders/:id/return - user TRẢ LẠI hàng về publisher
exports.returnOrder = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.status !== 'shipped') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể trả hàng khi đơn đã được gửi (hiện tại: '${order.status}')`
      });
    }

    order.status = 'returned';
    order.returnReason = reason || 'Khách hàng không xác nhận nhận hàng';
    await order.save();

    // Thông báo cho publisher: đơn bị trả lại
    if (order.shippedByPublisherId) {
      await Notification.create({
        recipientId: order.shippedByPublisherId,
        recipientRole: 'publisher',
        type: 'order',
        title: 'Đơn hàng bị trả lại',
        message: `Đơn #${order._id.toString().slice(-8).toUpperCase()} đã bị khách trả lại. Lý do: ${order.returnReason}`,
        refId: order._id,
        refModel: 'Order'
      });
    }

    res.status(200).json({ success: true, message: 'Đã trả lại hàng', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
