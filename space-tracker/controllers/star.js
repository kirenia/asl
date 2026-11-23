// Load in our Sequelize models and helpers
const { Star: starModel, Galaxy, Planet } = require('../models')
const { wantsJson, imageFor, saveImage } = require('./respond.js')

// Fields a client is allowed to set on a star
const fields = (body) => {
  const data = {}
  ;['name', 'size', 'description', 'galaxyId'].forEach((key) => {
    if (body[key] !== undefined && body[key] !== '') data[key] = body[key]
  })
  return data
}

// Data the form needs for picking related records
const formData = async () => ({ galaxies: await Galaxy.findAll(), planets: await Planet.findAll() })

// Show all resources
const index = async (req, res) => {
  try {
    const stars = await starModel.findAll({ include: [Galaxy, Planet] })
    if (wantsJson(req)) return res.status(200).json(stars)
    res.status(200).render('stars/index.html.twig', { stars })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Show the form to create a new resource
const form = async (req, res) => {
  res.status(200).render('stars/form.html.twig', { star: {}, ...(await formData()) })
}

// Show the form to edit a resource
const edit = async (req, res) => {
  const star = await starModel.findByPk(req.params.id, { include: [Galaxy, Planet] })
  if (!star) return res.status(404).render('404.html.twig')
  res.status(200).render('stars/form.html.twig', { star, ...(await formData()) })
}

// Show resource
const show = async (req, res) => {
  try {
    const star = await starModel.findByPk(req.params.id, { include: [Galaxy, Planet] })
    if (!star) {
      if (wantsJson(req)) return res.status(404).json({ message: 'star not found' })
      return res.status(404).render('404.html.twig')
    }
    if (wantsJson(req)) return res.status(200).json(star)
    res.status(200).render('stars/show.html.twig', { star, image: imageFor('stars', star.id) })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Create a new resource
const create = async (req, res) => {
  try {
    const star = await starModel.create(fields(req.body))
    const planetIds = [].concat(req.body.planetIds || []).map(Number).filter(Boolean)
    if (req.body.planetIds !== undefined) await star.setPlanets(planetIds)
    saveImage('stars', star.id, req.file)
    if (wantsJson(req)) return res.status(201).json(await starModel.findByPk(star.id, { include: [Galaxy, Planet] }))
    res.redirect(303, `/stars/${star.id}`)
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
    const planetIds = [].concat(req.body.planetIds || []).map(Number).filter(Boolean)
    if (req.body.planetIds !== undefined) await star.setPlanets(planetIds)
    saveImage('stars', star.id, req.file)
    if (wantsJson(req)) return res.status(200).json(await starModel.findByPk(star.id, { include: [Galaxy, Planet] }))
    res.redirect(303, `/stars/${star.id}`)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

// Remove a single resource
const remove = async (req, res) => {
  try {
    const deleted = await starModel.destroy({ where: { id: req.params.id } })
    if (!deleted) return res.status(404).json({ message: 'star not found' })
    if (wantsJson(req)) return res.status(204).end()
    res.redirect(303, '/stars')
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// Export all controller actions
module.exports = { index, form, edit, show, create, update, remove }
