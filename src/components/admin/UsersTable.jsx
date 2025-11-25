import React from 'react';

function UsersTable({ users, page, totalPages, onPageChange, query, onQueryChange, onDelete }) {
  return (
    <section className="tables-grid">
      <div className="panel table-panel animate-in">
        <div className="panel-header">
          <h2>Users</h2>
          <div className="search">
            <input type="text" placeholder="Search users…" value={query} onChange={(e) => onQueryChange(e.target.value)} />
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Sub-Admin</th>
                <th>Status</th>
                <th>Date & Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id} style={{ animationDelay: `${idx * 60}ms` }}>
                  <td>{u.id}</td>
                  <td className="name-cell">
                    <div className="avatar tiny" />
                    <span>{u.name}</span>
                  </td>
                  <td className="muted">{u.phone || '—'}</td>
                  <td><span className="badge">{u.role}</span></td>
                  <td className="muted">{u.subAdmin || 'N/A'}</td>
                  <td><span className={`status ${u.status.toLowerCase()}`}>{u.status}</span></td>
                  <td className="muted">{u.createdAt ? new Date(u.createdAt).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }) : 'N/A'}</td>
                  <td><button className="btn-danger" onClick={() => onDelete(u.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Prev</button>
            <span className="page-indicator">Page {page} of {totalPages}</span>
            <button className="page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UsersTable;


