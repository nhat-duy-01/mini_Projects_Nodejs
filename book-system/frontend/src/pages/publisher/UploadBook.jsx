import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { uploadBook } from '../../api/publisher';

const UploadBook = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: '',
    author: '',
    category: 'Fiction',
    price: 0,
    isbn: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn một file hình ảnh (PNG, JPG, JPEG, WEBP,...)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setError('');
    setImageFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('author', form.author.trim());
      formData.append('category', form.category);
      formData.append('price', Number(form.price) || 0);
      if (form.isbn) formData.append('isbn', form.isbn.trim());
      if (form.description) formData.append('description', form.description.trim());
      if (imageFile) {
        formData.append('coverImage', imageFile);
      }

      const res = await uploadBook(formData);
      if (!res.success) {
        setError(res.message || 'Đăng sách thất bại');
        return;
      }
      alert('Đăng sách thành công! Sách sẽ hiển thị công khai sau khi được admin duyệt.');
      navigate('/publisher');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng sách');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link to="/publisher" className="brand">Publisher Studio</Link>
        <nav>
          <Link to="/publisher" className="nav-link">Quay lại</Link>
        </nav>
      </header>

      <main className="container fade-up" style={{ maxWidth: 640 }}>
        <h1 className="mono text-cyan" style={{ fontSize: 22 }}>&gt; ĐĂNG TẢI SÁCH MỚI</h1>

        <div className="card card-glow" style={{ marginTop: 16 }}>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-12">
            <div>
              <label className="text-dim" style={{ fontSize: 13 }}>Tiêu đề sách *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="input"
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>

            <div>
              <label className="text-dim" style={{ fontSize: 13 }}>Tác giả *</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                required
                className="input"
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>

            <div>
              <label className="text-dim" style={{ fontSize: 13 }}>Thể loại *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
                style={{ width: '100%', marginTop: 4 }}
              >
                <option value="Fiction">Fiction</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="Literature">Literature</option>
              </select>
            </div>

            <div>
              <label className="text-dim" style={{ fontSize: 13 }}>Giá (VNĐ) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="input"
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>

            <div>
              <label className="text-dim" style={{ fontSize: 13 }}>ISBN (tuỳ chọn)</label>
              <input
                type="text"
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                className="input"
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>

            <div>
              <label className="text-dim" style={{ fontSize: 13 }}>Ảnh bìa sách (Tải lên từ thiết bị)</label>
              <div style={{ marginTop: 6 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="input"
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              {previewUrl && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img
                    src={previewUrl}
                    alt="Preview bìa sách"
                    style={{
                      width: 90,
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 6,
                      border: '1px solid var(--border)'
                    }}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{imageFile?.name}</p>
                    <p style={{ margin: '4px 0 8px', fontSize: 12, color: 'var(--text-dim)' }}>
                      {(imageFile?.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-danger btn-sm"
                    >
                      ✕ Gỡ ảnh
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-dim" style={{ fontSize: 13 }}>Mô tả / nội dung</label>
              <textarea
                rows="5"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input"
                style={{ width: '100%', marginTop: 4, minHeight: 100, resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Đang đăng tải...' : 'Đăng Tải Lên Hệ Thống'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UploadBook;
