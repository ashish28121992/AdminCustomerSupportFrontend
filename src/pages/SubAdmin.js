import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, clearToken, getUser, isSubadminPasswordResetPending, markSubadminPasswordResetComplete } from '../utils/auth';
import { postJson, getJson, putJson } from '../utils/api';
import toast from 'react-hot-toast';
import AddUserModal from '../components/subadmin/AddUserModal';
import EditClientModal from '../components/subadmin/EditClientModal';
import ClientsTable from '../components/subadmin/ClientsTable';
import ChangePasswordModal from '../components/subadmin/ChangePasswordModal';
import './Admin.css';
import './SubAdmin.css';

function SubAdmin() {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    phone: '',
    userId: ''
  });
  const [userError, setUserError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    isActive: true
  });
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isForcedPasswordChange, setIsForcedPasswordChange] = useState(false);

  async function handleConfirmLogout() {
    try {
      setIsLoggingOut(true);
      const token = getToken();
      if (token) {
        await postJson('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
      }
      clearToken();
      setConfirmOpen(false);
      toast.success('Logged out', { icon: '🚪', style: { background: 'linear-gradient(135deg, #22d3ee, #a78bfa)', color: '#0b1220', border: '1px solid rgba(99,102,241,0.55)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' } });
      navigate('/', { replace: true });
    } catch (e) {
      clearToken();
      setConfirmOpen(false);
      toast.error('Logout failed on server, cleared locally');
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  // Load current user
  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    const needsReset = isSubadminPasswordResetPending(user);
    setIsForcedPasswordChange(needsReset);
    setIsChangePasswordOpen(needsReset);
  }, []);

  // Helper function to fetch all pages of data
  const fetchAllPages = async (endpoint, token) => {
    let allItems = [];
    let currentPageNum = 1;
    let hasMore = true;
    const pageSize = 100; // Fetch 100 items per page

    try {
      while (hasMore) {
        const res = await getJson(`${endpoint}?page=${currentPageNum}&limit=${pageSize}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const items = res?.data?.items || [];
        allItems = [...allItems, ...items];
        
        // Check if there are more pages
        const pagination = res?.data?.pagination;
        if (pagination) {
          const totalPages = Math.ceil(pagination.total / pageSize);
          hasMore = currentPageNum < totalPages;
        } else {
          // If no pagination info, check if we got full page
          hasMore = items.length === pageSize;
        }
        
        currentPageNum++;
        
        // Safety check to prevent infinite loop
        if (currentPageNum > 100) break;
      }
    } catch (err) {
      throw err;
    }
    
    return allItems;
  };

  // Fetch clients (all pages)
  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      setIsLoadingClients(true);
      const token = getToken();
      const allClients = await fetchAllPages('/clients', token);
      
      setClients(allClients);
      // Calculate total pages for client-side pagination (10 items per page)
      setTotalPages(Math.ceil(allClients.length / 10));
    } catch (err) {
      toast.error('Failed to load clients');
    } finally {
      setIsLoadingClients(false);
    }
  }

  async function handleCreateUser() {
    setUserError('');
    
    // Validation
    if (!userForm.name || !userForm.phone || !userForm.userId) {
      setUserError('All fields are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      const payload = {
        userId: userForm.userId,
        name: userForm.name,
        phone: userForm.phone
      };
      
      const response = await postJson('/clients/create', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response?.success && response?.data) {
        // Optimistically update the clients state immediately
        const newClient = {
          id: response.data.id || response.data._id,
          userId: response.data.userId || userForm.userId,
          name: response.data.name || userForm.name,
          phone: response.data.phone || userForm.phone,
          isActive: response.data.isActive !== undefined ? response.data.isActive : true,
          branchWaLink: response.data.branchWaLink || response.data.waLink || '',
          createdAt: response.data.createdAt || new Date().toISOString(),
        };
        // Add new client to the beginning of the list
        setClients((prev) => [newClient, ...prev]);
        // Update total pages
        setTotalPages(Math.ceil((clients.length + 1) / 10));
        toast.success('Client created successfully!');
        setIsAddUserOpen(false);
        setUserForm({ name: '', phone: '', userId: '' });
      }
    } catch (err) {
      const msg = err?.message || 'Failed to create client';
      setUserError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEditClient(client) {
    setEditingClient(client);
    setEditForm({
      name: client.name,
      phone: client.phone,
      isActive: client.isActive
    });
    setEditError('');
    setIsEditClientOpen(true);
  }

  async function handleUpdateClient() {
    setEditError('');
    
    // Validation
    if (!editForm.name || !editForm.phone) {
      setEditError('Name and phone are required');
      return;
    }

    try {
      setIsUpdating(true);
      const token = getToken();
      const response = await putJson(`/clients/${editingClient.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response?.success && response?.data) {
        // Optimistically update the client in state immediately
        const updatedClient = {
          ...editingClient,
          name: response.data.name || editForm.name,
          phone: response.data.phone || editForm.phone,
          isActive: response.data.isActive !== undefined ? response.data.isActive : editForm.isActive,
          branchWaLink: response.data.branchWaLink || response.data.waLink || editingClient.branchWaLink || '',
        };
        // Update the client in the list
        setClients((prev) => prev.map(client => 
          client.id === editingClient.id ? updatedClient : client
        ));
        toast.success('Client updated successfully!');
        setIsEditClientOpen(false);
        setEditingClient(null);
      }
    } catch (err) {
      const msg = err?.message || 'Failed to update client';
      setEditError(msg);
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  }

  function handlePasswordChangeSuccess() {
    if (currentUser) {
      markSubadminPasswordResetComplete(currentUser);
    }
    setIsForcedPasswordChange(false);
    setIsChangePasswordOpen(false);
    setTimeout(() => {
      clearToken();
      navigate('/', { replace: true });
    }, 700);
  }

  return (
    <div className="admin-page">
      <div className="admin-gradient" />
      <header className="admin-header">
        <div className="brand">
          <img
            src={process.env.PUBLIC_URL + '/logo.png'}
            alt="Sub Admin"
            className="brand-logo"
          />
          <h1>SubAdmin Dashboard</h1>
        </div>
        <div className="header-actions">
          <button className="logout-btn" onClick={() => setConfirmOpen(true)}>Logout</button>
        </div>
      </header>
      <main className="admin-content">
        <div className="subadmin-welcome">
          <div className="welcome-card animate-in">
            <div className="welcome-icon">👋</div>
            <div>
              <h2 className="welcome-heading">Welcome, {currentUser?.username || 'Sub-Admin'}!</h2>
              <p className="welcome-text">Manage your clients and view important information</p>
            </div>
            <button className="add-user-btn" onClick={() => setIsAddUserOpen(true)}>
              <span className="btn-icon">➕</span>
              Add New Client
            </button>
          </div>
        </div>

        {isLoadingClients ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading clients...</p>
          </div>
        ) : (
          <ClientsTable
            clients={clients.slice((currentPage - 1) * 10, currentPage * 10)}
            page={currentPage}
            totalPages={totalPages}
            totalCount={clients.length}
            onPageChange={setCurrentPage}
            onEdit={handleEditClient}
          />
        )}
      </main>

      <AddUserModal
        open={isAddUserOpen}
        onClose={() => {
          setIsAddUserOpen(false);
          setUserForm({ name: '', phone: '', userId: '' });
          setUserError('');
        }}
        onCreate={handleCreateUser}
        values={userForm}
        onChange={(field, value) => setUserForm(prev => ({ ...prev, [field]: value }))}
        error={userError}
        submitting={isSubmitting}
      />

      <EditClientModal
        open={isEditClientOpen}
        onClose={() => {
          setIsEditClientOpen(false);
          setEditingClient(null);
          setEditForm({ name: '', phone: '', isActive: true });
          setEditError('');
        }}
        onUpdate={handleUpdateClient}
        values={editForm}
        onChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))}
        error={editError}
        submitting={isUpdating}
      />

      <ChangePasswordModal
        open={isChangePasswordOpen}
        onClose={() => {
          if (isForcedPasswordChange) return;
          setIsChangePasswordOpen(false);
        }}
        onSuccess={handlePasswordChangeSuccess}
        forced={isForcedPasswordChange}
      />

      {confirmOpen ? (
        <div className="modal-backdrop" onClick={() => setConfirmOpen(false)}>
          <div className="modal confirm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Logout</h3>
              <button className="ghost" onClick={() => setConfirmOpen(false)}>Close</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to logout?</p>
              <div className="modal-actions">
                <button className="ghost colorful-cancel" onClick={() => setConfirmOpen(false)} disabled={isLoggingOut}>Cancel</button>
                <button className="primary colorful-logout" onClick={handleConfirmLogout} disabled={isLoggingOut}>{isLoggingOut ? 'Logging out…' : 'Logout'}</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SubAdmin;


