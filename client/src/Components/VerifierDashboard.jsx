import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VerifierNavbar from './Sub-Components/VerifierNavbar';

function VerifierDashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ name: "Verifier", email: "" });
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  
  // System Analytics State
  const [stats, setStats] = useState({ pendingDocs: 0, verifiedToday: 0, totalVerified: 0 });

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

  // --- 2. FETCH PENDING DATA & CALCULATE STATS ---
  useEffect(() => {
    fetchPendingData();
  }, []);

  const fetchPendingData = () => {
    setIsLoading(true);
    axios.get('https://academic-repo-evrb.onrender.com/get-pending-files')
      .then(result => {
        if(result.data.status === "Success") {
          const allPending = result.data.data;
          setDocuments(allPending.reverse());

          // Calculate stats
          const today = new Date().toDateString();
          const verifiedToday = allPending.filter(d => {
            const docDate = new Date(d.date).toDateString();
            return docDate === today;
          }).length;

          setStats({
            pendingDocs: allPending.length,
            verifiedToday: verifiedToday,
            totalVerified: allPending.length // This would ideally come from a separate endpoint
          });
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  // --- UI CONFIGURATIONS ---
  const statBoxes = [
    {
        id: 'pending', value: stats.pendingDocs, label: "Pending Review", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    },
    {
        id: 'today', value: stats.verifiedToday, label: "Reviewed Today", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    },
    {
        id: 'queue', value: stats.totalVerified, label: "Total in Queue", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"></polyline></svg>
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
        
        .verifier-header {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%);
            border-bottom: 1px solid rgba(168, 85, 247, 0.2);
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
        .action-chip:hover { background: rgba(168, 85, 247, 0.1); border-color: #a855f7; color: white; }
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
          border-left: 4px solid #a855f7;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          animation: slideIn 0.3s ease-out;
        }
        .toast-custom.error { border-left-color: #ef4444; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      <VerifierNavbar />

      {toast.show && (
        <div className={`toast-custom ${toast.type}`}>
          <span className="fw-medium">{toast.msg}</span>
        </div>
      )}

      <div className="verifier-header py-4 mb-5 shadow-sm">
        <div className="container">
            <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" 
                     style={{width:'50px', height:'50px', background:'rgba(168, 85, 247, 0.2)', color:'#c084fc'}}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>
                </div>
                <div>
                    <h2 className="fw-bold text-highlight mb-0 d-flex align-items-center gap-2">
                        Verifier Command Center
                        <span className="badge rounded-pill" style={{fontSize: '0.7rem', background:'#a855f7', color:'white'}}>Quality Control</span>
                    </h2>
                    <p className="text-soft mb-0">Review and approve content before publication</p>
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
            
            {/* LEFT COL: Verifier Tools */}
            <div className="col-lg-4">
                <h5 className="fw-bold text-white mb-3">Review Actions</h5>
                <div className="d-flex flex-column gap-3">
                    
                    <Link to="/verifier-queue" className="action-chip">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <div>
                            <div className="fw-medium text-highlight">Pending Queue</div>
                            <div className="small text-soft" style={{fontSize: '0.8rem'}}>Review documents awaiting approval</div>
                        </div>
                    </Link>
                    
                    <Link to="/verifier-hub" className="action-chip success">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <div>
                            <div className="fw-medium text-highlight">Verified Archive</div>
                            <div className="small text-soft" style={{fontSize: '0.8rem'}}>Browse approved and published content</div>
                        </div>
                    </Link>

                </div>
            </div>

            {/* RIGHT COL: Recent Pending Feed */}
            <div className="col-lg-8">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                        <span className="bg-warning rounded-circle" style={{width:'8px', height:'8px', display:'inline-block'}}></span>
                        Recent Submissions
                    </h5>
                    <span className="small text-soft">Showing latest {Math.min(documents.length, 8)} pending</span>
                </div>

                <div className="stat-card p-0 overflow-hidden border-top-0">
                    {isLoading ? (
                         <div className="p-5 text-center text-soft">Fetching pending documents...</div>
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
                                        
                                        {/* Verifier Controls */}
                                        <div className="d-flex gap-2">
                                            <Link 
                                                to={`/verifier-queue`}
                                                className="btn btn-sm px-3 d-flex align-items-center gap-1" 
                                                style={{background:'rgba(168, 85, 247, 0.1)', color:'#c084fc', border:'1px solid rgba(168, 85, 247, 0.2)'}}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>
                                                Review
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                            {documents.length === 0 && <div className="p-4 text-center text-soft">No pending documents in the queue.</div>}
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default VerifierDashboard;