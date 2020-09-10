const ObjectID = require('mongodb').ObjectID;
const userCollection = require('../db').db().collection('users');
const followCollection = require('../db').db().collection('follows');
const User = require('./User')

let Follow = function(followedUsername, authorId) {
    this.followedUsername = followedUsername;
    this.authorId = authorId;
    this.errors = [];
}

Follow.prototype.cleanUp = function() {
    if(typeof(this.followedUsername) != 'string') {
        this.followedUsername = '';
    } 
}

Follow.prototype.validate = async function(action) {
    //followed user must exist in database
    let followedAccount = await userCollection.findOne({username: this.followedUsername});
    if(followedAccount) {
        this.followedId = followedAccount._id
    } else {
        this.errors.push("You cannot follow a user that does not exist.")
    }
    let doesFollowAlreadyExists = await followCollection.findOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})

    if(action == 'create') {
        if(doesFollowAlreadyExists) {
            this.errors.push('You are already following this user.')
        }
    }

    if(action == 'delete') {
        if(!doesFollowAlreadyExists) {
            this.errors.push('You cannot stop following someone you do not already follow.')
        }
    }

    //avoid possiblity to follow yourself
    if(this.followedId.equals(this.authorId)) {
        this.errors.push('You cannot follow yourself.')
    }
}

Follow.prototype.create = function() {
    return new Promise(async(resolve, rejecet) => {
        this.cleanUp();
        await this.validate('create');
        if(!this.errors.length) {
            await followCollection.insertOne({
                followedId: this.followedId, 
                authorId: new ObjectID(this.authorId)
            })
            resolve()
        } else {
            rejecet(this.errors)
        }
    })
}

Follow.prototype.delete = function() {
    return new Promise(async(resolve, rejecet) => {
        this.cleanUp();
        await this.validate('delete');
        if(!this.errors.length) {
            await followCollection.deleteOne({
                followedId: this.followedId, 
                authorId: new ObjectID(this.authorId)
            })
            resolve()
        } else {
            rejecet(this.errors)
        }
    })
}

Follow.isVisitorFollowing = async function(followedId, visitorId) {
    let followDoc = await followCollection.findOne({followedId: followedId, authorId: new ObjectID(visitorId)})
    if (followDoc) {
        return true
    } else {
        return false
    }
}

Follow.getFollowersById = (id) => {
    return new Promise(async (resolve, rejecet) => {
        try {
            let followers = await followCollection.aggregate([
                {$match: {followedId: id}},
                {$lookup: {from: 'users', localField: 'authorId', foreignField: '_id', as:'userDoc'}},
                {$project: {
                    username: {$arrayElemAt: ['$userDoc.username', 0]},
                    email: {$arrayElemAt: ['$userDoc.email', 0]}
                }}
            ]).toArray();
            
            followers = followers.map((follower) => {
                let user = new User(follower, true);
                return {username: follower.username, avatar: user.avatar}
            });

            resolve(followers);
        } catch {
            rejecet();
        }
    })
}

module.exports = Follow;