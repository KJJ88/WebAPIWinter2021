//app is the entry point of the application
var http = require('http');

http.createServer(function(request, response)
{
    //http header
    response.writeHead(200, {'Content-type':'text/plain'});
    //send a response to the body of the html
    response.end("*plays Skyrim entrance scene*");
    
}).listen(3000);

console.log("Server is running on port 3000");
