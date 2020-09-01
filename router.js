/**
 * The only responsability of this file is to list the
 * routes of the project in order to keep the main server file
 * as clean as possible
*/
const express = require("express");
const router = express.Router();
const userController = require('./controllers/userController')

router.get('/', userController.home)

router.post('/register', userController.register)

router.post('/login', userController.login)

router.post('/logout', userController.logout)

router.post('/create-post', userController.createPost)

module.exports = router;