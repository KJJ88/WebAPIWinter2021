var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var highScoreSchema = new Schema({
    player:{
        type:String,
        required:true
    },
    score:{
        type:String,
        required:true
    }
});

mongoose.model("highScore", highScoreSchema);