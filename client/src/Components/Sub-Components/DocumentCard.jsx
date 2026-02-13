import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';

function DocumentCard({ doc, onEdit, onDelete }) { 
    const [isHovered, setIsHovered] = useState(false);

    const filename = `${doc.title}${doc.tag === "common" ? "" : `-${doc.tag}`}.${doc.type.toLowerCase()}`;

    // 👇 I removed the local onDelete function entirely! 
    // The card will just use the one passed in from MyLibrary.jsx.

    const getFileColor = (type) => {
        const colors = {
        'PDF': '#ef4444',   
        'CSV': '#10b981',   
        'XLSX': '#10b981',  
        'DOC': '#3b82f6',   
        'DOCX': '#3b82f6',  
        'PPT': '#f97316',   
        'PPTX': '#f97316',  
        };
        return colors[type] || '#94a3b8'; 
    };

    const typeColor = getFileColor(doc.type);

    return (
        <div className="col-md-6 col-lg-4 mb-4">
        <div 
            className="card h-100 p-4" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
            backgroundColor: '#0f172a', 
            borderRadius: '1rem',
            border: `1px solid ${isHovered ? typeColor + '60' : 'rgba(255, 255, 255, 0.08)'}`,
            boxShadow: isHovered 
                ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.2s ease-out' 
            }}
        >
        
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div className="d-flex align-items-center justify-content-center" 
               style={{ width: '42px', height: '42px', backgroundColor: '#1e293b', borderRadius: '10px', border: `1px solid ${typeColor}30` }}>
            <span className="fw-bold" style={{ color: typeColor, fontSize: '0.8rem', letterSpacing: '0.5px' }}>{doc.type}</span>
          </div>
          <span className="badge px-3 py-2 fw-medium" style={{ backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
            {doc.tag === "common" ? "General": doc.tag}
          </span>
        </div>
        
        <h5 className="fw-bold mb-3" style={{ color: '#f8fafc', letterSpacing: '-0.3px', lineHeight: '1.4' }}>{doc.title}</h5>
        
        <div className="d-flex align-items-center gap-2 mb-4">
          <div className="rounded-circle d-flex align-items-center justify-content-center"
               style={{ width: '24px', height: '24px', backgroundColor: '#334155', color: '#f8fafc', fontSize: '0.7rem', fontWeight: 'bold' }}>
            {doc.author ? doc.author.charAt(0).toUpperCase() : '?'}
          </div>
          <p className="small mb-0 fw-medium" style={{ color: '#94a3b8' }}>{doc.author}</p>
        </div>
        
        <div className="mt-auto d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          
          <div className="d-flex align-items-center gap-3" style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '500' }}>
            <span className="d-flex align-items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {doc.date}
            </span>
            <span className="d-flex align-items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              {doc.size}
            </span>
          </div>
          
          {/* ACTIONS ROW */}
          <div className="d-flex gap-2">
            
            {/* Edit Button */}
            {onEdit && (
              <button onClick={() => onEdit(doc)} className="btn btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', backgroundColor: '#1e293b', color: '#cbd5e1', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.15s ease-out' }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.border = '1px solid #3b82f6'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.05)'; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
            )}

            {/* Delete Button - Now perfectly calls the parent's function! */}
            {onDelete && (
              <button onClick={() => onDelete(doc.id)}
                className="btn btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', backgroundColor: '#1e293b', color: '#cbd5e1', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.15s ease-out' }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.border = '1px solid #ef4444'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.05)'; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            )}

            {/* Download Button */}
            <button onClick={() => window.open(`${doc.filePath}?name=${encodeURIComponent(filename)}`, '_blank')}
                    className="btn btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', backgroundColor: '#1e293b', color: '#cbd5e1', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.15s ease-out' }}
                    onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.backgroundColor = typeColor; e.currentTarget.style.border = `1px solid ${typeColor}`; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#1e293b'; e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.05)'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
          </div>
        </div>
        </div>
        </div>
    );
}

export default DocumentCard;