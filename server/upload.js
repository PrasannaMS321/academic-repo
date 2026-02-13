const multer = require('multer');
const path = require("path");
const {v4: uuidv4} = require("uuid"); 

//Import Model
const DocumentsModel = require('./models/documents');

//SET File Size
let fileSize = 10 * 1024 * 1024

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname)
        const newName = `${uuidv4()}${extension}`
        cb(null, newName)
    }
})

//Filter out Allowed file Types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|csv/
    const isAllowed = allowedTypes.test(file.mimetype)
    if(isAllowed){
        cb(null, true)
    } else {
        cb(new Error("Only pdf, doc, docx or csv files are allowed.", false))
    }
}

exports.upload = multer({
    storage: storage,
    limits:{
        fileSize: fileSize
    },
    fileFilter: fileFilter
})