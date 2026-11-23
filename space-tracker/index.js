// Load in our Express framework
const express = require(`express`)

// Load in our Sequelize models
const db = require('./models')

// Create a new Express instance called "app"
const app = express()

// Twig templates live in ./views
app.set('views', __dirname + '/views')
app.set('view engine', 'twig')

// Serve CSS and uploaded images from ./public
app.use(express.static(__dirname + '/public'))

// Parse JSON and form bodies
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Load in our RESTful routers
const routers = require('./routers/index.js')

// Home page welcome middleware
app.get('/', (req, res) => {
  res.status(200).render('home.html.twig')
})

// Register our RESTful routers with our "app"
app.use(`/planets`,  routers.planet)
app.use(`/stars`,    routers.star)
app.use(`/galaxies`, routers.galaxy)

// Anything else is a 404
app.use((req, res) => res.status(404).render('404.html.twig'))

// Wait for MySQL to accept connections, then listen on 8080.
// Tables come from the migrations: npx sequelize-cli db:migrate
const start = async (tries = 20) => {
  try {
    await db.sequelize.authenticate()
    app.listen(8080, () => console.log('Space Tracker API listening on port 8080'))
  } catch (e) {
    if (tries <= 1) throw e
    console.log(`Database not ready (${e.message}), retrying in 3s...`)
    setTimeout(() => start(tries - 1), 3000)
  }
}

if (require.main === module) start()

module.exports = app
