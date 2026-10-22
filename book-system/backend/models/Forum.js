const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Forum topic title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null
    },
    posts: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        content: {
          type: String,
          required: [true, 'Post content is required'],
          trim: true,
          maxlength: [2000, 'Post cannot exceed 2000 characters']
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Forum', forumSchema);
