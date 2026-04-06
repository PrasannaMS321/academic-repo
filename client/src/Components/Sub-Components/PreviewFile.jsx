import 'bootstrap/dist/css/bootstrap.min.css';

function Preview({ doc, onClose }) {
  if (!doc) return null;

  const fileUrl = `${doc.filePath}?name=${encodeURIComponent(doc.title)}`;
  // Check if it's a PDF (Browsers can only natively preview PDFs and Images)
  const isPDF = doc.type && doc.type.toUpperCase() === 'PDF';

  return (
    <div className="modal-overlay" style={{ zIndex: 2050 }}>
      {/* Increased max-width for better document reading */}
      <div className="modal-custom d-flex flex-column" style={{ width: '95%', maxWidth: '1000px', height: '90vh', background: '#0f172a' }}>
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary border-opacity-25">
          <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Preview: {doc.title}
          </h5>
          <button className="btn btn-link text-secondary p-0" onClick={onClose} title="Close Preview">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Preview Body */}
        <div className="flex-grow-1 p-0 overflow-hidden bg-white rounded-bottom" style={{ borderRadius: '0 0 1rem 1rem' }}>
          {isPDF ? (
            <iframe 
              src={fileUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 'none' }}
              title="Document Preview"
            />
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-light text-dark">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1" className="mb-3">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline>
              </svg>
              <h4 className="fw-bold text-secondary">Browser Preview Not Supported</h4>
              <p className="text-muted mb-4">Localhost cannot preview {doc.type} files natively. Please download the file to view it.</p>
              <a href={fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary px-4 py-2 fw-medium rounded-pill">
                Download {doc.type}
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Preview;