/**
 * The only responsability of this file is to list the
 * routes of the project in order to keep the main server file
 * as clean as possible
*/
const express = require("express");
const router = express.Router();
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
const followController = require('./controllers/followController');

//User controllers route

router.get('/', userController.home);

router.post('/register', userController.register);

router.post('/login', userController.login);

router.post('/logout', userController.logout);

router.post('/doesUsernameExist', userController.doesUsernameExist)

router.post('/doesEmailExist', userController.doesEmailExist)

//profile controller rout
router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostsScreen)

router.get('/profile/:username/followers', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowersScreen)

router.get('/profile/:username/following', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowingScreen)



//Post controller route

router.get('/create-post', userController.mustBeLogged, postController.viewPostScreen);

router.post('/create-post', userController.mustBeLogged, postController.addPost);

router.get('/post/:id', postController.viewSingle);

router.get('/post/:id/edit', userController.mustBeLogged, postController.viewEditScreen);

router.post('/post/:id/edit', userController.mustBeLogged, postController.editPost)

router.post('/post/:id/delete', userController.mustBeLogged, postController.deletePost)

router.post('/search', postController.search)

//follow controller route

router.post('/addFollow/:username', userController.mustBeLogged, followController.addFollow)

router.post('/removeFollow/:username', userController.mustBeLogged, followController.removeFollow)

module.exports = router;