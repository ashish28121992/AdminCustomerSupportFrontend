import React from 'react';

function Sidebar({ section, setSection, onCreateSubAdmin, onAddBranch, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Admin" className="sidebar-logo" />
        <span>Admin Panel</span>
      </div>
      <nav className="sidebar-nav">
        <button className={`nav-item ${section === 'users' ? 'active' : ''}`} onClick={() => setSection('users')}>
          <span className="dot nav" /> Users
        </button>
        <button className={`nav-item ${section === 'subs' ? 'active' : ''}`} onClick={() => setSection('subs')}>
          <span className="dot nav" /> Sub-Admins
        </button>
        <button className={`nav-item ${section === 'branches' ? 'active' : ''}`} onClick={() => setSection('branches')}>
          <span className="dot nav" /> Branches
        </button>
        <button className="primary create-sub" onClick={onCreateSubAdmin}>Create Sub-Admin</button>
        <button className="primary create-branch" onClick={onAddBranch}>Add Branch</button>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </nav>
    </aside>
  );
}

export default Sidebar;


