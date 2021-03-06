const validator = require('validator');
const bcrypt = require('bcryptjs');
const md5 = require('md5');
let usersCollection = require('../db').db().collection('users');

let User = function(data, getAvatar) {
    this.data = data;
    this.errors = [];
    if(getAvatar == undefined) {
        getAvatar = false;
    }
    if(getAvatar) {
        this.getAvatar();
    }
}

//SECURITY FUNCTION TO LET USER ENTER IN DATABASE ONLY STRINGS
User.prototype.cleanUp = function() {
    let { username, email, password } = this.data;
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

//VALIDATION IN THE REGISTRATION PHASE
User.prototype.validate = function() {
    return new Promise(async (resolve, reject) => {
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
        if (password.length > 50) {
            this.errors.push("Password cannot exceed 50 characters.")
        }
        if (username.length > 0 && username.length < 3) {
            this.errors.push('Username must be at least 3 characters.')
        }
        if (username.length > 30) {
            this.errors.push("Username cannot exceed 30 characters.")
        }
    
        //if username is valid chack if is already taken from another dude
        if (username.length > 2 && username.length <32 && validator.isAlphanumeric(username)) {
            let usernameExists = await usersCollection.findOne({username});
            if (usernameExists) {
                this.errors.push("That username already exists.")
            }
        }
    
        //if email is valid chack if is already taken from another dude
        if (validator.isEmail(email)) {
            let emailExists = await usersCollection.findOne({email});
            if (emailExists) {
                this.errors.push("That email is already been used.")
            }
        }
        resolve()
    })
}

User.prototype.register = function() {
    return new Promise(async (resolve, reject) => {
        //Validate user data
        this.cleanUp();
        await this.validate();
        //if no error save data on database
        if(!this.errors.length) {
            //hash userpassword
            let salt = bcrypt.genSaltSync(10);
            this.data.password = bcrypt.hashSync(this.data.password, salt);
            await usersCollection.insertOne(this.data);
            this.getAvatar();
            resolve();
        } else {
            reject(this.errors)
        }
    })
}

User.prototype.login = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp();
        const { username, password} = this.data;
        usersCollection.findOne({username})
            .then((attemptedUser) => {
                if (attemptedUser && bcrypt.compareSync(password, attemptedUser.password)){
                    this.data=attemptedUser;
                    this.getAvatar()
                    resolve("Logged In");
                } else {
                    reject("Invalid Credential");
                }
            })
            .catch(err => {
                reject("Please try again later.");
            })
    })
}

User.prototype.getAvatar = function() {
    this.avatar = `https://www.gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

User.findByUsername = function(username) {
    return new Promise((resolve, reject) => {
        if(typeof(username) != 'string') {
            reject()
            return
        }
        usersCollection.findOne({username})
            .then((userDoc) => {
                if(userDoc) {
                    userDoc = new User(userDoc, true);
                    userDoc = {
                        _id: userDoc.data._id,
                        username: userDoc.data.username,
                        avatar: userDoc.avatar
                    }
                    resolve(userDoc);
                } else {
                    reject();
                }
            }).catch(() => {
                reject()
            })
    })
}

User.doesEmailExist = (email) => {
    return new Promise(async (resolve, reject) => {
        if(typeof(email) != 'string') {
            resolve(false)
            return
        }

        let user = await usersCollection.findOne({email})
        if(user) {
            resolve(true);
        } else {
            resolve(false);
        }
    })
}


module.exports = User;