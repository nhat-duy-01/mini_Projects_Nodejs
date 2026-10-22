import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../api/authApi';

const ForgotPassword = () => {
  const [form, setForm] = useState({
    username: '',
    mobileNumber: '',
    newPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await forgotPasswordApi(form);
      if (!res.success) {
        setError(res.message || 'Có lỗi xảy ra');
        return;
      }
      setMessage(res.message || 'Đặt lại mật khẩu thành công!');
      if (form.newPassword) {
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container container-narrow fade-up">
      <div className="card card-glow">
        <h1 style={{ marginBottom: 8, textAlign: 'center' }}>Quên Mật Khẩu</h1>
        <p className="text-dim text-center" style={{ fontSize: 14, marginBottom: 16 }}>
          Nhập Username + Số điện thoại để xác minh, rồi đặt mật khẩu mới.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={handleSubmit} className="form">
          {['username', 'mobileNumber', 'newPassword'].map((field) => (
            <div className="input" key={field}>
              <label>
                {field === 'newPassword'
                  ? 'Mật khẩu mới'
                  : field === 'mobileNumber'
                  ? 'Số điện thoại'
                  : 'Username'}
              </label>
              <input
                type={field === 'newPassword' ? 'password' : 'text'}
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
        <div className="flex-between mt-16" style={{ fontSize: 14 }}>
          <Link to="/login">← Quay lại Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
