import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navStyle = {
    background: '#333',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    marginLeft: '20px',
    fontWeight: 'bold'
  };

  return (
    <nav style={navStyle}>
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>CollabSphere</div>
      <div>
        <Link to="/" style={linkStyle}>Danh Sách</Link>
        <Link to="/create-project" style={linkStyle}>+ Tạo Đề Tài</Link>
        <Link to="/submit" style={linkStyle}>Nộp Bài</Link>
        <Link to="/grade" style={linkStyle}>Chấm Điểm</Link>
      </div>
    </nav>
  );
};

export default Navbar;