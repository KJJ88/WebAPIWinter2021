var io = require('socket.io')(process.env.PORT || 3000)//run on port 3000
var shortid = require('shortid')

//data server
var express = require('express')
var app = express()
var mongoose = require('mongoose')

require('./db')//Hello

var User = mongoose.model('User', {
    playerName:{
        type:String,
    },
    score:{
        type:Number
    }
})

app.use(express.urlencoded({extended:true}))
app.use(express.json())

//Get Route to get data from database
// app.get('/download', function(req, res){
//     User.find({}).then(function(User){
//         res.json(User)
//         console.log(User)
//     })

    
// })

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


app.use(express.static(__dirname+"/views"));

app.listen(5000, function(){
    console.log('App running on port 5000')
})

//Socket Server code------------------------------------------

console.log('server is running')

var playerCount = 0;
var players = []//array

io.on('connection', function(socket){
    console.log('client connected')

    var clientid = shortid.generate()

    // // players.forEach(function(id){
    // //     if(id == clientid){
    // //         return
    // //     }
    // //     players.push(clientid)
    // //     socket.broadcast.emit('spawn', {id:clientid})//pass and object to the on socket
    // // })
    
    players.push(clientid)
    //I exist so spawn me
    socket.broadcast.emit('spawn', {id:clientid})//tells other connection that the player exists in its own conncetion so spawn it on the originals

    //emit to client so logic can be run without other connections
    socket.emit('clientConnection', {id:clientid})

    // //request all existing player positions
    // socket.broadcast.emit('requestPosition')

    // //players spawn with the newly connected client
    // // for(var i = 0; i < players.length; i++){
    // //     if(players[i] == clientid){
    // //         return
    // //     }

    // //     socket.emit('spawn')
    // //     console.log('sending spawn to new player')
    // // }

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