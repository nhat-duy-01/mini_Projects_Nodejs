import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminBooks } from "../../api/admin";

const AllBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getAdminBooks();
        if (!cancelled) setBooks(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    filter === "all" ? books : books.filter((b) => b.status === filter);

  const statusBadge = (status) =>
    status === "approved"
      ? "badge badge-green"
      : status === "rejected"
        ? "badge badge-red"
        : "badge badge-amber";

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/admin" className="brand">
          Admin Panel
        </Link>
        <nav>
          <Link to="/admin" className="nav-link">
            Quay lại
          </Link>
        </nav>
      </header>

      <main className="container fade-up">
        <h1 className="mono text-cyan" style={{ fontSize: 22 }}>
          &gt; DANH SÁCH SÁCH HIỆN CÓ ({books.length})
        </h1>

        <div style={{ margin: "12px 0", display: "flex", gap: 8 }}>
          {["all", "approved", "pending", "rejected"].map((f) => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Tất cả" : f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="card card-glow">
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
                    <th>Ngày đăng</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        Không có sách nào
                      </td>
                    </tr>
                  ) : (
                    filtered.map((b) => (
                      <tr key={b._id}>
                        <td>
                          <strong className="text-light">{b.title}</strong>
                        </td>
                        <td className="text-dim">{b.author}</td>
                        <td>
                          <span className="badge badge-cyan">{b.category}</span>
                        </td>
                        <td className="text-price">
                          {Number(b.price).toLocaleString("vi-VN")} đ
                        </td>
                        <td>
                          <span className={statusBadge(b.status)}>
                            {(b.status || "pending").toUpperCase()}
                          </span>
                        </td>
                        <td className="text-dim">
                          {b.createdAt
                            ? new Date(b.createdAt).toLocaleDateString("vi-VN")
                            : "—"}
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
    </div>
  );
};

export default AllBooks;
