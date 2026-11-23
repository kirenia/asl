// Load in Express framework and multer for image uploads
const express = require(`express`)
const multer = require('multer')

// Load in our controller/action instances
const galaxyCtlr = require(`../controllers/galaxy.js`)

// Keep uploads in memory; the controller saves them to public/uploads/galaxies
const upload = multer({ storage: multer.memoryStorage() })

// Create a new Router instance and call it "router"
const router = new express.Router()

// RESTful resource mappings
router.get(`/`, galaxyCtlr.index)
router.post(`/`, upload.single('image'), galaxyCtlr.create)
router.get(`/new`, galaxyCtlr.form)
router.get(`/:id`, galaxyCtlr.show)
router.get(`/:id/edit`, galaxyCtlr.edit)
router.put(`/:id`, upload.single('image'), galaxyCtlr.update)
router.delete(`/:id`, galaxyCtlr.remove)

// HTML forms only support GET and POST, so they post here for update and delete
router.post(`/:id`, upload.single('image'), galaxyCtlr.update)
router.post(`/:id/delete`, galaxyCtlr.remove)

// export "router"
module.exports = router
