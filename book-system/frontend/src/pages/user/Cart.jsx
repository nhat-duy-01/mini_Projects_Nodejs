import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userApi from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [shipping, setShipping] = useState({ fullName: '', address: '', phone: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await userApi.getCart();
      setCart(res.data || { items: [], total: 0 });
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const changeQty = async (bookId, qty) => {
    try {
      await userApi.updateCartItem(bookId, qty);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const removeItem = async (bookId) => {
    await userApi.removeCartItem(bookId);
    load();
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (cart.items.length === 0) {
      return setError('Giỏ hàng trống!');
    }
    try {
      const res = await userApi.createOrder(shipping);
      setMsg(res.message || 'Đặt hàng thành công!');
      setCart({ items: [], total: 0 });
      setTimeout(() => navigate('/user/orders'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại');
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/user/home" className="brand">BookPortal</Link>
        <nav>
          <Link to="/user/home" className="nav-link">Trang chủ</Link>
          <Link to="/user/favorites" className="nav-link">Yêu thích</Link>
          <Link to="/user/cart" className="nav-link" style={{ fontWeight: 600 }}>Giỏ hàng</Link>
          <Link to="/user/orders" className="nav-link">Đơn hàng</Link>
          <Link to="/user/profile" className="nav-link">Hồ sơ</Link>
          <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate('/login'); }}>
            Đăng xuất
          </button>
        </nav>
      </header>

      <main className="container">
        <div className="card card-glow fade-up">
          <h1 style={{ marginBottom: 14 }}>Giỏ hàng</h1>
          {loading && <p className="text-dim mono">&gt; loading_cart() ...</p>}
          {!loading && cart.items.length === 0 && (
            <div className="empty">
              <span className="icon"/>
              <p>Giỏ hàng trống. Hãy khám phá <Link to="/user/home">Book Store</Link>!</p>
            </div>
          )}

          {cart.items.map((it) => (
            <div key={it.bookId?._id || it.bookId} className="flex" style={{ gap: 14, alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '14px 0' }}>
              <img src={it.bookId?.coverImage || 'https://via.placeholder.com/60x80'} alt="" style={{ width: 56, height: 76, objectFit: 'cover', borderRadius: 6, background: 'var(--bg-2)' }} />
              <div style={{ flex: 1 }}>
                <strong>{it.bookId?.title || 'Sách đã bị xóa'}</strong>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-dim)' }}>{it.bookId?.author}</p>
                <p style={{ margin: '2px 0 0', fontWeight: 700 }} className="text-price">
                  {it.bookId ? Number(it.bookId.price).toLocaleString('vi-VN') + ' đ × ' + it.qty : ''}
                </p>
              </div>
              <input
                type="number" min="1" value={it.qty}
                onChange={(e) => changeQty(it.bookId?._id, Number(e.target.value))}
                className="input"
                style={{ width: 64, textAlign: 'center' }}
              />
              <button className="btn btn-danger btn-sm" onClick={() => removeItem(it.bookId?._id)}>Xóa</button>
            </div>
          ))}

          {cart.items.length > 0 && (
            <div style={{ marginTop: 18, fontSize: 18, fontWeight: 800, textAlign: 'right' }}>
              Tổng cộng: <span className="text-price">{Number(cart.total).toLocaleString('vi-VN')} đ</span>
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="card fade-up" style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 12 }}>Thông tin giao hàng</h3>
            {msg && <div className="alert alert-success">{msg}</div>}
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCheckout} className="form">
              <input className="input" placeholder="Họ tên người nhận" value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} required />
              <input className="input" placeholder="Địa chỉ giao hàng" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} required />
              <input className="input" placeholder="Số điện thoại" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} required />
              <button type="submit" className="btn btn-primary btn-block" style={{ padding: 12, fontSize: 16 }}>
                Xác nhận đặt hàng
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
