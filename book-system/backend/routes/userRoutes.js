const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const forumController = require('../controllers/forumController');
const favoriteController = require('../controllers/favoriteController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/books', userController.getHomeBooks);
router.get('/search', userController.searchBooks);
router.get('/books/:id', optionalAuth, userController.getBookDetail);

router.post('/reviews', protect, userController.addReview);
router.post('/ratings', protect, userController.addRating);
router.get('/my-reviews', protect, userController.getMyReviews);
router.post('/reviews/:id/reply', protect, userController.replyToMyReview);
router.post('/feedback', protect, userController.sendFeedback);
router.get('/feedback', protect, userController.getMyFeedback);

router.get('/favorites', protect, favoriteController.getFavorites);
router.get('/favorites/ids', protect, favoriteController.getFavoriteIds);
router.post('/favorites/toggle', protect, favoriteController.toggleFavorite);

router.get('/cart', protect, cartController.getCart);
router.post('/cart', protect, cartController.addToCart);
router.put('/cart/:bookId', protect, cartController.updateCartItem);
router.delete('/cart/:bookId', protect, cartController.removeCartItem);
router.delete('/cart', protect, cartController.clearCart);

router.post('/orders', protect, orderController.createOrder);
router.post('/orders/buy-now', protect, orderController.buyNow);
router.get('/orders', protect, orderController.getMyOrders);
router.patch('/orders/:id/cancel', protect, orderController.cancelOrder);
router.patch('/orders/:id/confirm', protect, orderController.confirmDelivery);
router.patch('/orders/:id/return', protect, orderController.returnOrder);

router.get('/forum', forumController.getTopics);
router.get('/forum/:id', forumController.getTopic);
router.post('/forum', protect, forumController.createTopic);
router.post('/forum/:id/posts', protect, forumController.addPost);
router.delete('/forum/:id', protect, forumController.deleteTopic);
router.delete('/forum/:id/posts/:postId', protect, forumController.deletePost);

module.exports = router;
