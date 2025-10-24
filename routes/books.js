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
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }

    // return the book object if the searched published date is 
    // before the publishedBefore date
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }

    // return the book object if the searched published date is 
    // after the publishedAfter date
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }

    try {
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
    } catch {

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
// It constructs a new Book object from the request body,
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    })

    // processes the cover image
    saveCover(book, req.body.cover)

    try {
        // attempts to save the book
        const newBook = await book.save()

        // redirects to the books list on success
        res.redirect(`books/${newBook.id}`)
    } catch {
        // If saving fails, it re-renders the form with an error message
        renderNewPage(res, book, true)
    }
})

// Show Book Route
router.get('/:id', async (req, res) => {
    try {

        // Find a single book by the id from the URL, and also load the full author document instead of just its id
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show', { book: book })
    }
    catch {
        res.redirect('/')
    }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        // Attempt to retrieve the book document from MongoDB using the ID 
        // from the URL params
        const book = await Book.findById(req.params.id)

        // If retrieved successfully, render the book's 
        // edit page with the found book's data
        renderEditPage(res, book)
    } catch {

        // If any error occurs, redirect user to home page
        res.redirect('/')
    }
})

// Update Book Route
router.put('/:id', async (req, res) => {
    let book

    try {
        // find the existing book in the DB by the URL parameter id
        book = await Book.findById(req.params.id)

        // Update book fields with values from the submitted form
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description

        // If a new cover image was provided, process and save it
        if (req.body.cover != null && req.body.cover != '') {
            saveCover(book, req.body.cover)
        }

        // Save updated book back to the database
        await book.save()

        // After successful update, redirect to the book's detail page
        res.redirect(`/books/${book.id}`)
    } catch {

        // If the book was found but update/save failed, re-render the 
        // edit page with error flag
        if (book != null) {
            renderEditPage(res, book, true)
        } else {

            // If the book was never found (book is null), redirect to home
            redirect('/')
        }

    }
})

// Delete Book Route
router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.deleteOne()

        // If successful, redirect the client to the books list page
        res.redirect('/books')
    } catch {
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        } else {
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        // Fetch all authors from the database asynchronously
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Book'
            } else {
                params.errorMessage = 'Error Creating Book'
            }
        }
        // Render the 'books/new' view, passing the params which include:
        // 1. the list of authors retrieved from the database
        // 2. the book to be created 
        res.render(`books/${form}`, params)
    } catch {
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

        // Decodes the Base64 string (text form of image data) into binary and 
        // assign it to the book object so that it can be stored or processed 
        // properly in MongoDB
        book.coverImage = Buffer.from(cover.data, 'base64')

        // Store the image MIME type (e.g., 'image/jpeg', 'image/png') in the book.
        book.coverImageType = cover.type
    }
}

module.exports = router