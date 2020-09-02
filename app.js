const express = require('express')
const router = require('./router');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const app = express();

let sessionOption = session({
    secret: "JS is cool",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true} //here im setting a session that is actually stay up for an entire day
});

app.use(sessionOption);
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.set('views', 'views');
app.set('view engine', 'ejs');

//PAGES OF THE APPLICATION
app.use('/', router);
app.use('/register', router);
app.use('/login', router);
app.use('/logout', router);

module.exports = app;