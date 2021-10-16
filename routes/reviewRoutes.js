const express = require("express");
const Review = require("../models/reviewModel");
const Campground = require("../models/campgroundModel");
const wrapAsync = require("../utils/wrapAsync");
const {validateReview} = require("../utils/schemaValidations");
const {isLoggedIn, isReviewAuthor} = require("../utils/middleware");
const reviewController = require("../controllers/reviewController");
const reviewRouter = express.Router({mergeParams: true});

//Route to post a review
reviewRouter.post("/", 
    isLoggedIn, 
    validateReview, 
    wrapAsync(reviewController.createReview));


//Route to delete review
reviewRouter.delete("/:revId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview));


module.exports = reviewRouter;