const express = require('express');
const router = express.Router();
const publisherController = require('../controllers/publisherController');
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect, authorize('publisher'));

router.post('/books', upload.single('coverImage'), publisherController.createBook);
router.get('/books', publisherController.getPublisherBooks);
router.put('/books/:id', upload.single('coverImage'), publisherController.updateBook);
router.delete('/books/:id', publisherController.deleteBook);

router.get('/books/:bookId/reviews', publisherController.getPublisherBookReviews);
router.post('/reviews/:id/reply', publisherController.replyToReview);
router.delete('/reviews/:id/replies/:replyId', publisherController.deleteReply);

router.get('/orders', orderController.getPublisherOrders);
router.patch('/orders/:id/ship', orderController.markShipped);

module.exports = router;
