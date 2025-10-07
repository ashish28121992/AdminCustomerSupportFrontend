import React from 'react';

function Header() {
  return (
    <header className="admin-header">
      <div className="brand">
        <img
          src={process.env.PUBLIC_URL + '/logo.png'}
          alt="Admin Support"
          className="brand-logo"
        />
        <h1>Admin Dashboard</h1>
      </div>

      <div className="header-actions">
        <div className="avatar" title="Admin" />
      </div>
    </header>
  );
}

export default Header;


