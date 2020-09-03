const Post = require('../models/Post');

exports.viewPostScreen = (req, res) => {
    res.render('create-post', {avatar: req.session.user.avatar});
}