var io = require('socket.io')(process.env.PORT || 3000)//run on port 3000
var shortid = require('shortid')

//data server
var express = require('express')
var app = express()
var mongoose = require('mongoose')

require('./db')

var User = mongoose.model('User', {
    playerName:{
        type:String,
    },
    password:{
        type:String,
    },
    score:{
        type:Number
    }
})

app.use(express.urlencoded({extended:true}))
app.use(express.json())


app.get('/download', function(req, res){
    User.find({}).then(function(data){
        res.json(data)
        //console.log(data)
    }) 
})

//post route to save data from Unity
app.post('/upload', function(req, res){
    console.log("Posting Data")

    var newUser = new User({
        playerName:req.body.playerName,
        password:req.body.password,
        score:req.body.score
    })

    newUser.save(function(err, result){
        if(err){
            console.log(err)
        }
        else{
            console.log(result)
        }
    })
})

app.get("/getData", function(req, res)
{
    User.find({}).then(function(data)
    {
        res.json({data});
    });
});


//Post route to delete the game entry
app.post("/deletePlayer", function(req, res)
{
    console.log("User Deleted", req.body._id)
    User.findByIdAndDelete(req.body._id).exec()
    //res.redirect(req.get('referer'));
    io.emit("refreshPlayerList")
    
});

app.post("/updatePlayer", function(req, res){
    console.log('User Updated New Name: ' + req.body.newName)
    User.updateOne({_id:req.body._id} , {playerName:req.body.newName}).exec()
    io.emit("refreshPlayerList")
})


app.get('/login', function(data){
    console.log(data.playerName+ ' '+ data.password)
    isPasswordValid(data, function(res){
        if(res){
          data.success = true
        }
    })
})


app.use(express.static(__dirname+"/views"));

app.listen(5000, function(){
    console.log('App running on port 5000')
})

//Socket Server code------------------------------------------


var isPasswordValid = function (data, cb) {
    if (data.password != null && data.playerName != null) {
        User.findOne({ playerName: data.playerName }, function (err, playerName) {
            cb(data.password == playerName.password)
        })
    }
}

console.log('server is running')

var playerCount = 0;
var players = []//array

io.on('connection', function(socket){
    console.log('client connected')

    var clientid = shortid.generate()

    players.push(clientid)
    //I exist so spawn me
    socket.broadcast.emit('spawn', {id:clientid})//tells other connection that the player exists in its own conncetion so spawn it on the originals

    //emit to client so logic can be run without other connections
    socket.emit('clientConnection', {id:clientid})

  
    // socket.on('login', function(data){
    //     isPasswordValid(data, function(res){
    //         if(res){
                
    //         }
    //     })
    // })

    socket.on('hello', function(data){
        console.log('Hello from the connected client UNITY')
    })

    //spawns the existing players in the new connections scene
    players.forEach(function(client){
        if(client == clientid){
            return
        }
        //the others exist so spawn them
        socket.emit('spawn', {id:client})
    })

    socket.on('move', function(data){
        data.id = clientid;//set to this client
        console.log('Getting Pos from client')

        //emit to the client that sent the request
        socket.emit('MoveAddScore', {id:clientid})
        
        console.log(data)
        socket.broadcast.emit('move', data)
    })

    socket.on('updatePosition', function(data){
        data.id = clientid;//set to this client
        socket.broadcast.emit('updatePosition', data)
    })

    socket.on('disconnect', function(){
        console.log('player/client disconnected')
       players.splice(players.lastIndexOf(clientid), 1)//removes at an index then reorders
       socket.broadcast.emit('disconnected', {id:clientid})
    })
})

module.exports = {io}