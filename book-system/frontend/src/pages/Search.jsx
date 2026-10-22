import React, { useState } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:5000/api/books/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '20px' }}>
      <h2>Tìm Kiếm Sách (Search Page)</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', margin: '20px 0 30px' }}>
        <input
          type="text"
          placeholder="Nhập tên sách, tác giả hoặc thể loại..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          required
          style={{ flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
        <button type="submit" style={{ padding: '12px 24px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Tìm Kiếm
        </button>
      </form>

      {hasSearched && results.length === 0 && (
        <p style={{ color: '#64748b' }}>Không tìm thấy cuốn sách nào khớp với "{query}".</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '20px' }}>
        {results.map(b => (
          <BookCard key={b._id} book={b} />
        ))}
      </div>
    </div>
  );
};

export default Search;