const express = require('express')
// creates a route handler object
const router = express.Router()

// render the 'index.ejs' view when a GET request is made to the root path of this router
router.get('/', (req, res) => {
    res.render('index')
})

// makes this router available for use in other files
module.exports = router