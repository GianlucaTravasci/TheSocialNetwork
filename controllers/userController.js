const User = require('../models/User');
const { response } = require('../app');

exports.login = (req, res) => {
    let user = new User(req.body);
    user.login()
        .then(response => {
            res.send(response)
        })
        .catch(err => {
            res.send(err)
        })
}

exports.logout = () => {
    
}

exports.register = (req, res) => {
    let user = new User(req.body);
    user.register();
    if (user.errors.length) {
        res.send.errors;
    } else {
        res.send("register success!")
    }
}

exports.home = (req, res) => {
    res.render('home-guest')
}