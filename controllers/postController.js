const Post = require('../models/Post');

exports.viewPostScreen = (req, res) => {
    res.render('create-post', {username: req.session.user.username, avatar: req.session.user.avatar});
}

exports.addPost = (req, res) => {
    let post = new Post(req.body, req.session.user._id)
    post.addPost().then(() => {
        res.send('post created')
    }).catch((err) => {
        res.send(err);
    })
}