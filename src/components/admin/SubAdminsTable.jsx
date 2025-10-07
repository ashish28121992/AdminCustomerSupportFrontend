import React from 'react';

function SubAdminsTable({ subs, page, totalPages, onPageChange, query, onQueryChange, onDelete }) {
  return (
    <section className="tables-grid">
      <div className="panel table-panel animate-in">
        <div className="panel-header">
          <h2>Sub-Admins by Admin</h2>
          <div className="search">
            <input type="text" placeholder="Search sub-admins…" value={query} onChange={(e) => onQueryChange(e.target.value)} />
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table compact">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Email</th>
                <th>WA</th>
                <th>Last Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((a, idx) => (
                <tr key={a.email} style={{ animationDelay: `${idx * 70}ms` }}>
                  <td className="name-cell">
                    <div className="avatar tiny" />
                    <span>{a.admin}</span>
                  </td>
                  <td className="muted">{a.email}</td>
                  <td>
                    {a.waLink ? (
                      <a className="link" href={a.waLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td className="muted">{a.lastCreated}</td>
                  <td><button className="btn-danger" onClick={() => onDelete(a.email)}>Delete</button></td>
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

export default SubAdminsTable;


