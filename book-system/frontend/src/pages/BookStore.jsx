import { useEffect, useState } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';

const categories = ['All', 'Fiction', 'Science', 'Technology', 'Literature'];

const BookStore = () => {
  const [books, setBooks] = useState([]);
  const [selectedCat, setSelectedCat] = useState('All');

  useEffect(() => {
    const url = selectedCat === 'All'
      ? 'http://localhost:5000/api/books'
      : `http://localhost:5000/api/books?category=${selectedCat}`;
    axios.get(url).then(res => setBooks(res.data)).catch(console.error);
  }, [selectedCat]);

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '20px' }}>
      <h2>Cửa Hàng Sách (Book Store)</h2>
      
      {/* Bộ lọc danh mục */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              background: selectedCat === cat ? '#0284c7' : '#e2e8f0',
              color: selectedCat === cat ? '#fff' : '#334155'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '20px' }}>
        {books.map(b => (
          <BookCard key={b._id} book={b} />
        ))}
      </div>
    </div>
  );
};

export default BookStore;