const mongoose = require('mongoose')

const Insert_User_Schema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    lastLog: { type: Date, default: Date.now }
})

// Create the model ("users" will be the collection name in MongoDB)
const RegisterModel = mongoose.model("users", Insert_User_Schema);

// EXPORT 
module.exports = RegisterModel;
