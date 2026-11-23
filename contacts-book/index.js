// Load in our Express framework
const express = require(`express`)

// Create a new Express instance called "app"
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Load in our RESTful routers
const routers = require('./routers/index.js')

// Home page welcome middleware
app.get('/', (req, res) => {
  res
    .status(200)
    .send('Welcome to Star Tracker Library and shared')
})

// Register our RESTful routers with our "app"
app.use(`/planets`,  routers.planet)
app.use(`/stars`,    routers.star)
app.use(`/galaxies`, routers.galaxy)
app.use(`/v1/contacts`, routers.contacts)

// Set our app to listen on port 3000
app.listen(8080)
