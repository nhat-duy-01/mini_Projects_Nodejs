import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userApi from '../../api/userApi';

const statusBadge = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'resolved' || s === 'answered') return 'badge badge-green';
  if (s === 'pending' || s === 'new') return 'badge badge-amber';
  return 'badge badge-cyan';
};

const ViewFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchFeedbacks = async () => {
    try {
      const res = await userApi.getMyFeedback();
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!subject.trim() || !message.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung phản hồi');
      return;
    }

    try {
      await userApi.sendFeedback({ subject, message });
      setSubject('');
      setMessage('');
      setMsg('Gửi phản hồi thành công!');
      fetchFeedbacks();
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi phản hồi thất bại!');
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/user/home" className="brand">BookPortal</Link>
        <nav>
          <Link to="/user/home" className="nav-link">Trang chủ</Link>
          <Link to="/user/orders" className="nav-link">Đơn hàng</Link>
        </nav>
      </header>

      <main className="container container-narrow fade-up">
        <div className="card card-glow">
          <h1 className="section-title text-cyan mono">&gt; GỬI PHẢN HỒI</h1>
          {msg && <div className="alert alert-success">{msg}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSendFeedback} className="panel flex flex-col gap-12" style={{ marginBottom: 24 }}>
            <input
              type="text"
              className="input"
              placeholder="Tiêu đề..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <textarea
              rows="4"
              className="input"
              style={{ minHeight: 100, resize: 'vertical' }}
              placeholder="Nội dung phản hồi..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Gửi phản hồi
            </button>
          </form>

          <h2 className="section-title mono">&gt; LỊCH SỬ PHẢN HỒI ({feedbacks.length})</h2>
          {loading ? (
            <div className="text-center mono text-dim" style={{ padding: 24 }}>&gt; loading_feedback() ...</div>
          ) : feedbacks.length === 0 ? (
            <p className="text-muted">Chưa có phản hồi nào.</p>
          ) : (
            feedbacks.map((item) => (
              <div key={item._id} className="panel" style={{ marginBottom: 10 }}>
                <div className="flex-between">
                  <strong className="text-cyan">{item.subject}</strong>
                  <span className={statusBadge(item.status)}>{item.status}</span>
                </div>
                <p style={{ margin: '8px 0 6px' }} className="text-dim">{item.message}</p>
                <small className="text-muted mono" style={{ fontSize: 11 }}>
                  Ngày gửi: {new Date(item.createdAt).toLocaleString('vi-VN')}
                </small>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewFeedback;
