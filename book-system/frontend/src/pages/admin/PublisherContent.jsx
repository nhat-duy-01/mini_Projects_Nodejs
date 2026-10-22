import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublisherContent } from '../../api/admin';

const PublisherContent = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublisherContent(id)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Không tải được nội dung'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/admin/publishers" className="brand">Admin Panel</Link>
        <nav>
          <Link to="/admin/publishers" className="nav-link">Quay lại</Link>
        </nav>
      </header>

      <main className="container fade-up">
        <h1 className="mono text-cyan" style={{ fontSize: 22 }}>
          &gt; NỘI DUNG PUBLISHER ĐĂNG
        </h1>

        {loading && <p className="text-dim mono" style={{ marginTop: 16 }}>&gt; loadingcontent() ...</p>}
        {error && <div className="alert alert-danger" style={{ marginTop: 16 }}>{error}</div>}

        {data && (
          <>
            <div className="card card-glow" style={{ marginTop: 16 }}>
              <h3 className="mono text-cyan" style={{ marginTop: 0 }}>
                &gt; @{data.publisher?.username}
              </h3>
              <p className="text-dim">{data.publisher?.email}</p>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <h3 className="mono text-cyan" style={{ marginTop: 0 }}>&gt; SÁCH ĐÃ ĐĂNG ({data.books.length})</h3>
              {data.books.length === 0 ? (
                <p className="text-dim">Publisher chưa đăng sách nào.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Trạng thái</th>
                        <th>Giá</th>
                        <th>Ngày đăng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.books.map((b) => (
                        <tr key={b._id}>
                          <td className="text-light">{b.title}</td>
                          <td className="text-dim">{b.status}</td>
                          <td className="text-dim">{Number(b.price).toLocaleString('vi-VN')} đ</td>
                          <td className="text-muted">
                            {new Date(b.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <h3 className="mono text-cyan" style={{ marginTop: 0 }}>&gt; REVIEW TRÊN SÁCH CỦA PUBLISHER_</h3>
              {data.reviews.length === 0 ? (
                <p className="text-dim">Chưa có review nào.</p>
              ) : (
                data.reviews.map((r) => (
                  <div key={r._id} className="panel" style={{ marginBottom: 10 }}>
                    <strong className="text-cyan">@{r.userId?.username || 'Độc giả'}</strong>
                    <span className="text-muted" style={{ marginLeft: 8, fontSize: 12 }}>
                      trên «{r.bookId?.title}»
                    </span>
                    <p style={{ margin: '6px 0' }} className="text-dim">{r.comment}</p>
                    {(r.replies || []).map((rep) => (
                      <div
                        key={rep._id}
                        style={{ borderLeft: '2px solid var(--accent, #38bdf8)', paddingLeft: 12, marginTop: 6 }}
                      >
                        <strong className="text-light" style={{ fontSize: 13 }}>
                          ↳ @{rep.userId?.username || 'Publisher'}
                        </strong>
                        <p className="text-dim" style={{ margin: '2px 0', fontSize: 14 }}>{rep.comment}</p>
                      </div>
                    ))}
                    <small className="text-muted mono">{new Date(r.createdAt).toLocaleString('vi-VN')}</small>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PublisherContent;
