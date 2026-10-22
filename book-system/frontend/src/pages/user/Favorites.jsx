import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userApi from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

const Favorites = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await userApi.getFavorites();
      setBooks(res.data || []);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (bookId) => {
    await userApi.toggleFavorite(bookId);
    load();
  };

  const handleAddToCart = async (bookId) => {
    try {
      await userApi.addToCart(bookId);
      alert('Đã thêm vào giỏ hàng!');
    } catch (err) {
      alert(err.response?.data?.message || 'Thêm vào giỏ thất bại');
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/user/home" className="brand">BookPortal</Link>
        <nav>
          <Link to="/user/home" className="nav-link">Trang chủ</Link>
          <Link to="/user/favorites" className="nav-link" style={{ fontWeight: 600 }}>Yêu thích</Link>
          <Link to="/user/cart" className="nav-link">Giỏ hàng</Link>
          <Link to="/user/orders" className="nav-link">Đơn hàng</Link>
          <Link to="/user/profile" className="nav-link">Hồ sơ</Link>
          <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate('/login'); }}>
            Đăng xuất
          </button>
        </nav>
      </header>

      <main className="container">
        <div className="card card-glow fade-up">
          <h1 style={{ marginBottom: 14 }}>Sách yêu thích</h1>
          {loading && <p className="text-dim mono">&gt; loading_favorites() ...</p>}
          {!loading && books.length === 0 && (
            <div className="empty">
              <span className="icon"/>
              <p>Chưa có sách nào trong danh sách yêu thích.</p>
            </div>
          )}
          <div className="book-grid">
            {books.map((b) => (
              <div key={b._id} className="book-card">
                <img src={b.coverImage || 'https://via.placeholder.com/200x260?text=No+Cover'} alt={b.title} />
                <h3>{b.title}</h3>
                <p className="author">{b.author}</p>
                <p className="price">{Number(b.price || 0).toLocaleString('vi-VN')} đ</p>
                <div className="actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(b._id)}>Bỏ thích</button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAddToCart(b._id)}>Thêm giỏ </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Favorites;
