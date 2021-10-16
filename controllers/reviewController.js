const Review = require("../models/reviewModel");
const Campground = require("../models/campgroundModel");

module.exports.createReview = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const {body, rating} = req.body.review;
    const newReview = new Review({
        body, 
        rating,
        author: req.user._id
    });

    campground.reviews.push(newReview);

    await newReview.save();
    await campground.save();

    req.flash("success", "Review posted successfully!");
    res.redirect(`/campgrounds/${id}`);
}

module.exports.destroyReview = async (req, res) => {
    const {id, revId} = req.params;
    //pulling out an object from a Mongo array
    await Campground.findByIdAndUpdate(id, {$pull : {reviews: revId}});
    await Review.findByIdAndDelete(revId);

    req.flash("success", "Review deleted successfully!");
    res.redirect(`/campgrounds/${id}`);
}