const mongoose = require("mongoose");
const Review = require("./reviewModel");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url: {type: String, required: true},
    filename: {type: String, required: true}
})

imageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload", "/upload/w_200,h_100");
})

const campgroundOpts = { toJSON: { virtuals: true} };
const campgroundSchema = new Schema({
    title: {type: String, required: true},
    images: [imageSchema],
    geometry: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true}
    },
    price: {type: Number, required: true},
    description: {type: String},
    location: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: "User"},
    reviews: [
        {
            type: Schema.Types.ObjectId, ref: "Review"
        }
    ]
}, campgroundOpts, {
    timestamps: true
});

campgroundSchema.virtual("properties.popUpMarkup").get(function() {
    return `
        <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
        <p>${this.description.substring(0, 30)}...</p>
    `
})


campgroundSchema.post("findOneAndDelete", async function(campground) {
    if(campground) {
        const deleted = await Review.deleteMany({_id :{$in : campground.reviews}});
    }
})

const Campground = new mongoose.model("Campground", campgroundSchema);
module.exports = Campground;