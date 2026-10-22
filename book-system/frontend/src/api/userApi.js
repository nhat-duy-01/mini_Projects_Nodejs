import axiosClient from './axiosClient';

const userApi = {
  getBooks: () => axiosClient.get('/user/books'),
  searchBooks: (query) => axiosClient.get('/user/search', { params: { query } }),
  getBookDetail: (id) => axiosClient.get(`/user/books/${id}`),
  addReview: (data) => axiosClient.post('/user/reviews', data),
  addRating: (data) => axiosClient.post('/user/ratings', data),
  getMyReviews: () => axiosClient.get('/user/my-reviews'),
  replyToMyReview: (id, comment) =>
    axiosClient.post(`/user/reviews/${id}/reply`, { comment }),
  sendFeedback: (data) => axiosClient.post('/user/feedback', data),
  getMyFeedback: () => axiosClient.get('/user/feedback'),

  getFavorites: () => axiosClient.get('/user/favorites'),
  getFavoriteIds: () => axiosClient.get('/user/favorites/ids'),
  toggleFavorite: (bookId) => axiosClient.post('/user/favorites/toggle', { bookId }),
  
  getCart: () => axiosClient.get('/user/cart'),
  addToCart: (bookId, qty = 1) => axiosClient.post('/user/cart', { bookId, qty }),
  updateCartItem: (bookId, qty) => axiosClient.put(`/user/cart/${bookId}`, { qty }),
  removeCartItem: (bookId) => axiosClient.delete(`/user/cart/${bookId}`),
  clearCart: () => axiosClient.delete('/user/cart'),

  createOrder: (shippingInfo) => axiosClient.post('/user/orders', { shippingInfo }),
  buyNow: (bookId, qty, shippingInfo) => axiosClient.post('/user/orders/buy-now', { bookId, qty, shippingInfo }),
  getMyOrders: () => axiosClient.get('/user/orders'),
  cancelOrder: (id) => axiosClient.patch(`/user/orders/${id}/cancel`),
  confirmOrderDelivery: (id) => axiosClient.patch(`/user/orders/${id}/confirm`),
  returnOrder: (id, reason) => axiosClient.patch(`/user/orders/${id}/return`, { reason }),
};

export default userApi;
