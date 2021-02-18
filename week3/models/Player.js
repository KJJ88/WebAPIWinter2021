var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PlayerSchema = new Schema({
    username:
    {
        type:String,
        required:true
    },
    passwords:
    {
        type:String,
        required:true
    }
})

mongoose.model('player', PlayerSchema)