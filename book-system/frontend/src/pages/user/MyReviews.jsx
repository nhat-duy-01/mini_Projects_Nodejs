import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import userApi from '../../api/userApi';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    userApi
      .getMyReviews()
      .then((res) => setReviews(res.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Không tải được đánh giá'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleReply = async (id) => {
    const comment = (replyText[id] || '').trim();
    if (!comment) return;
    try {
      const res = await userApi.replyToMyReview(id, comment);
      setReviews((prev) => prev.map((r) => (r._id === id ? res.data : r)));
      setReplyText((prev) => ({ ...prev, [id]: '' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Trả lời thất bại');
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/user/home" className="brand">Book System</Link>
        <nav>
          <Link to="/user/home" className="nav-link">Quay lại</Link>
        </nav>
      </header>

      <main className="container fade-up" style={{ maxWidth: 760 }}>
        <h1 className="mono text-cyan" style={{ fontSize: 22 }}>&gt; ĐÁNH GIÁ CỦA TÔI</h1>

        {loading && <p className="text-dim mono" style={{ marginTop: 16 }}>&gt; loading_reviews() ...</p>}
        {error && <div className="alert alert-danger" style={{ marginTop: 16 }}>{error}</div>}
        {!loading && !error && reviews.length === 0 && (
          <div className="empty" style={{ marginTop: 16 }}>Bạn chưa viết đánh giá nào.</div>
        )}

        <div style={{ marginTop: 16 }}>
          {reviews.map((r) => (
            <div key={r._id} className="panel" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong className="text-cyan">{r.bookId?.title || 'Sách'}</strong>
                <Link to={`/books/${r.bookId?._id}`} className="text-muted" style={{ fontSize: 12 }}>
                  Xem sách →
                </Link>
              </div>
              <p style={{ margin: '6px 0' }} className="text-light">{r.comment}</p>
              <small className="text-muted mono">{new Date(r.createdAt).toLocaleString('vi-VN')}</small>

              {(r.replies || []).length > 0 && (
                <div style={{ marginTop: 10, borderLeft: '2px solid var(--accent, #38bdf8)', paddingLeft: 12 }}>
                  {(r.replies || []).map((rep) => (
                    <div key={rep._id} style={{ marginBottom: 8 }}>
                      <strong className="text-light" style={{ fontSize: 13 }}>@{rep.userId?.username || 'Người dùng'}</strong>
                      <p className="text-dim" style={{ margin: '2px 0', fontSize: 14 }}>{rep.comment}</p>
                      <small className="text-muted mono" style={{ fontSize: 11 }}>
                        {new Date(rep.createdAt).toLocaleString('vi-VN')}
                      </small>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Trả lời lại đánh giá của bạn..."
                  value={replyText[r._id] || ''}
                  onChange={(e) => setReplyText((prev) => ({ ...prev, [r._id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply(r._id)}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleReply(r._id)}>
                  Trả lời
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyReviews;
