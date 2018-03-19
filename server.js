/**
 * Server module.
 *
 *
 */
 
'use strict';
 
var nodestatic = require('node-static');
var express = require('express');
var path = require('path');
var http = require('http');
var https = require('https');
var fs = require('fs');
var privateKey  = fs.readFileSync('/Users/chiyexiao/.https_cert/private.pem', 'utf8');
var certificate = fs.readFileSync('/Users/chiyexiao/.https_cert/https_nc.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var serverPort = normalizePort(process.env.PORT || '1337');
var SSLPORT = 1338;

// var serverIpAddress = process.env.OPENSHIFT_NODEJS_IP || '192.168.3.103';
var socketIoServer = 'localhost';

////////////////////////////////////////////////
// SETUP SERVER
////////////////////////////////////////////////
    
var app = express();
var session = require('express-session');

const {promisify} = require('util');
var redis = require('redis');
var client = redis.createClient();



// 使用 session 中间件
app.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    // cookie : {
    //     maxAge : 1000 * 60 * 3, // 设置 session 的有效时间，单位毫秒
    // },
}));

require('./router')(app, socketIoServer);
require('./createroom').createroom(app);

// Static content (css, js, .png, etc) is placed in /public
app.use(express.static(__dirname + '/public'));

// Location of our views
app.set('views',__dirname + '/views');

// Use ejs as our rendering engine
app.set('view engine', 'ejs');

// Tell Server that we are actually rendering HTML files through EJS.
app.engine('html', require('ejs').renderFile);

app.set('port', serverPort);

var server = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


server.listen(serverPort,function(){
  console.log('HTTP Server is running on: http://localhost:%s',serverPort);
});

httpsServer.listen(SSLPORT, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});


// var server=app.listen(serverPort, serverIpAddress, function(){
//     console.log("Express is running on port "+serverPort);
// });

var io = require('socket.io').listen(httpsServer);
io.set('log level',2);

////////////////////////////////////////////////
// EVENT HANDLERS
////////////////////////////////////////////////

io.sockets.on('connection', function (socket){
    
	function log(){
        var array = [">>> Message from server: "];
        for (var i = 0; i < arguments.length; i++) {
	  	    array.push(arguments[i]);
        }
	    socket.emit('info', array);
    }
    

	socket.on('message', function (message) {
		log('Got message: ', message);
        socket.broadcast.to(socket.room).emit('message', message);
        if (message.type == 'bye') {
            client.srem(socket.room,message.from,redis.print);
        }
	});
    
	socket.on('create or join', function (message) {
        var room = message.room;
        socket.room = room;
        var participantID = message.from;
        configNameSpaceChannel(participantID);
        
		var numClients = io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);

		if (numClients == 0){
			socket.join(room);
			socket.emit('created', room);
		} else {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			socket.emit('joined', room);
		}
	});
    
    // Setup a communication channel (namespace) to communicate with a given participant (participantID)
    function configNameSpaceChannel(participantID) {
        var socketNamespace = io.of('/'+participantID);
        
        socketNamespace.on('connection', function (socket){
            socket.on('message', function (message) {
                // Send message to everyone BUT sender
                socket.broadcast.emit('message', message);
            });
        });
    }

});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
