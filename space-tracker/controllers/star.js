// Load in our Sequelize models
const { Star: starModel, Galaxy, Planet } = require('../models')

// Fields a client is allowed to set on a star
const fields = (body) => {
  const data = {}
  ;['name', 'size', 'description', 'galaxyId'].forEach((key) => {
    if (body[key] !== undefined) data[key] = body[key]
  })
  return data
}

// Show all resources
const index = async (req, res) => {
  try {
    const stars = await starModel.findAll({ include: [Galaxy, Planet] })
    // Respond with an array and 2xx status code
    res.status(200).json(stars)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Show resource
const show = async (req, res) => {
  try {
    const star = await starModel.findByPk(req.params.id, { include: [Galaxy, Planet] })
    if (!star) return res.status(404).json({ message: 'star not found' })
    // Respond with a single object and 2xx code
    res.status(200).json(star)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Create a new resource
const create = async (req, res) => {
  try {
    const star = await starModel.create(fields(req.body))
    if (Array.isArray(req.body.planetIds)) await star.setPlanets(req.body.planetIds)
    // Respond with the new resource and a 201 code
    res.status(201).json(await starModel.findByPk(star.id, { include: [Galaxy, Planet] }))
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

// Update an existing resource
const update = async (req, res) => {
  try {
    const star = await starModel.findByPk(req.params.id)
    if (!star) return res.status(404).json({ message: 'star not found' })
    await star.update(fields(req.body))
    if (Array.isArray(req.body.planetIds)) await star.setPlanets(req.body.planetIds)
    // Respond with a single resource and 2xx code
    res.status(200).json(await starModel.findByPk(star.id, { include: [Galaxy, Planet] }))
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

// Remove a single resource
const remove = async (req, res) => {
  try {
    const deleted = await starModel.destroy({ where: { id: req.params.id } })
    if (!deleted) return res.status(404).json({ message: 'star not found' })
    // Respond with a 2xx status code
    res.status(204).end()
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Export all controller actions
module.exports = { index, show, create, update, remove }
