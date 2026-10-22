import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../api/authApi';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    zipCode: '',
    mobileNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      return setError('Mật khẩu nhập lại không khớp!');
    }

    setLoading(true);

    try {
      const { confirmPassword, ...payload } = form;
      const res = await registerApi(payload);
      if (!res.success) {
        setError(res.message || 'Đăng ký thất bại');
        return;
      }
      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container container-narrow fade-up">
      <div className="card card-glow">
        <h1 style={{ marginBottom: 8, textAlign: 'center' }}>Đăng Ký Tài Khoản</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, marginBottom: 20 }}>
          Dành cho độc giả. Tài khoản Nhà xuất bản (Publisher) chỉ do Quản trị viên (Admin) cấp.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="form">
          {['username', 'email', 'password', 'confirmPassword', 'zipCode', 'mobileNumber'].map((field) => (
            <div key={field} className="input">
              <label>
                {field === 'confirmPassword'
                  ? 'Xác nhận mật khẩu'
                  : field === 'zipCode'
                  ? 'ZIP Code'
                  : field === 'mobileNumber'
                  ? 'Số điện thoại'
                  : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field.includes('password') || field === 'confirmPassword' ? 'password' : field === 'email' ? 'email' : 'text'}
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>
        <div className="text-center mt-16" style={{ fontSize: 14 }}>
          <Link to="/login">Đã có tài khoản? Đăng nhập →</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
