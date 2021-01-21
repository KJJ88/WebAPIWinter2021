var express = require("express");
var mongoose = require("mongoose");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
//var router = express.Router();

//sets up the middleware for the application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

//makes the connection to the database server
mongoose.connect("mongodb://localhost:27017/gameEntries",
{useNewUrlParser:true}).then(function() 
{
    console.log("Connected to MongoDB Database");    
}).catch(function(err) 
{
    console.log(err);    
});

//load in database templates
require("./models/Game");

var Game = mongoose.model("game");

//Basic template code for saving an entry
/*
var Game = mongoose.model("Game", {nameofgame:String});

var game = new Game({nameofgame:"Skyrim"});

game.save().then(function()
{
    console.log("Game Saved");
})
*/

//post route?
//Example of a POST route
app.post("/saveGame", function(req, res)
{
    console.log("Request Made");
    console.log(req.body);

    new Game(req.body).save().then(function()
    {
        res.redirect("gamelist.html");
    });

});

app.get("/getData", function(req, res)
{
    Game.find({}).then(function(game)
    {
        res.json({game});
    });//treat this as its creating an array
});

//Post route to delete the game entry
app.post("/deleteGame", function(req, res)
{
    console.log("Game Deleted", req.body._id);
    Game.findByIdAndDelete(req.body._id).exec();
    res.redirect("gameList.html");
});

app.use(express.static(__dirname+"/views"));
app.listen(3000, function()
{
    console.log("Listening on Port 3000");
});

