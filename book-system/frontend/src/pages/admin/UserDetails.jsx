import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUsers, deleteUser, createUser } from '../../api/admin';

const UserDetails = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    zipCode: '',
    mobileNumber: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getAdminUsers();
        if (!cancelled) setList(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa user này?')) return;
    try {
      await deleteUser(id);
      const res = await getAdminUsers();
      setList(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createUser(formData);
      setShowModal(false); 
      setFormData({ username: '', email: '', password: '', zipCode: '', mobileNumber: '' }); 
      const res = await getAdminUsers();
      setList(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Thêm user thất bại');
    } finally {
      setSubmitting(false);
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
        <div className="flex-between" style={{ marginBottom: 16, alignItems: 'center' }}>
            <h1 className="mono text-cyan" style={{ fontSize: 22, margin: 0 }}>&gt; QUẢN LÝ USERS</h1>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                + Thêm User
            </button>
        </div>

        <div className="card card-glow" style={{ marginTop: 16 }}>
          {loading ? (
            <p className="text-dim mono">&gt; loading_users() ...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {['Username', 'Email', 'ZIP', 'Mobile', ''].map((h) => (
                      <th key={h || 'x'}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        Chưa có user
                      </td>
                    </tr>
                  ) : (
                    list.map((u) => (
                      <tr key={u._id}>
                        <td><strong className="text-light">{u.username}</strong></td>
                        <td className="text-dim">{u.email}</td>
                        <td className="text-dim">{u.zipCode}</td>
                        <td className="text-dim">{u.mobileNumber}</td>
                        <td>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>
                            Xóa
                          </button>
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

      {showModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card card-glow" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
                <h2 style={{ marginBottom: 16 }}>Thêm User Mới</h2>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleAddUser} className="form">
                    <div className="input">
                        <label>Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="input">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="input">
                        <label>Mật khẩu</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="input">
                        <label>ZIP Code</label>
                        <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                    </div>
                    <div className="input">
                        <label>Số điện thoại</label>
                        <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
                    </div>
                    <div className="flex gap-8 mt-16">
                        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                            {submitting ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button type="button" className="btn btn-ghost btn-block" onClick={() => setShowModal(false)}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;