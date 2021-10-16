if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const {scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls} = require("./utils/sources");
const session = require("express-session");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const campgroundRouter = require("./routes/campgroundRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const userRouter = require("./routes/userRoutes");
const MongoDBStore = require("connect-mongo");

const dbUrl = process.env.DB_URL;

//In order to make use of "passport" we need to configure it as follows:
const User = require("./models/userModel");
const passport = require("passport");
const localPassport = require("passport-local");


mongoose.connect(dbUrl || "mongodb://localhost:27017/yelp-camp", { 
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Connected to DB");
}).catch(error => {
    console.log("Error connecting to DB");
    console.log(error);
})


const port = process.env.PORT || 3000;
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret: process.env.SESSION_SECRET || "thisissecret",
    touchAfter: 24 * 3600 // 24 hours
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR!", e);
})

const sessionOptions = {
    store,
    name: "session",
    secret: process.env.SESSION_SECRET  || "thisissecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 604800000, //604800000 is the number of milliseconds in a week
        maxAge: 604800000,
    }
};

const app = express();

app.engine("ejs", ejsMate);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(mongoSanitize());
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'", 
                "blob:", 
                "data:", 
                "https://res.cloudinary.com/dnep0y3dm/",
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        }
    })
);
app.use(methodOverride("_method"));
app.use(session(sessionOptions));
app.use(flash());
app.use(express.static("public"));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//We initiliaze "passport" as follows:
app.use(passport.initialize());
app.use(passport.session()); //--> Need to make sure we start express-session before this line of code
passport.use(new localPassport(User.authenticate()));

//The next two methods are used by "passport" to store and delete users to and from session respectively
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.message = req.flash("success");
    res.locals.error  = req.flash("error");
    //Variable to make sure the user is logged in or logged out
    res.locals.currentUser = req.user;
    next();
})

app.use("/", userRouter);
app.use("/campgrounds", campgroundRouter);
app.use("/campgrounds/:id/reviews", reviewRouter);




app.get("/", (req, res) => {
    res.render("screens/home");
})

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "The page you are looking for was not found!"));
})

app.use((err, req, res, next) => {
    if(!err.message) err.message = "Something went wrong!"
    if(!err.status) err.status = 500;
    res.status(err.status).render("screens/error", {err});
})


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})