const Post = require('../models/Post');

exports.viewPostScreen = (req, res) => {
    res.render('create-post');
}

exports.addPost = function(req, res) {
    let post = new Post(req.body, req.session.user._id)
    post.addPost().then(function(newId) {
        req.flash("success", "New post succeddfully created.")
        req.session.save(() => res.redirect(`/post/${newId}`))
    }).catch(function(errors) {
        errors.forEach((error) => {req.flash("errors", error)})
        req.session.save(() => res.redirect("/create-post"))
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
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        if (post.isVisitorOwner) {
            res.render('edit-post', {post})
        } else {
            req.flash("errors", "You do not have the permission to perform that action.")
            res.session.save(() => {
                res.redirect('/')
            })
        }
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

exports.deletePost = function(req, res) {
    Post.deletePost(req.params.id, req.visitorId)
        .then(() => {
            req.flash('success', 'Post successfully deleted.');
            req.session.save(() => {
                res.redirect(`/profile/${req.session.user.username}`)
            })
        }) 
        .catch(() => {
            req.flash('error', 'You do not have the permission to perform that action.')
            req.session.save(() => {
                res.redirect('/');
            })
        })
}