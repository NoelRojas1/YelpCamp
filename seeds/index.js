const mongoose = require("mongoose");
const Campground = require("../models/campgroundModel");
const cities = require("./cities");
const {places, descriptors} = require("./seedHelper");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Connected to DB");
}).catch(error => {
    console.log("Error connecting to DB");
    console.log(error);
})

const seedDB = async (num) => {
    await Campground.deleteMany({});

    for(let i = 0; i < num; i++) {
        const randPlace = Math.floor(Math.random() * places.length) + 1;
        const randdescriptor = Math.floor(Math.random() * descriptors.length) + 1;
        const rand = Math.floor(Math.random() * 1000) + 1;
        const price = Math.round(Math.random() * 500) + 1;
        // const img = Math.floor(Math.random() * 900000) + 100000;
        const newCamp = new Campground({
            title: `${descriptors[randdescriptor]} ${places[randPlace]}`,
            images: [
                {
                    url: "https://res.cloudinary.com/dnep0y3dm/image/upload/v1628780928/YelpCamp/nj43m8ivv6rc8eyhlovb.jpg",
                    filename: "YelpCamp/nj43m8ivv6rc8eyhlovb"
                }
            ],
            geometry: {
                type: "Point",
                coordinates: [
                    cities[rand].longitude, 
                    cities[rand].latitude
                ]
            },
            price: price,
            description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Praesentium quas assumenda eum adipisci mollitia quos cum pariatur ducimus minus. " +
                         "Accusantium ab enim corporis recusandae modi porro magnam molestiae id nisi.",
            location: `${cities[rand].city}, ${cities[rand].state}`,
            author: "613676522af5d14840eb4d75"
        })

        await newCamp.save();
    }
}

seedDB(150).then(() => {
    mongoose.connection.close();
});