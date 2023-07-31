const mongoose = require("mongoose");
// san123
mongoose.connect("mongodb+srv://sanjayacharya992:san123@cluster0.nidiiyb.mongodb.net/myDB").then(()=>{
    console.log("db cOnnected")
}).catch((err)=>console.log(err))