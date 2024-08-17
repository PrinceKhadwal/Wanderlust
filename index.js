const express = require('express')
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const path = require("path");
const Listing = require("./models/listing");
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const app = express()
const port = 3000

main().then(res => console.log('MongoDB connected'))
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

//show home route -----working well
app.get('/', async (req,res) => {
  let allListing = await Listing.find({})
  res.render('home.ejs', { allListing })
})

//show index[all] route -----working well
app.get('/listing', async (req, res) => {
  let allListing = await Listing.find({})
  res.render('index.ejs', { allListing })
})

//show create new list route  -----working well
app.get('/listing/new', (req, res) => {
  res.render('createList.ejs')
})

//show edit list route --------working well
app.get('/listing/:id/edit', async (req,res)=>{
  let list = await Listing.find({ _id: req.params.id })
  res.render('edit.ejs', {list})
})

// show individual list route ------working well
app.get('/listing/:id', async (req, res) => {
  let list = await Listing.find({ _id: req.params.id })
  res.render('showRoute.ejs', { list })
})

// creating new list route ----working well
app.post('/listing', async  (req, res) => {
  const list =  new Listing({
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    price: req.body.price,
    location: req.body.location,
    country: req.body.country,
  })
  await list.save();
  res.redirect('/listing')
})

//update list route ----working well
app.put('/listing/:id', async (req, res) => {
  await Listing.findByIdAndUpdate( req.params.id , {
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    price: req.body.price,
    location: req.body.location,
    country: req.body.country,
  })
  res.redirect('/listing')
})

//delete list -----working well
app.delete('/listing/:id', async (req, res) => {
  await Listing.findByIdAndDelete({ _id: req.params.id })
  res.redirect('/listing')
})

//Page not found
app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page not found'))
})  

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})