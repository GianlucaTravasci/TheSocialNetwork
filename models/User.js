const validator = require('validator');

let User = function(data) {
    this.data = data;
    this.errors = [];
}
User.prototype.validate = function() {
    if (this.data.username == '') {
        this.errors.push("Provide a username.")
    } 
    if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {
        this.errors.push("Username can only contain alphanumeric characters.")
    }
    if (!validator.isEmail(this.data.email)) {
        this.errors.push("Provide a valid email.")
    }
    if (this.data.password == '') {
        this.errors.push("Provide a password.")
    }
    if (this.data.password.length > 0 && this.data.password.length < 8) {
        this.errors.push('Password must be at least 8 characters.')
    }
    if (this.data.password.length > 100) {
        this.errors.push("Password cannot exceed 100 characters.")
    }
    if (this.data.username.length > 0 && this.data.username.length < 3) {
        this.errors.push('Username must be at least 3 characters.')
    }
    if (this.data.username.length > 30) {
        this.errors.push("Username cannot exceed 30 characters.")
    }
}

User.prototype.register = function() {
    //Validate user data
    this.validate();
    //TODO: if no error save data on database
    if(this.errors.length == 0) {
        console.log("all good")
    }
}

module.exports = User