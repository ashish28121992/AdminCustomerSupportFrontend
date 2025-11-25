import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { postJson, getJson, deleteJson, putJson } from '../utils/api';
import { getToken } from '../utils/auth';
import Header from '../components/admin/Header';
import Sidebar from '../components/admin/Sidebar';
import DashboardCards from '../components/admin/DashboardCards';
import UsersTable from '../components/admin/UsersTable';
import SubAdminsTable from '../components/admin/SubAdminsTable';
import CreateSubAdminModal from '../components/admin/CreateSubAdminModal';
import SubAdminClientsModal from '../components/admin/SubAdminClientsModal';
import ChangePasswordModal from '../components/admin/ChangePasswordModal';
import UpdateSubAdminModal from '../components/admin/UpdateSubAdminModal';
import toast from 'react-hot-toast';
import './Admin.css';

function Admin() {
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [subsPage, setSubsPage] = useState(1);
  
  const [usersQuery, setUsersQuery] = useState('');
  const [subsQuery, setSubsQuery] = useState('');
  
  const [timePeriod, setTimePeriod] = useState('realtime');
  const [analyticsRows, setAnalyticsRows] = useState([]);
  
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreatingSub, setIsCreatingSub] = useState(false);
  
  // Sub-admin form state
  const [newSubUsername, setNewSubUsername] = useState('');
  const [newSubPassword, setNewSubPassword] = useState('');
  const [newSubUserId, setNewSubUserId] = useState('');
  const [newSubBranchId, setNewSubBranchId] = useState('');
  const [newSubIsActive, setNewSubIsActive] = useState(true);
  const [newWaLink, setNewWaLink] = useState('');
  const [permUsersRead, setPermUsersRead] = useState(true);
  const [formError, setFormError] = useState('');
  
  
  
  const pageSize = 5;
  

  const [subAdmins, setSubAdmins] = useState([]);
  const [clientCounts, setClientCounts] = useState({}); // { subAdminId: count }
  const [allClients, setAllClients] = useState([]); // All clients from API
  const [totalClientsCount, setTotalClientsCount] = useState(0);
  
  // Modal state for viewing sub-admin clients
  const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);
  const [selectedSubAdminClients, setSelectedSubAdminClients] = useState([]);
  
  // Modal state for changing sub-admin password
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [selectedSubAdminForPassword, setSelectedSubAdminForPassword] = useState(null);

  // Modal state for updating sub-admin
  const [isUpdateSubAdminOpen, setIsUpdateSubAdminOpen] = useState(false);
  const [selectedSubAdminForUpdate, setSelectedSubAdminForUpdate] = useState(null);
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const normalized = (s) => s.toLowerCase();
  
  // Map API clients to match UsersTable structure
  const mappedClients = useMemo(() => {
    const lookup = new Map();
    subAdmins.forEach((sub) => {
      const identifier = sub.id || sub._id || '';
      const displayName = sub.username || sub.email || sub.userId || '—';
      const keys = [
        sub.id,
        sub._id,
        sub.userId,
        sub.username,
        sub.email,
      ].filter(Boolean);
      keys.forEach((key) => {
        lookup.set(String(key), {
          id: identifier || String(key),
          username: displayName,
        });
      });
    });

    const resolveSubAdminDetails = (client) => {
      const candidateRefs = [
        client.parentSubAdmin,
        client.createdBy,
        client.owner,
        client.assignedTo,
        client.subAdmin,
        client.subadmin,
      ];

      for (const ref of candidateRefs) {
        if (!ref) continue;

        if (typeof ref === 'string' || typeof ref === 'number') {
          const key = String(ref);
          const matched = lookup.get(key);
          if (matched) {
            return { name: matched.username, id: matched.id };
          }
        } else if (typeof ref === 'object') {
          const keys = [
            ref.id,
            ref._id,
            ref.userId,
            ref.username,
            ref.email,
            ref.name,
          ];
          for (const key of keys) {
            if (!key) continue;
            const matched = lookup.get(String(key));
            if (matched) {
              return { name: matched.username, id: matched.id };
            }
          }
          if (ref.username || ref.name || ref.email) {
            return {
              name: ref.username || ref.name || ref.email,
              id: ref.id || ref._id || ref.userId || '',
            };
          }
        }
      }

      const fallbackName =
        client.branchName ||
        client.branch?.branchName ||
        client.branch?.name ||
        client.branch?.username ||
        '';

      return { name: fallbackName, id: '' };
    };

    return allClients.map((client) => {
      const { name: subAdminName, id: subAdminId } = resolveSubAdminDetails(client);
      const phone =
        client.phone ||
        client.phoneNumber ||
        client.whatsappNumber ||
        client.contactNumber ||
        client.mobile ||
        '';
      const lookupKeys = Array.from(
        new Set(
          [
            client.userId,
            client.id,
            client.email,
            client.username,
            client.name,
            client.fullName,
            client.phone,
            client.phoneNumber,
            client.whatsappNumber,
            client.contactNumber,
            client.mobile,
          ]
            .filter(Boolean)
            .map((val) => String(val).toLowerCase())
        )
      );

      return {
        id: client.userId || client.id,
        name: client.name || client.fullName || client.username || '—',
        email: client.email || client.contactEmail || '—',
        phone,
        role: client.role || 'Client',
        status: client.isActive ? 'Active' : 'Inactive',
        subAdmin: subAdminName || 'N/A',
        subAdminId,
        createdAt: client.createdAt || client.createdAtUtc || client.createdOn,
        lookupKeys,
      };
    });
  }, [allClients, subAdmins]);

  const clientDetailsLookup = useMemo(() => {
    const map = new Map();
    mappedClients.forEach((client) => {
      (client.lookupKeys || []).forEach((key) => {
        if (!map.has(key)) {
          map.set(key, client);
        }
      });
    });
    return map;
  }, [mappedClients]);

  const clientSubAdminLookup = useMemo(() => {
    const map = new Map();
    mappedClients.forEach((client) => {
      const subName = client.subAdmin || '';
      if (!subName) return;
      (client.lookupKeys || []).forEach((key) => {
        if (!map.has(key)) {
          map.set(key, subName);
        }
      });
    });
    return map;
  }, [mappedClients]);

  const usersFiltered = mappedClients.filter((u) => {
    const q = normalized(usersQuery);
    if (!q) return true;
    return (
      normalized(u.id || '').includes(q) ||
      normalized(u.name || '').includes(q) ||
      normalized(u.email || '').includes(q) ||
      normalized(u.role || '').includes(q) ||
      normalized(u.status || '').includes(q) ||
      normalized(u.subAdmin || '').includes(q)
    );
  });
  const subsFiltered = subAdmins.filter((a) => {
    const q = normalized(subsQuery);
    if (!q) return true;
    return (
      normalized(a.admin || '').includes(q) ||
      normalized(a.branchName || '').includes(q) ||
      normalized(a.username || a.email || '').includes(q) ||
      normalized(a.userId || '').includes(q) ||
      normalized(String(a.isActive)).includes(q) ||
      normalized(a.branchWaLink || '').includes(q) ||
      normalized(a.createdAt || a.lastCreated || '').includes(q)
    );
  });
  

  const usersTotalPages = Math.max(1, Math.ceil(usersFiltered.length / pageSize));
  const subsTotalPages = Math.max(1, Math.ceil(subsFiltered.length / pageSize));
  const usersStartIdx = (usersPage - 1) * pageSize;
  const subsStartIdx = (subsPage - 1) * pageSize;
  const pagedUsers = usersFiltered.slice(usersStartIdx, usersStartIdx + pageSize);
  const pagedSubs = subsFiltered.slice(subsStartIdx, subsStartIdx + pageSize);
  

  async function handleCreateSubAdmin(e) {
    e.preventDefault();
    setFormError('');
    if (!newSubUsername.trim()) {
      setFormError('Username is required');
      return;
    }
    if (!newSubPassword || newSubPassword.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    if (!newSubUserId.trim()) {
      setFormError('User ID is required');
      return;
    }
    // Branch flow removed; waLink provided directly during sub-admin creation

    const permissions = [];
    if (permUsersRead) {
      permissions.push({ resource: 'users', actions: ['read'] });
    }

    try {
      setIsCreatingSub(true);
      const token = getToken();
      const payload = {
        username: newSubUsername.trim(),
        password: newSubPassword,
        userId: newSubUserId.trim(),
        isActive: Boolean(newSubIsActive),
        waLink: (newWaLink || '').trim(),
        permissions,
      };
      // Debug: verify payload
      console.log('POST /admins payload', payload);
      const res = await postJson('/admins', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res?.success && res?.data) {
        // Reflect in UI list (prepend a lightweight row)
        const newRow = {
          admin: (res.data.branch && res.data.branch.branchName) || res?.data?.branchName || '—',
          username: res.data.username || res.data.email,
          lastCreated: 'just now',
        };
        setSubAdmins((prev) => [newRow, ...prev]);
        toast.success('Sub-admin created');
        setIsCreateOpen(false);
        setNewSubUsername('');
        setNewSubPassword('');
        setNewSubUserId('');
        setNewSubBranchId('');
        setNewSubIsActive(true);
        setPermUsersRead(true);
        setNewWaLink('');
        setSubsPage(1);
        setSection('subs');
        return;
      }
      const msg = res?.message || 'Failed to create sub-admin';
      setFormError(msg);
      toast.error(msg);
    } catch (err) {
      console.error('Create sub-admin error:', err);
      const msg = err?.message || 'Network error';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsCreatingSub(false);
    }
  }

  

  // Function to view clients of a specific sub-admin
  function handleViewSubAdminClients(subAdmin) {
    // Filter by parentSubAdmin ID to ensure proper isolation
    // This ensures deleted sub-admin's clients don't show for new sub-admin
    const subAdminClients = allClients.filter(client => {
      // Extract IDs (parentSubAdmin might be object or string)
      const clientParentId = typeof client.parentSubAdmin === 'object' 
        ? String(client.parentSubAdmin?.id || '')
        : String(client.parentSubAdmin || '');
      const clientCreatorId = typeof client.createdBy === 'object'
        ? String(client.createdBy?.id || '')
        : String(client.createdBy || '');
      const subAdminId = String(subAdmin.id || '');
      
      // Match by parentSubAdmin ID (this is the creator/owner of the client)
      if (clientParentId && subAdminId && clientParentId === subAdminId) {
        return true;
      }
      // Fallback to createdBy field
      if (clientCreatorId && subAdminId && clientCreatorId === subAdminId) {
        return true;
      }
      
      return false;
    });
    
    setSelectedSubAdmin(subAdmin);
    setSelectedSubAdminClients(subAdminClients);
    setIsClientsModalOpen(true);
  }

  // Function to open change password modal for a sub-admin
  function handleChangePassword(subAdmin) {
    setSelectedSubAdminForPassword(subAdmin);
    setIsChangePasswordOpen(true);
  }

  // Function to open update modal for a sub-admin
  function handleUpdateSubAdmin(subAdmin) {
    setSelectedSubAdminForUpdate(subAdmin);
    setIsUpdateSubAdminOpen(true);
    setUpdateError('');
  }

  // Function to handle sub-admin update
  async function handleUpdateSubAdminSubmit(waLink) {
    if (!selectedSubAdminForUpdate) return;
    
    setUpdateError('');
    setIsUpdatingSub(true);

    try {
      const token = getToken();
      const subAdminId = selectedSubAdminForUpdate.id;
      
      const res = await putJson(`/admins/${subAdminId}`, 
        { waLink: waLink.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res?.success && res?.data) {
        // Update the sub admin in the state
        setSubAdmins(prev => prev.map(sub => {
          if (sub.id === subAdminId) {
            return {
              ...sub,
              branchWaLink: res.data.branchWaLink || waLink.trim()
            };
          }
          return sub;
        }));
        
        toast.success('Sub-admin updated successfully');
        setIsUpdateSubAdminOpen(false);
        setSelectedSubAdminForUpdate(null);
      } else {
        const msg = res?.message || 'Failed to update sub-admin';
        setUpdateError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error('Update sub-admin error:', err);
      const msg = err?.message || 'Network error';
      setUpdateError(msg);
      toast.error(msg);
    } finally {
      setIsUpdatingSub(false);
    }
  }

  // Helper function to fetch all pages of data
  const fetchAllPages = async (endpoint, token) => {
    let allItems = [];
    let currentPage = 1;
    let hasMore = true;
    const pageSize = 100; // Fetch 100 items per page

    try {
      while (hasMore) {
        const res = await getJson(`${endpoint}?page=${currentPage}&limit=${pageSize}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const items = res?.data?.items || [];
        allItems = [...allItems, ...items];
        
        // Check if there are more pages
        const pagination = res?.data?.pagination;
        if (pagination) {
          const totalPages = Math.ceil(pagination.total / pageSize);
          hasMore = currentPage < totalPages;
        } else {
          // If no pagination info, check if we got full page
          hasMore = items.length === pageSize;
        }
        
        currentPage++;
        
        // Safety check to prevent infinite loop
        if (currentPage > 100) break;
      }
    } catch (err) {
      console.error(`Error fetching all pages from ${endpoint}:`, err);
      throw err;
    }
    
    return allItems;
  };

  // Fetch analytics for selected time period (1d, 7d, 30d, realtime)
  const loadAnalytics = async (periodId) => {
    // Map UI ids to API period query values
    const periodMap = {
      '1day': '1d',
      '7days': '7d',
      '30days': '30d',
      'realtime': 'realtime',
    };

    const periodQuery = periodMap[periodId] || '1d';
    // Support 1d, 7d, 30d, realtime; others will show empty state
    if (periodQuery !== '1d' && periodQuery !== '7d' && periodQuery !== '30d' && periodQuery !== 'realtime') {
      setAnalyticsRows([]);
      return;
    }

    try {
      
      const token = getToken() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGUzODI3NDljZjViNDNhODdmYmJjODciLCJyb2xlIjoicm9vdCIsInR2Ijo1OSwiaWF0IjoxNzYxMjg5NjE1LCJleHAiOjE3NjEyOTA1MTV9.J5m7z2_hIW7U1lUrUYZfC8-1MWv2YEqdVp29kPnMccM';
      const endpointPath = periodQuery === 'realtime'
        ? '/analytics/realtime-stats'
        : `/analytics/client-visits?period=${encodeURIComponent(periodQuery)}`;
      const res = await getJson(endpointPath, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Normalize rows for DashboardCards table
      // Try to support various shapes conservatively
      // Set summary for realtime or day-based periods if available
      if (res?.data && typeof res.data === 'object') {
        if (periodQuery === 'realtime') {
          const { today, yesterday, thisWeek, thisMonth, total } = res.data;
          if ([today, yesterday, thisWeek, thisMonth, total].some(v => typeof v !== 'undefined')) {
            setAnalyticsSummary({ today, yesterday, thisWeek, thisMonth, total });
          } else {
            setAnalyticsSummary(null);
          }
        } else if (res.data.summary && typeof res.data.summary === 'object') {
          setAnalyticsSummary(res.data.summary);
        } else {
          setAnalyticsSummary(null);
        }
      } else {
        setAnalyticsSummary(null);
      }

      let items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      // Prefer named arrays when present (e.g., data.groupedVisits)
      if (res?.data && typeof res.data === 'object') {
        if (Array.isArray(res.data.groupedVisits)) {
          items = res.data.groupedVisits;
        } else if (!Array.isArray(items)) {
          const firstArray = Object.values(res.data).find(v => Array.isArray(v));
          if (Array.isArray(firstArray)) items = firstArray;
        }
      }
      // Realtime: if we have a flat visits list, aggregate by date to match other periods
      if (periodQuery === 'realtime' && res?.data && typeof res.data === 'object') {
        const visitsArray = Array.isArray(res.data.recentVisits)
          ? res.data.recentVisits
          : (Array.isArray(res.data.visits) ? res.data.visits : []);
        if (Array.isArray(visitsArray) && visitsArray.length > 0) {
          const dateToGroup = new Map();
          visitsArray.forEach((v) => {
            const visitedAt = v.visitedAt || v.timestamp || Date.now();
            const d = new Date(visitedAt);
            const dateKey = isNaN(d.getTime()) ? String(visitedAt) : d.toISOString().slice(0, 10);
            if (!dateToGroup.has(dateKey)) {
              dateToGroup.set(dateKey, { date: dateKey, visits: [], uniqueSet: new Set() });
            }
            const entry = dateToGroup.get(dateKey);
            entry.visits.push(v);
            if (v.userId) entry.uniqueSet.add(String(v.userId));
          });
          items = Array.from(dateToGroup.values())
            .map(g => ({
              date: g.date,
              totalVisits: g.visits.length,
              uniqueClients: g.uniqueSet.size,
              visits: g.visits,
            }))
            .sort((a, b) => (a.date < b.date ? 1 : -1));
        }
      }
      const normalized = items.map((it, idx) => {
        const date = it.date || it.day || it.timestamp || it.time || `#${idx + 1}`;
        // Map counts robustly for grouped daily rows and generic rows
        const users =
          it.totalUniqueClients ??
          it.uniqueClients ??
          it.users ??
          it.uniqueUsers ??
          it.clients ?? 0;
        const rawInquiries =
          it.totalVisits ??
          it.inquiries ??
          it.totalInquiries ??
          it.events ??
          it.total ??
          (Array.isArray(it.visits) ? it.visits.length : undefined);
        const inquiries = Number(rawInquiries ?? 0) || 0;
        const active =
          it.active ??
          it.activeUsers ??
          it.unique ??
          it.uniqueClients ?? 0;
        const collectVisitLookupKeys = (visit) =>
          [
            visit.userId,
            visit.user_id,
            visit.clientId,
            visit.client_id,
            visit.username,
            visit.userName,
            visit.clientUsername,
            visit.name,
            visit.clientName,
            visit.email,
            visit.clientEmail,
            visit.phone,
            visit.clientPhone,
            visit.contactNumber,
            visit.whatsappNumber,
            visit.phoneNumber,
            visit.mobile,
          ]
            .filter(Boolean)
            .map((val) => String(val).toLowerCase());

        const findClientDetailsForVisit = (visit) => {
          const keys = collectVisitLookupKeys(visit);
          for (const key of keys) {
            const details = clientDetailsLookup.get(key);
            if (details) return details;
          }
          return null;
        };

        const resolveVisitSubAdmin = (visit) => {
          if (!visit || typeof visit !== 'object') return visit || '';
          const candidateRefs = [
            visit.subAdmin,
            visit.subadmin,
            visit.subAdminName,
            visit.assignedTo,
            visit.owner,
            visit.createdBy,
            visit.parentSubAdmin,
            visit.branch?.manager,
            visit.branch?.owner,
          ];
          for (const ref of candidateRefs) {
            if (!ref) continue;
            if (typeof ref === 'string') {
              if (ref.trim()) return ref;
            } else if (typeof ref === 'object') {
              const refName =
                ref.username ||
                ref.name ||
                ref.fullName ||
                ref.email ||
                ref.userId ||
                ref.branchName ||
                ref.branch?.name;
              if (refName) return refName;
            }
          }
          const fallbackKeys = collectVisitLookupKeys(visit);
          for (const key of fallbackKeys) {
            const matched = clientSubAdminLookup.get(key);
            if (matched) return matched;
          }
          return (
            visit.branchName ||
            visit.branch?.branchName ||
            visit.branch?.name ||
            ''
          );
        };

        const visitors = Array.isArray(it.visits)
          ? it.visits.map((v) => {
              const username =
                v.username ||
                v.clientUsername ||
                v.userName ||
                v.user_id ||
                v.userId ||
                '';
              const matchedClient = findClientDetailsForVisit(v);
              const displayName =
                v.clientName ||
                v.name ||
                matchedClient?.name ||
                '';
              const phoneNumber =
                v.clientPhone ||
                v.phone ||
                v.contactNumber ||
                v.whatsappNumber ||
                v.phoneNumber ||
                matchedClient?.phone ||
                '';
              return {
                userId: v.userId || username || '',
                username,
                name: displayName,
                email: v.clientEmail || v.email || '',
                phone: phoneNumber,
                branchName: v.branchName || '',
                visitedAt: v.visitedAt || v.timestamp || '',
                subAdminName: resolveVisitSubAdmin(v),
              };
            })
          : [];
        return {
          date: typeof date === 'string' ? date : new Date(date).toLocaleString(),
          users: Number(users) || 0,
          inquiries: Number(inquiries) || 0,
          active: Number(active) || 0,
          visitors,
        };
      });
      setAnalyticsRows(normalized);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setAnalyticsRows([]);
    } finally {
      
    }
  };

  

  // Fetch all clients
  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        const clients = await fetchAllPages('/clients', token);
        
        setAllClients(clients);
        setTotalClientsCount(clients.length);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    })();
  }, []);

  // Count clients per sub-admin whenever clients or subAdmins change
  useEffect(() => {
    if (allClients.length === 0 || subAdmins.length === 0) return;
    
    const counts = {};
    subAdmins.forEach((subAdmin) => {
      // Count by parentSubAdmin to ensure accurate counts per sub-admin
      const clientsForSubAdmin = allClients.filter(client => {
        // Extract IDs (parentSubAdmin might be object or string)
        const clientParentId = typeof client.parentSubAdmin === 'object' 
          ? String(client.parentSubAdmin?.id || '')
          : String(client.parentSubAdmin || '');
        const clientCreatorId = typeof client.createdBy === 'object'
          ? String(client.createdBy?.id || '')
          : String(client.createdBy || '');
        const subAdminId = String(subAdmin.id || '');
        
        const matchParent = clientParentId && subAdminId && clientParentId === subAdminId;
        const matchCreator = clientCreatorId && subAdminId && clientCreatorId === subAdminId;
        
        return matchParent || matchCreator;
      });
      
      counts[subAdmin.id] = clientsForSubAdmin.length;
    });
    
    setClientCounts(counts);
  }, [allClients, subAdmins]);

  // Fetch sub-admins from API
  React.useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        const items = await fetchAllPages('/admins', token);
        console.log("items",items)
        
        const mapped = items.map((it) => ({
          id: it.id || it._id,
          admin: (it.branch && it.branch.branchName) || '—',
          branchName: (it.branch && it.branch.branchName) || (it.branchSnapshot && it.branchSnapshot.name) || '—',
          username: it.username || it.email,
          userId: it.userId || '',
          isActive: Boolean(it.isActive),
          branchWaLink: it.branchWaLink || it.waLink || (it.branchSnapshot && it.branchSnapshot.waLink) || (it.branch && it.branch.waLink) || '',
          createdAt: it.createdAt,
        }));
        setSubAdmins(mapped);
      } catch (e) {
        console.error('Error fetching sub-admins:', e);
      }
    })();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-gradient" />

      <div className={`content-shell ${isCreateOpen ? 'blurred' : ''}`}>
        <Header 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMenuOpen={isMobileMenuOpen}
          onBrandClick={() => setSection('dashboard')}
        />

        <div className="admin-layout">
          <Sidebar
            section={section}
            setSection={setSection}
            onCreateSubAdmin={() => setIsCreateOpen(true)}
            onLogout={() => navigate('/', { replace: true })}
            timePeriod={timePeriod}
            onTimePeriodChange={(period) => {
              setTimePeriod(period);
              // Load analytics for the selected period (currently implements 1 day)
              loadAnalytics(period);
            }}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuClose={() => setIsMobileMenuOpen(false)}
          />

          <main className="admin-content">
          {section === 'dashboard' ? (
            <DashboardCards
              usersCount={totalClientsCount}
              subAdmins={subAdmins}
              clientCounts={clientCounts}
              onNavigate={setSection}
              onViewClients={handleViewSubAdminClients}
              timePeriod={timePeriod}
              analyticsData={analyticsRows}
              analyticsSummary={analyticsSummary}
            />
          ) : section === 'users' ? (
            <UsersTable
              users={pagedUsers}
              page={usersPage}
              totalPages={usersTotalPages}
              onPageChange={(p) => setUsersPage(Math.min(Math.max(1, p), usersTotalPages))}
              query={usersQuery}
              onQueryChange={(q) => { setUsersQuery(q); setUsersPage(1); }}
              onDelete={() => {}}
            />
          ) : null}

          {section === 'subs' ? (
            <SubAdminsTable
              subs={pagedSubs}
              page={subsPage}
              totalPages={subsTotalPages}
              onPageChange={(p) => setSubsPage(Math.min(Math.max(1, p), subsTotalPages))}
              query={subsQuery}
              onQueryChange={(q) => { setSubsQuery(q); setSubsPage(1); }}
              onDelete={async (id) => {
                try {
                  const token = getToken();
                  await deleteJson(`/admins/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                  setSubAdmins(prev => prev.filter(s => s.id !== id));
                  toast.success('Sub-admin deleted');
                } catch (e) {
                  toast.error(e?.message || 'Delete failed');
                }
              }}
              onViewClients={handleViewSubAdminClients}
              onChangePassword={handleChangePassword}
              onUpdate={handleUpdateSubAdmin}
            />
          ) : null}
          
          </main>
        </div>
      </div>

      <CreateSubAdminModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateSubAdmin}
        values={{
          username: newSubUsername,
          password: newSubPassword,
          userId: newSubUserId,
          branchId: newSubBranchId,
          isActive: newSubIsActive,
          waLink: newWaLink,
          permissions: { users_read: permUsersRead },
        }}
        onChange={(field, value) => {
          if (field === 'username') setNewSubUsername(value);
          if (field === 'password') setNewSubPassword(value);
          if (field === 'userId') setNewSubUserId(value);
          if (field === 'branchId') setNewSubBranchId(value);
          if (field === 'isActive') setNewSubIsActive(Boolean(value));
          if (field === 'waLink') setNewWaLink(value);
          if (field === 'perm_users_read') setPermUsersRead(Boolean(value));
        }}
        submitting={isCreatingSub}
        error={formError}
      />

      

      <SubAdminClientsModal
        open={isClientsModalOpen}
        onClose={() => {
          setIsClientsModalOpen(false);
          setSelectedSubAdmin(null);
          setSelectedSubAdminClients([]);
        }}
        subAdmin={selectedSubAdmin}
        clients={selectedSubAdminClients}
      />

      <ChangePasswordModal
        open={isChangePasswordOpen}
        onClose={() => {
          setIsChangePasswordOpen(false);
          setSelectedSubAdminForPassword(null);
        }}
        subAdmin={selectedSubAdminForPassword}
      />

      <UpdateSubAdminModal
        open={isUpdateSubAdminOpen}
        onClose={() => {
          setIsUpdateSubAdminOpen(false);
          setSelectedSubAdminForUpdate(null);
          setUpdateError('');
        }}
        onUpdate={handleUpdateSubAdminSubmit}
        subAdmin={selectedSubAdminForUpdate}
        submitting={isUpdatingSub}
        error={updateError}
      />
    </div>
  );
}

export default Admin;


