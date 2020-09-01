const express = require('express')
const router = require('./router');
const app = express()

app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')

//PAGES OF THE APPLICATION
app.use('/', router);
app.use('/sample', router)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Check in http://localhost:3000/`)
})