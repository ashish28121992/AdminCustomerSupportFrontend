import React from 'react';

function ClientsTable({ clients, page, totalPages, onPageChange, onEdit }) {
  return (
    <div className="clients-section">
      <div className="section-header-compact">
        <h2 className="section-title-compact">My Clients</h2>
        <span className="client-count">{clients.length} client{clients.length !== 1 ? 's' : ''}</span>
      </div>
      
      {clients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Clients Yet</h3>
          <p>Start by adding your first client using the "Add New Client" button above.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>WhatsApp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, index) => (
                  <tr key={client.id || index} className="animate-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar-small">
                          {client.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="client-name-text">{client.name}</span>
                      </div>
                    </td>
                    <td className="muted">{client.userId}</td>
                    <td className="muted">{client.email}</td>
                    <td className="muted">{client.phone}</td>
                    <td className="muted">{client.branchName || 'N/A'}</td>
                    <td>
                      <span className={`status-badge-small ${client.isActive ? 'active' : 'inactive'}`}>
                        {client.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td>
                      {client.branchWaLink ? (
                        <a href={client.branchWaLink} target="_blank" rel="noopener noreferrer" className="wa-link-small">
                          💬 Link
                        </a>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => onEdit(client)} title="Edit">✏️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn" 
                disabled={page === 1} 
                onClick={() => onPageChange(page - 1)}
              >
                ← Prev
              </button>
              <span className="page-indicator">Page {page} of {totalPages}</span>
              <button 
                className="page-btn" 
                disabled={page === totalPages} 
                onClick={() => onPageChange(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ClientsTable;
