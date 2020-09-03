const Post = require('../models/Post');

exports.addPost = (req, res) => {
    res.send(req.body.title)
}

exports.viewPostScreen = (req, res) => {
    res.render('create-post', {username: req.session.user.username, avatar: req.session.user.avatar});
}