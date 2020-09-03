const validator = require('validator');
const md5 = require('md5');
let postCollection = require('../db').db().collection('posts');

let Post = function (data) {
    this.data = data;
    this.errors = [];
}

/*Post.prototype.addPostToDatabase = function() {
    return new Promise(async(resolve, reject) => {
        console.log('nothing to see here')
    })

}*/

Post.prototype.getAvatar = function() {
    this.avatar = `https://www.gravatar.com/avatar/${md5(this.data.email)}?s=128`
}
