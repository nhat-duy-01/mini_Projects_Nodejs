const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'returned', 'cancelled'],
      default: 'paid'
    },
    // Publisher nào gửi hàng / xác nhận (có thể có nhiều publisher trong 1 đơn)
    shippedByPublisherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    returnReason: { type: String, trim: true, default: '' },
    shippingInfo: {
      fullName: String,
      address: String,
      phone: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
