import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLocked(false);
    setLoading(true);

    try {
      const res = await loginApi({ username, password });
      if (!res.success) {
        setError(res.message || 'Đăng nhập thất bại');
        return;
      }
      login(res.data);

      const role = res.data.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'publisher') navigate('/publisher');
      else navigate('/user/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
      // Đánh dấu error để giữ thông báo lâu hơn khi bị khóa
      if (err.response?.status === 423) {
        setLocked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container container-narrow fade-up">
      <div className="card card-glow">
        <h1 style={{ marginBottom: 18, textAlign: 'center' }}>Đăng Nhập</h1>
        {locked && <div className="alert alert-error mono">🔒 {error}</div>}
        {!locked && error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <div className="input">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
        <div className="flex-between mt-16" style={{ fontSize: 14 }}>
          <Link to="/register">Đăng ký tài khoản →</Link>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;