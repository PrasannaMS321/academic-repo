import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import Navbar from './Sub-Components/AdminNavbar';

function AdminDashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ name: "Admin", email: "" });
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  
  // System Analytics State
  const [stats, setStats] = useState({ totalDocs: 0, uniqueUsers: 0, totalStorage: 0 });

  // --- 1. LOAD USER & SECURITY ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
    } else {
        navigate('/login');
    }
  }, [navigate]);

  // --- HELPERS ---
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // --- 2. FETCH GLOBAL DATA & CALCULATE STATS ---
  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = () => {
    setIsLoading(true);
    axios.get('https://academic-repo-evrb.onrender.com/get-files-data')
      .then(result => {
        if(result.data.status === "Success") {
          const allDocs = result.data.data;
          
          setDocuments(allDocs.reverse());

          const uniqueAuthors = new Set(allDocs.map(d => d.author));
          
          const totalSizeMB = allDocs.reduce((acc, curr) => {
              const sizeNum = parseFloat(curr.size.replace(' MB', ''));
              return acc + (isNaN(sizeNum) ? 0 : sizeNum);
          }, 0);

          setStats({
            totalDocs: allDocs.length,
            uniqueUsers: uniqueAuthors.size,
            totalStorage: totalSizeMB.toFixed(2)
          });
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  // --- 3. GLOBAL DELETE ---
  const handleAdminDelete = (id) => {
    if(window.confirm("ADMIN ACTION: Are you sure you want to permanently delete this user's file from the server?")) {
      axios.post('https://academic-repo-evrb.onrender.com/delete-file', { doc_id: id })
        .then(result => {
          if (result.data.status === "Success") {
            showToast("Document deleted globally.", "success");
            fetchGlobalData(); 
          } else {
            showToast(result.data.message, "error");
          }
        })
        .catch(() => showToast("Failed to delete document", "error"));
    }
  };

  // --- UI CONFIGURATIONS ---
  const statBoxes = [
    {
        id: 'docs', value: stats.totalDocs, label: "Total Documents", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    },
    {
        id: 'users', value: stats.uniqueUsers, label: "Active Contributors", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    },
    {
        id: 'storage', value: `${stats.totalStorage} MB`, label: "Server Storage Used", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>
    }
  ];

  const getIconStyle = (type) => {
    if (type === 'PDF') return { color: '#fca5a5', bg: 'rgba(239, 68, 68, 0.1)' };
    if (type === 'DOCX') return { color: '#93c5fd', bg: 'rgba(59, 130, 246, 0.1)' };
    if (type === 'PPTX') return { color: '#fdba74', bg: 'rgba(249, 115, 22, 0.1)' };
    return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
  };

  return (
    <div className="min-vh-100 d-flex flex-column" 
         style={{ background: '#0f172a', color: '#cbd5e1', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      
      <style>{`
        .text-soft { color: #94a3b8 !important; }
        .text-highlight { color: #f1f5f9 !important; }
        
        .admin-header {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%);
            border-bottom: 1px solid rgba(59, 130, 246, 0.2);
        }

        .stat-card {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 1.5rem;
            transition: all 0.3s ease;
        }
        .stat-card:hover { background: rgba(30, 41, 59, 0.6); transform: translateY(-3px); }

        .action-chip {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            padding: 1rem;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            color: #cbd5e1;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .action-chip:hover { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; color: white; }
        .action-chip.success:hover { background: rgba(16, 185, 129, 0.1); border-color: #10b981; color: white; }

        .recent-item {
            display: flex; align-items: center; justify-content: space-between;
            padding: 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .recent-item:last-child { border-bottom: none; }
        
        .icon-box {
            width: 40px; height: 40px;
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 0.8rem;
        }

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

      {toast.show && (
        <div className={`toast-custom ${toast.type}`}>
          <span className="fw-medium">{toast.msg}</span>
        </div>
      )}

      <div className="admin-header py-4 mb-5 shadow-sm">
        <div className="container">
            <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" 
                     style={{width:'50px', height:'50px', background:'rgba(245, 158, 11, 0.2)', color:'#f59e0b'}}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <div>
                    <h2 className="fw-bold text-highlight mb-0 d-flex align-items-center gap-2">
                        Admin Command Center
                        <span className="badge rounded-pill" style={{fontSize: '0.7rem', background:'#ef4444', color:'white'}}>Privileged Access</span>
                    </h2>
                    <p className="text-soft mb-0">System Overview & Global Moderation</p>
                </div>
            </div>
        </div>
      </div>

      <div className="container flex-grow-1">
        
        {/* --- 1. SYSTEM ANALYTICS --- */}
        <div className="row g-4 mb-5">
            {statBoxes.map((stat) => (
                <div className="col-md-4" key={stat.id}>
                    <div className="stat-card d-flex align-items-center gap-4">
                        <div className="rounded-4 d-flex align-items-center justify-content-center" 
                             style={{width:'60px', height:'60px', background: stat.bg, color: stat.color}}>
                             {stat.icon}
                        </div>
                        <div>
                            <div className="h2 fw-bold text-white mb-0">{stat.value}</div>
                            <div className="small fw-medium text-uppercase" style={{color: '#64748b', letterSpacing: '0.5px'}}>{stat.label}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* --- 2. MAIN GRID --- */}
        <div className="row g-4 mb-5">
            
            {/* LEFT COL: Admin Tools */}
            <div className="col-lg-4">
                <h5 className="fw-bold text-white mb-3">System Actions</h5>
                <div className="d-flex flex-column gap-3">
                    
                    {/* FIXED LINK TO MATCH APP.JSX */}
                    <Link to="/AdminArchive" className="action-chip">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <div>
                            <div className="fw-medium text-highlight">Universal Archive</div>
                            <div className="small text-soft" style={{fontSize: '0.8rem'}}>Edit or wipe any file on the server</div>
                        </div>
                    </Link>
                    
                    {/* FIXED LINK TO MATCH APP.JSX */}
                    <Link to="/ManageUsers" className="action-chip success">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <div>
                            <div className="fw-medium text-highlight">Manage Users</div>
                            <div className="small text-soft" style={{fontSize: '0.8rem'}}>Add users or revoke access</div>
                        </div>
                    </Link>

                </div>
            </div>

            {/* RIGHT COL: Global Moderation Feed */}
            <div className="col-lg-8">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                        <span className="bg-success rounded-circle" style={{width:'8px', height:'8px', display:'inline-block'}}></span>
                        Live Global Feed
                    </h5>
                    <span className="small text-soft">Showing latest {Math.min(documents.length, 8)} uploads</span>
                </div>

                <div className="stat-card p-0 overflow-hidden border-top-0">
                    {isLoading ? (
                         <div className="p-5 text-center text-soft">Fetching global activity...</div>
                    ) : (
                        <div>
                            {documents.slice(0, 8).map((doc) => {
                                const style = getIconStyle(doc.type);
                                return (
                                    <div key={doc.id} className="recent-item">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="icon-box" style={{background: style.bg, color: style.color}}>
                                                {doc.type}
                                            </div>
                                            <div>
                                                <div className="fw-medium text-highlight">{doc.title}</div>
                                                <div className="small" style={{color: '#94a3b8', fontSize: '0.8rem'}}>
                                                    <span className="text-info">{doc.author ? doc.author.split('@')[0] : 'Unknown'}</span> • Sem {doc.semester || '-'} • {doc.size}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Admin Controls */}
                                        <div className="d-flex gap-2">
                                            <a 
                                                href={`${doc.filePath}?name=${encodeURIComponent(`${doc.title}.${doc.type?.toLowerCase() || 'file'}`)}`}
                                                download
                                                className="btn btn-sm px-3" 
                                                style={{background:'rgba(255,255,255,0.05)', color:'#cbd5e1', border:'none', textDecoration:'none'}}
                                            >
                                                Inspect
                                            </a>
                                            
                                            <button 
                                                onClick={() => handleAdminDelete(doc.id)}
                                                className="btn btn-sm px-3 d-flex align-items-center gap-1" 
                                                style={{background:'rgba(239, 68, 68, 0.1)', color:'#f87171', border:'1px solid rgba(239, 68, 68, 0.2)'}}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                            {documents.length === 0 && <div className="p-4 text-center text-soft">Repository is completely empty.</div>}
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;