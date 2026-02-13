const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    // --- 1. System Data (From Multer) ---
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    extension: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    
    // --- 2. User Data (From React Form) ---
    title: { type: String, required: true },         // e.g. "Unit 1 Python"
    subject: { type: String, required: true },       // e.g. "Java"
    semester: { type: String, required: true },      // e.g. "1"
    tag: { type: String, default: "common" },       // e.g. "CSE"
    uploaderEmail: { type: String, required: true }, // e.g. "staff@college.edu"
    role: { type: String, default: "Student" },      // e.g. "Staff"

    // --- 3. Tracking ---
    uploadDate: { type: Date, default: Date.now }
});

const DocumentsModel = mongoose.model("documents", DocumentSchema);
module.exports = DocumentsModel;