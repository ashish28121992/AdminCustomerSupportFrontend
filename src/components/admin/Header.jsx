import React from 'react';

function Header({ onMenuToggle, isMenuOpen, onBrandClick }) {
  return (
    <header className="admin-header">
      <div className="brand">
        <button 
          className="mobile-menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <img
          src={process.env.PUBLIC_URL + '/logo.png'}
          alt="Admin Support"
          className="brand-logo"
          onClick={onBrandClick}
          style={{ cursor: onBrandClick ? 'pointer' : undefined }}
          title={onBrandClick ? 'Go to Dashboard' : undefined}
        />
        <h1 onClick={onBrandClick} style={{ cursor: onBrandClick ? 'pointer' : undefined }} title={onBrandClick ? 'Go to Dashboard' : undefined}>Admin Dashboard</h1>
      </div>

      <div className="header-actions">
        <div className="avatar" title="Admin" />
      </div>
    </header>
  );
}

export default Header;


