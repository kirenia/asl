// Load in our Sequelize models
const { Galaxy: galaxyModel, Star } = require('../models')

// Fields a client is allowed to set on a galaxy
const fields = (body) => {
  const data = {}
  ;['name', 'size', 'description'].forEach((key) => {
    if (body[key] !== undefined) data[key] = body[key]
  })
  return data
}

// Show all resources
const index = async (req, res) => {
  try {
    const galaxies = await galaxyModel.findAll({ include: [Star] })
    // Respond with an array and 2xx status code
    res.status(200).json(galaxies)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Show resource
const show = async (req, res) => {
  try {
    const galaxy = await galaxyModel.findByPk(req.params.id, { include: [Star] })
    if (!galaxy) return res.status(404).json({ message: 'galaxy not found' })
    // Respond with a single object and 2xx code
    res.status(200).json(galaxy)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Create a new resource
const create = async (req, res) => {
  try {
    const galaxy = await galaxyModel.create(fields(req.body))

    // Respond with the new resource and a 201 code
    res.status(201).json(await galaxyModel.findByPk(galaxy.id, { include: [Star] }))
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

// Update an existing resource
const update = async (req, res) => {
  try {
    const galaxy = await galaxyModel.findByPk(req.params.id)
    if (!galaxy) return res.status(404).json({ message: 'galaxy not found' })
    await galaxy.update(fields(req.body))

    // Respond with a single resource and 2xx code
    res.status(200).json(await galaxyModel.findByPk(galaxy.id, { include: [Star] }))
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

// Remove a single resource
const remove = async (req, res) => {
  try {
    const deleted = await galaxyModel.destroy({ where: { id: req.params.id } })
    if (!deleted) return res.status(404).json({ message: 'galaxy not found' })
    // Respond with a 2xx status code
    res.status(204).end()
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Export all controller actions
module.exports = { index, show, create, update, remove }
