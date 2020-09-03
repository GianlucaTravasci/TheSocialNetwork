const validator = require('validator');
const md5 = require('md5');

let Post = function (data) {
    this.data = data;
    this.errors = [];
}

Post.prototype.getAvatar = function() {
    this.avatar = `https://www.gravatar.com/avatar/${md5(this.data.email)}?s=128`
}
