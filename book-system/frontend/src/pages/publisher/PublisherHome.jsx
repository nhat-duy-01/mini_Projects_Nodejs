import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublisherBooks, deleteBook, getPublisherOrders, markOrderShipped } from '../../api/publisher';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell';

const PublisherHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, ordRes] = await Promise.all([getPublisherBooks(), getPublisherOrders()]);
      setBooks(res.data || []);
      setOrders(ordRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sách này?')) return;
    try {
      await deleteBook(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleShip = async (id) => {
    if (!window.confirm('Xác nhận ĐÃ GỬI đơn hàng này?')) return;
    try {
      await markOrderShipped(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Xác nhận gửi hàng thất bại');
    }
  };

  const orderStatusBadge = (s) =>
    s === 'delivered'
      ? 'badge badge-green'
      : s === 'returned' || s === 'cancelled'
        ? 'badge badge-red'
        : s === 'shipped'
          ? 'badge badge-cyan'
          : 'badge badge-amber';

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/publisher" className="brand">Publisher Studio</Link>
        <nav>
          <Link to="/publisher/upload" className="nav-link">Đăng sách</Link>
          <Link to="/publisher/profile" className="nav-link">Hồ sơ</Link>
          <Link to="/change-password" className="nav-link">Đổi mật khẩu</Link>
          <NotificationBell />
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Đăng xuất
          </button>
        </nav>
      </header>

      <main className="container fade-up">
        <div className="hero" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {user?.avatar && (
            <img
              src={user.avatar}
              alt="Publisher Avatar"
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--accent, #38bdf8)',
                marginBottom: 8
              }}
            />
          )}
          <h1>Xin chào, {user?.username}</h1>
          <Link to="/publisher/upload" className="btn btn-primary" style={{ marginTop: 12 }}>
            Đăng Sách Mới
          </Link>
        </div>

        <div className="card card-glow" style={{ marginTop: 18 }}>
          <h2 style={{ marginBottom: 10 }}>Đơn hàng cần xử lý</h2>
          {loading ? (
            <p className="text-dim mono">&gt; loading_orders() ...</p>
          ) : orders.length === 0 ? (
            <p className="text-dim">Chưa có đơn hàng nào chứa sách của bạn</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Sách của bạn</th>
                    <th>Khách hàng</th>
                    <th>Địa chỉ</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const myItems = o.items.filter((it) => it.isMine);
                    return (
                      <tr key={o._id}>
                        <td className="mono">#{o._id.slice(-8).toUpperCase()}</td>
                        <td>
                          {myItems.map((it, i) => (
                            <div key={i}>
                              {it.title} × {it.qty}
                            </div>
                          ))}
                        </td>
                        <td>{o.shippingInfo?.fullName}</td>
                        <td className="text-dim" style={{ maxWidth: 200 }}>
                          {o.shippingInfo?.address} · {o.shippingInfo?.phone}
                        </td>
                        <td>
                          <span className={orderStatusBadge(o.status)}>
                            {(o.status || 'pending').toUpperCase()}
                          </span>
                          {o.status === 'returned' && o.returnReason && (
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--red, #e57373)' }}>
                              ✖ {o.returnReason}
                            </p>
                          )}
                        </td>
                        <td>
                          {(o.status === 'paid' || o.status === 'pending') && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleShip(o._id)}>
                              Xác nhận đã gửi
                            </button>
                          )}
                          {o.status === 'shipped' && <span className="text-dim">Đang chờ khách xác nhận...</span>}
                          {o.status === 'delivered' && <span className="badge badge-green">✓ Hoàn tất</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card card-glow" style={{ marginTop: 18 }}>
          <h2 style={{ marginBottom: 10 }}>Sách của tôi</h2>
          {loading ? (
            <p className="text-dim mono">&gt; loading_books() ...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Thể loại</th>
                    <th>Giá</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted">Chưa có sách nào</td></tr>
                  ) : (
                    books.map((b) => (
                      <tr key={b._id}>
                        <td><strong className="text-light">{b.title}</strong></td>
                        <td className="text-dim">{b.author}</td>
                        <td><span className="badge badge-cyan">{b.category}</span></td>
                        <td className="text-price">{Number(b.price).toLocaleString('vi-VN')} đ</td>
                        <td>
                          <span
                            className={
                              b.status === 'approved'
                                ? 'badge badge-green'
                                : b.status === 'rejected'
                                  ? 'badge badge-red'
                                  : 'badge badge-amber'
                            }
                            title={b.rejectionReason ? `Lý do từ chối: ${b.rejectionReason}` : ''}
                          >
                            {(b.status || 'pending').toUpperCase()}
                          </span>
                          {b.status === 'rejected' && b.rejectionReason && (
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--red, #e57373)' }}>
                              ✖ {b.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td>
                          <Link to={`/publisher/feedbacks?bookId=${b._id}`} className="btn btn-ghost btn-sm" style={{ marginRight: 8 }}>
                            Xem Reviews
                          </Link>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}>
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">© {new Date().getFullYear()} Book Review Portal — Publisher Studio</footer>
    </div>
  );
};

export default PublisherHome;
