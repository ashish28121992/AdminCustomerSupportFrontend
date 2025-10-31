import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

function DashboardCards({ usersCount, subAdmins, onNavigate, clientCounts = {}, onViewClients, timePeriod = 'realtime', analyticsData = [], analyticsSummary = null }) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [showTable, setShowTable] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const prevTimePeriodRef = React.useRef(timePeriod);

  // Auto-open table when time period changes
  useEffect(() => {
    // Only show table if timePeriod actually changed (not on initial mount)
    if (prevTimePeriodRef.current !== timePeriod) {
      console.log('Time period changed from', prevTimePeriodRef.current, 'to', timePeriod);
      setShowTable(true);
      prevTimePeriodRef.current = timePeriod;
    }
  }, [timePeriod]);
  
  const rowsToRender = Array.isArray(analyticsData) ? analyticsData : [];
  
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

      {/* Time Period Data Table Overlay */}
      {showTable && createPortal(
        <>
          <div className="table-overlay-backdrop" onClick={() => {
            console.log('Backdrop clicked, closing table');
            setShowTable(false);
          }} />
          <div className="period-data-table-overlay animate-in">
            <div className="table-header">
              <h3 className="table-title">📊 Analytics Data</h3>
              <div className="table-header-right">
                <span className="period-badge">
                  {timePeriod === '1day' ? '1 Day' : 
                   timePeriod === '7days' ? '7 Days' : 
                   timePeriod === '30days' ? '30 Days' : 'Real-time'}
                </span>
                <button className="close-table-btn" onClick={() => setShowTable(false)}>✕</button>
              </div>
            </div>
            {analyticsSummary ? (
              <div className="table-wrapper-custom" style={{ marginBottom: '1rem' }}>
                <div className="summary-bar" role="status" aria-live="polite">
                  {(() => {
                    const items = [];
                    // Realtime-style metrics
                    const rt = ['today','yesterday','thisWeek','thisMonth','total'];
                    const hasRt = rt.some(k => typeof analyticsSummary[k] !== 'undefined');
                    if (hasRt) {
                      items.push({ key: 'today', label: 'Today', value: analyticsSummary.today, icon: '☀️' });
                      items.push({ key: 'yesterday', label: 'Yesterday', value: analyticsSummary.yesterday, icon: '🌙' });
                      items.push({ key: 'thisWeek', label: 'This Week', value: analyticsSummary.thisWeek, icon: '📅' });
                      items.push({ key: 'thisMonth', label: 'This Month', value: analyticsSummary.thisMonth, icon: '🗓️' });
                      items.push({ key: 'total', label: 'Total', value: analyticsSummary.total, icon: '∑' });
                    } else {
                      // Day-period summary
                      items.push({ key: 'totalVisits', label: 'Total Visits', value: analyticsSummary.totalVisits, icon: '∑' });
                      items.push({ key: 'totalUniqueClients', label: 'Unique Clients', value: analyticsSummary.totalUniqueClients, icon: '👥' });
                      items.push({ key: 'avgVisitsPerDay', label: 'Avg/Day', value: analyticsSummary.avgVisitsPerDay, icon: '📈' });
                      if (analyticsSummary.dateRange?.from && analyticsSummary.dateRange?.to) {
                        items.push({ key: 'range', label: 'Date Range', value: `${new Date(analyticsSummary.dateRange.from).toLocaleDateString()} — ${new Date(analyticsSummary.dateRange.to).toLocaleDateString()}`, icon: '🗓️', small: true });
                      }
                    }
                    return items.filter(m => typeof m.value !== 'undefined').map((m) => (
                      <div className="summary-item" key={m.key}>
                        <div className="summary-top">
                          <div className="summary-icon" aria-hidden="true">{m.icon}</div>
                          <div className="summary-label">{m.label}</div>
                        </div>
                        <div className={`summary-value${m.small ? ' small' : ''}`}>{m.value}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ) : null}
            {rowsToRender.length === 0 ? (
              <div className="table-wrapper-custom">
                <div className="no-data-state">
                  <div className="no-data-graphic" aria-hidden="true" />
                  <div className="no-data-title">No data available</div>
                  <div className="no-data-subtitle">Try a different period or check back later.</div>
                </div>
              </div>
            ) : (
              <div className="table-wrapper-custom">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>{timePeriod === 'realtime' ? 'Time' : 'Date'}</th>
                      <th>Users</th>
                      <th>Inquiries</th>
                      <th>Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsToRender.map((row, idx) => {
                      const hasVisitors = Array.isArray(row.visitors) && row.visitors.length > 0;
                      const isExpanded = expandedRows.has(idx);
                      return (
                        <React.Fragment key={idx}>
                          <tr
                            onClick={() => {
                              if (!hasVisitors) return;
                              const next = new Set(expandedRows);
                              if (next.has(idx)) next.delete(idx); else next.add(idx);
                              setExpandedRows(next);
                            }}
                            style={{ cursor: hasVisitors ? 'pointer' : 'default' }}
                          >
                            <td>{timePeriod === 'realtime' ? (row.time || row.date) : (row.date || row.time)}</td>
                            <td>{row.users ?? row.count ?? row.visits ?? 0}</td>
                            <td>{row.inquiries ?? row.total ?? row.events ?? 0}</td>
                            <td><span className="active-badge-table">{row.active ?? row.unique ?? 0}</span></td>
                          </tr>
                          {hasVisitors && isExpanded ? (
                            <tr>
                              <td colSpan={4}>
                                <div style={{ padding: '0.75rem 0.25rem' }}>
                                  <div style={{ fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Visitors ({row.visitors.length})
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                    {row.visitors.map((v, i) => (
                                      <div key={i} style={{
                                        background: 'rgba(99,102,241,0.06)',
                                        border: '1px solid rgba(99,102,241,0.18)',
                                        borderRadius: 8,
                                        padding: '0.5rem 0.6rem'
                                      }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                          <strong style={{ color: '#e6e8f0', fontSize: '0.95rem' }}>{v.name || v.userId || 'Unknown'}</strong>
                                          <span style={{ color: '#93c5fd', fontSize: '0.75rem' }}>{v.userId || ''}</span>
                                        </div>
                                        <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: 4 }}>{v.branchName || '—'}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 2 }}>{v.visitedAt ? new Date(v.visitedAt).toLocaleString() : ''}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </section>
  );
}

export default DashboardCards;
