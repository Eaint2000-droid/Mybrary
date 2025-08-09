// Import the Mongoose library for interacting with MongoDB
const mongoose = require('mongoose')

// Define a schema for the 'Author' collection
// This specifies the structure of an Author document
const authorSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    }
})

// Export a Mongoose model based on the schema
// 'Author' is the name of the model 
module.exports = mongoose.model('Author', authorSchema)