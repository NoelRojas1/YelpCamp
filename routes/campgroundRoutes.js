const express = require("express");
const multer = require("multer");
const {storage} = require("../cloudinary/index");
const upload = multer({storage});
const Campground = require("../models/campgroundModel");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {isLoggedIn, isAuthor} = require("../utils/middleware");
const {validateCampground} = require("../utils/schemaValidations");
const campgroundController = require("../controllers/campgroundController");
 
const campgroundRouter = express.Router();

//Route for all campgrounds
campgroundRouter.get("/", wrapAsync(campgroundController.index));

//Routes to create a new campground
campgroundRouter.get("/new", isLoggedIn, campgroundController.renderNewForm)

campgroundRouter.post("/", 
    isLoggedIn, 
    upload.array("campground[images]"),
    validateCampground,
    wrapAsync(campgroundController.createNewCampground)
    );

//Route for campground by id
campgroundRouter.get("/:id", wrapAsync(campgroundController.showCampground));

//Routes to edit a campground
campgroundRouter.get("/:id/edit", 
    isLoggedIn,
    isAuthor,
    wrapAsync(campgroundController.renderEditForm));

campgroundRouter.put("/:id", 
    isLoggedIn,
    isAuthor,
    upload.array("campground[images]"),
    validateCampground, 
    wrapAsync(campgroundController.editCampground));


//Route to delete a campground
campgroundRouter.delete("/:id", 
    isLoggedIn,
    isAuthor, 
    wrapAsync(campgroundController.destroyCampground));




module.exports = campgroundRouter;