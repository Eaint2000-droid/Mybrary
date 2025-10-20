// Import the Mongoose library for interacting with MongoDB
const mongoose = require('mongoose')
const Book = require('./book')

// Define a schema for the 'Author' collection
// This specifies the structure of an Author document
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

// Add a Mongoose pre-hook that runs BEFORE a document deleteOne operation
// This is a DOCUMENT middleware, so `this` refers to the actual author document being deleted
authorSchema.pre('deleteOne', { document: true, query: false }, async function (next) {

    // Find all books in the database that reference this author
    const books = await Book.find({ author: this._id })

    // If any books exist, block deletion and return an error
    if (books.length > 0) {
        return next(new Error('This author has books still'))
    }

    // Otherwise, allow deletion to proceed
    next()
})


// Export a Mongoose model based on the schema
// 'Author' is the name of the model 
module.exports = mongoose.model('Author', authorSchema)