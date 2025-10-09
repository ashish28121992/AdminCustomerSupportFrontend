import React, { useState } from 'react';

function DashboardCards({ usersCount, subAdmins, branchesCount, onNavigate, clientCounts = {}, onViewClients }) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  const summaryCards = [
    {
      title: 'Total Clients',
      count: usersCount,
      icon: '👥',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      hoverColor: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
      onClick: () => onNavigate('users')
    },
    {
      title: 'Total Sub-Admins',
      count: subAdmins.length,
      active: subAdmins.filter(s => s.isActive).length,
      inactive: subAdmins.filter(s => !s.isActive).length,
      icon: '👨‍💼',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      hoverColor: 'linear-gradient(135deg, #ee82f0 0%, #f34a5c 100%)',
      onClick: () => onNavigate('subs')
    },
    {
      title: 'Branches',
      count: branchesCount,
      icon: '🏢',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      hoverColor: 'linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%)',
      onClick: () => onNavigate('branches')
    }
  ];

  const gradients = [
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  ];

  return (
    <section className="dashboard-cards">
      {/* Summary Cards */}
      <div className="cards-grid">
        {summaryCards.map((card, index) => (
          <div 
            key={card.title}
            className="dashboard-card animate-in"
            style={{ 
              animationDelay: `${index * 150}ms`,
              background: card.color,
              '--hover-bg': card.hoverColor
            }}
            onClick={card.onClick}
          >
            <div className="card-icon">
              <span>{card.icon}</span>
            </div>
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <div className="card-count">{card.count}</div>
              {card.active !== undefined && (
                <div className="card-breakdown">
                  <span 
                    className={`active-count ${statusFilter === 'active' ? 'filter-active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setStatusFilter(statusFilter === 'active' ? 'all' : 'active'); }}
                    style={{ cursor: 'pointer' }}
                  >
                    ✓ {card.active} Active
                  </span>
                  <span 
                    className={`inactive-count ${statusFilter === 'inactive' ? 'filter-active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setStatusFilter(statusFilter === 'inactive' ? 'all' : 'inactive'); }}
                    style={{ cursor: 'pointer' }}
                  >
                    ✗ {card.inactive} Inactive
                  </span>
                </div>
              )}
            </div>
            <div className="card-overlay">
              <span className="card-action">View Details →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sub-Admin Cards Section */}
      {subAdmins.length > 0 ? (
        <div className="subadmin-section animate-in" style={{ animationDelay: '450ms' }}>
          <div className="section-header">
            <h2 className="section-title">Sub-Admin Overview</h2>
            <p className="section-subtitle">
              {statusFilter === 'all' 
                ? 'View all sub-admins and their user counts' 
                : statusFilter === 'active' 
                  ? `Showing ${subAdmins.filter(s => s.isActive).length} Active Sub-Admins` 
                  : `Showing ${subAdmins.filter(s => !s.isActive).length} Inactive Sub-Admins`}
            </p>
            {statusFilter !== 'all' && (
              <button 
                className="filter-reset-btn" 
                onClick={() => setStatusFilter('all')}
              >
                ← Show All Sub-Admins
              </button>
            )}
          </div>
          <div className="subadmin-cards-grid">
            {subAdmins
              .filter(subAdmin => {
                if (statusFilter === 'active') return subAdmin.isActive;
                if (statusFilter === 'inactive') return !subAdmin.isActive;
                return true;
              })
              .map((subAdmin, index) => {
                const count = clientCounts[subAdmin.id] || 0;
                
                return (
              <div
                key={subAdmin.id || index}
                className="subadmin-card animate-in"
                style={{ 
                  animationDelay: `${(index + 3) * 100}ms`,
                  background: gradients[index % gradients.length]
                }}
              >
                <div className="subadmin-card-header">
                  <div className="subadmin-avatar">
                    <span>{subAdmin.userId || '?'}</span>
                  </div>
                  <div className="subadmin-info">
                    <h3 className="subadmin-name">{subAdmin.branchName || 'Unknown Branch'}</h3>
                    <p className="subadmin-email">{subAdmin.email}</p>
                  </div>
                </div>
                <div className="subadmin-stats-single">
                  <div 
                    className="users-count-box clickable" 
                    onClick={() => onViewClients && onViewClients(subAdmin)}
                    title="Click to view clients"
                  >
                    <div className="users-count-label">My Clients</div>
                    <div className="users-count-value">{count}</div>
                  </div>
                </div>
                <div className="subadmin-footer">
                  <span className={`status-badge ${subAdmin.isActive ? 'active' : 'inactive'}`}>
                    {subAdmin.isActive ? '● Active' : '○ Inactive'}
                  </span>
                  <span className="branch-link">
                    {subAdmin.branchWaLink ? '📱 WhatsApp' : '—'}
                  </span>
                </div>
              </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="dashboard-welcome animate-in" style={{ animationDelay: '450ms' }}>
          <h2 className="welcome-title">Welcome to Admin Dashboard</h2>
          <p className="welcome-subtitle">No sub-admins created yet. Create your first sub-admin to get started!</p>
        </div>
      )}
    </section>
  );
}

export default DashboardCards;
