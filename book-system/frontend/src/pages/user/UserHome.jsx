import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import { useAuth } from '../../context/AuthContext';
import userApi from '../../api/userApi';

const UserHome = () => {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBooks = async (search) => {
    setLoading(true);
    try {
      const res = search
        ? await userApi.searchBooks(search)
        : await userApi.getBooks();
      setBooks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadBooks(query.trim());
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/user/home" className="brand">BookPortal</Link>
        <nav>
          <Link to="/user/favorites" className="nav-link"> Yêu thích</Link>
          <Link to="/user/cart" className="nav-link">Giỏ hàng</Link>
          <Link to="/user/orders" className="nav-link"> Đơn hàng</Link>
          <Link to="/user/feedback" className="nav-link">Feedback</Link>
          <Link to="/user/my-reviews" className="nav-link">Đánh giá của tôi</Link>
          <Link to="/user/profile" className="nav-link">Hồ sơ</Link>
          <NotificationBell />
          <Link to="/change-password" className="nav-link">Đổi mật khẩu</Link>
          <button className="btn btn-danger btn-sm" onClick={logout}>Đăng xuất</button>
        </nav>
      </header>

      <main className="container">
        <div className="hero fade-up">
          <h1>Xin chào, {user?.username || user?.email} </h1>
          <p>
            Chào mừng trở lại! Khám phá những cuốn sách mới nhất từ các nhà xuất bản,
            đánh giá và mua sách yêu thích của bạn.
          </p>

          <form onSubmit={handleSearch} className="flex" style={{ gap: 8, maxWidth: 560, margin: '0 auto 10px' }}>
            <input
              type="text"
              className="input"
              placeholder="⌕ Tìm theo tên, tác giả, thể loại..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Tìm kiếm</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setQuery(''); loadBooks(); }}>
              Tất cả
            </button>
          </form>
        </div>

        {loading ? (
          <p className="text-dim mono text-center">&gt; loading_books() ...</p>
        ) : books.length === 0 ? (
          <div className="empty">
            <span className="icon"/>
            Không có sách nào.
          </div>
        ) : (
          <div className="book-grid">
            {books.map((b) => (
              <div key={b._id} className="book-card">
                <img src={b.coverImage || 'https://via.placeholder.com/200x260?text=No+Cover'} alt={b.title} />
                <h3>{b.title}</h3>
                <p className="author">{b.author}</p>
                <span className="cat">{b.category}</span>
                <p className="price">{b.price != null ? `${Number(b.price).toLocaleString('vi-VN')} đ` : ''}</p>
                <div className="actions">
                  <Link to={`/books/${b._id}`} className="btn btn-primary btn-sm">Xem chi tiết</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">© {new Date().getFullYear()} Book Review Portal — MERN Stack</footer>
    </div>
  );
};

export default UserHome;
