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
mongoose.connect("mongodb://localhost:27017/Scores",
{useNewUrlParser:true}).then(function() 
{
    console.log("Connected to MongoDB Database");    
}).catch(function(err) 
{
    console.log(err);    
});

//load in database templates
require("./models/highScores");

var Score = mongoose.model("highScore");


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
app.post("/saveScore", function(req, res)
{
    console.log("Request Made");
    console.log(req.body);

    new Score
    ({
        player: req.body.playerName,
        score: req.body.playerScore//The only way to my knowlege that req.body works is via the input element which means i cant grab the textcontetn of a span with it
    }).save().then(function()
    {
        res.redirect("highScores.html");
    })

    
    ;

    // new Score({req}).save().then(function()
    // {
        
    // });

});

app.get("/getData", function(req, res)
{
    Score.find({}).then(function(score)
    {
        res.json({score});
    });//treat this as its creating an array
});


app.use(express.static(__dirname+"/views"));
app.listen(5000, function()
{
    console.log("Listening on Port 5000");
});

