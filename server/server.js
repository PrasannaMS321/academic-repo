const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");
const fs = require('fs');
const multer = require('multer');
const {upload} = require("./upload");

//IMPORT MODELS
const UserModel = require('./models/users');
const DocumentsModel = require('./models/documents');

const app = express();
//const upload = multer({dest: "uploads/"});
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://guest123:guest123@cluster0.a1iay2y.mongodb.net/academic_repo?retryWrites=true&w=majority')
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ Connection error", err));

// Test Route
app.get('/', (req, res) => {
    res.send("API is working! 🚀");
});

//Static file access
const uploadsLocation = path.join(__dirname, "uploads");

// Checks if React requested a specific download name
app.use("/uploads", (req, res, next) => {
    if (req.query.name) {
        // Forces the browser to download the file with the original name
        res.setHeader('Content-Disposition', `attachment; filename="${req.query.name}"`);
    }
    next();
});

// Static Access
app.use("/uploads", express.static(uploadsLocation));

//FILE Upload
app.post("/upload/file", upload.single("file"), async (req, res) => {
    
    // 1. Check if file is missing
    if (!req.file) {
        return res.status(400).json({ message: "Error: No file uploaded" });
    }

    // 2. Prepare the Combined Data - Merge Multer's file info with React's form info
    const docData = {
        // A. File Info (from Multer)
        originalName: req.file.originalname,
        storedName: req.file.filename,
        extension: path.extname(req.file.originalname).toLowerCase(),
        path: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,

        // B. Form Info (from req.body - matches your React append names)
        title: req.body.title,              // formData.append("title", ...)
        subject: req.body.subject,          // formData.append("subject", ...)
        semester: req.body.semester,        // formData.append("semester", ...)
        uploaderEmail: req.body.uploaderEmail, // formData.append("uploaderEmail", ...)
        role: req.body.role                 // formData.append("role", ...)
    };

    try {
        // 3. Save to MongoDB
        const newDoc = await DocumentsModel.create(docData);

        console.log("Saved Document:", newDoc); // Debug log

        return res.json({
            status: "Success",
            message: "Material uploaded successfully",
            data: newDoc
        });

    } catch (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ status: "Error", error: err.message });
    }
});

//GET Files Data:
app.get("/get-files-data", async (req, res) => {
    try {
        const rawDocs = await DocumentsModel.find({});

        //Format Raw Data
        const formattedDocs = rawDocs.map(doc => {
        return {
                id: doc._id,
                title: doc.title || "Untitled Document",
                author: doc.uploaderEmail || "Unknown",
                date: doc.uploadDate ? new Date(doc.uploadDate).toISOString().split('T')[0] : "Unknown Date",
                type: doc.extension ? doc.extension.replace('.', '').toUpperCase() : "FILE",
                size: doc.size ? (doc.size / (1024 * 1024)).toFixed(1) + " MB" : "0 MB",
                tag: doc.tag || doc.subject || "General",

                // 👉 ADD THIS: The frontend needs this to download the file!
                filePath: `http://localhost:5000/${doc.path.replace(/\\/g, "/")}` 
            };
        });

        res.json({ status: "Success", data: formattedDocs });

    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ status: "Error", error: err.message });
    }
});

//Delete File data
app.post("/delete-file", async (req, res) => {
    try {
        const { doc_id } = req.body;

        // Find the document so we know the file path
        const docToDelete = await DocumentsModel.findById(doc_id);
        if (!docToDelete) {
            return res.json({ status: "Error", message: "Document not found" });
        }

        // Delete the physical file from "uploads" folder using 'fs'
        const absolutePath = path.join(__dirname, docToDelete.path);
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath); 
        }

        // Delete the record from MongoDB
        await DocumentsModel.findByIdAndDelete(doc_id);

        res.json({ status: "Success", message: "File deleted successfully" });

    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ status: "Error", error: err.message });
    }
});

// Edit File data
app.put("/edit-file/:id", async (req, res) => {
    try {
        const documentId = req.params.id;
        
        // Get and Validate all fields from body
        const { title, tag, semester } = req.body;
        if (!title || !tag || !semester) {
            return res.status(400).json({ status: "Error", message: "Title, tag, and semester are required." });
        }

        // Update the document in MongoDB
        const updatedDoc = await DocumentsModel.findByIdAndUpdate( documentId, { 
                title: title, 
                tag: tag,
                semester: semester
            },
            { new: true } // Ensure getting New version over the Old
        );

        if (!updatedDoc) {
            return res.status(404).json({ status: "Error", message: "Document not found." });
        }

        res.json({ status: "Success", message: "Document updated successfully", data: updatedDoc });

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ status: "Error", error: err.message });
    }
});

//User Authentication
app.post('/login', (req, res) => {
    console.log("Received Data:", req.body); 
    const { email, password } = req.body;

    UserModel.findOne({email: email})
    // 👇 FIX: Added "async" right here!
    .then(async user => { 
        if(user){
            if(user.password === password){
                
                // 👇 Now await will work perfectly here
                user.lastLog = new Date();
                await user.save();

                res.json({
                    status:"Success",
                    user: user,
                    role: user.role
                });
            } 
            else {
                res.json({ status: "Error", message: "Incorrect password" });
            }
        }
        else res.json({ status: "Error", message: "User not found" });
    })
    .catch(err => res.json(err));
});

//Register new user
app.post('/register', (req, res) => {
    console.log("Received Data:", req.body);

    UserModel.create(req.body)
    .then(register => res.json(register))
    .catch(err => {
            console.error(err);
            res.status(500).json(err);
        })
});

app.get("/get-users", async (req, res) => {
    try {
        // Find all users, but exclude their passwords for security
        const users = await UserModel.find({}, { password: 0 });
        res.json({ status: "Success", data: users });
    } catch (err) {
        console.error("Fetch Users Error:", err);
        res.status(500).json({ status: "Error", error: err.message });
    }
});

//Exception Handling
app.use((err, req, res, next) => {
    if(err instanceof multer.MulterError) {
        switch(err.code){
            case "LIMIT_FILE_SIZE":
                return res.status(400).json({ message: "Error: File too large! Maximum size is 10MB." })
            default:
                return res.status(400).json({ message: `Multer Error: ${err.message}`})
        }
    } else {
        return res.status(400).json({error: err.message})
    }
})

app.listen(5000, () => {
    console.log("🚀 Server running on http://localhost:5000");
});