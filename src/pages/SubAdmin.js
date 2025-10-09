import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, clearToken } from '../utils/auth';
import { postJson, getJson, putJson } from '../utils/api';
import toast from 'react-hot-toast';
import AddUserModal from '../components/subadmin/AddUserModal';
import EditClientModal from '../components/subadmin/EditClientModal';
import ClientsTable from '../components/subadmin/ClientsTable';
import './Admin.css';
import './SubAdmin.css';

function SubAdmin() {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
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

  // Fetch clients
  useEffect(() => {
    fetchClients();
  }, [currentPage]);

  async function fetchClients() {
    try {
      setIsLoadingClients(true);
      const token = getToken();
      const response = await getJson(`/clients?page=${currentPage}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response?.success && response?.data) {
        setClients(response.data.items || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      toast.error('Failed to load clients');
    } finally {
      setIsLoadingClients(false);
    }
  }

  async function handleCreateUser() {
    setUserError('');
    
    // Validation
    if (!userForm.name || !userForm.email || !userForm.phone || !userForm.userId) {
      setUserError('All fields are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      const payload = {
        userId: userForm.userId,
        name: userForm.name,
        phone: userForm.phone,
        email: userForm.email
      };
      
      const response = await postJson('/clients/create', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response?.success) {
        toast.success('Client created successfully!');
        setIsAddUserOpen(false);
        setUserForm({ name: '', email: '', phone: '', userId: '' });
        fetchClients(); // Refresh clients list
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
      
      if (response?.success) {
        toast.success('Client updated successfully!');
        setIsEditClientOpen(false);
        setEditingClient(null);
        fetchClients(); // Refresh clients list
      }
    } catch (err) {
      const msg = err?.message || 'Failed to update client';
      setEditError(msg);
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
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
              <h2 className="welcome-heading">Welcome, Sub-Admin!</h2>
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
            clients={clients}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onEdit={handleEditClient}
          />
        )}
      </main>

      <AddUserModal
        open={isAddUserOpen}
        onClose={() => {
          setIsAddUserOpen(false);
          setUserForm({ name: '', email: '', phone: '', userId: '' });
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


