import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMeApi, updateProfileApi } from '../api/authApi';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    username: '',
    email: '',
    mobileNumber: '',
    zipCode: '',
    role: ''
  });
  const [currentAvatar, setCurrentAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchUserData = async () => {
      try {
        const res = await getMeApi();
        if (!cancelled && res.success && res.data) {
          const u = res.data;
          setForm({
            username: u.username || '',
            email: u.email || '',
            mobileNumber: u.mobileNumber || '',
            zipCode: u.zipCode || '',
            role: u.role || 'user'
          });
          setCurrentAvatar(u.avatar || '');
          updateUser(u);
        }
      } catch (err) {
        if (!cancelled) {
          setForm({
            username: user?.username || '',
            email: user?.email || '',
            mobileNumber: user?.mobileNumber || '',
            zipCode: user?.zipCode || '',
            role: user?.role || 'user'
          });
          setCurrentAvatar(user?.avatar || '');
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    fetchUserData();
    return () => {
      cancelled = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return setError('Vui lòng chọn một file hình ảnh hợp lệ (PNG, JPG, WEBP,...)');
    }

    if (file.size > 5 * 1024 * 1024) {
      return setError('Dung lượng ảnh tối đa là 5MB');
    }

    setError('');
    setAvatarFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancelAvatar = () => {
    setAvatarFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', form.email.trim());
      formData.append('mobileNumber', form.mobileNumber.trim());
      formData.append('zipCode', form.zipCode.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await updateProfileApi(formData);
      if (!res.success) {
        setError(res.message || 'Cập nhật thất bại');
        return;
      }

      setMsg(res.message || 'Cập nhật thông tin thành công!');
      if (res.data) {
        updateUser(res.data);
        setCurrentAvatar(res.data.avatar || '');
      }
      handleCancelAvatar();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const isPublisher = user?.role === 'publisher';

  return (
    <div className="page">
      <header className="navbar">
        {isPublisher ? (
          <>
            <Link to="/publisher" className="brand">Publisher Studio</Link>
            <nav>
              <Link to="/publisher" className="nav-link">Trang chủ</Link>
              <Link to="/publisher/upload" className="nav-link">Đăng sách</Link>
              <Link to="/publisher/profile" className="nav-link" style={{ fontWeight: 600 }}>Hồ sơ</Link>
              <Link to="/change-password" className="nav-link">Đổi mật khẩu</Link>
              <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate('/login'); }}>
                Đăng xuất
              </button>
            </nav>
          </>
        ) : (
          <>
            <Link to="/user/home" className="brand">BookPortal</Link>
            <nav>
              <Link to="/user/home" className="nav-link">Trang chủ</Link>
              <Link to="/user/favorites" className="nav-link">Yêu thích</Link>
              <Link to="/user/cart" className="nav-link">Giỏ hàng</Link>
              <Link to="/user/orders" className="nav-link">Đơn hàng</Link>
              <Link to="/user/profile" className="nav-link" style={{ fontWeight: 600 }}>Hồ sơ</Link>
              <Link to="/change-password" className="nav-link">Đổi mật khẩu</Link>
              <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate('/login'); }}>
                Đăng xuất
              </button>
            </nav>
          </>
        )}
      </header>

      <main className="container fade-up" style={{ maxWidth: 640 }}>
        <h1 className="mono text-cyan" style={{ fontSize: 22 }}>
          &gt; {isPublisher ? 'HỒ SƠ NHÀ XUẤT BẢN' : 'HỒ SƠ CÁ NHÂN'}
        </h1>

        <div className="card card-glow" style={{ marginTop: 16 }}>
          {msg && <div className="alert alert-success">{msg}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {fetching ? (
            <p className="text-dim mono" style={{ textAlign: 'center', padding: 30 }}>&gt; loading_profile() ...</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-16">
              {/* Avatar Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  {previewUrl || currentAvatar ? (
                    <img
                      src={previewUrl || currentAvatar}
                      alt="Avatar"
                      style={{
                        width: 110,
                        height: 110,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid var(--accent, #38bdf8)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 110,
                        height: 110,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 42,
                        fontWeight: 700,
                        color: '#fff',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                      }}
                    >
                      {form.username ? form.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-ghost btn-sm"
                  >
                    {previewUrl ? 'Chọn ảnh khác' : 'Tải ảnh từ thiết bị'}
                  </button>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleCancelAvatar}
                      className="btn btn-danger btn-sm"
                    >
                      ✕ Hủy chọn
                    </button>
                  )}
                </div>
                {avatarFile && (
                  <span className="text-dim" style={{ fontSize: 12 }}>
                    Đã chọn: {avatarFile.name} ({(avatarFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              {/* Account Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="text-dim" style={{ fontSize: 13 }}>Tên đăng nhập (Username)</label>
                  <input
                    type="text"
                    value={form.username}
                    disabled
                    className="input"
                    style={{ width: '100%', marginTop: 4, background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label className="text-dim" style={{ fontSize: 13 }}>Vai trò (Role)</label>
                  <input
                    type="text"
                    value={isPublisher ? 'Nhà xuất bản (Publisher)' : 'Độc giả (User)'}
                    disabled
                    className="input"
                    style={{ width: '100%', marginTop: 4, background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-dim" style={{ fontSize: 13 }}>Email </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="input"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="text-dim" style={{ fontSize: 13 }}>Số điện thoại </label>
                  <input
                    type="text"
                    value={form.mobileNumber}
                    onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                    required
                    className="input"
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label className="text-dim" style={{ fontSize: 13 }}>Mã bưu chính (ZIP Code) </label>
                  <input
                    type="text"
                    value={form.zipCode}
                    onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                    required
                    className="input"
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ marginTop: 8, padding: '12px' }}
              >
                {loading ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
