import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ModeratorQueue() {
    const [pendingFiles, setPendingFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Security Check: Only moderators (or admins) allowed
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || (storedUser.role !== "moderator" && storedUser.role !== "admin" && storedUser.role !== "verifier")) {
            navigate('/login');
        } else {
            fetchPendingFiles();
        }
    }, [navigate]);

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
                    // Remove it from the pending list UI
                    setPendingFiles(prev => prev.filter(file => file.id !== id));
                }
            });
    };

    const handleReject = (id) => {
        if(window.confirm("Reject and delete this file permanently?")) {
            axios.post(`https://academic-repo-evrb.onrender.com/delete-file`, { doc_id: id })
                .then(res => {
                    if(res.data.status === "Success") {
                        setPendingFiles(prev => prev.filter(file => file.id !== id));
                    }
                });
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate('/login');
    };

    return (
        <div className="min-vh-100 p-5" style={{ background: '#0f172a', color: '#cbd5e1', fontFamily: "'Inter', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-white mb-1">Verification Queue</h2>
                    <p className="text-muted">Review uploaded documents before they are published to students.</p>
                </div>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm px-4">Log Out</button>
            </div>

            {isLoading ? (
                <div className="text-center py-5">Loading queue...</div>
            ) : pendingFiles.length === 0 ? (
                <div className="text-center py-5 p-5 border border-secondary border-opacity-25 rounded-4" style={{background: 'rgba(255,255,255,0.02)'}}>
                    <h5 className="text-white">All Caught Up!</h5>
                    <p className="text-muted mb-0">There are no pending files to review.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {pendingFiles.map(file => (
                        <div className="col-12" key={file.id}>
                            <div className="d-flex justify-content-between align-items-center p-4 rounded-4" style={{background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)'}}>
                                
                                <div>
                                    <h5 className="text-white fw-bold mb-1">{file.title}</h5>
                                    <div className="small text-muted mb-2">Uploaded by: {file.author}</div>
                                    <span className="badge bg-secondary me-2">{file.type}</span>
                                    <span className="badge bg-dark border border-secondary">Sem {file.semester} • {file.tag}</span>
                                </div>
                                
                                <div className="d-flex gap-3 align-items-center">
                                    <a href={`${file.filePath}?name=${encodeURIComponent(file.title)}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-dark px-3">
                                        Preview File
                                    </a>
                                    <div style={{width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)'}}></div>
                                    <button onClick={() => handleReject(file.id)} className="btn btn-sm btn-danger px-4">Reject</button>
                                    <button onClick={() => handleApprove(file.id)} className="btn btn-sm btn-success px-4 fw-bold">Approve & Publish</button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ModeratorQueue;