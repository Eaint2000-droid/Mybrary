// Import the Mongoose library for interacting with MongoDB
const mongoose = require('mongoose')

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
    coverImage:{
        type: Buffer, // used for storing raw binary data e.g. images, audio or other files;
        required: true
    },
    coverImageType:{
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
    // Check if the book has a cover image and coverimagetype
    if(this.coverImage != null && this.coverImageType != null){
         // Return a base64-encoded Data URL that can be rendered directly in <img src="...">
        return `data:${this.coverImageType};charset=utf-8;base64,
        ${this.coverImage.toString('base64')}`
    }
})

// Export a Mongoose model based on the schema
// 'Book' is the name of the model 
module.exports = mongoose.model('Book', bookSchema)