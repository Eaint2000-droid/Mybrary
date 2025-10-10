const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path') // used for working with files and directory paths
const fs = require('fs') // built-in node.js module to hand file system
const Book = require('../models/book')
const Author = require('../models/author')
const uploadPath = path.join('public', Book.coverImageBasePath) // Set the upload directory path by joining 'public' with the cover image folder from the Book model
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'] // Define the allowed MIME types for uploaded images (JPEG, PNG, GIF)

// Configure multer for handling file uploads
const upload = multer({
    // Destination folder where uploaded files will be stored
    dest: uploadPath,

    // 'fileFilter' is a function that decides whether to accept or reject an uploaded file
    // req → the incoming request.
    // file → metadata about the uploaded file (file.mimetype, file.originalname, etc.).
    // callback → used to tell Multer whether the file should be accepted.
    fileFilter: (req, file, callback) => {
        // Check if file type is in the allowed list and pass the result to the callback
        callback(null, imageMimeTypes.includes(file.mimetype))
        // If it’s valid, callback(null, true) → file accepted.
        // If not, callback(null, false) → file rejected (not uploaded).
    }
})

// All Books Route
router.get('/', async (req, res) => {
    let query = Book.find()

    // to match the title of the book partially and don't care if the book title
    // is uppercase or lowercase
    if (req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }

    // return the book object if the searched published date is 
    // before the publishedBefore date
    if (req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore)
    }

    // return the book object if the searched published date is 
    // after the publishedAfter date
    if (req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter)
    }

    try{
        // Fetch all book documents from the database based on the query
        const books = await query.exec()
        // Render the 'books/index' view (EJS or similar template)
        // Pass two variables:
        // 1. 'books' – the list of books retrieved from the database
        // 2. 'searchOptions' – the current query parameters (used to retain search inputs in the UI)
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch{
        // If an error occurs (e.g., database issue),
        // redirect the user to the home page ('/')
        res.redirect('/')
    }
    
})

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// Create Book Route
// accepts another parameter which will accepts a single file upload with a filename 'cover'
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try{
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect('/books') // sends an HTTP redirct to /books
    } catch {
        // this if() condition is to make sure that the errorneous book doesn't 
        // get saved into 'uploads' folder when the user pressed on 'Create'
        // for e.g., let's say the user chooses not to leave the book cover image
        // as blank and chooses to 'Create', then this book should not be saved into
        // the uploads folder
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }

        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName){
    // to remove the file from the uploadPath
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

async function renderNewPage(res, book, hasError = false){
    try {
        // Fetch all authors from the database asynchronously
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book'
        // Render the 'books/new' view, passing the params which include:
        // 1. the list of authors retrieved from the database
        // 2. the book to be created 
        res.render('books/new', params)
    } catch{
        // if there is an error in book creation, redirect it to '/books' route
        res.redirect('/books')
    }
}
  
module.exports = router