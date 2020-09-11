const express = require('express')
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let sessionOption = session({
    secret: "JS is cool",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true} //here im setting a session that is actually stay up for an entire day
});

app.use(flash())
app.use(sessionOption);
app.use((req, res, next)=>{
    //make all flash stuff availables for all pages
    res.locals.errors = req.flash('errors')
    res.locals.success = req.flash('success');

    //make current user id available on the req object
    if(req.session.user){
        req.visitorId = req.session.user._id
    } else {
        req.visitorId= 0;
    }
    // make user session date available from within view templates
    res.locals.user = req.session.user
    next();
})
const router = require('./router');
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());


app.set('views', 'views');
app.set('view engine', 'ejs');

app.use('/', router);

io.on('connection', (socket) => {
    socket.on('chatMessageFromBrowser', (data) => {
        io.emit('chatMessageFromServer', {message: data.message})
    })
})

module.exports = server;