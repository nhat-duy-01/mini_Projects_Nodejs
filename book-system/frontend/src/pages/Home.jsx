import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userApi from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import heroImg from '../assets/hero.jpg';

const Home = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getBooks()
      .then(res => setBooks(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const requireLogin = () => {
    if (!token) {
      navigate('/login');
      return true;
    }
    return false;
  };

  const handleFav = async (id) => {
    if (requireLogin()) return;
    try {
      await userApi.toggleFavorite(id);
      alert('Đã cập nhật yêu thích!');
    } catch (err) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleCart = async (id) => {
    if (requireLogin()) return;
    try {
      await userApi.addToCart(id);
      if (window.confirm('Đã thêm vào giỏ hàng! Đi đến giỏ hàng ngay?')) navigate('/user/cart');
    } catch (err) {
      alert(err.response?.data?.message || 'Thêm vào giỏ thất bại');
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/" className="brand">BookPortal</Link>
        <nav>
          <Link to="/login" className="nav-link">Đăng nhập</Link>
          <Link to="/register" className="nav-link">Đăng ký</Link>
        </nav>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      {/* Hero section */}
      <section style={{ display: 'flex', alignItems: 'center', gap: '30px', padding: '30px 0' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.2rem', color: '#0f172a', lineHeight: '1.2' }}>
            Xem trước đánh giá sách mới xuất bản
          </h1>
          <p style={{ color: '#475569', lineHeight: '1.6', marginTop: '12px' }}>
            Cập nhật các tựa sách mới nhất từ nhà xuất bản thuộc các chủ đề viễn tưởng, khoa học, công nghệ. Độc giả có thể đọc bài review, cho điểm và để lại ý kiến nhận xét.
          </p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <img src={heroImg} alt="Hero" style={{ maxWidth: '85%', height: 'auto', borderRadius: '8px' }} />
        </div>
      </section>

      {/* Sách nổi bật */}
      <section>
        <h2 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          Sách Mới Cập Nhật
        </h2>
        {loading ? (
          <p style={{ color: '#64748b' }}>Đang tải sách...</p>
        ) : books.length === 0 ? (
          <p style={{ color: '#64748b' }}>Chưa có sách nào được duyệt.</p>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {books.map(b => (
            <div key={b._id} className="book-card">
              <img src={b.coverImage || 'https://via.placeholder.com/200x260?text=No+Cover'} alt={b.title} />
              <h3>{b.title}</h3>
              <p className="author">{b.author}</p>
              <span className="cat">{b.category}</span>
              {b.price != null && <p className="price">{Number(b.price).toLocaleString('vi-VN')} đ</p>}
              <p className="rating">★ {b.averageRating ? Number(b.averageRating).toFixed(1) : 'Chưa có'} / 5</p>
              <div className="actions">
                <Link to={`/books/${b._id}`} className="btn btn-primary btn-sm">Xem chi tiết</Link>
                <button className="btn btn-ghost btn-sm" onClick={() => handleFav(b._id)}>Thích</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleCart(b._id)}>Giỏ hàng</button>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>
      </div>

      <footer className="footer">© {new Date().getFullYear()} Book Review Portal — MERN Stack</footer>
    </div>
  );
};

export default Home;