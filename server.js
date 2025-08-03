// Check if the app is NOT running in production mode
if (process.env.NODE_ENV !== 'production') {
    // If not in production, load environment variables from the .env file
    // This makes variables in .env available via process.env
    require('dotenv').config()
}
const express = require('express')// Import Express framework
const app = express() // Create an Express application instance
const expressLayouts = require('express-ejs-layouts') // Import express-ejs-layouts middleware for layout support in EJS

const indexRouter = require('./routes/index')// Import the router from 'routes/index.js' to handle routing

app.set('view engine', 'ejs') // Set EJS as the templating engine
app.set('views', __dirname + '/views') // Set the directory for EJS view files
app.set('layout', 'layouts/layout') // Set the default layout file for EJS layouts under ./views/layouts/

app.use(expressLayouts) // Enable express-ejs-layouts middleware
app.use(express.static('public')) // Serve static files (like CSS, images, JS) from the 'public' folder

const mongoose = require('mongoose') // Import mongoose 
mongoose.connect(process.env.DATABASE_URL) //Set up connection for database
const db = mongoose.connection // Get the default Mongoose connection object

// Set up an event listener for connection errors
// If there's an error while connecting to MongoDB, log it to the console
db.on('error', error => console.log(error))

// Set up a one-time event listener for the 'open' event
// This runs once when the connection is successfully established
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)// Mount the imported router to handle all routes starting with '/'

app.listen(process.env.PORT || 3000)// Start the server on the specified environment port or default to 3000
