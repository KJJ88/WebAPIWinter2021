//app is the entry point of the application
var http = require('http');

http.createServer(function(request, response)
{
    //url var
    var url = request.url;
    //http header
    response.writeHead(200, {'Content-type':'text/plain'});
    //send a response to the body of the html
    response.end('URL requested\n' + url);
    
}).listen(3000);

console.log("Server is running on port 3000");