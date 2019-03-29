const express = require('express');
const app = express();
const server = app.listen(3000);
const socket = require('socket.io');
const names = require('names.json')
app.use(express.static('public'));
const io = socket(server);
let users = [];
console.log("\x1b[97m","socket server open");

class user {
  constructor(id) {
    this.id = id;
    this.room = "noroom";
  }
  switchRoom(roomNew, socket) {
    socket.broadcast.emit('leave',{id: socket.id});
    socket.leave(this.room);
    socket.join(roomNew);
    this.room = roomNew;
    console.log("\x1b[35m","switched to room " + this.room + " " + socket.id);
  }
  joinRoom(roomNew, socket) {
    socket.join(roomNew);
    this.room = roomNew;
    console.log("\x1b[32m","joined room " + this.room + " " + socket.id);
  }
}

function findMe(socket) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id==socket.id) {
      return users[i];
    }
  }
}
function findMySpot(socket) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id==socket.id) {
      return i;
    }
  }
}
function randomName() {
  let name = Math.floor(Math.random() * Math.floor(names.length));
  let end = name+1;
  let me = names.slice(name, end);
  return me;
}

io.sockets.on('connection', function(socket) {
  console.log("\x1b[34m","new connection from : " + socket.id);
  users.push(new user(socket.id));
  console.log("\x1b[34m","user count : " + users.length);

  socket.on('rName', function(callBack) {
    callBack(randomName());
  });

  socket.on('roomJoin', function(data) {
    findMe(socket).joinRoom(data.room, socket);
    console.log("\x1b[32m","joining room " + data.room + " " + socket.id);
  });

  socket.on('switchJoin', function(data) {
    findMe(socket).switchRoom(data.room, socket);
    console.log("\x1b[35m","switching to room " + data.room + " " + socket.id);
  });

  socket.on('newName', function(data) {
    io.in(data.room).emit('newName',data);
    //console.log("\x1b[30m","newName event in " + data.room + " from " + data.name + " " + data.user);
  });

  socket.on('mouse', function(data) {
    socket.to(data.room).emit('mouse',data);
    //console.log("\x1b[30m","mouse data sent in " + data.room + " from " + socket.id);
  });

  socket.on('clear', function(data) {
    socket.to(data.room).emit('clear',data);
    console.log("\x1b[33m","cleared canvas on room " + data.room);
  });

  socket.on('disconnect', function(data) {
    users.splice(findMySpot(socket), 1);
    socket.broadcast.emit('leave',{id: socket.id});

    console.log("\x1b[31m","disconnected for " + data.reason + " : " + socket.id);
    console.log("\x1b[31m","user count : " + users.length);
  });

});
