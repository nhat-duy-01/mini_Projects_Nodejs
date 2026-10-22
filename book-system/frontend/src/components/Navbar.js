import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">BookReview Portal</Link>

      <nav>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/store" className="nav-link">Book Store</Link>
        <Link to="/search" className="nav-link">Search</Link>

        {role === 'admin' && <Link to="/admin" className="nav-link" style={{ color: 'var(--warn)' }}>Admin Panel</Link>}
        {role === 'publisher' && <Link to="/publisher" className="nav-link" style={{ color: 'var(--success)' }}>Publisher Studio</Link>}

        {token ? (
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}
      </nav>
    </nav>
  );
};

export default Navbar;