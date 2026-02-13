import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import Navbar from './Sub-Components/Navbar';

function SharedHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterSem, setFilterSem] = useState('All');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    axios.get('http://localhost:5000/get-files-data')
      .then(result => {
        if(result.data.status === "Success") {
          setDocuments(result.data.data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // --- FILTER LOGIC ---
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.tag || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'All' || doc.type === filterType;
    const matchesSem = filterSem === 'All' || String(doc.semester) === String(filterSem);

    return matchesSearch && matchesType && matchesSem;
  });

  // --- BADGE STYLES ---
  const getTypeBadgeStyle = (type) => {
    const styles = { 
      PDF: { bg: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.2)' }, 
      DOCX: { bg: 'rgba(59, 130, 246, 0.1)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.2)' }, 
      PPTX: { bg: 'rgba(249, 115, 22, 0.1)', color: '#fdba74', border: 'rgba(249, 115, 22, 0.2)' } 
    };
    return styles[type] || { bg: 'rgba(148, 163, 184, 0.1)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.2)' };
  };

  return (
    <div className="min-vh-100 d-flex flex-column" 
      style={{ 
        background: '#0f172a', // Deep Slate
        color: '#cbd5e1',      // Soft Gray (Not harsh white)
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>

      <style>{`
        /* Color Utilities */
        .text-soft { color: #94a3b8 !important; } /* Dim Gray */
        .text-main { color: #e2e8f0 !important; } /* Light Slate (Header highlight) */

        /* Glass Panel Container */
        .glass-panel {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
        }

        /* Inputs & Selects */
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
        .control-input::placeholder {
            color: #64748b !important;
        }

        /* Table Styling */
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

        /* Enforce Soft Gray Text in Table Cells */
        .table-modern td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #1e293b;
          color: #cbd5e1 !important; /* Overrides Bootstrap White */
          background: transparent;
        }

        .table-modern tbody tr:hover td {
          background: rgba(59, 130, 246, 0.04);
          color: #e2e8f0 !important; /* Slightly brighter on hover */
        }
      `}</style>

      <Navbar />

      <div className="container py-5">
        
        {/* --- 1. HEADER --- */}
        <div className="mb-4">
            <h2 className="fw-bold text-main mb-1">Shared Repository</h2>
            <p className="text-soft">Browse and download resources from the master archive.</p>
        </div>

        {/* --- 2. CONTROL BAR (Search & Filters) --- */}
        <div className="glass-panel p-3 mb-4 d-flex flex-column flex-md-row gap-3 align-items-center">
            
            {/* Search Input */}
            <div className="position-relative flex-grow-1 w-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)'}}>
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                    type="text" 
                    className="form-control control-input rounded-3 ps-5" 
                    placeholder="Search by title, author, or tag..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Dropdowns */}
            <div className="d-flex gap-2 w-100 w-md-auto">
                {/* File Type Filter */}
                <select className="form-select control-input rounded-3" style={{width: '150px'}} 
                        value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="All">All Types</option>
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="PPTX">PPTX</option>
                    <option value="XLSX">Excel</option>
                </select>

                {/* Semester Filter */}
                <select className="form-select control-input rounded-3" style={{width: '150px'}}
                        value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
                    <option value="All">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
            </div>
        </div>

        {/* --- 3. DATA TABLE --- */}
        <div className="glass-panel overflow-hidden">
          {isLoading ? (
            <div className="text-center py-5 text-soft">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
              Loading archive...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-modern mb-0 w-100">
                <thead>
                  <tr>
                    <th>Format</th>
                    <th>Document Name</th>
                    <th>Author</th>
                    <th className="text-center">Sem</th>
                    <th>Date</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => {
                    const badge = getTypeBadgeStyle(doc.type);
                    return (
                      <tr key={doc.id}>
                        <td style={{width: '90px'}}>
                          <span className="badge rounded-1 fw-bold" 
                            style={{
                              background: badge.bg, 
                              color: badge.color, 
                              border: `1px solid ${badge.border}`,
                              fontSize: '0.7rem',
                              minWidth: '55px',
                              textAlign: 'center'
                            }}>
                            {doc.type}
                          </span>
                        </td>

                        <td>
                          <div className="fw-medium text-main">{doc.title}</div>
                          <div className="small text-soft">{doc.tag}</div>
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

                        <td className="text-end">
                          <button 
                            className="btn btn-sm d-inline-flex align-items-center gap-2"
                            style={{
                              border: '1px solid rgba(59,130,246,0.3)', 
                              color: '#60a5fa', 
                              background: 'rgba(59,130,246,0.1)',
                              fontSize: '0.8rem',
                              padding: '0.4rem 0.8rem'
                            }}
                            onClick={() => window.open(`${doc.filePath}?name=${encodeURIComponent(doc.title)}`, '_blank')}
                          >
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                             Download
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-soft">
                        No documents found matching your filters.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default SharedHub;