const express = require('express')
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require('ejs-mate')
const Listing = require("./models/listing");
const ExpressError = require('./utils/ExpressError')
const listing = require('./routes/listing')
const session = require('express-session')
const flash = require('connect-flash')
const app = express()
const port = 3000

main().then(res => console.log('DB connected'))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}



app.engine('ejs', ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(methodOverride("_method"));



const sessionOptions = {
  secret : 'mySuperSecret', 
  resave : false,
  saveUninitialized : true,
}

app.use(session(sessionOptions))
app.use(flash())
app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})

app.use('/listing', listing)

//show home route -----working well
app.get('/', async (req,res) => {
  let allListing = await Listing.find({})
  res.render('home.ejs', { allListing })
})

//Page not found
app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page not found'))
})  

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})