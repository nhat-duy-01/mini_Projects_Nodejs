import axiosClient from './axiosClient';

export const getPublisherBooks = () => axiosClient.get('/publisher/books');
export const uploadBook = (bookData) => axiosClient.post('/publisher/books', bookData);
export const updateBook = (id, bookData) => axiosClient.put(`/publisher/books/${id}`, bookData);
export const deleteBook = (bookId) => axiosClient.delete(`/publisher/books/${bookId}`);
export const getBookReviews = (bookId) =>
  axiosClient.get(`/publisher/books/${bookId}/reviews`);
export const replyToReview = (reviewId, comment) =>
  axiosClient.post(`/publisher/reviews/${reviewId}/reply`, { comment });
export const deleteReply = (reviewId, replyId) =>
  axiosClient.delete(`/publisher/reviews/${reviewId}/replies/${replyId}`);
export const getPublisherOrders = () => axiosClient.get('/publisher/orders');
export const markOrderShipped = (orderId) =>
  axiosClient.patch(`/publisher/orders/${orderId}/ship`);
