let postCollection = require('../db').db().collection('posts');
const ObjectID = require('mongodb').ObjectID;
const User = require('./User');

let Post = function (data, userId, requestedPostId) {
    this.data = data;
    this.userId = userId;
    this.errors = [];
    this.requestedPostId = requestedPostId;
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
            postCollection.insertOne(this.data)
                .then((info) => {
                    resolve(info.ops[0]._id)
                })
                .catch(() => {
                    this.errors.push("Please try again later.")
                     reject(this.errors);
                }
            )
        } else {
            reject(this.errors);
        }
    })

}

Post.prototype.updatePost = function() {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(this.requestedPostId, this.userId)
            if (post.isVisitorOwner) {
                let status = await this.actuallyUpdate()
                resolve(status);
            } else {
                reject();
            }
        } catch {
            reject();
        }
    })
}

Post.prototype.actuallyUpdate = function() {
    return new Promise(async(resolve, reject) => {
        this.cleanUp();
        this.validate();
        if(!this.errors.length) {
            postCollection.findOneAndUpdate({_id: new ObjectID(this.requestedPostId)}, {$set: {title: this.data.title, body: this.data.body}})
            resolve("success")
        } else {
            resolve("failure")
        }
    })
}

Post.reusablePostQuery = function(uniqueOperation, visitorId) {
    return new Promise(async(resolve, reject) => {
        let aggOperations = uniqueOperation.concat([
            {$lookup: {
                from: 'users', 
                localField: 'author', 
                foreignField: '_id',   
                as: 'authorOfTheDocument'
            }},
            {$project: {
                title: 1,
                body: 1,
                data: 1,
                authorId: "$author",
                author: {$arrayElemAt:[
                    "$authorOfTheDocument", 0
                ]}
            }}
        ])

        let posts = await postCollection.aggregate(aggOperations).toArray();

        //clean up author prop in each post object
        posts = posts.map((post) =>{
            post.isVisitorOwner = post.authorId.equals(visitorId);
            post.authorId = undefined;

            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post;
        })
        resolve(posts);
    })
}

Post.findSingleById = function(id, visitorId) {
    return new Promise(async(resolve, reject) => {
        if(typeof(id) != 'string' || !ObjectID.isValid(id)) {
            reject();
            return //to stop the function right here and dont go over
        }
        
        let posts = await Post.reusablePostQuery([
            {$match: {_id: new ObjectID(id)}}
        ], visitorId)

        if (posts.length) {
            resolve(posts[0]);
        } else {
            reject();
        }
    })
}


Post.findByAuthorId = function(author) {
    return Post.reusablePostQuery([
        {$match: {author}},
        {$sort: {data: -1}}
    ])
}

Post.deletePost = function(postIdToDelete, currentUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(postIdToDelete, currentUserId)
            if(post.isVisitorOwner) {
                await postCollection.deleteOne({_id: new ObjectID(postIdToDelete)})
                resolve();
            } else {
                reject()
            }
        }catch{
            reject();
        }
    })
}

Post.search = function(searchTerm) {
    return new Promise (async (resolve, reject) => {
        if(typeof(searchTerm) == 'string') {
            let posts = await Post.reusablePostQuery([
                {$match: {$text: {$search: searchTerm}}},
                {$sort: {score: {$meta: "textScore"}}}
            ])
            resolve(posts);
        }else{
            reject();
        }
    })
}

Post.countPostsByAuthor = function(id) {
    return new Promise(async(resolve, reject) => {
        let postCount = await postCollection.countDocuments({author: id})
        resolve(postCount)
    })
}

module.exports = Post;