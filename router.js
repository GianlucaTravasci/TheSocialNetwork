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

//profile controller rout
router.get('/profile/:username', userController.ifUserExists, userController.profilePostsScreen)

//Post controller route

router.get('/create-post', userController.mustBeLogged, postController.viewPostScreen);

router.post('/create-post', userController.mustBeLogged, postController.addPost);

router.get('/post/:id', postController.viewSingle);

router.get('/post/:id/edit', userController.mustBeLogged, postController.viewEditScreen);

router.post('/post/:id/edit', userController.mustBeLogged, postController.editPost)

router.post('/post/:id/delete', userController.mustBeLogged, postController.deletePost)

router.post('/search', postController.search)

module.exports = router;