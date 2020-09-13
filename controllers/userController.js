const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');

exports.mustBeLogged = (req, res, next) => {
    if(req.session.user) {
        next();
    } else {
        req.flash('errors', 'You must be logged in to perform that action.')
        req.session.save(()=> {
            res.redirect('/');
        })
    }
}

exports.login = (req, res) => {
    let user = new User(req.body);
    user.login()                    //Return a promise
        .then(response => {
            req.session.user = {
                avatar: user.avatar,
                username: user.data.username,
                _id: user.data._id
            }
            req.session.save(() => {
                res.redirect('/')
            })
        })
        .catch(err => {
            req.flash('errors', err)
            req.session.save(() => {
                res.redirect('/')
            })
        })
}

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
}

exports.register = (req, res) => {
    let user = new User(req.body);
    user.register()
        .then(() => {
            req.session.user = {
                avatar: user.avatar,
                username: user.data.username,
                _id: user.data._id
            };
            req.session.save(() => {
                res.redirect('/');
            })
        })
        .catch((regErrors) => {
            regErrors.forEach((error) => {
                req.flash('regErrors', error);
            })
            req.session.save(() => {
                res.redirect('/');
            })
        });
    
}

exports.home = async (req, res) => {
    if (req.session.user) {
        //fetch feed of post for current user
        let posts = await Post.getFeed(req.session.user._id);
        res.render('home-dashboard', {posts})
    } else {
        res.render('home-guest', {regErrors: req.flash('regErrors')})
    }
}

exports.ifUserExists = (req, res, next) => {
    User.findByUsername(req.params.username)
        .then((userDocument)=>{
            req.profileUser = userDocument;
            next()
        }).catch(() => {
            res.render('404');
        })
}

exports.sharedProfileData = async function(req, res, next) {
    let isVisitorsProfile = false
    let isFollowing = false
    if (req.session.user) {
        isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
        isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
    }
  
    req.isVisitorsProfile = isVisitorsProfile
    req.isFollowing = isFollowing

    //retrieve post follower and following counts
    let postCountPromise = Post.countPostsByAuthor(req.profileUser._id)
    let followerCountPromise = Follow.countFollowersById(req.profileUser._id)
    let folloingCountPromise = Follow.countFollowingById(req.profileUser._id)
    let [postCount, followerCount, followingCount] = await Promise.all([postCountPromise, followerCountPromise, folloingCountPromise]);
    
    req.postCount = postCount
    req.followerCount = followerCount
    req.followingCount = followingCount

    next()
}

exports.profilePostsScreen = (req, res) => {
    //ask our post model for post by a certain author
    Post.findByAuthorId(req.profileUser._id)
        .then((posts) => {
            res.render('profile', {
                title: `${req.profileUser.username}`,
                currentPage: 'posts',
                posts: posts,
                profileUsername: req.profileUser.username,
                profileAvatar: req.profileUser.avatar,
                isFollowing: req.isFollowing,
                isVisitorsProfile: req.isVisitorsProfile,
                counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
            })
        }).catch(() => {
            res.render('404')
        })
}

exports.profileFollowersScreen = async (req, res) => {
    try {
        let followers = await Follow.getFollowersById(req.profileUser._id);
        
        res.render('profile-followers', {
            currentPage: 'followers',
            followers: followers,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
        })
    } catch {
        res.render('404');
    }
}

exports.profileFollowingScreen = async (req, res) => {
    try {
        let following = await Follow.getFollowingById(req.profileUser._id);
        res.render('profile-following', {
            currentPage: 'following',
            following: following,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
        })
    } catch {
        res.render('404');
    }
}