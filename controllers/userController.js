const User = require("../models/userModel");

module.exports.renderRegistrationForm = (req, res) => {
    res.render("users/register");
}

module.exports.createUser = async(req, res, next) => {
    //This route is like this because we are using "passport"
    //It would be different if using bcrypt
    const {email, username, password, confirmPassword} = req.body;
    if(password === confirmPassword) {
        try {
            const newUser = new User({email, username});
            const registeredUser = await User.register(newUser, password);
            //To automatically login a user that was successfully registered
            req.login(registeredUser, err => {
                if(err) return next(err);
                req.flash("success", "Welcome to YelpCamp!");
                res.redirect("/campgrounds");
            });
        } catch (error) {
            req.flash("error", error.message);
            res.redirect("/register");
        }
    } else {
        req.flash("error", "Incorrect confirm password. Try again!");
        res.redirect("/register");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
}

module.exports.userLogin = async(req, res) => {
    //This route is like this because we are using "passport"
    //It would be different if using bcrypt
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo;
    req.flash("success", "Welcome back!");
    res.redirect(redirectUrl);
}

module.exports.userLogout = (req, res) => {
    //This route is like this because we are using "passport"
    //It would be different if using bcrypt
    req.logout();
    req.flash("success", "Good Bye");
    res.redirect('/campgrounds');
}