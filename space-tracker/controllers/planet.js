// Load in our Sequelize models and helpers
const { Planet: planetModel, Star } = require('../models')
const { wantsJson, imageFor, saveImage } = require('./respond.js')

// Fields a client is allowed to set on a planet
const fields = (body) => {
  const data = {}
  ;['name', 'size', 'description'].forEach((key) => {
    if (body[key] !== undefined && body[key] !== '') data[key] = body[key]
  })
  return data
}

// Data the form needs for picking related records
const formData = async () => ({ stars: await Star.findAll() })

// Show all resources
const index = async (req, res) => {
  try {
    const planets = await planetModel.findAll({ include: [Star] })
    if (wantsJson(req)) return res.status(200).json(planets)
    res.status(200).render('planets/index.html.twig', { planets })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Show the form to create a new resource
const form = async (req, res) => {
  res.status(200).render('planets/form.html.twig', { planet: {}, ...(await formData()) })
}

// Show the form to edit a resource
const edit = async (req, res) => {
  const planet = await planetModel.findByPk(req.params.id, { include: [Star] })
  if (!planet) return res.status(404).render('404.html.twig')
  res.status(200).render('planets/form.html.twig', { planet, ...(await formData()) })
}

// Show resource
const show = async (req, res) => {
  try {
    const planet = await planetModel.findByPk(req.params.id, { include: [Star] })
    if (!planet) {
      if (wantsJson(req)) return res.status(404).json({ message: 'planet not found' })
      return res.status(404).render('404.html.twig')
    }
    if (wantsJson(req)) return res.status(200).json(planet)
    res.status(200).render('planets/show.html.twig', { planet, image: imageFor('planets', planet.id) })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Create a new resource
const create = async (req, res) => {
  try {
    const planet = await planetModel.create(fields(req.body))
    const starIds = [].concat(req.body.starIds || []).map(Number).filter(Boolean)
    if (req.body.starIds !== undefined) await planet.setStars(starIds)
    saveImage('planets', planet.id, req.file)
    if (wantsJson(req)) return res.status(201).json(await planetModel.findByPk(planet.id, { include: [Star] }))
    res.redirect(303, `/planets/${planet.id}`)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

// Update an existing resource
const update = async (req, res) => {
  try {
    const planet = await planetModel.findByPk(req.params.id)
    if (!planet) return res.status(404).json({ message: 'planet not found' })
    await planet.update(fields(req.body))
    const starIds = [].concat(req.body.starIds || []).map(Number).filter(Boolean)
    if (req.body.starIds !== undefined) await planet.setStars(starIds)
    saveImage('planets', planet.id, req.file)
    if (wantsJson(req)) return res.status(200).json(await planetModel.findByPk(planet.id, { include: [Star] }))
    res.redirect(303, `/planets/${planet.id}`)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

// Remove a single resource
const remove = async (req, res) => {
  try {
    const deleted = await planetModel.destroy({ where: { id: req.params.id } })
    if (!deleted) return res.status(404).json({ message: 'planet not found' })
    if (wantsJson(req)) return res.status(204).end()
    res.redirect(303, '/planets')
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Export all controller actions
module.exports = { index, form, edit, show, create, update, remove }
