import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postJson, getJson, deleteJson, putJson } from '../utils/api';
import { getToken } from '../utils/auth';
import Header from '../components/admin/Header';
import Sidebar from '../components/admin/Sidebar';
import DashboardCards from '../components/admin/DashboardCards';
import UsersTable from '../components/admin/UsersTable';
import SubAdminsTable from '../components/admin/SubAdminsTable';
import BranchesTable from '../components/admin/BranchesTable';
import CreateSubAdminModal from '../components/admin/CreateSubAdminModal';
import AddBranchModal from '../components/admin/AddBranchModal';
import toast from 'react-hot-toast';
import './Admin.css';

function Admin() {
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [usersPage, setUsersPage] = useState(1);
  const [subsPage, setSubsPage] = useState(1);
  const [branchesPage, setBranchesPage] = useState(1);
  const [usersQuery, setUsersQuery] = useState('');
  const [subsQuery, setSubsQuery] = useState('');
  const [branchesQuery, setBranchesQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreatingSub, setIsCreatingSub] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isEditBranchOpen, setIsEditBranchOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  // Sub-admin form state
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubPassword, setNewSubPassword] = useState('');
  const [newSubUserId, setNewSubUserId] = useState('');
  const [newSubBranchId, setNewSubBranchId] = useState('');
  const [newSubIsActive, setNewSubIsActive] = useState(true);
  const [newWaLink, setNewWaLink] = useState('');
  const [permUsersRead, setPermUsersRead] = useState(true);
  const [formError, setFormError] = useState('');
  
  // Branch form state
  const [branchForm, setBranchForm] = useState({
    branchId: '',
    branchName: '',
    waLink: ''
  });
  const [branchError, setBranchError] = useState('');
  
  // Branches state
  const [branches, setBranches] = useState([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  
  const pageSize = 5;
  const users = [
    { id: 'USR-3201', name: 'Priya Sharma', email: 'priya@example.com', role: 'User', status: 'Active', subAdmin: 'Riya Kapoor' },
    { id: 'USR-3202', name: 'Aman Verma', email: 'aman@example.com', role: 'User', status: 'Pending', subAdmin: 'Vikram Rao' },
    { id: 'USR-3203', name: 'Neha Singh', email: 'neha@example.com', role: 'User', status: 'Active', subAdmin: 'Arjun Patel' },
    { id: 'USR-3204', name: 'Rahul Jain', email: 'rahul@example.com', role: 'User', status: 'Blocked', subAdmin: 'Riya Kapoor' },
  ];

  const [subAdmins, setSubAdmins] = useState([]);
  const [clientCounts, setClientCounts] = useState({}); // { subAdminId: count }
  const [allClients, setAllClients] = useState([]); // All clients from API
  const [totalClientsCount, setTotalClientsCount] = useState(0);

  const normalized = (s) => s.toLowerCase();
  
  // Map API clients to match UsersTable structure
  const mappedClients = allClients.map(client => ({
    id: client.userId || client.id,
    name: client.name,
    email: client.email,
    role: 'Client',
    status: client.isActive ? 'Active' : 'Inactive',
    subAdmin: client.branchName || 'N/A'
  }));

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
      normalized(a.email || '').includes(q) ||
      normalized(a.userId || '').includes(q) ||
      normalized(String(a.isActive)).includes(q) ||
      normalized(a.branchWaLink || '').includes(q) ||
      normalized(a.createdAt || a.lastCreated || '').includes(q)
    );
  });
  
  const branchesFiltered = branches.filter((b) => {
    const q = normalized(branchesQuery);
    if (!q) return true;
    return (
      normalized(b.branchId || '').includes(q) ||
      normalized(b.branchName || '').includes(q) ||
      normalized(b.waLink || '').includes(q)
    );
  });

  const usersTotalPages = Math.max(1, Math.ceil(usersFiltered.length / pageSize));
  const subsTotalPages = Math.max(1, Math.ceil(subsFiltered.length / pageSize));
  const branchesTotalPages = Math.max(1, Math.ceil(branchesFiltered.length / pageSize));
  const usersStartIdx = (usersPage - 1) * pageSize;
  const subsStartIdx = (subsPage - 1) * pageSize;
  const branchesStartIdx = (branchesPage - 1) * pageSize;
  const pagedUsers = usersFiltered.slice(usersStartIdx, usersStartIdx + pageSize);
  const pagedSubs = subsFiltered.slice(subsStartIdx, subsStartIdx + pageSize);
  const pagedBranches = branchesFiltered.slice(branchesStartIdx, branchesStartIdx + pageSize);

  async function handleCreateSubAdmin(e) {
    e.preventDefault();
    setFormError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSubEmail)) {
      setFormError('Valid email is required');
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
    const branchIdToUse = newSubBranchId.trim() || 'ROOT-BRANCH';

    const permissions = [];
    if (permUsersRead) {
      permissions.push({ resource: 'users', actions: ['read'] });
    }

    try {
      setIsCreatingSub(true);
      const token = getToken();
      const payload = {
        email: newSubEmail.trim(),
        password: newSubPassword,
        userId: newSubUserId.trim(),
        branchId: branchIdToUse,
        isActive: Boolean(newSubIsActive),
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
          email: res.data.email,
          lastCreated: 'just now',
        };
        setSubAdmins((prev) => [newRow, ...prev]);
        toast.success('Sub-admin created');
        setIsCreateOpen(false);
        setNewSubEmail('');
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

  async function handleAddBranch(e) {
    e.preventDefault();
    setBranchError('');
    if (!branchForm.branchId.trim()) { setBranchError('Branch ID is required'); return; }
    if (!branchForm.branchName.trim()) { setBranchError('Branch name is required'); return; }
    try {
      const token = getToken();
      const payload = {
        branchId: branchForm.branchId.trim(),
        branchName: branchForm.branchName.trim(),
        waLink: branchForm.waLink.trim(),
      };
      const res = await postJson('/branches', payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res?.data) {
        setBranches(prev => [{ id: res.data._id || Date.now(), branchId: res.data.branchId, branchName: res.data.branchName, waLink: res.data.waLink }, ...prev]);
        toast.success('Branch created');
        setIsAddBranchOpen(false);
        setBranchForm({ branchId: '', branchName: '', waLink: '' });
        setSection('branches');
        return;
      }
      const msg = res?.message || 'Failed to create branch';
      setBranchError(msg);
      toast.error(msg);
    } catch (err) {
      const msg = err?.message || 'Network error';
      setBranchError(msg);
      toast.error(msg);
    }
  }

  // Fetch branches from API
  // Fetch branches
  React.useEffect(() => {
    (async () => {
      try {
        setIsLoadingBranches(true);
        const token = getToken();
        const res = await getJson('/branches', { headers: { Authorization: `Bearer ${token}` } });
        const items = res?.data?.items || [];
        setBranches(items.map((it) => ({ id: it._id, branchId: it.branchId, branchName: it.branchName, waLink: it.waLink })));
      } catch (err) {
        // non-blocking
      } finally {
        setIsLoadingBranches(false);
      }
    })();
  }, []);

  // Fetch all clients
  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        const res = await getJson('/clients', { headers: { Authorization: `Bearer ${token}` } });
        const clients = res?.data?.items || [];
        const total = res?.data?.pagination?.total || clients.length;
        
        // Store all clients and total count
        setAllClients(clients);
        setTotalClientsCount(total);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    })();
  }, []);

  // Count clients per sub-admin whenever clients or subAdmins change
  useEffect(() => {
    if (allClients.length === 0 || subAdmins.length === 0) return;
    
    const counts = {};
    subAdmins.forEach(subAdmin => {
      const clientsForSubAdmin = allClients.filter(client => 
        client.branchName === subAdmin.branchName || 
        client.email === subAdmin.email
      );
      counts[subAdmin.id] = clientsForSubAdmin.length;
    });
    
    setClientCounts(counts);
  }, [allClients, subAdmins]);

  // Fetch sub-admins from API
  React.useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        const res = await getJson('/admins?page=1&limit=10', { headers: { Authorization: `Bearer ${token}` } });
        const items = res?.data?.items || [];
        const mapped = items.map((it) => ({
          id: it.id || it._id,
          admin: (it.branch && it.branch.branchName) || '—',
          branchName: (it.branch && it.branch.branchName) || (it.branchSnapshot && it.branchSnapshot.name) || '—',
          email: it.email,
          userId: it.userId || '',
          isActive: Boolean(it.isActive),
          branchWaLink: (it.branchSnapshot && it.branchSnapshot.waLink) || (it.branch && it.branch.waLink) || '',
          createdAt: it.createdAt,
        }));
        setSubAdmins(mapped);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-gradient" />

      <div className={`content-shell ${isCreateOpen || isAddBranchOpen ? 'blurred' : ''}`}>
        <Header />

        <div className="admin-layout">
          <Sidebar
            section={section}
            setSection={setSection}
            onCreateSubAdmin={() => setIsCreateOpen(true)}
            onAddBranch={() => setIsAddBranchOpen(true)}
            onLogout={() => navigate('/', { replace: true })}
          />

          <main className="admin-content">
          {section === 'dashboard' ? (
            <DashboardCards
              usersCount={totalClientsCount}
              subAdmins={subAdmins}
              branchesCount={branches.length}
              clientCounts={clientCounts}
              onNavigate={setSection}
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
            />
          ) : null}

          {section === 'branches' ? (
            <BranchesTable
              branches={pagedBranches}
              page={branchesPage}
              totalPages={branchesTotalPages}
              onPageChange={(p) => setBranchesPage(Math.min(Math.max(1, p), branchesTotalPages))}
              query={branchesQuery}
              onQueryChange={(q) => { setBranchesQuery(q); setBranchesPage(1); }}
              onDelete={async (id) => {
                try {
                  const token = getToken();
                  await deleteJson(`/branches/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                  setBranches(prev => prev.filter(b => b.id !== id));
                  toast.success('Deleted');
                } catch (e) {
                  toast.error(e?.message || 'Delete failed');
                }
              }}
              onEdit={(branch) => { setEditingBranch(branch); setIsEditBranchOpen(true); }}
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
          email: newSubEmail,
          password: newSubPassword,
          userId: newSubUserId,
          branchId: newSubBranchId,
          isActive: newSubIsActive,
          waLink: newWaLink,
          permissions: { users_read: permUsersRead },
        }}
        onChange={(field, value) => {
          if (field === 'email') setNewSubEmail(value);
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

      <AddBranchModal
        open={isAddBranchOpen}
        onClose={() => setIsAddBranchOpen(false)}
        onCreate={handleAddBranch}
        values={branchForm}
        onChange={(field, value) => {
          setBranchForm(prev => ({ ...prev, [field]: value }));
        }}
        error={branchError}
        submitting={false}
      />

      {isEditBranchOpen ? (
        <div className="modal-backdrop" onClick={() => setIsEditBranchOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Branch</h3>
              <button className="ghost" onClick={() => setIsEditBranchOpen(false)}>Close</button>
            </div>
            <form className="modal-body" onSubmit={async (e) => {
              e.preventDefault();
              if (!editingBranch) return;
              try {
                const token = getToken();
                const payload = {
                  branchId: editingBranch.branchId,
                  branchName: editingBranch.branchName,
                  waLink: editingBranch.waLink || '',
                };
                const res = await putJson(`/branches/${editingBranch.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                // optimistic update
                setBranches(prev => prev.map(b => b.id === editingBranch.id ? { ...b, ...payload } : b));
                toast.success('Branch updated');
                setIsEditBranchOpen(false);
              } catch (err) {
                toast.error(err?.message || 'Update failed');
              }
            }}>
              <label>
                <span>Branch ID</span>
                <input type="text" value={editingBranch?.branchId || ''} onChange={(e) => setEditingBranch(prev => ({ ...prev, branchId: e.target.value }))} />
              </label>
              <label>
                <span>Branch Name</span>
                <input type="text" value={editingBranch?.branchName || ''} onChange={(e) => setEditingBranch(prev => ({ ...prev, branchName: e.target.value }))} />
              </label>
              <label>
                <span>WhatsApp Link</span>
                <input type="url" value={editingBranch?.waLink || ''} onChange={(e) => setEditingBranch(prev => ({ ...prev, waLink: e.target.value }))} />
              </label>
              <div className="modal-actions">
                <button type="button" className="ghost" onClick={() => setIsEditBranchOpen(false)}>Cancel</button>
                <button type="submit" className="primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Admin;


