const express = require('express')
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;


app.use(express.static('public'))

let users = {};
var socketUsers = [];


io.on('connection', socket => { 
  socket.on('chat message', (msg) => {
      socket.broadcast.emit('chat message', { msg: msg, name: users[socket.id] });
      
    });
  socket.on('new-user', (name) => {
    socketUsers.push({
      socketID: socket.id,
      name : name
    })
    users[socket.id] = name
      socket.broadcast.emit('user-connected', name);
      io.sockets.emit('users', socketUsers)
      console.log("Before disconnect")
      console.log(socketUsers)
  });

  socket.on('mouse', (data) => {
      socket.broadcast.emit('mouseMsg', data)
      
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
      socketUsers.splice(socketUsers.findIndex(elem => elem.socketID === socket.id), 1);
      io.sockets.emit('users', socketUsers)
      console.log(socketUsers)
  })
});



http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});