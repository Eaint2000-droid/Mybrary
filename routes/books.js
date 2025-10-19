const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'] // Define the allowed MIME types for uploaded images (JPEG, PNG, GIF)

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
// It constructs a new Book object from the request body, processes the cover image,
// attempts to save the book, and redirects to the books list on success.
// If saving fails, it re-renders the form with an error message.
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    
    saveCover(book, req.body.cover)

    try{
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect('/books') // sends an HTTP redirct to /books
    } catch {
        renderNewPage(res, book, true)
    }
})

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

// Processes and saves the book's cover image data.
function saveCover(book, coverEncoded) {
    // If no encoded cover data is provided, exit the function early.
    if (coverEncoded == null) return
    // Parse the encoded cover data from JSON format into a JavaScript object.
    const cover = JSON.parse(coverEncoded)
    // If a valid cover exists and its MIME type is supported, process it.
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        // Decodes the Base64 string (text form of image data) into binary and assign it to the book object
        // so that it can be stored or processed properly in MongoDB
        book.coverImage = Buffer.from(cover.data, 'base64')
        // Store the image MIME type (e.g., 'image/jpeg', 'image/png') in the book.
        book.coverImageType = cover.type
    }
}

module.exports = router