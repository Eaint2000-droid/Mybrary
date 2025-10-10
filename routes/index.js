const express = require('express')
const router = express.Router()
const Book = require('../models/book')

// render the 'index.ejs' view when a GET request is made to the root path of this router
router.get('/', async (req, res) => {
    let books = []
    try{
        // query for the top 10 most recently created books
        books = await Book.find().sort({createdAt: 'desc'}).limit(10).exec()
    } catch{
        books = []
    }

    res.render('index', { books: books })
})

// makes this router available for use in other files
module.exports = router