const express = require('express')
const router = express.Router()
const Author = require('../models/author')

// Handle GET request to '/authors' to list all authors
router.get('/', async (req, res) => {
    // Initialize an empty object to hold search filters
    let searchOptions = {}
    // If the query parameter 'name' exists and is not an empty string
    if (req.query.name != null && req.query.name !== ''){
        // Add a case-insensitive regular expression to match partial text in the 'name' field
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        // Fetch all authors from the database asynchronously
        const authors = await Author.find(searchOptions)
        
        // Render the 'authors/index' view, passing:
        // 1. The list of authors retrieved from the database
        // 2. The original search query so it can be displayed back in the search form
        res.render('authors/index', { 
            authors: authors, 
            searchOptions: req.query
        })
    } catch {
        // if there is an error, redirect to the homepage '/'
        res.redirect('/')
    }
})

// New Author Route
// Renders a form where users can input data to create a new author
// e.g. authors/new/...
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author()})
})

// Create Author Route
// This route would typically receive data from the "new author" form
router.post('/', async (req, res) => {
    const author = new Author({ name: req.body.name })
    try {
      const newAuthor = await author.save()
      res.redirect(`authors`) // sends an HTTP redirct to /authors
    } catch (err) {
      res.render('authors/new', {
        author: author,
        errorMessage: 'Error creating Author'
      });
    }
  });
  
module.exports = router