const User = require('../models/User')
const { use } = require('../router')

exports.login = (req, res) => {
    res.send('You are trying to login')
}

exports.logout = () => {
    
}

exports.register = (req, res) => {
    let user = new User(req.body);
    user.register()
}

exports.home = (req, res) => {
    res.render('home-guest')
}