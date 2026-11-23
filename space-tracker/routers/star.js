// Load in Express framework and multer for image uploads
const express = require(`express`)
const multer = require('multer')

// Load in our controller/action instances
const starCtlr = require(`../controllers/star.js`)

// Keep uploads in memory; the controller saves them to public/uploads/stars
const upload = multer({ storage: multer.memoryStorage() })

// Create a new Router instance and call it "router"
const router = new express.Router()

// RESTful resource mappings
router.get(`/`, starCtlr.index)
router.post(`/`, upload.single('image'), starCtlr.create)
router.get(`/new`, starCtlr.form)
router.get(`/:id`, starCtlr.show)
router.get(`/:id/edit`, starCtlr.edit)
router.put(`/:id`, upload.single('image'), starCtlr.update)
router.delete(`/:id`, starCtlr.remove)

// HTML forms only support GET and POST, so they post here for update and delete
router.post(`/:id`, upload.single('image'), starCtlr.update)
router.post(`/:id/delete`, starCtlr.remove)

// export "router"
module.exports = router
