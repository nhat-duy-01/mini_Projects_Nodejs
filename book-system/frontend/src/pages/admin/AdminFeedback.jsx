import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminFeedback, updateFeedbackStatus } from "../../api/admin";
import NotificationBell from "../../components/NotificationBell";

const statusBadge = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "resolved") return "badge badge-green";
  if (s === "in-review") return "badge badge-purple";
  return "badge badge-amber";
};

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await getAdminFeedback();
      setFeedbacks(res.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Không tải được danh sách phản hồi",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateFeedbackStatus(id, status);
      setFeedbacks((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status } : f)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

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
          <NotificationBell />
        </nav>
      </header>

      <main className="container container-narrow fade-up">
        <div className="card card-glow">
          <h1 className="section-title text-cyan mono">
            &gt; PHẢN HỒI NGƯỜI DÙNG ({feedbacks.length})
          </h1>
          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="text-center mono text-dim" style={{ padding: 24 }}>
              &gt; loading_feedback() ...
            </div>
          ) : feedbacks.length === 0 ? (
            <p className="text-muted">Chưa có phản hồi nào.</p>
          ) : (
            feedbacks.map((item) => (
              <div
                key={item._id}
                className="panel"
                style={{ marginBottom: 10 }}
              >
                <div className="flex-between">
                  <strong className="text-cyan">{item.subject}</strong>
                  <span className={statusBadge(item.status)}>
                    {item.status}
                  </span>
                </div>
                <p style={{ margin: "8px 0 6px" }} className="text-dim">
                  {item.message}
                </p>
                <small className="text-muted mono" style={{ fontSize: 11 }}>
                  @{item.userId?.username || "Người dùng"} ·{" "}
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </small>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleStatus(item._id, "in-review")}
                  >
                    Đang xem xét
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleStatus(item._id, "resolved")}
                  >
                    Đã xử lý
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminFeedback;
