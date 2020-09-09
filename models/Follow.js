const ObjectID = require('mongodb').ObjectID;
const userCollection = require('../db').db().collection('users');
const followCollection = require('../db').db().collection('follows');

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

Follow.prototype.validate = async function() {
    //followed user must exist in database
    let followedAccount = await userCollection.findOne({username: this.followedUsername});
    if(followedAccount) {
        this.followdId = followedAccount._id
    } else {
        this.errors.push("You cannot follow a user that does not exist.")
    }
}

Follow.prototype.create = function() {
    return new Promise(async(resolve, rejecet) => {
        this.cleanUp();
        await this.validate();
        if(!this.errors.length) {
            await followCollection.insertOne({
                followdId: this.followdId, 
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
    console.log(followDoc)
    if (followDoc) {
        return true
    } else {
        return false
    }
}

module.exports = Follow;