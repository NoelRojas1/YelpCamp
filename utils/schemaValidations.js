const {reviewSchema, campgroundSchema} = require("../validationSchemas/schemas");
const ExpressError = require("../utils/ExpressError");

module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate({campground: req.body.campground, images: req.files});
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}