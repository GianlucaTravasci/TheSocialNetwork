let postCollection = require('../db').db().collection('posts');
const ObjectID = require('mongodb').ObjectID;

let Post = function (data, userId) {
    this.data = data;
    this.userId = userId;
    this.errors = [];
}

Post.prototype.cleanUp = function() {
    let { title, body } = this.data;
    if(typeof(title) != 'string') { title = '' };
    if(typeof(body) != 'string') { body = '' };

    //Get rid of any bogus properties
    this.data = {
        title: title.trim(),
        body: body.trim(),
        data: new Date(),
        author: ObjectID(this.userId)
    }
}

Post.prototype.validate = function() {
    let { title, body } = this.data;
    if (title == '') { this.errors.push('Provide a title to your post.') }
    if (body == '') { this.errors.push('Write something the text area.')}
}

Post.prototype.addPost = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp();
        this.validate();
        if(!this.errors.length) {
            postCollection.insertOne(this.data).then(() => {
                resolve()
            })
            .catch(() => {
                this.errors.push("Please try again later.")
                reject(this.errors);
            })
        } else {
            reject(this.errors);
        }
    })

}

Post.findSingleById = function(id) {
    return new Promise(async(resolve, reject) => {
        if(typeof(id) != 'string' || !ObjectID.isValid(id)) {
            reject();
            return //to stop the function right here and dont go over
        }
        let post = await postCollection.findOne({ _id: new ObjectID(id) })
        if (post) {
            resolve(post);
        } else {
            reject();
        }
    })
}

module.exports = Post;