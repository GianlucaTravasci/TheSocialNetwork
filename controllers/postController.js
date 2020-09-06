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
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        res.render('post-single', {post})
    } catch {
        res.render('404'); 
    }
}

exports.viewEditScreen = async(req, res) => {
    try{
        let post = await Post.findSingleById(req.params.id)
        res.render('edit-post', {post})
    } catch {
        res.render('404');
    }
}

exports.editPost = (req, res) => {
    let post = new Post(req.body, req.visitorId, req.params.id);
    post.updatePost()
        .then((status) => {
            //the post was succesfully update in the database
            //or the user did have permissions but there were validation errors
            if(status == "success") {
                req.flash("success", "Post succesfully updated");
                req.session.save(() => {
                    res.redirect(`/post/${req.params.id}/edit`)
                })
            } else {
                post.errors.forEach(err => {
                    req.flash('errors', err);
                })
                req.session.save(() => {
                    req.redirect(`/post/${req.params.id}/edit`)
                })
            }
        })
        .catch(() => {
            //post with id that doesnt exist
            //or if the current visitor is not hte owner of the post
            req.flash("errors", "You do not have the permission to perform that action.")
            req.session.save(() => {
                res.redirect('/');
            })
        })
}