import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import AdminNavbar from './Sub-Components/AdminNavbar';

function ManageUsers() {
  const navigate = useNavigate();
  const [activeUsers, setActiveUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // --- FILTER & SEARCH STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // --- ADD USER MODAL STATES ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student', department: 'CSE' });

  // --- USER MANAGEMENT MODAL STATES ---
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEditData, setUserEditData] = useState({ name: '', role: '', department: '' });
  
  // --- FILE EDIT MODAL (Inside User Management) ---
  const [editingDoc, setEditingDoc] = useState(null);
  const [docEditData, setDocEditData] = useState({ title: '', tag: '', semester: '' });

  // Security Check
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) navigate('/login');
  }, [navigate]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // --- FETCH REAL USERS & MERGE WITH FILE DATA ---
  const fetchSystemData = async () => {
    setIsLoading(true);
    try {
        const [usersRes, docsRes] = await Promise.all([
            axios.get('https://academic-repo-evrb.onrender.com/get-users'),
            axios.get('https://academic-repo-evrb.onrender.com/get-files-data')
        ]);

        if (usersRes.data.status === "Success" && docsRes.data.status === "Success") {
            const realUsers = usersRes.data.data;
            const allDocs = docsRes.data.data;

            const combinedData = realUsers.map(u => {
                const userDocs = allDocs.filter(d => d.author === u.email);
                
                let formattedLastLog = "Never";
                let logTimestamp = 0; 
                if (u.lastLog) {
                    const d = new Date(u.lastLog);
                    formattedLastLog = d.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }); 
                    logTimestamp = d.getTime();
                }

                const creationTimestamp = new Date(parseInt(u._id.substring(0, 8), 16) * 1000);
                const formattedCreatedAt = creationTimestamp.toLocaleDateString();

                return {
                    ...u, 
                    docs: userDocs, 
                    documentCount: userDocs.length,
                    displayLastLog: formattedLastLog,
                    logTime: logTimestamp,
                    createdAt: formattedCreatedAt,
                    creationTime: creationTimestamp.getTime() 
                };
            });

            setActiveUsers(combinedData);

            if (selectedUser) {
                const updatedUser = combinedData.find(user => user.email === selectedUser.email);
                if (updatedUser) setSelectedUser(updatedUser);
            }
        }
    } catch (err) {
        showToast("Failed to fetch system data", "error");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => { fetchSystemData(); }, []);

  // --- FILTER & SORT LOGIC ---
  const filteredUsers = activeUsers
    .filter(u => {
        const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchDept = filterDepartment === 'All' || u.department === filterDepartment;
        const matchRole = filterRole === 'All' || u.role === filterRole;
        return matchSearch && matchDept && matchRole;
    })
    .sort((a, b) => {
        if (sortBy === 'newest') return b.creationTime - a.creationTime;
        if (sortBy === 'oldest') return a.creationTime - b.creationTime;
        if (sortBy === 'az') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'za') return (b.name || '').localeCompare(a.name || '');
        if (sortBy === 'lastLogDesc') return b.logTime - a.logTime; 
        if (sortBy === 'lastLogAsc') return a.logTime - b.logTime;  
        if (sortBy === 'filesDesc') return b.documentCount - a.documentCount; 
        if (sortBy === 'filesAsc') return a.documentCount - b.documentCount;  
        return 0;
    });

  const hasActiveFilters = filterDepartment !== 'All' || filterRole !== 'All' || sortBy !== 'newest';

  const clearFilters = () => {
      setSearchTerm('');
      setFilterDepartment('All');
      setFilterRole('All');
      setSortBy('newest');
  };

  // --- ADD NEW USER ---
  const handleAddUser = (e) => {
      e.preventDefault();
      if (!newUser.name || !newUser.email || !newUser.password) return showToast("Missing fields", "error");
      
      setIsSubmitting(true);
      axios.post('https://academic-repo-evrb.onrender.com/register', newUser)
        .then(result => {
            showToast(`Account created for ${newUser.name}`, "success");
            setShowAddModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'student', department: 'CSE' }); 
            fetchSystemData(); 
        })
        .catch(err => showToast("Failed to create user", "error"))
        .finally(() => setIsSubmitting(false));
  };

  // --- OPEN USER MANAGEMENT ---
  const openUserManagement = (user) => {
      setSelectedUser(user);
      setUserEditData({ name: user.name, role: user.role, department: user.department });
  };

  // --- UPDATE USER PROFILE ---
  const handleUpdateUser = () => {
      axios.put(`https://academic-repo-evrb.onrender.com/edit-user/${selectedUser.email}`, userEditData)
          .then(res => {
              if(res.data.status === "Success") {
                  showToast("User profile updated", "success");
                  fetchSystemData(); 
              } else {
                  showToast(res.data.message, "error");
              }
          })
          .catch(() => showToast("Failed to update user", "error"));
  };

  // --- DELETE USER ACCOUNT ---
  const handleDeleteUser = () => {
      if(window.confirm(`WARNING: Are you sure you want to permanently delete the account for ${selectedUser.name}?`)) {
          axios.post('https://academic-repo-evrb.onrender.com/delete-user', { email: selectedUser.email })
              .then(res => {
                  if(res.data.status === "Success") {
                      showToast("User account deleted", "success");
                      setSelectedUser(null); 
                      fetchSystemData(); 
                  } else showToast(res.data.message, "error");
              })
              .catch(() => showToast("Failed to delete user", "error"));
      }
  };

  // --- DOC ACTIONS (Inside User Modal) ---
  const handleDeleteDoc = (id) => {
      if(window.confirm("Permanently delete this file?")) {
          axios.post('https://academic-repo-evrb.onrender.com/delete-file', { doc_id: id })
              .then(res => {
                  if (res.data.status === "Success") {
                      showToast("File deleted", "success");
                      fetchSystemData(); 
                  }
              });
      }
  };

  const handleUpdateDoc = () => {
      axios.put(`https://academic-repo-evrb.onrender.com/edit-file/${editingDoc.id}`, docEditData)
          .then(res => {
              if (res.data.status === "Success") {
                  showToast("File updated", "success");
                  setEditingDoc(null);
                  fetchSystemData();
              }
          });
  };

  return (
    <div className="min-vh-100 d-flex flex-column" 
         style={{ background: '#0f172a', color: '#cbd5e1', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      
      <style>{`
        .text-soft { color: #94a3b8 !important; }
        .text-main { color: #e2e8f0 !important; }
        .glass-panel { background: rgba(30, 41, 59, 0.5); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; }
        .control-input { background-color: #1e293b !important; border: 1px solid #334155 !important; color: #cbd5e1 !important; font-size: 0.9rem; padding: 0.75rem 1rem; transition: all 0.2s; }
        .control-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important; color: #fff !important; }
        
        .table-modern th { background: rgba(30, 41, 59, 0.9); color: #64748b; font-weight: 600; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #334155; padding: 1.2rem 1rem; }
        .table-modern td { padding: 1.2rem 1rem; vertical-align: middle; border-bottom: 1px solid #1e293b; color: #cbd5e1 !important; background: transparent; }
        .table-modern tbody tr { transition: background 0.2s; }
        .table-modern tbody tr:hover td { background: rgba(59, 130, 246, 0.04); }

        .toast-custom { position: fixed; bottom: 30px; right: 30px; z-index: 3000; background: #1e293b; color: white; padding: 1rem 1.5rem; border-radius: 8px; border-left: 4px solid #10b981; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: slideIn 0.3s ease-out; }
        .toast-custom.error { border-left-color: #ef4444; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal-custom { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); max-height: 90vh; overflow-y: auto; }
        @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .action-btn { width: 32px; height: 32px; color: #94a3b8; border-radius: 8px; border: none; background: rgba(255,255,255,0.05); display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; }
        .action-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        .action-btn.edit:hover { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
        .action-btn.delete:hover { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      <AdminNavbar />
      {toast.show && <div className={`toast-custom ${toast.type}`}><span className="fw-medium">{toast.msg}</span></div>}

      <div className="container py-5">
        <div className="d-flex align-items-center gap-3 mb-4">
            <Link to="/AdminDash" className="btn btn-sm" style={{background: 'rgba(255,255,255,0.05)', color: '#94a3b8'}}>&larr; Back to Dashboard</Link>
        </div>

        {/* --- HEADER --- */}
        <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <div>
                <h2 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Platform Users
                </h2>
                <p className="text-soft mb-0">Managing registered system accounts & activity.</p>
            </div>
            
            <div className="d-flex align-items-center gap-4">
                <div className="text-end d-none d-sm-block">
                    <div className="h3 fw-bold text-white mb-0">{filteredUsers.length}</div>
                    <div className="small text-soft text-uppercase" style={{letterSpacing: '1px'}}>Accounts Tracked</div>
                </div>
                
                {/* PRIMARY ACTION: ADD USER */}
                <button onClick={() => setShowAddModal(true)} className="btn d-inline-flex align-items-center justify-content-center gap-2 fw-medium px-4 py-2 shadow-sm" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> 
                    Add New User
                </button>
            </div>
        </div>

        {/* --- CONTROL BAR (Search + Filter Toggle Only) --- */}
        <div className="glass-panel p-3 mb-4">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                
                {/* Search Bar - Flex Grow ensures maximum space */}
                <div className="position-relative flex-grow-1 w-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)'}}>
                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        className="form-control control-input rounded-3 ps-5 w-100" 
                        placeholder="Search user by name or email..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                
                {/* Filter Toggle Button - Shrinks to fit content */}
                <button onClick={() => setShowFilter(!showFilter)} 
                        className="btn d-inline-flex align-items-center justify-content-center gap-2 fw-medium px-4 py-2"
                        style={{ 
                            background: hasActiveFilters ? 'rgba(59, 130, 246, 0.15)' : (showFilter ? 'rgba(255,255,255,0.05)' : '#1e293b'), 
                            color: hasActiveFilters ? '#60a5fa' : '#cbd5e1', 
                            border: hasActiveFilters ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid #334155', 
                            borderRadius: '10px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> 
                    Sort & Filter
                </button>
            </div>

            {/* EXPANDABLE MULTI-FILTER OPTIONS */}
            {showFilter && (
                <div className="mt-3 pt-3 border-top border-secondary border-opacity-25 d-flex align-items-end gap-3 flex-wrap">
                    
                    <div className="d-flex flex-column gap-1">
                        <label className="small text-soft fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>Sort By</label>
                        <select className="form-select control-input rounded-3" style={{width: '180px'}} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Newest Accounts</option>
                            <option value="oldest">Oldest Accounts</option>
                            <option value="az">Name (A-Z)</option>
                            <option value="za">Name (Z-A)</option>
                            <option value="lastLogDesc">Recent Activity</option>
                            <option value="lastLogAsc">Oldest Activity</option>
                            <option value="filesDesc">Highest Uploads</option>
                            <option value="filesAsc">Lowest Uploads</option>
                        </select>
                    </div>

                    <div className="d-flex flex-column gap-1">
                        <label className="small text-soft fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>Role</label>
                        <select className="form-select control-input rounded-3" style={{width: '150px'}} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                            <option value="All">All Roles</option>
                            <option value="admin">Administrator</option>
                            <option value="verifier">Verifier</option>
                            <option value="student">Student</option>
                        </select>
                    </div>

                    <div className="d-flex flex-column gap-1">
                        <label className="small text-soft fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>Department</label>
                        <select className="form-select control-input rounded-3" style={{width: '180px'}} value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                            <option value="All">All Departments</option>
                            <option value="CSE">Computer Science</option>
                            <option value="ECE">Electronics</option>
                            <option value="IT">Information Tech</option>
                            <option value="MECH">Mechanical</option>
                            <option value="CIVIL">Civil Engineering</option>
                        </select>
                    </div>
                    
                    {/* Clear Filters Button (Aligns to right automatically) */}
                    {(hasActiveFilters || searchTerm !== '') && (
                        <button onClick={clearFilters} className="btn btn-sm text-soft text-decoration-underline pb-2 ms-auto">
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* --- USERS TABLE --- */}
        <div className="glass-panel overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="text-center py-5 text-soft">Fetching database records...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-modern mb-0 w-100">
                <thead>
                  <tr>
                    <th>User Profile</th>
                    <th>Email Address</th>
                    <th className="text-center">Role</th>
                    <th>Created At</th>
                    <th>Last Log</th>
                    <th className="text-center">Uploads</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, index) => (
                      <tr key={index}>
                        <td>
                            <div className="d-flex align-items-center gap-3">
                                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{width:'36px', height:'36px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', fontSize: '0.9rem'}}>{u.name ? u.name.charAt(0).toUpperCase() : '?'}</div>
                                <div className="fw-medium text-main" style={{fontSize: '0.95rem'}}>{u.name}</div>
                            </div>
                        </td>
                        <td className="text-soft font-monospace" style={{fontSize: '0.85rem'}}>{u.email}</td>
                        <td className="text-center">
                            <span className="badge rounded-pill fw-medium px-3 py-1" style={{
                                background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : u.role === 'verifier' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                                color: u.role === 'admin' ? '#fca5a5' : u.role === 'verifier' ? '#c084fc' : '#93c5fd', 
                                border: u.role === 'admin' ? '1px solid rgba(239, 68, 68, 0.2)' : u.role === 'verifier' ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)', 
                                fontSize: '0.7rem', letterSpacing: '0.5px'
                            }}>
                                {u.role ? u.role.toUpperCase() : 'STUDENT'}
                            </span>
                        </td>
                        <td className="text-soft" style={{fontSize: '0.85rem'}}>{u.createdAt}</td>
                        <td className="text-soft" style={{fontSize: '0.85rem'}}>{u.displayLastLog}</td>
                        <td className="text-center"><span className="badge rounded-pill fw-bold px-3 py-2" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)'}}>{u.documentCount}</span></td>
                        
                        <td className="text-end pe-4">
                            {/* MANAGE USER BUTTON */}
                            <button onClick={() => openUserManagement(u)} className="btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2" style={{border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', borderRadius: '8px', transition: 'all 0.2s'}}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Manage
                            </button>
                        </td>
                      </tr>
                  ))}
                  {filteredUsers.length === 0 && <tr><td colSpan="7" className="text-center py-5 text-soft">No users match applied filters.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          USER MANAGEMENT WINDOW (MODAL) 
      ============================================= */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-custom p-0 w-100" style={{maxWidth: '900px'}} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom border-secondary border-opacity-25" style={{background: 'rgba(15, 23, 42, 0.9)', borderRadius: '1rem 1rem 0 0'}}>
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{width:'46px', height:'46px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', fontSize: '1.2rem'}}>{selectedUser.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <h5 className="fw-bold mb-0 text-white">{selectedUser.name}</h5>
                        <div className="text-soft small font-monospace">{selectedUser.email}</div>
                    </div>
                </div>
                <button className="btn btn-link text-soft p-0" onClick={() => setSelectedUser(null)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>

            <div className="row g-0">
                {/* Left Side: Edit User Details */}
                <div className="col-md-5 p-4 border-end border-secondary border-opacity-25" style={{background: '#1e293b'}}>
                    <h6 className="fw-bold text-main mb-3 text-uppercase small" style={{letterSpacing:'1px'}}>Account Settings</h6>
                    
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-soft">Display Name</label>
                        <input type="text" className="form-control control-input" value={userEditData.name} onChange={(e) => setUserEditData({...userEditData, name: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-soft">Role</label>
                        <select className="form-select control-input" value={userEditData.role} onChange={(e) => setUserEditData({...userEditData, role: e.target.value})}>
                            <option value="student">Student</option>
                            <option value="admin">Administrator</option>
                            <option value="verifier">Verifier</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-soft">Department</label>
                        <select className="form-select control-input" value={userEditData.department} onChange={(e) => setUserEditData({...userEditData, department: e.target.value})}>
                            <option value="CSE">Computer Science</option><option value="ECE">Electronics</option><option value="IT">Information Tech</option><option value="MECH">Mechanical</option><option value="CIVIL">Civil Engineering</option>
                        </select>
                    </div>
                    
                    <button onClick={handleUpdateUser} className="btn w-100 fw-medium text-white mb-4" style={{background:'#3b82f6'}}>Save Changes</button>
                    
                    <div className="border-top border-secondary border-opacity-25 pt-4">
                        <button onClick={handleDeleteUser} className="btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2" style={{background:'rgba(239, 68, 68, 0.1)', color:'#f87171', border:'1px solid rgba(239, 68, 68, 0.3)'}}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg> Delete User Account
                        </button>
                        <div className="small text-soft mt-2 text-center" style={{fontSize: '0.7rem'}}>Warning: This permanently removes the login access.</div>
                    </div>
                </div>

                {/* Right Side: Document Management */}
                <div className="col-md-7 p-4" style={{background: '#0f172a'}}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold text-main mb-0 text-uppercase small" style={{letterSpacing:'1px'}}>Uploaded Files</h6>
                        <span className="badge" style={{background:'#334155', color:'#cbd5e1'}}>{selectedUser.docs.length} Total</span>
                    </div>

                    <div className="pe-2" style={{maxHeight: '400px', overflowY: 'auto'}}>
                        {selectedUser.docs.length === 0 ? (
                            <div className="text-center py-5 text-soft border border-secondary border-opacity-25 rounded-3 border-dashed">No files uploaded by this user.</div>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {selectedUser.docs.map(doc => (
                                    <div key={doc.id} className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)'}}>
                                        <div className="overflow-hidden me-3">
                                            <div className="fw-bold text-white text-truncate mb-1" style={{fontSize:'0.9rem'}}>{doc.title}</div>
                                            <div className="d-flex gap-2 align-items-center small" style={{fontSize:'0.75rem'}}>
                                                <span className="text-info fw-bold">{doc.type}</span>
                                                <span className="text-soft">• Sem {doc.semester || '-'} • {doc.tag}</span>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <button onClick={() => {setEditingDoc(doc); setDocEditData({title: doc.title, tag: doc.tag, semester: doc.semester})}} className="action-btn edit" title="Edit File Data"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                            <button onClick={() => handleDeleteDoc(doc.id)} className="action-btn delete" title="Delete File"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- INLINE FILE EDIT MODAL (Overlaps the User Modal) --- */}
      {editingDoc && (
        <div className="modal-overlay" style={{zIndex: 2000}} onClick={() => setEditingDoc(null)}>
          <div className="modal-custom p-4 w-100" style={{maxWidth: '450px'}} onClick={(e) => e.stopPropagation()}>
            <h5 className="fw-bold text-white mb-4">Edit File Metadata</h5>
            <div className="mb-3"><label className="small text-soft fw-bold">Title</label><input type="text" className="form-control control-input" value={docEditData.title} onChange={(e) => setDocEditData({...docEditData, title: e.target.value})} /></div>
            <div className="row g-3 mb-4">
                <div className="col-6"><label className="small text-soft fw-bold">Semester</label><select className="form-select control-input" value={docEditData.semester} onChange={(e) => setDocEditData({...docEditData, semester: e.target.value})}>{["1","2","3","4","5","6","7","8"].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="col-6"><label className="small text-soft fw-bold">Tag</label><select className="form-select control-input" value={docEditData.tag} onChange={(e) => setDocEditData({...docEditData, tag: e.target.value})}><option value="CS">Comp Sci</option><option value="ECE">ECE</option><option value="MECH">Mech</option><option value="General">General</option></select></div>
            </div>
            <div className="d-flex justify-content-end gap-2">
                <button className="btn text-soft" onClick={() => setEditingDoc(null)}>Cancel</button>
                <button className="btn fw-medium text-white px-4" style={{background:'#3b82f6'}} onClick={handleUpdateDoc}>Save File</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          ADD NEW USER WINDOW (MODAL)
      ============================================= */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-custom p-4 p-md-5" style={{maxWidth: '500px', width: '100%'}} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
              <h4 className="fw-bold mb-0 text-white">Register System User</h4>
              <button className="btn btn-link text-secondary p-0" onClick={() => setShowAddModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddUser}>
                <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-soft">Full Name</label>
                    <input type="text" className="form-control control-input" required
                           value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
                </div>
                
                <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-soft">Email Address</label>
                    <input type="email" className="form-control control-input" required
                           value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                </div>

                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase text-soft">Access Role</label>
                        <select className="form-select control-input" 
                                value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                            <option value="student">Student</option>
                            <option value="admin">Administrator</option>
                            <option value="verifier">Verifier</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase text-soft">Department</label>
                        <select className="form-select control-input" 
                                value={newUser.department} onChange={(e) => setNewUser({...newUser, department: e.target.value})}>
                            <option value="CSE">Computer Science</option>
                            <option value="ECE">Electronics</option>
                            <option value="IT">Information Tech</option>
                            <option value="MECH">Mechanical</option>
                            <option value="CIVIL">Civil Engineering</option>
                        </select>
                    </div>
                </div>

                <div className="mb-5">
                    <label className="form-label small fw-bold text-uppercase text-soft">Initial Password</label>
                    <input type="password" className="form-control control-input" required
                           value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                </div>

                <div className="d-flex justify-content-end gap-3 pt-2">
                    <button type="button" className="btn text-soft fw-medium" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button 
                        type="submit" 
                        className="btn rounded-pill px-4 fw-medium text-white shadow-sm" 
                        style={{ backgroundColor: '#10b981', border: 'none' }} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Provision Account'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManageUsers;