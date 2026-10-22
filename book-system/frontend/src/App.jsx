import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import UserHome from './pages/user/UserHome';
import ViewFeedback from './pages/user/ViewFeedback';
import MyReviews from './pages/user/MyReviews';
import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import Favorites from './pages/user/Favorites';
import Cart from './pages/user/Cart';
import Orders from './pages/user/Orders';
import AdminHome from './pages/admin/AdminHome';
import PendingBooks from './pages/admin/PendingBooks';
import AllBooks from './pages/admin/AllBooks';
import PublisherDetails from './pages/admin/PublisherDetails';
import PublisherContent from './pages/admin/PublisherContent';
import UserDetails from './pages/admin/UserDetails';
import AdminFeedback from './pages/admin/AdminFeedback';
import PublisherHome from './pages/publisher/PublisherHome';
import UploadBook from './pages/publisher/UploadBook';
import PublisherViewFeedback from './pages/publisher/ViewFeedback';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Trang chủ công khai: xem sách, muốn thích/giỏ hàng phải đăng nhập */}
          <Route path="/" element={<Home />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* User */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/user/home" element={<UserHome />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/user/feedback" element={<ViewFeedback />} />
            <Route path="/user/my-reviews" element={<MyReviews />} />
            <Route path="/user/favorites" element={<Favorites />} />
            <Route path="/user/cart" element={<Cart />} />
            <Route path="/user/orders" element={<Orders />} />
            <Route path="/orders" element={<Navigate to="/user/orders" replace />} />
            <Route path="/cart" element={<Navigate to="/user/cart" replace />} />
            <Route path="/favorites" element={<Navigate to="/user/favorites" replace />} />
          </Route>

          {/* Chi tiết sách: công khai xem, thao tác yêu cầu đăng nhập */}
          <Route path="/books/:id" element={<BookDetail />} />

          {/* Publisher */}
          <Route element={<ProtectedRoute allowedRoles={['publisher']} />}>
            <Route path="/publisher" element={<PublisherHome />} />
            <Route path="/publisher/profile" element={<Profile />} />
            <Route path="/publisher/upload" element={<UploadBook />} />
            <Route path="/publisher/feedbacks" element={<PublisherViewFeedback />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/pending-books" element={<PendingBooks />} />
            <Route path="/admin/books" element={<AllBooks />} />
            <Route path="/admin/publishers" element={<PublisherDetails />} />
            <Route path="/admin/publishers/:id/content" element={<PublisherContent />} />
            <Route path="/admin/users" element={<UserDetails />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
          </Route>

          {/* Shared protected */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin', 'publisher']} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
