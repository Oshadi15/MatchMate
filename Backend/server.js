//dbpsswrd = aHYSiQQ29jiOI9IW
//mongodb+srv://admin:<db_password>@cluster0.jd1telg.mongodb.net/
//set uo express and mongoose
const express = require("express");
const mongoose = require("mongoose");

const app= express();

//Middleware 
app.use("/",(req, res, next) => {
    res.send("It Is Working");
})

mongoose.connect("mongodb+srv://admin:aHYSiQQ29jiOI9IW@cluster0.jd1telg.mongodb.net/")
.then(()=> console.log("Connected to MongoDB"))
.then(()=> {
    app.listen(5000);
})
.catch((err)=> console.log((err)));