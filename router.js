/**
 * The only responsability of this file is to list the
 * routes of the project in order to keep the main server file
 * as clean as possible
*/

const express = require("express");
const router = express.Router();

router.get('/', (req, res) =>{
    res.render('home-guest');
})

router.get('/sample', (req, res) => {
    res.send('Welcome to the about page!')
})

module.exports = router;