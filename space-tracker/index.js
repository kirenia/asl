// Load in our Express framework
const express = require(`express`)

// Load in our Sequelize models
const db = require('./models')

// Create a new Express instance called "app"
const app = express()

// Parse JSON and form bodies
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Load in our RESTful routers
const routers = require('./routers/index.js')

// Home page welcome middleware
app.get('/', (req, res) => {
  res
    .status(200)
    .send('Welcome to Star Tracker Library')
})

// Register our RESTful routers with our "app"
app.use(`/planets`,  routers.planet)
app.use(`/stars`,    routers.star)
app.use(`/galaxies`, routers.galaxy)

// Anything else is a 404
app.use((req, res) => res.status(404).json({ message: 'Not found.' }))

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
