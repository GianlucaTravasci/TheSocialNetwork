const Post = require('../models/Post');

exports.viewPostScreen = (req, res) => {
    res.render('create-post');
}

exports.addPost = (req, res) => {
    let post = new Post(req.body, req.session.user._id)
    post.addPost().then(() => {
        res.send('post created')
    }).catch((err) => {
        res.send(err);
    })
}

exports.viewSingle = (req, res) => {
    res.render('post')
}