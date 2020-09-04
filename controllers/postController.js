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

exports.viewSingle = async(req, res) => {
    try {
        let post = await Post.findSingleById(req.params.id)
        res.render('post-single', {post})
    } catch {
        res.render('404'); 
    }
}