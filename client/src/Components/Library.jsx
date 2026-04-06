import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import axios from 'axios'; 
import Navbar from './Sub-Components/Navbar';
import DocumentCard from './Sub-Components/DocumentCard';

function MyLibrary() {
  const navigate = useNavigate();

  // --- 1. FIX: Load User IMMEDIATELY from Local Storage ---
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    // Return the parsed user or NULL (don't default to Guest)
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  const [myDocuments, setMyDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Edit Modal States
  const [editingDoc, setEditingDoc] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editSem, setEditSem] = useState("");

  // --- 2. FIX: Redirect if not logged in ---
  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect to login if no user found
    }
  }, [user, navigate]);

  // --- HELPERS ---
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // --- FETCH DATA ---
  useEffect(() => {
    // Stop if user is not loaded yet
    if (!user || !user.email) return; 

    axios.get('https://academic-repo-evrb.onrender.com/get-files-data')
      .then(result => {
        if (result.data.status === "Success") {
          // 3. FIX: Filter using the correct user email
          const userDocs = result.data.data.filter(doc => doc.author === user.email);
          setMyDocuments(userDocs);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [user]); // Re-run if user changes (rare, but safe)

  // --- FILTER & SORT LOGIC ---
  const filteredDocs = myDocuments
    .filter(doc => {
        const matchesSearch = (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (doc.tag || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || doc.type === filterType;
        return matchesSearch && matchesType;
    })
    .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'az') return a.title.localeCompare(b.title);
        return 0;
    });

  // --- ACTIONS ---
  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to permanently delete this file?")) {
      axios.post('https://academic-repo-evrb.onrender.com/delete-file', { doc_id: id })
        .then(result => {
          if (result.data.status === "Success") {
            setMyDocuments(prev => prev.filter(doc => doc.id !== id));
            showToast("Document deleted successfully", "success");
          } else {
            showToast(result.data.message, "error");
          }
        })
        .catch(() => showToast("Failed to delete document", "error"));
    }
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditTag(doc.tag === "common" ? "General" : doc.tag);
    setEditSem(doc.semester || "1");
  };

  const saveEdit = () => {
    if(!editTitle.trim()) return showToast("Title cannot be empty", "error");
    setIsSaving(true);
    axios.put(`https://academic-repo-evrb.onrender.com/edit-file/${editingDoc.id}`, { 
        title: editTitle, 
        tag: editTag, 
        semester: editSem
    })
    .then(result => {
        if (result.data.status === "Success") {
            setMyDocuments(prev => prev.map(doc => 
              doc.id === editingDoc.id ? { ...doc, title: editTitle, tag: editTag, semester: editSem } : doc
            ));
            showToast("Document updated successfully", "success");
            setEditingDoc(null); 
        } else {
            showToast("Failed to update", "error");
        }
    })
    .catch(() => showToast("Server error occurred", "error"))
    .finally(() => setIsSaving(false));
  };

  // Prevent rendering if user is missing (avoid flashing content before redirect)
  if (!user) return null;

  return (
    <div className="min-vh-100 d-flex flex-column" 
         style={{ background: '#0f172a', color: '#cbd5e1', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      
      <style>{`
        /* --- GLASSMOPHISM & UTILS --- */
        .glass-panel {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        .text-highlight { color: #e2e8f0; }
        
        /* --- STATS CARD --- */
        .stat-card {
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            transition: transform 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-2px); border-color: rgba(59, 130, 246, 0.3); }

        /* --- MODERN SEARCH INPUT --- */
        .search-container {
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 0.5rem 1rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
        }
        .search-container:focus-within {
            border-color: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
            background-color: #1e293b;
        }
        .search-input-field {
            background: transparent;
            border: none;
            color: #e2e8f0;
            width: 100%;
            outline: none;
            padding-left: 10px;
            font-size: 1rem;
        }
        .search-input-field::placeholder { color: #64748b; }

        /* --- FILTERS --- */
        .filter-select {
            background-color: #1e293b;
            border: 1px solid #334155;
            color: #cbd5e1;
            border-radius: 10px;
            padding: 0.7rem 1rem;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .filter-select:hover { border-color: #475569; }
        .filter-select:focus { border-color: #3b82f6; outline: none; }

        /* --- TOAST --- */
        .toast-custom {
          position: fixed; bottom: 30px; right: 30px; z-index: 2000;
          background: #1e293b; color: white;
          padding: 1rem 1.5rem; border-radius: 8px;
          border-left: 4px solid #3b82f6;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          animation: slideIn 0.3s ease-out;
        }
        .toast-custom.error { border-left-color: #ef4444; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      <Navbar />

      {/* --- TOAST --- */}
      {toast.show && (
        <div className={`toast-custom ${toast.type}`}>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-medium">{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="container py-5 flex-grow-1 d-flex flex-column">
        
        {/* --- 1. HERO SECTION & STATS --- */}
        <div className="row align-items-center mb-5 gy-4">
            
            {/* Title Section */}
            <div className="col-lg-7">
                <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="badge rounded-pill px-3 py-2" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
                        Workspace
                    </div>
                    {/* Access 'name' from user object safely */}
                    {/*<span className="text-secondary small">Hello, {user.name || 'User'}</span>*/}
                </div>
                <h1 className="fw-bold text-highlight display-5 mb-2">My Library</h1>
                <p className="text-secondary lead mb-0" style={{fontSize: '1rem', maxWidth:'500px'}}>
                    Manage your personal contributions.
                </p>
            </div>

            {/* Professional Stats Block */}
            <div className="col-lg-5">
                <div className="d-flex gap-3">
                    {/* Stats Card */}
                    <div className="stat-card flex-grow-1 p-3 d-flex align-items-center gap-3">
                        <div className="rounded-3 d-flex align-items-center justify-content-center" 
                             style={{width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.15)', color:'#34d399'}}>
                             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        </div>
                        <div>
                            <div className="h2 fw- boldtext-white mb-0">{myDocuments.length}</div>
                            <div className="small text-secondary text-uppercase fw-bold" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Total Uploads</div>
                        </div>
                    </div>

                    {/* Quick Action */}
                    <Link to="/upload" className="stat-card d-flex flex-column align-items-center justify-content-center px-4 text-decoration-none" 
                          style={{background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.4)', minWidth: '120px'}}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" className="mb-1"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                         <span className="small fw-bold" style={{color: '#60a5fa'}}>Upload</span>
                    </Link>
                </div>
            </div>
        </div>

        {/* --- 2. COMMAND BAR (Search & Filters) --- */}
        <div className="glass-panel p-3 mb-5 d-flex flex-column flex-md-row gap-3 align-items-center">
            
            {/* Search Input */}
            <div className="search-container flex-grow-1 w-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                    type="text" 
                    className="search-input-field" 
                    placeholder="Search your documents..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>

            {/* Filters */}
            <div className="d-flex gap-2 w-100 w-md-auto">
                <select className="filter-select" style={{width: '140px'}} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="All">All Types</option>
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                </select>

                <select className="filter-select" style={{width: '140px'}} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="az">A-Z Title</option>
                </select>
            </div>
        </div>

        {/* --- 3. CONTENT GRID --- */}
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center flex-grow-1">
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-5 glass-panel opacity-75">
             <div className="mb-3 text-secondary">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
             </div>
            <h5 className="text-highlight">No documents found</h5>
            <p className="text-secondary small">You haven't uploaded any documents yet.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredDocs.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                doc={doc} 
                onEdit={openEditModal}    
                onDelete={handleDelete}   
              />
            ))}
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {editingDoc && (
        <div className="modal-overlay">
          <div className="modal-custom p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
              <h5 className="fw-bold mb-0 text-white">Edit Document</h5>
              <button className="btn btn-link text-secondary p-0" onClick={() => setEditingDoc(null)}>Close</button>
            </div>
            
            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase text-secondary">Title</label>
              <input type="text" className="form-control" style={{background:'#0f172a', border:'1px solid #334155', color:'white'}} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            
            <div className="row g-3 mb-4">
              <div className="col-6">
                <label className="form-label small fw-bold text-uppercase text-secondary">Semester</label>
                <select className="form-select" style={{background:'#0f172a', border:'1px solid #334155', color:'white'}} value={editSem} onChange={(e) => setEditSem(e.target.value)}>
                    {["1", "2", "3", "4", "5", "6", "7", "8"].map(sem => <option key={sem} value={sem}>{sem}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label small fw-bold text-uppercase text-secondary">Tag</label>
                <select className="form-select" style={{background:'#0f172a', border:'1px solid #334155', color:'white'}} value={editTag} onChange={(e) => setEditTag(e.target.value)}>
                    <option value="CS">Comp Sci</option>
                    <option value="Mech">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-2">
              <button className="btn btn-link text-decoration-none text-secondary" onClick={() => setEditingDoc(null)}>Cancel</button>
              <button 
                className="btn btn-primary rounded-3 px-4 d-flex align-items-center gap-2" 
                style={{ backgroundColor: '#3b82f6', border: 'none' }} 
                onClick={saveEdit}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyLibrary;