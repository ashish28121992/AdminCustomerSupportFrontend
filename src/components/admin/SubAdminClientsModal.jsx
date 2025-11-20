import React from 'react';

function SubAdminClientsModal({ open, onClose, subAdmin, clients }) {
  if (!open || !subAdmin) return null;

  return (
    <div className="modal-backdrop blur-backdrop" onClick={onClose}>
      <div className="modal subadmin-clients-modal full-screen-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="gradient-text">{`${subAdmin.username || subAdmin.email || 'Sub-Admin'}'s Clients`}</h3>
          <button className="ghost" onClick={onClose}>Close</button>
        </div>
        <div className="modal-body">
          <div className="modal-info">
            <p><strong>Sub-Admin:</strong> {subAdmin.username || subAdmin.email}</p>
            <p><strong>Total Clients:</strong> {clients.length}</p>
          </div>

          {clients.length === 0 ? (
            <div className="empty-state-small">
              <p>No clients found for this sub-admin</p>
            </div>
          ) : (
            <div className="clients-modal-table-wrapper">
              <table className="clients-modal-table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Name</th>
                    <th style={{ width: '12%' }}>User ID</th>
                    <th style={{ width: '22%' }}>Email</th>
                    <th style={{ width: '13%' }}>Phone</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '25%' }}>WhatsApp Link</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, index) => (
                    <tr key={client.id || index}>
                      <td className="client-name-cell">{client.name}</td>
                      <td className="muted">{client.userId}</td>
                      <td className="muted">{client.email}</td>
                      <td className="muted">{client.phone}</td>
                      <td>
                        <span className={`status-badge-small ${client.isActive ? 'active' : 'inactive'}`}>
                          {client.isActive ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td>
                        {client.branchWaLink ? (
                          <a href={client.branchWaLink} target="_blank" rel="noopener noreferrer" className="wa-link-modal">
                            💬 {client.branchWaLink}
                          </a>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubAdminClientsModal;
