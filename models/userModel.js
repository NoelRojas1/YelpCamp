const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
    email: {type: String, required: true, unique: true}
});

//We did not specify "name" and "password" in the Schema because we are going to use passportLocalMongoose for that
//passportLocalMongoose makes sure the usernames are not duplicated, and it hashes the password with a salt value included
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;