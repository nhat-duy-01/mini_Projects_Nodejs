import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookCount } from '../../api/admin';
import NotificationBell from '../../components/NotificationBell';

const AdminHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookCount, setBookCount] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getBookCount();
        if (!cancelled && res.success) setBookCount(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/admin" className="brand">Admin Panel</Link>
        <nav>
          <Link to="/change-password" className="nav-link">Đổi mật khẩu</Link>
          <Link to="/admin/feedback" className="nav-link">Feedback</Link>
          <NotificationBell />
          <button
            type="button"
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
        <div className="hero">
          <h1>Xin chào, {user?.username} 👋</h1>
        </div>

        <div className="stats-grid">

          <Link to="/admin/books" className="stat-card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <div className="num" style={{ fontSize: '1.8rem' }}>{bookCount.total}</div>
            <div className="num" style={{ fontSize: '1.1rem' }}>Tổng số sách</div>
            <div className="label">
              Đã duyệt: {bookCount.approved} · Chờ duyệt: {bookCount.pending} · Từ chối: {bookCount.rejected}
            </div>
          </Link>

          <Link to="/admin/pending-books" className="stat-card" style={{ textDecoration: 'none' }}>
            <div className="num" style={{ fontSize: '1.3rem' }}>Duyệt sách</div>
            <div className="label">Phê duyệt / từ chối sách do publisher đăng</div>
          </Link>

          <Link to="/admin/publishers" className="stat-card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}/>
            <div className="num" style={{ fontSize: '1.3rem' }}>Publishers</div>
            <div className="label">Thêm mới và xem danh sách nhà xuất bản</div>
          </Link>

          <Link to="/admin/users" className="stat-card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}/>
            <div className="num" style={{ fontSize: '1.3rem' }}>Users</div>
            <div className="label">Xem và xóa tài khoản độc giả</div>
          </Link>

        </div>
      </main>

      <footer className="footer">© {new Date().getFullYear()} Book Review Portal — Admin Console</footer>
    </div>
  );
};

export default AdminHome;