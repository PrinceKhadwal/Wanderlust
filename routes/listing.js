const express = require('express')
const router = express.Router()
const Listing = require("../models/listing");
const Review = require("../models/review");
const { listingSchema, reviewSchema } = require('../schema')
const ExpressError = require('../utils/ExpressError')

// const validateListing = (req, res, next) => {
//     let {error} = listingSchema.validate(req.body);
  
//     if(error) {
//       throw  new ExpressError(404)
//     }
//     else{
//       next()
//     }  
//   }
  
  const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
  
    if(error) {
      let errMsg = error.details.map((el) => el.message.join(','))
      throw new ExpressError(404, errMsg)
    }
    else  next()
  }

//show index[all] route -----working well
router.get('/', async (req, res) => {
    let allListing = await Listing.find({})
    res.render('index.ejs', { allListing })
  })
  
  //show create new list route  -----working well
  router.get('/new', (req, res) => {
    res.render('createList.ejs')
  })
  
  //show edit list route --------working well
  router.get('/:id/edit', async (req,res)=>{
    let list = await Listing.find({ _id: req.params.id })
    res.render('edit.ejs', {list})
  })
  
  // show individual list route ------working well
  router.get('/:id', async (req, res) => {
    const { id } = req.params
    let list = await Listing.findById(id).populate('review')
    if(!list){
      req.flash('error', 'listing you requested does not exist')
      res.redirect('/listings')
    }
    res.render('showRoute.ejs', { list })
  })
  
  // creating new list route ----working well
  router.post('/', async  (req, res) => {
    const list =  new Listing({
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      price: req.body.price,
      location: req.body.location,
      country: req.body.country,
    })
    await list.save();
    req.flash('success', 'New listing created successfully')
    res.redirect('/listing')
  })
  
  //update list route ----working well
  router.put('/:id', async (req, res) => {
    await Listing.findByIdAndUpdate( req.params.id , {
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      price: req.body.price,
      location: req.body.location,
      country: req.body.country,
    })
    req.flash('success', 'listing updated successfully')

    res.redirect('/listing')
  })
  
  //delete list -----working well
  router.delete('/listing/:id', async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id)
    req.flash('success', 'listing deleted successfully')

    res.redirect('/listing')
  })
  
  //delete individual review -----working well
  router.delete('/:id/review/:reviewId', async (req, res) => {
    const {id, reviewId} = req.params
    await Listing.findByIdAndUpdate(id, { $pull: { review : reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'review deleted successfully')

    res.redirect(`/listing/${id}`)
  })
  
  //create review -----working well
  router.post('/:id/reviews', validateReview, async (req, res) => {
    let list = await Listing.findById(req.params.id)
    let newReview = new Review(req.body.review)
  
    list.review.push(newReview)
  
    await newReview.save()
    await list.save()
    req.flash('success', 'New Review created successfully')

    res.redirect(`/listing/${req.params.id}`)
  })
  
  module.exports = router;