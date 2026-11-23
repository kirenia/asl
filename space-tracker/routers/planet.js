// Load in Express framework and multer for image uploads
const express = require(`express`)
const multer = require('multer')

// Load in our controller/action instances
const planetCtlr = require(`../controllers/planet.js`)

// Keep uploads in memory; the controller saves them to public/uploads/planets
const upload = multer({ storage: multer.memoryStorage() })

// Create a new Router instance and call it "router"
const router = new express.Router()

// RESTful resource mappings
router.get(`/`, planetCtlr.index)
router.post(`/`, upload.single('image'), planetCtlr.create)
router.get(`/new`, planetCtlr.form)
router.get(`/:id`, planetCtlr.show)
router.get(`/:id/edit`, planetCtlr.edit)
router.put(`/:id`, upload.single('image'), planetCtlr.update)
router.delete(`/:id`, planetCtlr.remove)

// HTML forms only support GET and POST, so they post here for update and delete
router.post(`/:id`, upload.single('image'), planetCtlr.update)
router.post(`/:id/delete`, planetCtlr.remove)

// export "router"
module.exports = router
