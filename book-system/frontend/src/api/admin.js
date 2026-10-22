import axiosClient from './axiosClient';

export const getAdminUsers = () => axiosClient.get('/admin/users');
export const createUser = (data) => {
  return axiosClient.post('/admin/users', data);
};
export const getAdminPublishers = () => axiosClient.get('/admin/publishers');
export const addPublisher = (data) => axiosClient.post('/admin/publishers', data);
export const deletePublisher = (id) => axiosClient.delete(`/admin/publishers/${id}`);
export const getPublisherContent = (id) =>
  axiosClient.get(`/admin/publishers/${id}/content`);
export const deleteUser = (id) => axiosClient.delete(`/admin/users/${id}`);
export const getAdminBooks = () => axiosClient.get('/admin/books');
export const getBookCount = () => axiosClient.get('/admin/books/count');
export const getPendingBooks = () => axiosClient.get('/admin/books/pending');
export const approveBook = (id) => axiosClient.patch(`/admin/books/${id}/approve`);
export const rejectBook = (id, reason) =>
  axiosClient.patch(`/admin/books/${id}/reject`, { reason });
export const deleteAdminBook = (id) => axiosClient.delete(`/admin/books/${id}`);
export const getAdminReviews = () => axiosClient.get('/admin/reviews');
export const deleteAdminReview = (id) => axiosClient.delete(`/admin/reviews/${id}`);
export const getAdminFeedback = () => axiosClient.get('/admin/feedback');
export const updateFeedbackStatus = (id, status) =>
  axiosClient.patch(`/admin/feedback/${id}`, { status });
