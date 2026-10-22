const Forum = require('../models/Forum');

exports.createTopic = async (req, res) => {
  try {
    const { title, bookId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const topic = await Forum.create({
      title: title.trim(),
      createdBy: req.user._id,
      bookId: bookId || null
    });

    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTopics = async (req, res) => {
  try {
    const topics = await Forum.find()
      .populate('createdBy', 'username')
      .populate('bookId', 'title')
      .populate('posts.userId', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopic = async (req, res) => {
  try {
    const topic = await Forum.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('bookId', 'title')
      .populate('posts.userId', 'username');

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Forum topic not found' });
    }
    res.status(200).json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const topic = await Forum.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          posts: {
            userId: req.user._id,
            content: content.trim()
          }
        }
      },
      { new: true }
    ).populate('posts.userId', 'username');

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Forum topic not found' });
    }

    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Forum.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Forum topic not found' });
    }

    const isOwner = topic.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this topic' });
    }

    await topic.deleteOne();
    res.status(200).json({ success: true, message: 'Forum topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User xóa một bình luận (post) của chính mình trong topic
exports.deletePost = async (req, res) => {
  try {
    const topic = await Forum.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Forum topic not found' });
    }

    const post = topic.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isOwner = String(post.userId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Bạn chỉ có thể xóa bình luận của chính mình' });
    }

    post.deleteOne();
    await topic.save();

    const updated = await Forum.findById(req.params.id).populate('posts.userId', 'username');
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
