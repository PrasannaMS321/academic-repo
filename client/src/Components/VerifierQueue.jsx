import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VerifierNavbar from './Sub-Components/VerifierNavbar';

function VerifierQueue() {
    const [pendingFiles, setPendingFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
    const navigate = useNavigate();

    // Security Check: Only verifiers, moderators, or admins allowed
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || (storedUser.role !== "moderator" && storedUser.role !== "admin" && storedUser.role !== "verifier")) {
            navigate('/login');
        } else {
            fetchPendingFiles();
        }
    }, [navigate]);

    const showToast = (msg, type = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const fetchPendingFiles = () => {
        setIsLoading(true);
        axios.get('https://academic-repo-evrb.onrender.com/get-pending-files')
            .then(res => {
                if (res.data.status === "Success") setPendingFiles(res.data.data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const handleApprove = (id) => {
        axios.put(`https://academic-repo-evrb.onrender.com/approve-file/${id}`)
            .then(res => {
                if(res.data.status === "Success") {
                    setPendingFiles(prev => prev.filter(file => file.id !== id));
                    showToast("Document approved and published!", "success");
                }
            });
    };

    const handleReject = (id) => {
        if(window.confirm("Reject and delete this file permanently?")) {
            axios.post(`https://academic-repo-evrb.onrender.com/delete-file`, { doc_id: id })
                .then(res => {
                    if(res.data.status === "Success") {
                        setPendingFiles(prev => prev.filter(file => file.id !== id));
                        showToast("Document rejected and deleted.", "error");
                    }
                });
        }
    };

    const getIconStyle = (type) => {
        const styles = { 
            PDF: { color: '#fca5a5', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' }, 
            DOCX: { color: '#93c5fd', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' }, 
            PPTX: { color: '#fdba74', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.2)' } 
        };
        return styles[type] || { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)' };
    };

    return (
        <div className="min-vh-100 d-flex flex-column" 
             style={{ background: '#0f172a', color: '#cbd5e1', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
            
            <style>{`
                .text-soft { color: #94a3b8 !important; }
                .text-highlight { color: #f1f5f9 !important; }
                
                .queue-item {
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 1.25rem;
                    transition: all 0.2s ease;
                }
                .queue-item:hover { 
                    background: rgba(30, 41, 59, 0.7); 
                    border-color: rgba(168, 85, 247, 0.2);
                }

                .btn-approve {
                    background: rgba(16, 185, 129, 0.15);
                    color: #34d399;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }
                .btn-approve:hover {
                    background: rgba(16, 185, 129, 0.25);
                    color: #fff;
                }

                .btn-reject {
                    background: rgba(239, 68, 68, 0.15);
                    color: #f87171;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }
                .btn-reject:hover {
                    background: rgba(239, 68, 68, 0.25);
                    color: #fff;
                }

                .btn-preview {
                    background: rgba(59, 130, 246, 0.1);
                    color: #60a5fa;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                }
                .btn-preview:hover {
                    background: rgba(59, 130, 246, 0.2);
                    color: #fff;
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

            <div className="container py-5">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="fw-bold text-highlight mb-1">Review Queue</h2>
                    <p className="text-soft mb-0">Review uploaded documents before they are published to students.</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-soft mt-3">Loading queue...</p>
                    </div>
                ) : pendingFiles.length === 0 ? (
                    <div className="text-center py-5 p-5 border border-secondary border-opacity-25 rounded-4" 
                         style={{background: 'rgba(255,255,255,0.02)'}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" className="mb-3">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h5 className="text-white fw-bold">All Caught Up!</h5>
                        <p className="text-soft mb-0">There are no pending files to review.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {pendingFiles.map(file => {
                            const style = getIconStyle(file.type);
                            return (
                                <div className="col-12" key={file.id}>
                                    <div className="queue-item d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                        
                                        {/* Left: File Info */}
                                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                                            <div className="icon-box d-flex align-items-center justify-content-center rounded-3 fw-bold" 
                                                 style={{width:'48px', height:'48px', background: style.bg, color: style.color, border: `1px solid ${style.border}`, fontSize: '0.75rem', minWidth: '48px'}}>
                                                {file.type}
                                            </div>
                                            <div>
                                                <h5 className="text-highlight fw-bold mb-1">{file.title}</h5>
                                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                                    <span className="small text-soft">
                                                        <span className="text-info">{file.author ? file.author.split('@')[0] : 'Unknown'}</span>
                                                    </span>
                                                    <span className="text-soft">•</span>
                                                    <span className="badge" style={{background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.7rem'}}>Sem {file.semester}</span>
                                                    <span className="badge" style={{background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', fontSize: '0.7rem'}}>{file.tag}</span>
                                                    <span className="badge" style={{background: 'rgba(255,255,255,0.05)', color: '#64748b', fontSize: '0.7rem'}}>{file.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Right: Actions */}
                                        <div className="d-flex gap-2 align-items-center flex-shrink-0">
                                            <a href={`${file.filePath}?name=${encodeURIComponent(file.title)}`} 
                                               target="_blank" 
                                               rel="noreferrer" 
                                               className="btn btn-sm btn-preview px-3 d-flex align-items-center gap-2">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                Preview
                                            </a>
                                            <div style={{width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)'}}></div>
                                            <button onClick={() => handleReject(file.id)} className="btn btn-sm btn-reject px-3 d-flex align-items-center gap-2">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                Reject
                                            </button>
                                            <button onClick={() => handleApprove(file.id)} className="btn btn-sm btn-approve px-3 d-flex align-items-center gap-2 fw-bold">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                Approve
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifierQueue;