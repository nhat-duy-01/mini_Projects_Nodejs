import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPendingBooks, approveBook, rejectBook } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';

const statusBadge = (status) =>
  status === 'approved'
    ? 'badge badge-green'
    : status === 'rejected'
      ? 'badge badge-red'
      : 'badge badge-amber';

const PendingBooks = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPendingBooks();
      setBooks(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Duyệt sách này để hiển thị công khai?')) return;
    try {
      await approveBook(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Duyệt thất bại');
    }
  };

  const handleReject = async (id) => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await rejectBook(id, reason.trim());
      setRejectingId(null);
      setReason('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Từ chối thất bại');
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/admin" className="brand">Admin Panel</Link>
        <nav>
          <Link to="/admin/publishers" className="nav-link">Publishers</Link>
          <Link to="/admin/users" className="nav-link">Users</Link>
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
        <div className="hero">
          <h1>Duyệt sách chờ phê duyệt</h1>
        </div>

        <div className="card card-glow">
          {loading ? (
            <p className="text-dim mono">&gt; loading_pending_books() ...</p>
          ) : books.length === 0 ? (
            <div className="empty">
              <span className="icon"/>
              Không có sách nào chờ duyệt.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Thể loại</th>
                    <th>Giá</th>
                    <th>Publisher</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b._id}>
                      <td><strong className="text-light">{b.title}</strong></td>
                      <td className="text-dim">{b.author}</td>
                      <td><span className="badge badge-cyan">{b.category}</span></td>
                      <td className="text-price">{Number(b.price).toLocaleString('vi-VN')} đ</td>
                      <td className="text-dim">{b.publisherId?.username || '—'}</td>
                      <td><span className={statusBadge(b.status)}>{(b.status || 'pending').toUpperCase()}</span></td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-green btn-sm" style={{ marginRight: 8 }} onClick={() => handleApprove(b._id)}>
                          Duyệt
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => { setRejectingId(b._id); setReason(''); }}>
                          Từ chối
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {rejectingId && (
          <div className="card card-glow" style={{ marginTop: 16 }}>
            <h3 className="mono text-red" style={{ marginBottom: 8 }}>✖ Từ chối sách</h3>
            <textarea
              rows="3"
              className="input"
              style={{ width: '100%', resize: 'vertical' }}
              placeholder="Nhập lý do từ chối (publisher sẽ thấy và có thể sửa rồi đăng lại)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn btn-danger" onClick={() => handleReject(rejectingId)}>Xác nhận từ chối</button>
              <button className="btn btn-ghost" onClick={() => setRejectingId(null)}>Hủy</button>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">© {new Date().getFullYear()} Book Review Portal — Admin Console</footer>
    </div>
  );
};

export default PendingBooks;
