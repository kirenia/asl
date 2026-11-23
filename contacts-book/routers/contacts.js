// Load in Express framework
const express = require(`express`)

// Load in our controller/action instances
const contactsCtlr = require(`../controllers/contacts.js`)

// Create a new Router instance and call it "router"
const router = new express.Router()

// RESTful resource mappings
router.get(`/`, contactsCtlr.index)
router.post(`/`, contactsCtlr.create)
router.get(`/:id`, contactsCtlr.show) 
router.put(`/:id`, contactsCtlr.update) 
router.delete(`/:id`, contactsCtlr.remove) 

// export "router"
module.exports = router