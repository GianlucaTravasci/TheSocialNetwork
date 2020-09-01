exports.login = (req, res) => {
    res.send('You are trying to login')
}

exports.logout = () => {
    
}

exports.register = (req, res) => {
    res.send('You are trying to register.')
}

exports.home = (req, res) => {
    res.render('home-guest')
}