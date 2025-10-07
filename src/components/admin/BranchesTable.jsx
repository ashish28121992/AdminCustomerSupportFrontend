import React from 'react';

function BranchesTable({ branches, page, totalPages, onPageChange, query, onQueryChange, onDelete }) {
  return (
    <section className="tables-grid">
      <div className="panel table-panel animate-in">
        <div className="panel-header">
          <h2>Branches</h2>
          <div className="search">
            <input type="text" placeholder="Search branches…" value={query} onChange={(e) => onQueryChange(e.target.value)} />
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Branch Name</th>
                <th>Location</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>WhatsApp</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch, idx) => (
                <tr key={branch.id || idx} style={{ animationDelay: `${idx * 60}ms` }}>
                  <td className="name-cell">
                    <div className="avatar tiny" />
                    <span>{branch.name}</span>
                  </td>
                  <td className="muted">{branch.location}</td>
                  <td>{branch.contactPerson || '—'}</td>
                  <td className="muted">{branch.phone || '—'}</td>
                  <td>
                    {branch.waLink ? (
                      <a className="link" href={branch.waLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td className="muted">{branch.email || '—'}</td>
                  <td><button className="btn-danger" onClick={() => onDelete(branch.id || idx)}>Delete</button></td>
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

export default BranchesTable;
