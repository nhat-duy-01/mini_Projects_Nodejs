import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import userApi from '../api/userApi';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext';

const BookDetail = () => {
  const { id } = useParams();
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [replyText, setReplyText] = useState({});
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await userApi.getBookDetail(id);
        if (!cancelled) {
          setData(res.data);
          setHasPurchased(Boolean(res.data?.hasPurchased));
        }
        if (!cancelled && token) {
          try {
            const favs = await userApi.getFavoriteIds();
            setIsFav((favs.data || []).map(String).includes(id));
          } catch { /* ignore */ }
        }
      } catch {
        if (!cancelled) setError('Không tải được thông tin sách');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const handleToggleFav = async () => {
    if (!token) return setError('Vui lòng đăng nhập để yêu thích sách');
    try {
      const res = await userApi.toggleFavorite(id);
      setIsFav(Boolean(res.data?.favorited));
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await userApi.addToCart(id);
      if (window.confirm('Đã thêm vào giỏ hàng! Bạn muốn đi đến giỏ hàng ngay?')) {
        navigate('/user/cart');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Thêm vào giỏ thất bại');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!token) {
      setError('Vui lòng đăng nhập để đánh giá');
      return;
    }
    if (!hasPurchased) {
      setError('Bạn chỉ có thể đánh giá sách mà bạn đã đặt hàng');
      return;
    }
    try {
      if (comment.trim()) await userApi.addReview({ bookId: id, comment });
      await userApi.addRating({ bookId: id, score });
      setComment('');
      setMsg('Gửi đánh giá thành công!');
      const res = await userApi.getBookDetail(id);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi thất bại');
    }
  };

  const handleReply = async (reviewId) => {
    const text = (replyText[reviewId] || '').trim();
    if (!text) return;
    try {
      const res = await userApi.replyToMyReview(reviewId, text);
      const updated = res.data;
      setData((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) => (r._id === reviewId ? updated : r))
      }));
      setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Trả lời thất bại');
    }
  };

  if (!data && !error) {
    return <div className="page container text-center mono" style={{ padding: 48 }}>&gt; loading_book() ...</div>;
  }
  if (error && !data) {
    return <div className="page container alert alert-danger" style={{ margin: '40px auto', maxWidth: 600 }}>{error}</div>;
  }

  const { book, reviews, avgRating, totalRatings } = data;

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/user/home" className="brand">BookPortal</Link>
        <nav>
          <Link to="/user/cart" className="nav-link">Giỏ hàng</Link>
          <Link to="/user/orders" className="nav-link">Đơn hàng</Link>
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
        <div className="card card-glow">
          <h1 className="text-xl">{book.title}</h1>
          <p className="text-dim">
            Tác giả: <strong className="text-light">{book.author}</strong>
            {' · '}Thể loại: <span className="badge badge-cyan">{book.category}</span>
            {book.price != null && (
              <> · Giá: <span className="text-price">{Number(book.price).toLocaleString('vi-VN')} đ</span></>
            )}
          </p>

          <div className="flex gap-8 mb-16" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-amber">★ {avgRating} / 5 · {totalRatings} lượt đánh giá</span>
            <button
              type="button"
              onClick={handleToggleFav}
              className={isFav ? 'btn btn-danger btn-sm' : 'btn btn-ghost btn-sm'}
            >
              {isFav ? ' Đã yêu thích' : 'Yêu thích'}
            </button>
            <button type="button" onClick={handleAddToCart} className="btn btn-primary btn-sm">
              Thêm vào giỏ hàng
            </button>
          </div>

          {book.description && (
            <div className="panel mb-16">
              <strong className="text-cyan">&gt; MÔ TẢ_</strong>
              <p style={{ margin: '8px 0 0' }} className="text-dim">{book.description}</p>
            </div>
          )}

          <h3 className="text-cyan mono">&gt; {hasPurchased ? 'GỬI ĐÁNH GIÁ_' : 'ĐÁNH GIÁ SÁCH_'}</h3>
          {msg && <div className="alert alert-success">{msg}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          {hasPurchased ? (
          <form onSubmit={handleSubmit} className="panel flex flex-col gap-12" style={{ marginTop: 10, marginBottom: 28 }}>
            <label className="text-dim">
              Số sao:{' '}
              <select
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="input"
                style={{ width: 120, display: 'inline-block' }}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} sao
                  </option>
                ))}
              </select>
            </label>
            <textarea
              placeholder="Viết cảm nhận (review)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input"
              style={{ minHeight: 80, resize: 'vertical' }}
            />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Gửi đánh giá
            </button>
          </form>
          ) : (
            <div className="panel text-dim" style={{ marginTop: 10, marginBottom: 28 }}>
              Bạn chỉ có thể đánh giá sách mà bạn đã đặt hàng. Hãy đặt hàng trước, sau đó quay lại để chia sẻ cảm nhận nhé.
            </div>
          )}

          <h3 className="mono">&gt; REVIEW ({reviews?.length || 0})</h3>
          {(reviews || []).length === 0 && <p className="text-muted">Chưa có review nào.</p>}
          {(reviews || []).map((r) => (
            <div key={r._id} className="panel" style={{ marginBottom: 10 }}>
              <strong className="text-cyan">@{r.userId?.username || 'Độc giả'}</strong>
              <p style={{ margin: '6px 0 0' }} className="text-dim">{r.comment}</p>

              {(r.replies || []).length > 0 && (
                <div style={{ marginTop: 10, borderLeft: '2px solid var(--accent, #38bdf8)', paddingLeft: 12 }}>
                  {(r.replies || []).map((rep) => (
                    <div key={rep._id} style={{ marginBottom: 8 }}>
                      <strong className="text-light" style={{ fontSize: 13 }}>
                        @{rep.userId?.username || 'Người dùng'}
                      </strong>
                      <p className="text-dim" style={{ margin: '2px 0', fontSize: 14 }}>{rep.comment}</p>
                      <small className="text-muted mono" style={{ fontSize: 11 }}>
                        {new Date(rep.createdAt).toLocaleString('vi-VN')}
                      </small>
                    </div>
                  ))}
                </div>
              )}

              {token && String(r.userId?._id || r.userId) === String(user?._id) && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Trả lời lại review của bạn..."
                    value={replyText[r._id] || ''}
                    onChange={(e) => setReplyText((prev) => ({ ...prev, [r._id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleReply(r._id)}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleReply(r._id)}>
                    Trả lời
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BookDetail;
