const express = require('express')
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const sanitizeHTML = require('sanitize-html')
const csrf = require('csurf');
const app = express();


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

app.use(csrf())

app.use((req, res, next) => {
  res.locals.csrfToken=req.csrfToken()
  next();
})

app.use('/', router);

app.use((err, req, res, next) => {
  if (err) {
    if (err.code == "EBADCSRFTOKEN") {
      req.flash('errors', 'Cross site request forgery detected.')
      req.session.save(() => res.redirect('/'))
    } else {
      res.render('404');
    }
  }
})

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.use((socket, next) => {
    sessionOption(socket.request, socket.request.res, next)
})

io.on('connection', function(socket) {
    if (socket.request.session.user) {
      let user = socket.request.session.user
  
      socket.emit('welcome', {username: user.username, avatar: user.avatar})
  
      socket.on('chatMessageFromBrowser', function(data) {
        socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar})
      })
    }
  })

module.exports = server;