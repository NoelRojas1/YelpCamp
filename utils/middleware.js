const Campground = require("../models/campgroundModel");
const Review = require("../models/reviewModel");

//Athentication middleware
module.exports.isLoggedIn = (req, res, next) => {
    //isAuthenticated is attached to req when using passport
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in!");
        return res.redirect("/login");
    }
    next();
}

//Authorization middleware
module.exports.isAuthor = (async(req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);

    if(!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that.");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
})

//Authorization middleware for reviews
module.exports.isReviewAuthor = (async(req, res, next) => {
    const {id, revId} = req.params;
    const review = await Review.findById(revId);

    if(!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that.");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
})