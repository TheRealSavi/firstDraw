const express = require('express');
const app = express();
const server = app.listen(3000);
const socket = require('socket.io');
app.use(express.static('public'));
const io = socket(server);

console.log("socket server open");

io.sockets.on('connection', function(socket) {
  console.log("new connection from : " + socket.id);

  socket.on('mouse', function(data) {
    socket.broadcast.emit('mouse',data);
  });

  socket.on('clear', function(data) {
    socket.broadcast.emit('clear',data);
    console.log("canvas cleared");
  });

  socket.on('newName', function(data) {
    io.emit('newName',data);
    console.log("newName event " + data.name + " " + data.user);
  });

  socket.on('disconnect', function(data) {
    console.log("disconnected for " + data.reason + " : " + socket.id);
    socket.broadcast.emit('leave',{id: socket.id})
  });

});
