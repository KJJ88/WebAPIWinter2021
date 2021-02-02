var express = require('express')
var app = express()
var serv = require('http').Server(app)
var io = require('socket.io')(serv,{})

//File Communication===================================
app.get('/', function(req,res){
    res.sendFile(__dirname+'/client/index.html')
})

app.use('/client', express.static(__dirname+'/client'))




//server side communiction=========================
serv.listen(3000,function(){
    console.log('Connected on localhost 3000')
})

var SocketList = {}
var PlayerList = {}

var Player =function(id){
    var self = {
        x:400,
        y:300,
        id:id,
        number:Math.floor(Math.random()*10),
        right:false,
        left:false,
        up:false,
        down:false,
        speed:10
    }
    self.updatePosition = function(){
        //console.log(self.up)
        if(self.right)
        self.x += self.speed
        if(self.left)
        self.x -= self.speed
        if(self.up)
        self.y -= self.speed
        if(self.down)
        self.y += self.speed
    }
    return self
}

io.sockets.on('connection', function(socket){
    console.log("Socket Connected")

    socket.id = Math.random()
   // socket.x = 0
   // socket.y = Math.floor(Math.random()*600)
   // socket.number = Math.floor(Math.random()*10)
    //add something to SocketList
    SocketList[socket.id] = socket
    

    var player = new Player(socket.id)
    PlayerList[socket.id] = player

    //disconnection event
    socket.on('disconnect',function(){
        delete SocketList[socket.id]
        delete PlayerList[socket.id]
    })

    //recieves player input
    socket.on('keypress',function(data){
        console.log(data.state)
        if(data.inputId === 'up')
            player.up = data.state
        if(data.inputId === 'down')
            player.down = data.state
        if(data.inputId === 'left')
            player.left = data.state
        if(data.inputId === 'right')
            player.right = data.state
    })

    ///Old Examples from Wednesday 1/27
    // socket.on('sendMsg',function(data){
    //     console.log(data.message);
    // })
    // socket.on('sendBtnMsg',function(data){
    //     console.log(data.message)
    // })

    // socket.emit('messageFromServer',{
    //     message:'Hey Jordan Welcome to the party'
    // })
})

//Setup Update Loop 
setInterval(function(){
   var pack = []
   
    for (var i in PlayerList) {
        var player = PlayerList[i]
        player.updatePosition()
        //console.log(player)
        pack.push({
            x: player.x,
            y: player.y,
            number:player.number 
        })
    }
    for (var i in SocketList) {
        var socket = SocketList[i]
        socket.emit('newPositions',pack)
    }
}, 1000/30)