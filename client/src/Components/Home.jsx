import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import Navbar from './Sub-Components/Navbar';

function Home() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ name: "User", email: "" });
  
  // Stats State
  const [stats, setStats] = useState({ total: 0, mine: 0, recent: 0 });

  // --- 1. LOAD USER & TIME ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // --- 2. FETCH & CALCULATE STATS ---
  useEffect(() => {
    axios.get('http://localhost:5000/get-files-data')
      .then(result => {
        if(result.data.status === "Success") {
          const allDocs = result.data.data;
          // Sort by newest first
          const sorted = allDocs.reverse(); 
          setDocuments(sorted);

          // Calculate Stats
          const myDocsCount = user.email ? allDocs.filter(d => d.author === user.email).length : 0;
          
          setStats({
            total: allDocs.length,
            mine: myDocsCount,
            recent: 5 // Just a visual cap for the list
          });
        }
        setIsLoading(false);
      })
      .catch(err => setIsLoading(false));
  }, [user.email]);

  return (
    <div className="min-vh-100 d-flex flex-column" 
         style={{ 
           background: '#0f172a', 
           color: '#cbd5e1',
           fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
         }}>
      
      <style>{`
        /* --- UTILS --- */
        .text-soft { color: #94a3b8 !important; }
        .text-highlight { color: #f1f5f9 !important; }
        
        /* --- HERO CARD --- */
        .hero-card {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 24px;
            position: relative;
            overflow: hidden;
        }
        .hero-glow {
            position: absolute; top: -50%; right: -20%;
            width: 500px; height: 500px;
            background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%);
            border-radius: 50%;
            pointer-events: none;
        }

        /* --- STAT BOXES --- */
        .stat-box {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 1.5rem;
            transition: all 0.3s ease;
        }
        .stat-box:hover {
            background: rgba(30, 41, 59, 0.6);
            transform: translateY(-5px);
            border-color: rgba(59, 130, 246, 0.3);
        }

        /* --- CATEGORY CHIPS --- */
        .cat-chip {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            padding: 1rem;
            border-radius: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            color: #cbd5e1;
            display: block;
        }
        .cat-chip:hover {
            background: rgba(59, 130, 246, 0.1);
            border-color: #3b82f6;
            color: white;
        }

        /* --- RECENT LIST --- */
        .recent-item {
            display: flex; align-items: center; justify-content: space-between;
            padding: 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            transition: background 0.2s;
        }
        .recent-item:hover { background: rgba(255,255,255,0.02); }
        .recent-item:last-child { border-bottom: none; }
        
        .icon-box {
            width: 40px; height: 40px;
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold;
            font-size: 0.8rem;
        }
      `}</style>

      <Navbar />

      <div className="container py-5">
        
        {/* --- 1. HERO SECTION --- */}
        <div className="hero-card p-5 mb-5 shadow-lg">
            <div className="hero-glow"></div>
            <div className="row align-items-center position-relative" style={{zIndex: 2}}>
                <div className="col-lg-8">
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="badge rounded-pill" style={{background:'rgba(16, 185, 129, 0.2)', color:'#34d399', border:'1px solid rgba(16, 185, 129, 0.2)'}}>System Online</span>
                        <span className="text-soft small">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h1 className="display-4 fw-bold text-highlight mb-3">
                        {getTimeGreeting()}, {user.name.split(' ')[0]}.
                    </h1>
                    <p className="lead text-soft mb-4" style={{maxWidth: '600px'}}>
                        Welcome to your Academic Repository. You have secure access to the central archives. 
                        What would you like to do today?
                    </p>
                    <div className="d-flex gap-3">
                        <Link to="/shared-hub" className="btn btn-primary px-4 py-2 fw-medium rounded-3" style={{background:'#3b82f6', border:'none'}}>
                            Browse Archive
                        </Link>
                    </div>
                </div>
                
                {/* Hero Stats (Right Side) */}
                <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="d-flex flex-column gap-3">
                         {/* My Contributions */}
                         <div className="d-flex align-items-center gap-3 p-3 rounded-4" style={{background:'rgba(0,0,0,0.2)'}}>
                            <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                 style={{width:'50px', height:'50px', background:'rgba(59, 130, 246, 0.2)', color:'#60a5fa'}}>
                                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <div>
                                <div className="h4 fw-bold text-white mb-0">{stats.mine}</div>
                                <div className="small text-soft">My Contributions</div>
                            </div>
                         </div>

                         {/* Total Repo */}
                         <div className="d-flex align-items-center gap-3 p-3 rounded-4" style={{background:'rgba(0,0,0,0.2)'}}>
                            <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                 style={{width:'50px', height:'50px', background:'rgba(168, 85, 247, 0.2)', color:'#c084fc'}}>
                                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <div>
                                <div className="h4 fw-bold text-white mb-0">{stats.total}</div>
                                <div className="small text-soft">Total Documents</div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- 2. MAIN GRID --- */}
        <div className="row g-4">
            
            {/* LEFT COL: Quick Access */}
            <div className="col-lg-4">
                <h5 className="fw-bold text-white mb-3">Quick Access</h5>
                <div className="row g-3">
                    <div className="col-6">
                        <Link to="/shared-hub" className="cat-chip">
                            <div className="mb-2" style={{color:'#fca5a5'}}>PDF</div>
                            <span className="small">Lecture Notes</span>
                        </Link>
                    </div>
                    <div className="col-6">
                         <Link to="/shared-hub" className="cat-chip">
                            <div className="mb-2" style={{color:'#93c5fd'}}>DOCX</div>
                            <span className="small">Assignments</span>
                        </Link>
                    </div>
                    <div className="col-6">
                         <Link to="/my-library" className="cat-chip">
                            <div className="mb-2" style={{color:'#86efac'}}>MY</div>
                            <span className="small">My Library</span>
                        </Link>
                    </div>
                    <div className="col-6">
                         <Link to="/upload" className="cat-chip">
                            <div className="mb-2" style={{color:'#fdba74'}}>+</div>
                            <span className="small">Add New</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-4 p-4 rounded-4 text-center" style={{border:'1px dashed rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.01)'}}>
                    <p className="small text-soft mb-2">Need help finding a resource?</p>
                    <Link to="/shared-hub" className="text-decoration-none fw-bold" style={{color:'#60a5fa'}}>Go to Advanced Search &rarr;</Link>
                </div>
            </div>

            {/* RIGHT COL: Recent Activity Feed */}
            <div className="col-lg-8">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-white mb-0">Recent Uploads</h5>
                    <Link to="/shared-hub" className="small text-decoration-none" style={{color:'#60a5fa'}}>View All</Link>
                </div>

                <div className="stat-box p-0 overflow-hidden">
                    {isLoading ? (
                         <div className="p-5 text-center text-soft">Loading activity...</div>
                    ) : (
                        <div>
                            {documents.slice(0, 5).map((doc) => {
                                // Determine icon color based on type
                                let iconColor = '#94a3b8';
                                let iconBg = 'rgba(148, 163, 184, 0.1)';
                                if(doc.type === 'PDF') { iconColor = '#fca5a5'; iconBg = 'rgba(239, 68, 68, 0.1)'; }
                                if(doc.type === 'DOCX') { iconColor = '#93c5fd'; iconBg = 'rgba(59, 130, 246, 0.1)'; }

                                return (
                                    <div key={doc.id} className="recent-item">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="icon-box" style={{background: iconBg, color: iconColor}}>
                                                {doc.type}
                                            </div>
                                            <div>
                                                <div className="fw-medium text-highlight">{doc.title}</div>
                                                <div className="small text-soft">
                                                    Uploaded by {doc.author ? doc.author.split('@')[0] : 'Unknown'} • Sem {doc.semester || '?'}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => window.open(`${doc.filePath}?name=${encodeURIComponent(doc.title)}`, '_blank')}
                                            className="btn btn-sm rounded-pill px-3" 
                                            style={{background:'rgba(255,255,255,0.05)', color:'#cbd5e1', border:'none'}}>
                                            Download
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default Home;