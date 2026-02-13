import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import axios from 'axios';
import Navbar from './Sub-Components/Navbar'; 

function StaffUpload() {
    const user = JSON.parse(localStorage.getItem("user")); 
    const email = user ? user.email : "guest@college.edu";

    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [semester, setSemester] = useState("1");
    const [subject, setSubject] = useState("");
    const [tag, setTag] = useState("CS"); 

    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setUploadStatus({ type: "error", message: "Please select a file to upload." });
            return;
        }

        setIsUploading(true);
        setUploadStatus({ type: "", message: "" });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("uploaderEmail", email);
        formData.append("role", "Staff"); 
        formData.append("semester", semester);
        formData.append("subject", subject);
        formData.append("tag", tag);

        try {
            const res = await axios.post('http://localhost:5000/upload/file', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            if (res.data.status === "Success") {
                setUploadStatus({ type: "success", message: "Material published successfully!" });
                
                setFile(null);
                setTitle("");
                setSubject("");
                
                const fileInput = document.getElementById('file-upload');
                if(fileInput) fileInput.value = ''; 
            }
        } catch (err) {
            console.error(err);
            setUploadStatus({ type: "error", message: "Failed to upload. Please try again." });
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="min-vh-100 d-flex flex-column" 
             style={{ 
               background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
               color: '#fff',
               fontFamily: 'system-ui, -apple-system, sans-serif'
             }}>
            
            <Navbar />

            {/* --- CUSTOM FORM STYLES --- */}
            <style>{`
                .upload-card {
                    background-color: #1e293b;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1.25rem;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
                }
                .form-control-custom, .form-select-custom {
                    background-color: #0f172a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #f8fafc !important; /* Forces bright white text */
                    padding: 0.85rem 1.25rem;
                    border-radius: 0.75rem;
                    transition: all 0.2s ease;
                    font-size: 0.95rem;
                }
                .form-control-custom:focus, .form-select-custom:focus {
                    background-color: #0f172a;
                    border-color: #3b82f6;
                    color: #ffffff !important;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
                    outline: none;
                }
                .form-control-custom::placeholder {
                    color: #94a3b8 !important; /* High contrast placeholder */
                }
                /* Fix for dropdown options on Windows/Chrome */
                .form-select-custom option {
                    background-color: #1e293b;
                    color: #f8fafc;
                    padding: 10px;
                }
                /* Custom File Dropzone Style */
                .file-dropzone {
                    border: 2px dashed rgba(255, 255, 255, 0.15);
                    border-radius: 1rem;
                    background-color: rgba(15, 23, 42, 0.4);
                    transition: all 0.2s ease;
                    cursor: pointer;
                    position: relative;
                }
                .file-dropzone:hover {
                    border-color: #3b82f6;
                    background-color: rgba(59, 130, 246, 0.05);
                }
                /* Hide the ugly default file input */
                .file-dropzone input[type="file"] {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    z-index: 10;
                }
                /* Custom Action Button Text */
                .btn-cancel-custom {
                    color: #94a3b8;
                    transition: color 0.2s;
                }
                .btn-cancel-custom:hover {
                    color: #f8fafc;
                }
            `}</style>

            <div className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
                <div className="w-100" style={{ maxWidth: '800px' }}>
                    
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-white mb-2">Publish Material</h2>
                        {/* Fixed Contrast Here */}
                        <p style={{ color: '#94a3b8' }}>Upload course documents, notes, and assignments to the repository.</p>
                    </div>

                    <div className="upload-card p-4 p-md-5">
                        <form onSubmit={handleSubmit}>
                            
                            <div className="row g-4 mb-4">
                                {/* Document Title */}
                                <div className="col-12">
                                    <label className="form-label fw-medium small mb-2" style={{ color: '#cbd5e1' }}>Document Title <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control form-control-custom w-100" 
                                        placeholder="e.g., Chapter 1: Introduction to Data Structures" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)} required />
                                </div>

                                {/* Subject */}
                                <div className="col-md-6">
                                    <label className="form-label fw-medium small mb-2" style={{ color: '#cbd5e1' }}>Subject Name <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control form-control-custom w-100" 
                                        placeholder="e.g., Advanced Java" 
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)} required />
                                </div>

                                {/* Semester */}
                                <div className="col-md-3">
                                    <label className="form-label fw-medium small mb-2" style={{ color: '#cbd5e1' }}>Semester <span className="text-danger">*</span></label>
                                    <select className="form-select form-select-custom w-100" value={semester} onChange={(e) => setSemester(e.target.value)}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                            <option key={num} value={num}>Sem {num}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tag Category */}
                                <div className="col-md-3">
                                    <label className="form-label fw-medium small mb-2" style={{ color: '#cbd5e1' }}>Category <span className="text-danger">*</span></label>
                                    <select className="form-select form-select-custom w-100" value={tag} onChange={(e) => setTag(e.target.value)}>
                                        <option value="CS">Comp Sci</option>
                                        <option value="Mech">Mechanical</option>
                                        <option value="Civil">Civil</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                            </div>

                            {/* Custom File Dropzone */}
                            <div className="mb-4">
                                <label className="form-label fw-medium small mb-2" style={{ color: '#cbd5e1' }}>File Upload <span className="text-danger">*</span></label>
                                <div className="file-dropzone d-flex flex-column align-items-center justify-content-center py-5 text-center px-3">
                                    
                                    <input type="file" id="file-upload" accept=".pdf,.doc,.docx,.ppt,.pptx,.csv,.xlsx" 
                                        onChange={(e) => setFile(e.target.files[0])} required />
                                    
                                    <div className="mb-3 d-flex align-items-center justify-content-center rounded-circle" 
                                         style={{ width: '64px', height: '64px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                    </div>
                                    <h6 className="text-white fw-bold mb-1" style={{ wordBreak: 'break-all' }}>
                                        {file ? file.name : "Click or drag file to this area to upload"}
                                    </h6>
                                    {/* Fixed Contrast Here */}
                                    <p className="small mb-0" style={{ color: '#94a3b8' }}>
                                        {file ? `Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Support for a single or bulk upload. Max size 10MB."}
                                    </p>
                                </div>
                            </div>

                            {/* Status Messages */}
                            {uploadStatus.message && (
                                <div className={`alert ${uploadStatus.type === 'success' ? 'alert-success bg-success border-success' : 'alert-danger bg-danger border-danger'} bg-opacity-10 text-${uploadStatus.type === 'success' ? 'success' : 'danger'} py-3 px-4 rounded-3 small fw-medium mb-4 d-flex align-items-center gap-2`}>
                                    {uploadStatus.type === 'success' ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    )}
                                    {uploadStatus.message}
                                </div>
                            )}

                            {/* Action Footer */}
                            <div className="d-flex justify-content-end gap-3 pt-4 border-top mt-2" style={{ borderColor: 'rgba(255,255,255,0.08) !important' }}>
                                {/* Fixed Contrast Here */}
                                <button type="button" className="btn btn-link btn-cancel-custom text-decoration-none fw-medium px-4" onClick={() => {
                                    setFile(null); setTitle(""); setSubject(""); 
                                    const fileInput = document.getElementById('file-upload');
                                    if(fileInput) fileInput.value = '';
                                }}>
                                    Clear Form
                                </button>
                                <button type="submit" className="btn btn-primary px-4 py-2 fw-medium rounded-3 d-flex align-items-center gap-2" disabled={isUploading} style={{ backgroundColor: '#3b82f6', border: 'none', color: '#fff' }}>
                                    {isUploading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                            Publish Document
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default StaffUpload;