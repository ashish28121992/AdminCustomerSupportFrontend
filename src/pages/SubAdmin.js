import React from 'react';
import './Admin.css';

function SubAdmin() {
  return (
    <div className="admin-page">
      <div className="admin-gradient" />
      <header className="admin-header">
        <div className="brand">
          <img
            src={process.env.PUBLIC_URL + '/logo.png'}
            alt="Sub Admin"
            className="brand-logo"
          />
          <h1>SubAdmin View</h1>
        </div>
      </header>
      <main className="admin-content">
        {/* Placeholder content area for future sub-admin features */}
      </main>
    </div>
  );
}

export default SubAdmin;


