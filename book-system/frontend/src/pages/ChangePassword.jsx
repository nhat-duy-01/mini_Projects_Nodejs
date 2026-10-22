import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { changePasswordApi } from '../api/authApi';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      return setError('Mật khẩu mới không khớp!');
    }

    setLoading(true);

    try {
      const res = await changePasswordApi({ oldPassword, newPassword });
      if (!res.success) {
        setError(res.message || 'Đổi mật khẩu thất bại');
        return;
      }
      setMessage('Đổi mật khẩu thành công!');
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/user/home" className="brand">BookPortal</Link>
        <nav>
          <Link to="/user/home" className="nav-link">Trang chủ</Link>
        </nav>
      </header>

      <main className="container container-narrow fade-up">
        <div className="card card-glow">
          <h1 className="section-title text-cyan mono">&gt; ĐỔI MẬT KHẨU</h1>
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-12">
            <label className="text-dim">
              Mật khẩu cũ:
              <div style={{ position: 'relative' }}>
                <input
                  type={showOld ? 'text' : 'password'}
                  className="input"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowOld((s) => !s)}
                  aria-label={showOld ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  style={{
                    position: 'absolute',
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 18,
                    padding: '2px 6px',
                  }}
                >
                  {showOld ? '🙈' : '👁'}
                </button>
              </div>
            </label>
            <label className="text-dim">
              Mật khẩu mới:
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  className="input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  aria-label={showNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  style={{
                    position: 'absolute',
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 18,
                    padding: '2px 6px',
                  }}
                >
                  {showNew ? '🙈' : '👁'}
                </button>
              </div>
            </label>
            <label className="text-dim">
              Nhập lại mật khẩu mới:
              <input
                type={showNew ? 'text' : 'password'}
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
              {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </main>

      <footer className="footer">© {new Date().getFullYear()} Book Review Portal</footer>
    </div>
  );
};

export default ChangePassword;
