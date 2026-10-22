import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} Book Review Portal — Node.js Mini Project · Powered by MERN Stack
    </footer>
  );
};

export default Footer;