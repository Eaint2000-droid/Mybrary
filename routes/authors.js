const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

// All Authors Route
// Handle GET request to '/authors' to list all authors
router.get('/', async (req, res) => {
  // Initialize an empty object to hold search filters
  let searchOptions = {}

  // If the query parameter 'name' exists and is not an empty string
  if (req.query.name != null && req.query.name !== '') {
    // Add a case-insensitive regular expression to match partial text in the 'name' field
    // 'i' is for case-insensitive; can be either UPPERCASE or LOWERCASE
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    // Fetch all authors from the database which matches the searchOptions criteria asynchronously
    const authors = await Author.find(searchOptions)

    // Render the 'authors/index' view, passing:
    // 1. The list of authors retrieved from the database
    // 2. The original search query so it can be displayed back in the search form
    //      --> means that when a user searches for something (e.g.,"Taylor") in the authors search form,
    //          you don’t want the search box to reset to empty after showing results. Instead, you want the search 
    //          form to still display "Taylor" in the input field so the user sees what they searched for.
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
  res.render('authors/new', { author: new Author() })
})

// Create Author Route
// This route would typically receive data from the "new author" form
router.post('/', async (req, res) => {
  // create a new Author instance using data from the submitted form
  const author = new Author({ name: req.body.name })

  try {
    // attempt to save the new Author to the database (asynchronously)
    const newAuthor = await author.save()

    // If successful, redirect the client to the author's id page
    res.redirect(`/authors/${author.id}`)
  } catch (err) {
    // If error (e.g. validation error, DB error, etc...), re-render the form
    // Pass the existing author data to pre-fill the form so that the user doesn't need to enter that name again
    // Pass an errorMessage to show feedback to the user
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    });
  }
});

// Define a GET route that expects a dynamic parameter ":id"
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    // show only 6 books for the specific authors
    const books = await Book.find({ author: author.id }).limit(6).exec()
    // if successful, render the show page by passing these params
    res.render('authors/show', {
      author: author,
      booksByAuthor: books
    })
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})

// Define a GET route for displaying the Edit Form of a specific author defined by a dynamic parameter: id
router.get('/:id/edit', async (req, res) => {
  try {
    // Find the author by ID from the database using the id from the URL params
    const author = await Author.findById(req.params.id)

    // Render the "edit" view and pass the found author data to the view
    res.render('authors/edit', { author: author })
  } catch {
    res.redirect('/authors')
  }
})

// UPDATE ROUTE
router.put('/:id', async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id) // find existing author
    author.name = req.body.name // change the author's name
    await author.save() // save the author in the database

    // If successful, redirect the client to the author's id page
    res.redirect(`/authors/${author.id}`)
  }
  catch (err) {
    if (author == null) {
      res.redirect('/')
    } else {
      res.render('authors/new', {
        author: author,
        errorMessage: 'Error updating Author'
      })
    }
  }
})

// DELETE ROUTE
router.delete('/:id', async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id) // find existing author
    await author.deleteOne() // delete author from the database
    // If successful, redirect the client to the authors list page
    res.redirect(`/authors`)
  }
  catch (err) {
    if (author == null) {
      res.redirect('/')
    } else {
      res.redirect(`/authors/${author.id}`)
    }
  }
})

module.exports = router