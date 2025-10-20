// Check if the app is NOT running in production mode
if (process.env.NODE_ENV !== 'production') {
    // If not in production, load environment variables from the .env file
    // This makes variables in .env available via process.env
    require('dotenv').config()
}

const express = require('express')// Import Express framework
const app = express() // Create an Express application instance
const expressLayouts = require('express-ejs-layouts') // Import express-ejs-layouts middleware for layout support in EJS
const bodyParser = require('body-parser') // Import the body-parser module to parse incoming request bodies
const methodOverride = require('method-override') // Import the method-override library to enable overriding HTTP verbs (e.g. use PUT/DELETE via forms)

// Import the routers to handle routing
const indexRouter = require('./routes/index') 
const authorRouter = require('./routes/authors') 
const bookRouter = require('./routes/books') 

app.set('view engine', 'ejs') // Set EJS as the templating engine
app.set('views', __dirname + '/views') // Set the directory for EJS view files
app.set('layout', 'layouts/layout') // Set the default layout file for EJS layouts under ./views/layouts/ folder

app.use(expressLayouts) // Enable express-ejs-layouts middleware
app.use(methodOverride('_method')) // Allow override using a query param or a hidden input named "_method"
app.use(express.static('public')) // Serve static files (like CSS, images, JS) from the 'public' folder
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false })) // Parse URL-encoded form data up to 10MB

const mongoose = require('mongoose') // Import mongoose 
mongoose.connect(process.env.DATABASE_URL) //Set up connection for database
const db = mongoose.connection // Get the default Mongoose connection object

// Set up an event listener for connection errors
// If there's an error while connecting to MongoDB, print it out to the console
db.on('error', error => console.error(error))

// Set up a one-time event listener for the 'open' event
// This runs once when the connection is successfully established
// Run only once when we open up the database for the first time
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter) // Mount the imported router to handle all routes starting with '/'
app.use('/authors', authorRouter) // Every route inside our author router will be prepended by the '/authors'
app.use('/books', bookRouter)

app.listen(process.env.PORT || 3000)// Start the server on the specified environment port or default to 3000
