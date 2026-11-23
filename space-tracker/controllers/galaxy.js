// Load in our Sequelize models and helpers
const { Galaxy: galaxyModel, Star } = require('../models')
const { wantsJson, imageFor, saveImage } = require('./respond.js')

// Fields a client is allowed to set on a galaxy
const fields = (body) => {
  const data = {}
  ;['name', 'size', 'description'].forEach((key) => {
    if (body[key] !== undefined && body[key] !== '') data[key] = body[key]
  })
  return data
}

// Data the form needs for picking related records
const formData = async () => ({})

// Show all resources
const index = async (req, res) => {
  try {
    const galaxies = await galaxyModel.findAll({ include: [Star] })
    if (wantsJson(req)) return res.status(200).json(galaxies)
    res.status(200).render('galaxies/index.html.twig', { galaxies })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Show the form to create a new resource
const form = async (req, res) => {
  res.status(200).render('galaxies/form.html.twig', { galaxy: {}, ...(await formData()) })
}

// Show the form to edit a resource
const edit = async (req, res) => {
  const galaxy = await galaxyModel.findByPk(req.params.id, { include: [Star] })
  if (!galaxy) return res.status(404).render('404.html.twig')
  res.status(200).render('galaxies/form.html.twig', { galaxy, ...(await formData()) })
}

// Show resource
const show = async (req, res) => {
  try {
    const galaxy = await galaxyModel.findByPk(req.params.id, { include: [Star] })
    if (!galaxy) {
      if (wantsJson(req)) return res.status(404).json({ message: 'galaxy not found' })
      return res.status(404).render('404.html.twig')
    }
    if (wantsJson(req)) return res.status(200).json(galaxy)
    res.status(200).render('galaxies/show.html.twig', { galaxy, image: imageFor('galaxies', galaxy.id) })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Create a new resource
const create = async (req, res) => {
  try {
    const galaxy = await galaxyModel.create(fields(req.body))

    saveImage('galaxies', galaxy.id, req.file)
    if (wantsJson(req)) return res.status(201).json(await galaxyModel.findByPk(galaxy.id, { include: [Star] }))
    res.redirect(303, `/galaxies/${galaxy.id}`)
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

    saveImage('galaxies', galaxy.id, req.file)
    if (wantsJson(req)) return res.status(200).json(await galaxyModel.findByPk(galaxy.id, { include: [Star] }))
    res.redirect(303, `/galaxies/${galaxy.id}`)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

// Remove a single resource
const remove = async (req, res) => {
  try {
    const deleted = await galaxyModel.destroy({ where: { id: req.params.id } })
    if (!deleted) return res.status(404).json({ message: 'galaxy not found' })
    if (wantsJson(req)) return res.status(204).end()
    res.redirect(303, '/galaxies')
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Export all controller actions
module.exports = { index, form, edit, show, create, update, remove }
