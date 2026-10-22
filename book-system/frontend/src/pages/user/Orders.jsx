import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userApi from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

const statusBadge = (status) =>
  status === 'paid' || status === 'delivered'
    ? 'badge badge-green'
    : status === 'shipped'
      ? 'badge badge-cyan'
      : status === 'returned' || status === 'cancelled'
        ? 'badge badge-red'
        : 'badge badge-amber';

const Orders = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await userApi.getMyOrders();
      setOrders(res.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;
    try {
      await userApi.cancelOrder(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Hủy đơn thất bại');
    }
  };

  const handleConfirm = async (id) => {
    if (!window.confirm('Xác nhận bạn ĐÃ NHẬN được hàng?')) return;
    try {
      await userApi.confirmOrderDelivery(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Xác nhận thất bại');
    }
  };

  const handleReturn = async (id) => {
    const reason = window.prompt('Lý do trả lại hàng (bắt buộc):');
    if (!reason || !reason.trim()) return alert('Vui lòng nhập lý do trả hàng');
    try {
      await userApi.returnOrder(id, reason.trim());
      alert('Đã gửi yêu cầu trả hàng về publisher.');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Trả hàng thất bại');
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/user/home" className="brand">BookPortal</Link>
        <nav>
          <Link to="/user/home" className="nav-link">Trang chủ</Link>
          <Link to="/user/favorites" className="nav-link">Yêu thích</Link>
          <Link to="/user/cart" className="nav-link">Giỏ hàng</Link>
          <Link to="/user/orders" className="nav-link" style={{ fontWeight: 600 }}>Đơn hàng</Link>
          <Link to="/user/feedback" className="nav-link">Feedback</Link>
          <Link to="/user/profile" className="nav-link">Hồ sơ</Link>
          <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate('/login'); }}>
            Đăng xuất
          </button>
        </nav>
      </header>

      <main className="container">
        <div className="card card-glow fade-up">
          <h1 style={{ marginBottom: 14 }}>Đơn hàng của tôi</h1>
          {loading && <p className="text-dim mono">&gt; loading_orders() ...</p>}
          {!loading && orders.length === 0 && (
            <div className="empty">
              <span className="icon"/>
              <p>Chưa có đơn hàng nào. Hãy khám phá <Link to="/user/home">Book Store</Link>!</p>
            </div>
          )}

          {orders.map((o) => (
            <div key={o._id} className="card fade-up" style={{ marginTop: 14, padding: 18 }}>
              <div className="flex-between" style={{ marginBottom: 10 }}>
                <strong className="mono" style={{ fontSize: '1.02rem' }}>
                  Đơn #{o._id.slice(-8).toUpperCase()}
                </strong>
                <span className={statusBadge(o.status)}>{o.status.toUpperCase()}</span>
              </div>

              {o.items.map((it, idx) => (
                <p key={idx} style={{ margin: '3px 0', fontSize: 14, color: 'var(--text-dim)' }}>
                  <span className="text-price"></span><b> Tên sách : {it.title} </b> - số lượng : {it.qty} - giá : {' '}
                  <span className="text-price">{Number(it.price * it.qty).toLocaleString('vi-VN')} đ</span>
                </p>
              ))}

              <p style={{ margin: '8px 0 0', fontWeight: 800, fontSize: '1.05rem' }}>
                Tổng: <span className="text-price">{Number(o.totalAmount).toLocaleString('vi-VN')} đ</span>
              </p>
              <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--text-faint)' }}>
                Giao tới: {o.shippingInfo?.fullName} · {o.shippingInfo?.address} · {o.shippingInfo?.phone}
              </p>

              {o.status === 'pending' && (
                <button className="btn btn-danger btn-sm mt-16" onClick={() => handleCancel(o._id)}>
                  Hủy đơn
                </button>
              )}
              {o.status === 'shipped' && (
                <div className="mt-16" style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleConfirm(o._id)}>
                    Đã nhận được hàng
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleReturn(o._id)}>
                    Trả lại hàng
                  </button>
                </div>
              )}
              {o.status === 'delivered' && (
                <p className="badge badge-green mt-16" style={{ display: 'inline-block' }}>Giao hàng thành công</p>
              )}
              {o.status === 'returned' && o.returnReason && (
                <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--red, #e57373)' }}>Lý do trả: {o.returnReason}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Orders;
