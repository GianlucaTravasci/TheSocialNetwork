/**
 * The only responsability of this file is to list the
 * routes of the project in order to keep the main server file
 * as clean as possible
*/
const express = require("express");
const router = express.Router();
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');

//User controllers route

router.get('/', userController.home);

router.post('/register', userController.register);

router.post('/login', userController.login);

router.post('/logout', userController.logout);

//Post controller route

router.get('/create-post', postController.viewPostScreen)

module.exports = router;