import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getBookReviews, replyToReview, deleteReply } from '../../api/publisher';
import { useAuth } from '../../context/AuthContext';

const ViewFeedback = () => {
  const [params] = useSearchParams();
  const bookId = params.get('bookId');
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    getBookReviews(bookId)
      .then((res) => setReviews(res.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Không tải được reviews'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!bookId) {
      setError('Thiếu bookId');
      setLoading(false);
      return;
    }
    load();
  }, [bookId]);

  const handleReply = async (reviewId) => {
    const comment = (replyText[reviewId] || '').trim();
    if (!comment) return;
    try {
      const res = await replyToReview(reviewId, comment);
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? res.data : r)));
      setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Trả lời thất bại');
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    if (!window.confirm('Xóa trả lời này?')) return;
    try {
      const res = await deleteReply(reviewId, replyId);
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? res.data : r)));
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa trả lời thất bại');
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/publisher" className="brand">Publisher Studio</Link>
        <nav>
          <Link to="/publisher" className="nav-link">Quay lại</Link>
        </nav>
      </header>

      <main className="container fade-up" style={{ maxWidth: 760 }}>
        <h1 className="mono text-cyan" style={{ fontSize: 22 }}>&gt; REVIEWS CỦA SÁCH</h1>

        {loading && <p className="text-dim mono" style={{ marginTop: 16 }}>&gt; loading_reviews() ...</p>}
        {error && <div className="alert alert-danger" style={{ marginTop: 16 }}>{error}</div>}
        {!loading && !error && reviews.length === 0 && (
          <div className="empty" style={{ marginTop: 16 }}>
            <span className="icon"></span>
            Chưa có review nào.
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          {reviews.map((r) => (
            <div key={r._id} className="panel" style={{ marginBottom: 10 }}>
              <strong className="text-cyan">@{r.userId?.username || 'Độc giả'}</strong>
              <p style={{ margin: '6px 0' }} className="text-dim">{r.comment}</p>
              <small className="text-muted mono">{new Date(r.createdAt).toLocaleString('vi-VN')}</small>

              {(r.replies || []).length > 0 && (
                <div style={{ marginTop: 10, borderLeft: '2px solid var(--accent, #38bdf8)', paddingLeft: 12 }}>
                  {(r.replies || []).map((rep) => (
                    <div key={rep._id} style={{ marginBottom: 8 }}>
                      <strong className="text-light" style={{ fontSize: 13 }}>
                        @{rep.userId?.username || 'Publisher'}
                      </strong>
                      <p className="text-dim" style={{ margin: '2px 0', fontSize: 14 }}>{rep.comment}</p>
                      <small className="text-muted mono" style={{ fontSize: 11 }}>
                        {new Date(rep.createdAt).toLocaleString('vi-VN')}
                      </small>
                      {user && String(rep.userId?._id || rep.userId) === String(user._id) && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ marginLeft: 10, fontSize: 11 }}
                          onClick={() => handleDeleteReply(r._id, rep._id)}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Viết trả lời của bạn..."
                  value={replyText[r._id] || ''}
                  onChange={(e) => setReplyText((prev) => ({ ...prev, [r._id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply(r._id)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleReply(r._id)}
                >
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

export default ViewFeedback;
