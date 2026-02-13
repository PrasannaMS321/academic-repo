import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Setup User State (Default to Guest)
  const [user, setUser] = useState({
    name: "Guest",
    email: "Please Login",
    initial: "?"
  });

  const location = useLocation(); 
  const navigate = useNavigate();

  // Load User Data from Local Storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({
        name: parsedUser.name || "User", 
        email: parsedUser.email || "",
        // Create a short ID from the MongoDB _id (taking last 6 chars)
        id: parsedUser._id ? `ID: ${parsedUser._id.slice(-6).toUpperCase()}` : "ID: GUEST",
        initial: parsedUser.name ? parsedUser.name.charAt(0).toUpperCase() : "U"
      });
    }
  }, []);

  // Handle Logout
  const handleLogout = () => {
    if(window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("user"); // Clear data
      navigate("/login"); // Redirect to login
    }
  };

  // Function to determine if a link is active
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <style>{`
        /* Enhanced Glass Navbar */
        .glass-nav {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        /* Nav Links */
        .nav-link-custom {
          color: #94a3b8 !important; 
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.5rem 1.25rem;
          border-radius: 2rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }
        /* Active State */
        .nav-link-custom:hover, .nav-link-custom.active {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.1);
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

      <nav className="glass-nav py-3">
        <div className="container-fluid px-4 d-flex justify-content-between align-items-center">
          
          {/* 1. BRAND / LOGO */}
          <div className="d-flex align-items-center gap-3">
            <Link to="/home" className="text-decoration-none d-flex align-items-center gap-3">
              <div style={{
                width: '38px', height: '38px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.4) 100%)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <div>
                <h6 className="fw-bold text-white mb-0" style={{ letterSpacing: '0.2px' }}>Academic Repository</h6>
                <span className="small" style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1px' }}>STUDENT ACCESS</span>
              </div>
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION LINKS */}
          <div className="d-none d-lg-flex align-items-center gap-1">
            <Link to="/home" className={`nav-link-custom ${isActive('/home')}`}>Dashboard</Link>
            <Link to="/library" className={`nav-link-custom ${isActive('/library')}`}>My Library</Link>
            <Link to="/shared-hub" className={`nav-link-custom ${isActive('/shared-hub')}`}>Shared Hub</Link>
            <Link to="#" className="nav-link-custom">Analytics</Link>
          </div>

          {/* 3. ACTIONS & PROFILE */}
          <div className="d-flex align-items-center gap-3">
            
            {/* Notification Bell */}
            <button className="icon-btn position-relative d-none d-sm-flex">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ width: '8px', height: '8px', marginTop: '6px', marginLeft: '-6px' }}></span>
            </button>

            {/* Profile Section */}
            <div className="position-relative">
              <div className="d-flex align-items-center gap-3 profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                
                <div className="d-none d-md-block text-end">
                  {/* Dynamic Name and ID */}
                  <div className="small fw-bold text-white lh-1">{user.name}</div>
                  <div className="text-muted mt-1" style={{ fontSize: '0.7rem', fontWeight: '500' }}>{user.id}</div>
                </div>
                
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" 
                     style={{ 
                       width: '40px', height: '40px', 
                       background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', 
                       border: '2px solid rgba(255,255,255,0.15)',
                       boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                     }}>
                  {user.initial}
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              <div className="profile-dropdown">
                <div className="px-3 py-2 d-md-none">
                  <div className="fw-bold text-white">{user.name}</div>
                  <div className="text-muted small">{user.email}</div>
                  <div className="dropdown-divider-custom"></div>
                </div>
                
                <Link to="#" className="dropdown-item-custom">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  My Profile
                </Link>
                <Link to="#" className="dropdown-item-custom">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  Settings
                </Link>
                
                <div className="dropdown-divider-custom"></div>
                
                {/* Sign Out Button - Clears Local Storage */}
                <button onClick={handleLogout} className="dropdown-item-custom" style={{ color: '#ef4444' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Sign out
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="icon-btn d-lg-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>

          </div>
        </div>

        {/* 4. MOBILE DROPDOWN MENU */}
        {isMobileMenuOpen && (
          <div className="d-lg-none border-top mt-3 px-4 py-3" style={{ background: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.05) !important' }}>
            <div className="d-flex flex-column gap-2">
              <Link to="/home" className={`nav-link-custom ${isActive('/home')}`}>Dashboard</Link>
              <Link to="/library" className={`nav-link-custom ${isActive('/library')}`}>My Library</Link>
              <Link to="/share-dhub" className={`nav-link-custom ${isActive('/shared-hub')}`}>Shared Hub</Link>
              <Link to="#" className="nav-link-custom">Analytics</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;