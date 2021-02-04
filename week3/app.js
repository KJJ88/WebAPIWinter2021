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
//var PlayerList = {}

//ADDED WEEK4
var GameObject = function () 
{
    var self = 
    {
        x:400,
        y:300,
        spX:0,//speedx
        spY:0,//speedy
        id:""
    }

    self.update = function()
    {
        self.updatePosition();
    }

    self.updatePosition = function()
    {
        self.x += self.spX;
        self.y += self.spY;
    }
    return self;
}

var Player = function(id){

    var self = GameObject();

    self.id = id;
    self.number = Math.floor(Math.random() * 10);
    self.right = false;
    self.left = false;
    self.up = false;
    self.down = false;
    self.speed = 10;

    var playerUpdate = self.update;

    self.update = function()
    {
        self.updateSpeed();
        playerUpdate();
    }

    self.updateSpeed = function()
    {
        if(self.right)
        {
            self.spX = self.speed;
        }
        else if(self.left)
        {
            self.spX = -self.speed;
        }
        else
        {
            self.spX = 0;
        }

        //Vertical
        if(self.up)
        {
            self.spY = -self.speed;
        }
        else if(self.down)
        {
            self.spY = self.speed;
        }
        else
        {
            self.spY = 0;
        }
    }

    Player.list[id] = self;
    return self
}

Player.list = {};

//list of functions for player conenction and movement
Player.onConnect = function(socket)
{
    var player = new Player(socket.id);

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
}

Player.onDisconnect = function()
{
    delete Player.list[socket.id];
}

Player.update = function()
{
    var pack = []
   
    for (var i in Player.list) {
        var player = Player.list[i]
        player.update()
        //console.log(player)
        pack.push({
            x: player.x,
            y: player.y,
            number:player.number 
        })
    }

    return pack;
}


//Connection to game
io.sockets.on('connection', function(socket){
    console.log("Socket Connected")
    socket.id = Math.random()
   // socket.x = 0
   // socket.y = Math.floor(Math.random()*600)
   // socket.number = Math.floor(Math.random()*10)
    //add something to SocketList
    SocketList[socket.id] = socket

    Player.onConnect(socket);

    //disconnection event
    socket.on('disconnect',function(){
        delete SocketList[socket.id]
        Player.onDisconnect(socket);
        
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
     var pack = Player.update();


    for (var i in SocketList) {
        var socket = SocketList[i]
        socket.emit('newPositions',pack)
    }
}, 1000/30)