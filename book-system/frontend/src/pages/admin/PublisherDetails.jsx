import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAdminPublishers, addPublisher, deletePublisher } from '../../api/admin';

const PublisherDetails = () => {
  const fileInputRef = useRef(null);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    zipCode: '',
    mobileNumber: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await getAdminPublishers();
      setList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAdminPublishers();
        if (!cancelled) setList(res.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const handleAvatarChange = (e) => {
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

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa publisher này? Toàn bộ sách của publisher cũng sẽ bị xóa.')) return;
    try {
      await deletePublisher(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', form.username.trim());
      formData.append('email', form.email.trim());
      formData.append('password', form.password);
      formData.append('zipCode', form.zipCode.trim());
      formData.append('mobileNumber', form.mobileNumber.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await addPublisher(formData);
      if (!res.success) {
        setError(res.message || 'Thêm thất bại');
        return;
      }
      setMsg('Thêm publisher thành công!');
      setForm({ username: '', email: '', password: '', zipCode: '', mobileNumber: '' });
      handleRemoveAvatar();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Thêm thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/admin" className="brand">Admin Panel</Link>
        <nav>
          <Link to="/admin" className="nav-link">Quay lại</Link>
        </nav>
      </header>

      <main className="container fade-up">
        <h1 className="mono text-cyan" style={{ fontSize: 22 }}>&gt; QUẢN LÝ PUBLISHERS</h1>

        <div className="card card-glow" style={{ marginTop: 16 }}>
          <h3 className="mono text-cyan" style={{ marginTop: 0 }}>&gt; THÊM PUBLISHER MỚI_</h3>
          {msg && <div className="alert alert-success">{msg}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-12">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['username', 'email', 'password', 'zipCode', 'mobileNumber'].map((f) => (
                <input
                  key={f}
                  type={f === 'password' ? 'password' : f === 'email' ? 'email' : 'text'}
                  placeholder={
                    f === 'password'
                      ? 'Mật khẩu'
                      : f === 'email'
                      ? 'Email'
                      : f === 'username'
                      ? 'Tên đăng nhập'
                      : f === 'zipCode'
                      ? 'ZIP Code'
                      : 'Số điện thoại '
                  }
                  value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  required
                  className="input"
                />
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <label className="text-dim" style={{ fontSize: 13 }}>
                Ảnh đại diện / Logo Publisher (Tuỳ chọn - Tải lên từ thiết bị):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="input"
                  style={{ flex: 1, padding: 8 }}
                />
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="btn btn-danger btn-sm"
                  >
                    ✕ Gỡ ảnh
                  </button>
                )}
              </div>

              {previewUrl && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--accent, #38bdf8)'
                    }}
                  />
                  <span className="text-dim" style={{ fontSize: 12 }}>
                    {avatarFile?.name} ({(avatarFile?.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: 6 }}
            >
              {loading ? 'Đang thêm...' : 'Thêm Publisher'}
            </button>
          </form>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Publisher</th>
                  <th>Email</th>
                  <th>ZIP</th>
                  <th>Mobile</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan="5" className="text-center text-muted">Chưa có publisher</td></tr>
                ) : (
                  list.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {p.avatar ? (
                            <img
                              src={p.avatar}
                              alt=""
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid var(--border)'
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 14,
                                fontWeight: 700
                              }}
                            >
                              {p.username ? p.username.charAt(0).toUpperCase() : 'P'}
                            </div>
                          )}
                          <strong className="text-light">{p.username}</strong>
                        </div>
                      </td>
                      <td className="text-dim">{p.email}</td>
                      <td className="text-dim">{p.zipCode}</td>
                      <td className="text-dim">{p.mobileNumber}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link
                            to={`/admin/publishers/${p._id}/content`}
                            className="btn btn-primary btn-sm"
                          >
                            Xem nội dung
                          </Link>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublisherDetails;
