import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/admin/Header';
import Sidebar from '../components/admin/Sidebar';
import UsersTable from '../components/admin/UsersTable';
import SubAdminsTable from '../components/admin/SubAdminsTable';
import BranchesTable from '../components/admin/BranchesTable';
import CreateSubAdminModal from '../components/admin/CreateSubAdminModal';
import AddBranchModal from '../components/admin/AddBranchModal';
import './Admin.css';

function Admin() {
  const navigate = useNavigate();
  const [section, setSection] = useState('users');
  const [usersPage, setUsersPage] = useState(1);
  const [subsPage, setSubsPage] = useState(1);
  const [branchesPage, setBranchesPage] = useState(1);
  const [usersQuery, setUsersQuery] = useState('');
  const [subsQuery, setSubsQuery] = useState('');
  const [branchesQuery, setBranchesQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newWaLink, setNewWaLink] = useState('');
  const [newCreatedBy, setNewCreatedBy] = useState('Super Admin');
  const [formError, setFormError] = useState('');
  
  // Branch form state
  const [branchForm, setBranchForm] = useState({
    name: '',
    location: '',
    contactPerson: '',
    phone: '',
    waLink: '',
    email: '',
    address: ''
  });
  const [branchError, setBranchError] = useState('');
  
  // Branches state
  const [branches, setBranches] = useState([
    { id: 1, name: 'Mumbai Branch', location: 'Andheri, Mumbai', contactPerson: 'Rajesh Kumar', phone: '+91 9876543210', waLink: 'https://wa.me/919876543210', email: 'mumbai@company.com' },
    { id: 2, name: 'Delhi Branch', location: 'Connaught Place, Delhi', contactPerson: 'Priya Sharma', phone: '+91 9876543211', waLink: 'https://wa.me/919876543211', email: 'delhi@company.com' },
  ]);
  
  const pageSize = 5;
  const users = [
    { id: 'USR-3201', name: 'Priya Sharma', email: 'priya@example.com', role: 'User', status: 'Active', subAdmin: 'Riya Kapoor' },
    { id: 'USR-3202', name: 'Aman Verma', email: 'aman@example.com', role: 'User', status: 'Pending', subAdmin: 'Vikram Rao' },
    { id: 'USR-3203', name: 'Neha Singh', email: 'neha@example.com', role: 'User', status: 'Active', subAdmin: 'Arjun Patel' },
    { id: 'USR-3204', name: 'Rahul Jain', email: 'rahul@example.com', role: 'User', status: 'Blocked', subAdmin: 'Riya Kapoor' },
  ];

  const [adminSummary, setAdminSummary] = useState([
    { admin: 'Super Admin', email: 'admin@company.com', subAdmins: 6, lastCreated: '2d ago' },
    { admin: 'Aditi Mehta', email: 'aditi@company.com', subAdmins: 2, lastCreated: '5h ago' },
    { admin: 'Karan Khanna', email: 'karan@company.com', subAdmins: 4, lastCreated: '1d ago' },
  ]);

  const normalized = (s) => s.toLowerCase();
  const usersFiltered = users.filter((u) => {
    const q = normalized(usersQuery);
    if (!q) return true;
    return (
      normalized(u.id).includes(q) ||
      normalized(u.name).includes(q) ||
      normalized(u.email).includes(q) ||
      normalized(u.role).includes(q) ||
      normalized(u.status).includes(q) ||
      normalized(u.subAdmin).includes(q)
    );
  });
  const subsFiltered = adminSummary.filter((a) => {
    const q = normalized(subsQuery);
    if (!q) return true;
    return (
      normalized(a.admin).includes(q) ||
      normalized(a.email).includes(q) ||
      normalized(a.lastCreated).includes(q)
    );
  });
  
  const branchesFiltered = branches.filter((b) => {
    const q = normalized(branchesQuery);
    if (!q) return true;
    return (
      normalized(b.name).includes(q) ||
      normalized(b.location).includes(q) ||
      normalized(b.contactPerson || '').includes(q) ||
      normalized(b.phone || '').includes(q) ||
      normalized(b.email || '').includes(q)
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

  function handleCreateSubAdmin(e) {
    e.preventDefault();
    setFormError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newSubName.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!emailRegex.test(newSubEmail)) {
      setFormError('Valid email is required');
      return;
    }
    const next = [
      { admin: newSubName.trim(), email: newSubEmail.trim(), subAdmins: 0, lastCreated: 'just now', waLink: newWaLink.trim() },
      ...adminSummary,
    ];
    setAdminSummary(next);
    setIsCreateOpen(false);
    setNewSubName('');
    setNewSubEmail('');
    setNewWaLink('');
    setNewCreatedBy('Super Admin');
    setSubsPage(1);
    setSection('subs');
  }

  function handleAddBranch(e) {
    e.preventDefault();
    setBranchError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!branchForm.name.trim()) {
      setBranchError('Branch name is required');
      return;
    }
    if (!branchForm.location.trim()) {
      setBranchError('Location is required');
      return;
    }
    if (branchForm.email && !emailRegex.test(branchForm.email)) {
      setBranchError('Valid email is required');
      return;
    }
    
    // Add to branches list
    const newBranch = {
      id: Date.now(),
      ...branchForm,
      name: branchForm.name.trim(),
      location: branchForm.location.trim(),
      contactPerson: branchForm.contactPerson.trim(),
      phone: branchForm.phone.trim(),
      waLink: branchForm.waLink.trim(),
      email: branchForm.email.trim(),
      address: branchForm.address.trim()
    };
    
    setBranches(prev => [newBranch, ...prev]);
    setIsAddBranchOpen(false);
    setBranchForm({
      name: '',
      location: '',
      contactPerson: '',
      phone: '',
      waLink: '',
      email: '',
      address: ''
    });
    setSection('branches'); // Switch to branches view
  }

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
          {section === 'users' ? (
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
              onDelete={() => {}}
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
              onDelete={(id) => setBranches(prev => prev.filter(b => b.id !== id))}
            />
          ) : null}
          </main>
        </div>
      </div>

      <CreateSubAdminModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateSubAdmin}
        values={{ name: newSubName, email: newSubEmail, createdBy: newCreatedBy, waLink: newWaLink }}
        onChange={(field, value) => {
          if (field === 'name') setNewSubName(value);
          if (field === 'email') setNewSubEmail(value);
          if (field === 'waLink') setNewWaLink(value);
          if (field === 'createdBy') setNewCreatedBy(value);
        }}
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
      />
    </div>
  );
}

export default Admin;


