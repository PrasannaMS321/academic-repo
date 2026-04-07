import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // --- NEW: Server Status State ---
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'

  // --- NEW: Ping server on page load ---
  useEffect(() => {
    axios.get('https://academic-repo-evrb.onrender.com/')
      .then(() => setServerStatus('online'))
      .catch(() => setServerStatus('offline'));
  }, []);

  // Handle Login
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('https://academic-repo-evrb.onrender.com/login', { email, password })
      .then(result => {
        if (result.data.status === "Success") {
          localStorage.setItem("user", JSON.stringify(result.data.user));
          if (result.data.role === "admin") navigate("/AdminDash");
          else if (result.data.role === "verifier") navigate("/verifier-dash");
          else navigate("/home");
        } else {
          alert(result.data.message); // Added simple alert for wrong password/user
        }
      })
      .catch(err => {
        console.log(err);
        // If the request completely fails (Network Error), update status to offline
        if (err.message === 'Network Error') {
            setServerStatus('offline');
        }
      });
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ 
           // Deep Royal Navy (Softer than black, very professional)
           background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
           color: '#fff',
           fontFamily: 'system-ui, -apple-system, sans-serif'
         }}>
      
      <style>{`
        .glossy-card {
          /* Lighter, more translucent glass */
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .glossy-input {
          /* Softer background for inputs */
          background-color: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #e2e8f0 !important;
          transition: all 0.3s ease;
        }
        .glossy-input:focus {
          background-color: rgba(15, 23, 42, 0.8) !important;
          border-color: #60a5fa !important; /* Soft Blue focus */
          box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.1) !important;
        }
        .glossy-button {
          background: linear-gradient(to right, #2563eb, #3b82f6);
          border: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .glossy-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
        }
        .glossy-button:disabled {
          background: #475569;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
        .right-panel-gradient {
           background: linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), transparent),
                       linear-gradient(to top left, rgba(30, 41, 59, 0.5), transparent);
        }
      `}</style>

      <div className="card glossy-card rounded-4 overflow-hidden border-0" 
            style={{ maxWidth: '1000px', width: '90%' }}>
        
        <div className="row g-0">
          
          {/* LEFT SIDE: Login Form */}
          <div className="col-lg-6 p-5 d-flex flex-column justify-content-center"
                style={{ position: 'relative', zIndex: 2 }}>
            
            <div className="mb-5">
              <div className="d-flex align-items-center mb-3">
                <div className="me-3" style={{
                  width: '44px', height: '44px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="fw-bold text-white mb-0" style={{ letterSpacing: '-0.5px' }}>
                    Academic Repository
                  </h4>
                </div>
              </div>
              <p className="mb-0 small" style={{ color: '#94a3b8' }}>
                Private access for authorized personnel only.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label text-uppercase small fw-bold" 
                       style={{ fontSize: '0.7rem', letterSpacing: '1px', color: '#cbd5e1' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control form-control-lg glossy-input"
                  style={{ fontSize: '0.95rem', padding: '0.8rem 1rem', borderRadius: '8px' }}
                  placeholder="name@university.edu"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label text-uppercase small fw-bold mb-0" 
                         style={{ fontSize: '0.7rem', letterSpacing: '1px', color: '#cbd5e1' }}>
                    Password
                  </label>
                  <Link to="/reset" className="text-decoration-none small fw-bold" style={{ color: '#60a5fa' }}>
                    Forgot?
                  </Link>
                </div>
                <input
                  type="password"
                  className="form-control form-control-lg glossy-input"
                  style={{ fontSize: '0.95rem', padding: '0.8rem 1rem', borderRadius: '8px' }}
                  placeholder="••••••••"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-check mb-4">
                <input className="form-check-input" type="checkbox" id="rememberMe" 
                       style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', cursor: 'pointer' }} />
                <label className="form-check-label small" htmlFor="rememberMe" 
                       style={{ color: '#94a3b8', cursor: 'pointer' }}>
                  Remember me
                </label>
              </div>

              <button 
                type="submit" 
                className="btn w-100 py-3 fw-bold rounded-3 glossy-button text-white"
                disabled={serverStatus === 'offline'} // Disable button if server is dead
              >
                {serverStatus === 'offline' ? 'Server Offline' : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="small" style={{ color: '#64748b' }}>
                Need access? <Link to="/register" className="fw-bold text-decoration-none ms-1" style={{ color: '#60a5fa' }}>Request Account</Link>
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Adjusted for Private/Small Scale */}
          <div className="col-lg-6 d-none d-lg-flex right-panel-gradient flex-column justify-content-center align-items-center p-5 text-center"
               style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            
            {/* Subtle Locked Graphic */}
            <div className="mb-4 p-4 rounded-circle" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>

            <div style={{ maxWidth: '280px' }}>
              <h3 className="fw-bold text-white mb-2" style={{ letterSpacing: '-0.5px' }}>
                Restricted Archive
              </h3>
              <p className="small mb-4" style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                This is a private repository. Access is limited to authorized members only.
              </p>

              {/* Minimal Status Indicators */}
              <div className="d-flex flex-column gap-2 w-100">
                
                {/* --- DYNAMIC SERVER STATUS INDICATOR --- */}
                <div className="px-3 py-2 rounded-2 d-flex align-items-center justify-content-center gap-2" 
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ 
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: serverStatus === 'online' ? '#10b981' : serverStatus === 'checking' ? '#f59e0b' : '#ef4444' 
                  }}></div>
                  <span className="small text-white-50" style={{ fontSize: '0.75rem' }}>
                    {serverStatus === 'online' ? 'System Online' : serverStatus === 'checking' ? 'Connecting...' : 'System Offline'}
                  </span>
                </div>

                <div className="px-3 py-2 rounded-2 d-flex align-items-center justify-content-center gap-2" 
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span className="small text-white-50" style={{ fontSize: '0.75rem' }}>Encrypted Connection</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;