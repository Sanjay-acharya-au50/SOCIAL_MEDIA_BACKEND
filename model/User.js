const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name : String,
    sammary:String,
    email : String,
    password:String,
    isFriend:String,
    friends : [{
        type : mongoose.Schema.Types.ObjectId,
        ref :'UserDB'
    }]
})

const user = mongoose.model("UserDB", UserSchema );

module.exports = user;