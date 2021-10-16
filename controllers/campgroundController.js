const Campground = require("../models/campgroundModel");
const {cloudinary} = require("../cloudinary/index");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAP_PUBLIC_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds})
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createNewCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    
    const {title, location, price, description} = req.body.campground;
    const images = req.files.map(f => ({url: f.path, filename: f.filename}));
    const newCamp = new Campground({
        title: title,
        price: price,
        location: location,
        images: images,
        description: description,
        author: req.user._id,
        geometry: geoData.body.features[0].geometry
    })
    await newCamp.save();

    req.flash("success", "Campground created successfully!");
    res.redirect(`/campgrounds/${newCamp._id}`);
}

module.exports.showCampground = async (req, res, next) => {
    const {id} = req.params;
    //This bit of code populates the campground and populates the reviews if any
    const campground = await Campground.findById(id).populate({
        path:"reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    if(!campground) {
        req.flash("error", "Campground can not be found!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", {campground});
}

module.exports.renderEditForm = async (req, res, next) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp) {
        req.flash("error", "Campground can not be found!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", {camp});
}

module.exports.editCampground = async (req, res, next) => {
    const {id} = req.params;
    const {title, location, price, description} = req.body.campground;
    const images = req.files.map(f => ({url: f.path, filename: f.filename}));
    const updatedCampground = await Campground.findByIdAndUpdate(id, {
        title: title,
        location: location,
        price: price, 
        description: description
    }, {new: true});
    
    updatedCampground.images.push(...images);
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    await updatedCampground.save();

    req.flash("success", "Campground updated successfully!");
    res.redirect(`/campgrounds/${id}`);
}

module.exports.destroyCampground = async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);

    req.flash("success", "Campground deleted successfully!");
    res.redirect("/campgrounds");
}