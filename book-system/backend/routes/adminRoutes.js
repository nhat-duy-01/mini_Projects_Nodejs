const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect, authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.addUser);
router.get('/publishers', adminController.getAllPublishers);
router.post('/publishers', upload.single('avatar'), adminController.addPublisher);
router.delete('/users/:id', adminController.deleteUser);
router.delete('/publishers/:id', adminController.deletePublisher);
router.get('/publishers/:id/content', adminController.getPublisherContent);

router.get('/books', adminController.getAllBooks);
router.get('/books/count', adminController.getBookCount);
router.get('/books/pending', adminController.getPendingBooks);
router.patch('/books/:id/approve', adminController.approveBook);
router.patch('/books/:id/reject', adminController.rejectBook);
router.delete('/books/:id', adminController.deleteBook);

router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);

router.get('/feedback', adminController.getAllFeedback);
router.patch('/feedback/:id', adminController.updateFeedbackStatus);

const analysisController = require('../controllers/analysisController');
router.get('/analysis/summary', analysisController.getSummary);
router.get('/analysis/books', analysisController.getBooksAnalysis);
router.get('/analysis/categories', analysisController.getCategoryAnalysis);

module.exports = router;
