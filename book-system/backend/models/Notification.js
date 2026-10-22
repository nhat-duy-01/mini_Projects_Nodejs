const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Người nhận thông báo
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Vai trò của người nhận ('publisher', 'admin', 'user')
    recipientRole: {
      type: String,
      enum: ["publisher", "admin", "user"],
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "review", "feedback", "approval", "system"],
      default: "order",
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    // Liên kết tới dữ liệu gốc (order id, book id, ...)
    refId: { type: mongoose.Schema.Types.ObjectId, refPath: "refModel" },
    refModel: {
      type: String,
      enum: ["Order", "Book", "Review", "Feedback"],
      default: "Order",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
