// Import the Mongoose library for interacting with MongoDB
const mongoose = require('mongoose')
const path = require('path')
const coverImageBasePath = 'uploads/bookCovers'

// Define a schema for the 'Author' collection
// This specifies the structure of an Author document
const bookSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName:{
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, // referencing to another object inside our collection
        required: true,
        ref: 'Author'                         // referencing to 'Author' collection which we have created earlier
    }
})

// create a virtual property 'coverImagePath' for the bookSchema
bookSchema.virtual('coverImagePath').get(function(){
    // Check if the book has a cover image name stored 
    if(this.coverImageName != null){
        // Return the complete relative path to the cover image
        // Combines the base directory (coverImageBasePath) with the image file name
        // Example output: /uploads/bookCovers/image.jpg
        return path.join('/', coverImageBasePath, this.coverImageName)
    }
})

// Export a Mongoose model based on the schema
// 'Book' is the name of the model 
module.exports = mongoose.model('Book', bookSchema)
module.exports.coverImageBasePath = coverImageBasePath