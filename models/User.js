const validator = require('validator');

let User = function(data) {
    this.data = data;
    this.errors = [];
}

//SECURITY FUNCTION TO LET USER ENTER IN DATABASE ONLY STRINGS
User.prototype.cleanUp = function() {
    const { username, email, password } = this.data;
    if (typeof(username) != "string") {
        username = '';
    }
    if (typeof(email) != "string") {
        email = '';
    }
    if (typeof(password) != "string") {
        password = '';
    }

    //Get rid of any bogus properties
    this.data = {
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password
    }
}

User.prototype.validate = function() {
    const { username, email, password } = this.data;
    if (username == '') {
        this.errors.push("Provide a username.")
    } 
    if (username != "" && !validator.isAlphanumeric(username)) {
        this.errors.push("Username can only contain alphanumeric characters.")
    }
    if (!validator.isEmail(email)) {
        this.errors.push("Provide a valid email.")
    }
    if (password == '') {
        this.errors.push("Provide a password.")
    }
    if (password.length > 0 && password.length < 8) {
        this.errors.push('Password must be at least 8 characters.')
    }
    if (password.length > 100) {
        this.errors.push("Password cannot exceed 100 characters.")
    }
    if (username.length > 0 && username.length < 3) {
        this.errors.push('Username must be at least 3 characters.')
    }
    if (username.length > 30) {
        this.errors.push("Username cannot exceed 30 characters.")
    }
}

User.prototype.register = function() {
    //Validate user data
    this.cleanUp();
    this.validate();
    //TODO: if no error save data on database
    if(this.errors.length == 0) {
        console.log("all good")
    } else {
        console.log(this.errors);
    }
}

module.exports = User