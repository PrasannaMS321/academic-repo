import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import AdminNavbar from './Sub-Components/AdminNavbar'; // Ensure this points to your new Admin Navbar!

function AdminArchive() {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Filters, Search & Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterSem, setFilterSem] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); 
  const [showFilters, setShowFilters] = useState(false); 

  // Bulk Selection States
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Preview & Edit States
  const [previewDoc, setPreviewDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editSem, setEditSem] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // --- SECURITY CHECK ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) navigate('/login');
  }, [navigate]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // --- FETCH ALL DATA ---
  useEffect(() => {
    axios.get('https://academic-repo-evrb.onrender.com/get-files-data')
      .then(result => {
        if(result.data.status === "Success") {
          setDocuments(result.data.data); 
        }
        setIsLoading(false);
      })
      .catch(() => {
          showToast("Failed to connect to database.", "error");
          setIsLoading(false);
      });
  }, []);

  // --- FILTER & SORT LOGIC ---
  const filteredDocs = documents
    .filter(doc => {
      const matchesSearch = 
        (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.tag || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'All' || doc.type === filterType;
      const matchesSem = filterSem === 'All' || String(doc.semester) === String(filterSem);

      return matchesSearch && matchesType && matchesSem;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'az') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'za') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });

  // --- BULK SELECTION LOGIC ---
  const handleSelectAll = () => {
    if (selectedDocs.length === filteredDocs.length && filteredDocs.length > 0) {
      setSelectedDocs([]); // Deselect all
    } else {
      setSelectedDocs(filteredDocs.map(doc => doc.id)); // Select all currently filtered
    }
  };

  const handleSelectOne = (id) => {
    if (selectedDocs.includes(id)) {
      setSelectedDocs(prev => prev.filter(docId => docId !== id));
    } else {
      setSelectedDocs(prev => [...prev, id]);
    }
  };

  // --- ADMIN ACTIONS ---
  const handleDelete = (id) => {
    if(window.confirm("ADMIN ACTION: Are you sure you want to permanently delete this file from the server?")) {
      axios.post('https://academic-repo-evrb.onrender.com/delete-file', { doc_id: id })
        .then(result => {
          if (result.data.status === "Success") {
            setDocuments(prev => prev.filter(doc => doc.id !== id));
            setSelectedDocs(prev => prev.filter(docId => docId !== id)); // Remove from selection if checked
            showToast("Document deleted successfully", "success");
          } else {
            showToast(result.data.message, "error");
          }
        })
        .catch(() => showToast("Failed to delete document", "error"));
    }
  };

  // Uses frontend loop to avoid needing to alter server.js
  const handleBulkDelete = async () => {
    if(window.confirm(`WARNING: You are about to permanently delete ${selectedDocs.length} files from the server. This cannot be undone. Proceed?`)) {
      setIsBulkDeleting(true);
      let successCount = 0;
      let errorCount = 0;
      const successfullyDeletedIds = [];

      for (const id of selectedDocs) {
          try {
              const res = await axios.post('https://academic-repo-evrb.onrender.com/delete-file', { doc_id: id });
              if (res.data.status === "Success") {
                  successCount++;
                  successfullyDeletedIds.push(id);
              } else {
                  errorCount++;
              }
          } catch (err) {
              errorCount++;
          }
      }

      // Update UI state
      setDocuments(prev => prev.filter(doc => !successfullyDeletedIds.includes(doc.id)));
      setSelectedDocs([]);
      setIsBulkDeleting(false);

      if (errorCount === 0) {
          showToast(`Successfully deleted ${successCount} files.`, "success");
      } else {
          showToast(`Deleted ${successCount} files. ${errorCount} failed.`, "error");
      }
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
            setDocuments(prev => prev.map(doc => 
              doc.id === editingDoc.id ? { ...doc, title: editTitle, tag: editTag, semester: editSem } : doc
            ));
            showToast("Document updated globally", "success");
            setEditingDoc(null); 
        } else {
            showToast("Failed to update", "error");
        }
    })
    .catch(() => showToast("Server error occurred", "error"))
    .finally(() => setIsSaving(false));
  };

  // --- HELPERS ---
  const getTypeBadgeStyle = (type) => {
    const styles = { 
      PDF: { bg: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.2)' }, 
      DOCX: { bg: 'rgba(59, 130, 246, 0.1)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.2)' }, 
      PPTX: { bg: 'rgba(249, 115, 22, 0.1)', color: '#fdba74', border: 'rgba(249, 115, 22, 0.2)' } 
    };
    return styles[type] || { bg: 'rgba(148, 163, 184, 0.1)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.2)' };
  };

  const isDocumentPDF = (doc) => {
    if (!doc) return false;
    return (
        (doc.type && doc.type.toUpperCase() === 'PDF') ||
        (doc.title && doc.title.toLowerCase().endsWith('.pdf')) ||
        (doc.filePath && doc.filePath.toLowerCase().endsWith('.pdf'))
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column" 
      style={{ background: '#0f172a', color: '#cbd5e1', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      <style>{`
        .text-soft { color: #94a3b8 !important; } 
        .text-main { color: #e2e8f0 !important; } 

        .glass-panel {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
        }

        .control-input {
          background-color: #1e293b !important;
          border: 1px solid #334155 !important;
          color: #cbd5e1 !important;
          font-size: 0.9rem;
          padding: 0.7rem 1rem;
          transition: all 0.2s;
        }
        .control-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
          color: #fff !important;
        }

        /* Checkbox styling */
        .custom-checkbox {
          width: 18px; height: 18px;
          background-color: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px; cursor: pointer;
        }
        .custom-checkbox:checked {
          background-color: #3b82f6; border-color: #3b82f6;
        }
        .custom-checkbox:focus { box-shadow: none; border-color: #60a5fa; }

        /* Floating Bulk Action Bar */
        .bulk-action-bar {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.5rem;
          animation: slideDown 0.3s ease-out forwards;
        }

        .table-modern th {
          background: rgba(30, 41, 59, 0.9);
          color: #64748b;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #334155;
          padding: 1.2rem 1rem;
        }
        .table-modern td {
          padding: 1rem; vertical-align: middle;
          border-bottom: 1px solid #1e293b;
          color: #cbd5e1 !important; background: transparent;
        }
        .table-modern tbody tr { transition: background 0.2s; }
        .table-modern tbody tr:hover td, .table-modern tbody tr.selected td { 
          background: rgba(59, 130, 246, 0.05); color: #e2e8f0 !important; 
        }

        .actions-group {
            display: inline-flex; background: rgba(0, 0, 0, 0.2);
            border-radius: 10px; padding: 4px; border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .action-btn {
            width: 32px; height: 32px; color: #94a3b8; border-radius: 8px; border: none; background: transparent;
            display: inline-flex; align-items: center; justify-content: center;
            transition: all 0.2s ease; text-decoration: none; padding: 0;
        }
        .action-btn:hover { background-color: rgba(255, 255, 255, 0.08); transform: translateY(-1px); }
        .action-btn.preview:hover { color: #c084fc; background-color: rgba(192, 132, 252, 0.15); }
        .action-btn.edit:hover { color: #3b82f6; background-color: rgba(59, 130, 246, 0.15); }
        .action-btn.delete:hover { color: #ef4444; background-color: rgba(239, 68, 68, 0.15); }
        .action-btn.download:hover { color: #10b981; background-color: rgba(16, 185, 129, 0.15); }

        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
          z-index: 2050; display: flex; align-items: center; justify-content: center; padding: 2rem;
        }
        .modal-custom {
          background-color: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); display: flex; flex-direction: column;
          animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .toast-custom {
          position: fixed; bottom: 30px; right: 30px; z-index: 3000; background: #1e293b; color: white;
          padding: 1rem 1.5rem; border-radius: 8px; border-left: 4px solid #3b82f6;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: slideIn 0.3s ease-out;
        }
        .toast-custom.error { border-left-color: #ef4444; }

        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <AdminNavbar />

      {toast.show && (
        <div className={`toast-custom ${toast.type}`}>
          <span className="fw-medium">{toast.msg}</span>
        </div>
      )}

      <div className="container py-5">
        
        <div className="d-flex align-items-center gap-3 mb-4">
            <Link to="/AdminDash" className="btn btn-sm" style={{background: 'rgba(255,255,255,0.05)', color: '#94a3b8'}}>
                &larr; Back to Dashboard
            </Link>
        </div>

        {/* --- 1. HEADER --- */}
        <div className="mb-4 d-flex justify-content-between align-items-end">
            <div>
                <h2 className="fw-bold text-main mb-1 d-flex align-items-center gap-2">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Universal Archive
                </h2>
                <p className="text-soft mb-0">Full administrative access to view, edit, or bulk-delete any server file.</p>
            </div>
            <div className="text-end">
                <div className="h3 fw-bold text-main mb-0">{documents.length}</div>
                <div className="small text-soft text-uppercase" style={{letterSpacing: '1px'}}>Total Records</div>
            </div>
        </div>

        {/* --- 2. CONTROL BAR (Search + Filter Tab) --- */}
        <div className="glass-panel p-3 mb-4">
            <div className="d-flex flex-column flex-md-row gap-3 align-items-center">
                <div className="position-relative flex-grow-1 w-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)'}}>
                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        className="form-control control-input rounded-3 ps-5" 
                        placeholder="Search master database..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn d-flex align-items-center gap-2 px-4 py-2"
                    style={{
                        background: showFilters ? 'rgba(59, 130, 246, 0.1)' : '#1e293b',
                        color: showFilters ? '#60a5fa' : '#cbd5e1',
                        border: showFilters ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #334155',
                        borderRadius: '10px',
                        transition: 'all 0.2s'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    Sort & Filter
                </button>
            </div>

            {showFilters && (
                <div className="d-flex flex-wrap gap-3 mt-3 pt-3 border-top border-secondary border-opacity-25">
                    <div className="d-flex flex-column gap-1">
                        <label className="small text-soft fw-medium text-uppercase" style={{fontSize: '0.7rem'}}>Sort By</label>
                        <select className="form-select control-input rounded-3" style={{width: '160px'}} 
                                value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="az">A-Z Title</option>
                            <option value="za">Z-A Title</option>
                        </select>
                    </div>
                    <div className="d-flex flex-column gap-1">
                        <label className="small text-soft fw-medium text-uppercase" style={{fontSize: '0.7rem'}}>File Type</label>
                        <select className="form-select control-input rounded-3" style={{width: '140px'}} 
                                value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="All">All Types</option>
                            <option value="PDF">PDF</option>
                            <option value="DOCX">DOCX</option>
                            <option value="PPTX">PPTX</option>
                            <option value="XLSX">Excel</option>
                        </select>
                    </div>
                    <div className="d-flex flex-column gap-1">
                        <label className="small text-soft fw-medium text-uppercase" style={{fontSize: '0.7rem'}}>Semester</label>
                        <select className="form-select control-input rounded-3" style={{width: '140px'}}
                                value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
                            <option value="All">All Sems</option>
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                        </select>
                    </div>
                </div>
            )}
        </div>

        {/* --- BULK ACTION BAR --- */}
        {selectedDocs.length > 0 && (
            <div className="bulk-action-bar">
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{width:'36px', height:'36px', background:'#3b82f6', color:'white'}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div>
                        <div className="fw-bold text-white mb-0">{selectedDocs.length} files selected</div>
                        <div className="small" style={{color: '#93c5fd'}}>Ready for bulk actions</div>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-sm text-soft" 
                        onClick={() => setSelectedDocs([])}
                        disabled={isBulkDeleting}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn btn-sm d-flex align-items-center gap-2 px-3 fw-bold" 
                        style={{background:'#ef4444', color:'white', border:'none', borderRadius: '8px'}}
                        onClick={handleBulkDelete}
                        disabled={isBulkDeleting}
                    >
                        {isBulkDeleting ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                Delete Selected
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}

        {/* --- 3. DATA TABLE --- */}
        <div className="glass-panel overflow-hidden">
          {isLoading ? (
            <div className="text-center py-5 text-soft">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
              Accessing global database...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-modern mb-0 w-100">
                <thead>
                  <tr>
                    <th style={{width: '50px', textAlign: 'center'}}>
                        <input 
                            type="checkbox" 
                            className="form-check-input custom-checkbox"
                            checked={selectedDocs.length === filteredDocs.length && filteredDocs.length > 0}
                            onChange={handleSelectAll}
                        />
                    </th>
                    <th>Format</th>
                    <th>Document Name</th>
                    <th>Author</th>
                    <th className="text-center">Sem</th>
                    <th>Date</th>
                    <th className="text-end pe-4">Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => {
                    const badge = getTypeBadgeStyle(doc.type);
                    const fileExtension = doc.type && doc.type !== 'FILE' ? `.${doc.type.toLowerCase()}` : '';
                    const downloadFileName = encodeURIComponent(`${doc.title}${fileExtension}`);
                    const isSelected = selectedDocs.includes(doc.id);

                    return (
                      <tr key={doc.id} className={isSelected ? 'selected' : ''}>
                        
                        {/* Checkbox Column */}
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                                type="checkbox" 
                                className="form-check-input custom-checkbox m-0"
                                checked={isSelected}
                                onChange={() => handleSelectOne(doc.id)}
                            />
                        </td>

                        <td style={{width: '90px'}}>
                          <span className="badge rounded-1 fw-bold" 
                            style={{
                              background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                              fontSize: '0.7rem', minWidth: '55px', textAlign: 'center'
                            }}>
                            {doc.type}
                          </span>
                        </td>

                        <td>
                          <div className="fw-medium text-main">{doc.title}</div>
                          <div className="small text-soft">{doc.tag} • {doc.size}</div>
                        </td>

                        <td>
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle d-flex align-items-center justify-content-center text-main small fw-bold" 
                                        style={{width:'26px', height:'26px', background: '#334155'}}>
                                    {doc.author ? doc.author.charAt(0).toUpperCase() : '?'}
                                </div>
                                <span className="small text-soft">{doc.author ? doc.author.split('@')[0] : 'Unknown'}</span>
                            </div>
                        </td>

                        <td className="text-center text-soft small">
                          {doc.semester || '-'}
                        </td>

                        <td className="small text-soft">{doc.date}</td>

                        <td className="text-end pe-4">
                            <div className="actions-group">
                                <button onClick={() => setPreviewDoc(doc)} className="action-btn preview" title="Preview File">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                                <button onClick={() => openEditModal(doc)} className="action-btn edit" title="Edit Metadata">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <a 
                                    className="action-btn download" href={`${doc.filePath}?name=${downloadFileName}`}
                                    download={downloadFileName} title="Download File"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </a>
                                <button onClick={() => handleDelete(doc.id)} className="action-btn delete ms-1 border-start border-secondary" style={{borderRadius: '0 8px 8px 0'}} title="Delete from Server">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredDocs.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-soft">
                        No documents found in the system matching criteria.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {editingDoc && (
        <div className="modal-overlay" onClick={() => setEditingDoc(null)}>
          <div className="modal-custom p-4" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px', width: '100%'}}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
              <h5 className="fw-bold mb-0 text-white">Admin Edit Record</h5>
              <button className="btn btn-link text-secondary p-0" onClick={() => setEditingDoc(null)}>Close</button>
            </div>
            
            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase text-secondary">Title</label>
              <input type="text" className="form-control control-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            
            <div className="row g-3 mb-4">
              <div className="col-6">
                <label className="form-label small fw-bold text-uppercase text-secondary">Semester</label>
                <select className="form-select control-input" value={editSem} onChange={(e) => setEditSem(e.target.value)}>
                    {["1", "2", "3", "4", "5", "6", "7", "8"].map(sem => <option key={sem} value={sem}>{sem}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label small fw-bold text-uppercase text-secondary">Tag</label>
                <select className="form-select control-input" value={editTag} onChange={(e) => setEditTag(e.target.value)}>
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
                className="btn btn-primary rounded-3 px-4 fw-medium" 
                style={{ backgroundColor: '#3b82f6', border: 'none' }} 
                onClick={saveEdit}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Force Override'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PREVIEW MODAL OVERLAY --- */}
      {previewDoc && (
        <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="modal-custom" onClick={(e) => e.stopPropagation()} style={{maxWidth: '1100px', width: '100%', height: '90vh'}}>
            
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary border-opacity-25">
              <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>
                </svg>
                {previewDoc.title}
              </h5>
              <button className="btn btn-link text-soft p-0 m-0 text-decoration-none fs-4" onClick={() => setPreviewDoc(null)} style={{ lineHeight: '1' }}>&times;</button>
            </div>

            <div className="flex-grow-1 overflow-hidden" style={{ borderRadius: '0 0 1rem 1rem', background: '#0f172a' }}>
              {isDocumentPDF(previewDoc) ? (
                <iframe src={`${previewDoc.filePath}?name=${encodeURIComponent(previewDoc.title)}`} width="100%" height="100%" style={{ border: 'none', background: '#fff' }} title="Document Preview" />
              ) : (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                  </div>
                  <h4 className="fw-bold text-main mb-2">Browser Preview Unavailable</h4>
                  <p className="text-soft mb-4">Web browsers cannot natively preview <strong>{previewDoc.type}</strong> files.</p>
                  <a className="btn btn-primary px-4 py-2 fw-medium rounded-pill" style={{ background: '#3b82f6', border: 'none', textDecoration: 'none' }} href={`${previewDoc.filePath}?name=${encodeURIComponent(`${previewDoc.title}.${(previewDoc.type && previewDoc.type !== 'FILE') ? previewDoc.type.toLowerCase() : 'pdf'}`)}`} download>Download File Now</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminArchive;