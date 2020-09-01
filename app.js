const express = require('express')
const router = require('./router');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.set('views', 'views');
app.set('view engine', 'ejs');

//PAGES OF THE APPLICATION
app.use('/', router);
app.use('/register', router);
app.use('/login', router);

module.exports = app;