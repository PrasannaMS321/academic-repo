import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function VerifierNavbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Setup Verifier State
  const [verifier, setVerifier] = useState({
    name: "Verifier",
    email: "Verifier Access",
    initial: "V"
  });

  const location = useLocation(); 
  const navigate = useNavigate();

  // Load Verifier Data from Local Storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setVerifier({
        name: parsedUser.name || "Verifier", 
        email: parsedUser.email || "Verifier Access",
        id: "ROLE: VERIFIER",
        initial: parsedUser.name ? parsedUser.name.charAt(0).toUpperCase() : "V"
      });
    }
  }, []);

  // Handle Logout
  const handleLogout = () => {
    if(window.confirm("Log out of the Verifier Portal?")) {
      localStorage.removeItem("user"); 
      navigate("/login"); 
    }
  };

  // Determine if link is active
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <style>{`
        /* Enhanced Glass Navbar (Verifier Variant - Purple Theme) */
        .verifier-glass-nav {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        /* Nav Links */
        .verifier-nav-link {
          color: #94a3b8 !important; 
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.5rem 1.25rem;
          border-radius: 2rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }
        
        /* Active State (Purple Accent for Verifier) */
        .verifier-nav-link:hover, .verifier-nav-link.active {
          color: #c084fc !important;
          background: rgba(168, 85, 247, 0.1);
          transform: translateY(-1px);
        }

        /* Icon Buttons */
        .icon-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Profile Trigger */
        .profile-trigger {
          padding: 0.35rem 0.5rem 0.35rem 1rem;
          border-radius: 2rem;
          transition: background 0.2s ease;
          cursor: pointer;
        }
        .profile-trigger:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Profile Dropdown */
        .profile-dropdown {
          position: absolute;
          top: 110%;
          right: 0;
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.02);
          width: 240px;
          padding: 0.5rem;
          display: ${isProfileOpen ? 'block' : 'none'};
          animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top right;
        }
        
        .dropdown-item-custom {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #cbd5e1 !important; 
          padding: 0.6rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
        }
        .dropdown-item-custom:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff !important;
          transform: translateX(2px);
        }
        .dropdown-divider-custom {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          margin: 0.5rem 0;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <nav className="verifier-glass-nav py-3">
        <div className="container-fluid px-4 d-flex justify-content-between align-items-center">
          
          {/* 1. BRAND / LOGO (Verifier Variant) */}
          <div className="d-flex align-items-center gap-3">
            <Link to="/verifier-dash" className="text-decoration-none d-flex align-items-center gap-3">
              <div style={{
                width: '38px', height: '38px',
                background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)',
                color: 'white'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 12l2 2 4-4"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <div>
                <h6 className="fw-bold text-white mb-0" style={{ letterSpacing: '0.2px' }}>Verifier<span style={{color: '#c084fc'}}>Portal</span></h6>
                <span className="small" style={{ color: '#c4b5fd', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1px' }}>CONTENT REVIEW</span>
              </div>
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION LINKS (Verifier Only) */}
          <div className="d-none d-lg-flex align-items-center gap-1">
            <Link to="/verifier-dash" className={`verifier-nav-link ${isActive('/verifier-dash')}`}>Dashboard</Link>
            <Link to="/verifier-queue" className={`verifier-nav-link ${isActive('/verifier-queue')}`}>Review Queue</Link>
            <Link to="/verifier-hub" className={`verifier-nav-link ${isActive('/verifier-hub')}`}>Verified Archive</Link>
          </div>

          {/* 3. ACTIONS & PROFILE */}
          <div className="d-flex align-items-center gap-3">
            
            {/* Profile Section */}
            <div className="position-relative">
              <div className="d-flex align-items-center gap-3 profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                
                <div className="d-none d-md-block text-end">
                  <div className="small fw-bold text-white lh-1">{verifier.name}</div>
                  <div className="text-purple mt-1" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#c084fc' }}>{verifier.id}</div>
                </div>
                
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" 
                     style={{ 
                       width: '40px', height: '40px', 
                       background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', 
                       border: '2px solid rgba(255,255,255,0.15)',
                       boxShadow: '0 4px 10px rgba(168, 85, 247, 0.3)'
                     }}>
                  {verifier.initial}
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              <div className="profile-dropdown">
                <div className="px-3 py-2 d-md-none">
                  <div className="fw-bold text-white">{verifier.name}</div>
                  <div className="text-muted small">{verifier.email}</div>
                  <div className="dropdown-divider-custom"></div>
                </div>
                
                <Link to="/home" className="dropdown-item-custom" style={{color: '#60a5fa'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  Switch to User View
                </Link>

                <div className="dropdown-divider-custom"></div>
                
                {/* Sign Out Button */}
                <button onClick={handleLogout} className="dropdown-item-custom" style={{ color: '#ef4444' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="icon-btn d-lg-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>

          </div>
        </div>

        {/* 4. MOBILE DROPDOWN MENU (Verifier Links) */}
        {isMobileMenuOpen && (
          <div className="d-lg-none border-top mt-3 px-4 py-3" style={{ background: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(168,85,247,0.2) !important' }}>
            <div className="d-flex flex-column gap-2">
              <Link to="/verifier-dash" className={`verifier-nav-link ${isActive('/verifier-dash')}`}>Dashboard</Link>
              <Link to="/verifier-queue" className={`verifier-nav-link ${isActive('/verifier-queue')}`}>Review Queue</Link>
              <Link to="/verifier-hub" className={`verifier-nav-link ${isActive('/verifier-hub')}`}>Verified Archive</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default VerifierNavbar;