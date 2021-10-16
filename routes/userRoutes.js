const express = require("express");
const User = require("../models/userModel");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { isLoggedIn } = require("../utils/middleware");
const userController = require("../controllers/userController");
const router = express.Router();

router.route("/register")
    .get(userController.renderRegistrationForm)
    .post(wrapAsync(userController.createUser));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        //This route is like this because we are using "passport"
        passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), 
        wrapAsync(userController.userLogin)
    );

router.get("/logout", isLoggedIn, userController.userLogout);

module.exports = router;