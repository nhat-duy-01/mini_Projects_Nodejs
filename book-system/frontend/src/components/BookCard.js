import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  return (
    <div className="book-card">
      <img src={book.coverImage || 'https://via.placeholder.com/200x260?text=No+Cover'} alt={book.title} />
      <h3>{book.title}</h3>
      <p className="author">Tác giả: {book.author}</p>
      <span className="cat">{book.category}</span>
      <p className="rating">★ {book.averageRating ? Number(book.averageRating).toFixed(1) : 'Chưa có'} / 5</p>
      <div className="actions">
        <Link to={`/books/${book._id}`} className="btn btn-primary btn-sm">Xem chi tiết</Link>
      </div>
    </div>
  );
};

export default BookCard;