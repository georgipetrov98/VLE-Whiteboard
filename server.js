const express = require('express');
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')
const logger = require('morgan')
const cors = require('cors')

const port = process.env.PORT || 3000
app.set('port', port)
http.listen(port, () => console.log('listening on port ' + port));

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/public')));

// middleware
app.use(cors())
app.use(logger('dev'))
var socketUsers = [];
const namespaces = ['Programming', 'Science', 'Arts'];

namespaces.map(ns => io.of(`/${ns}`))
.forEach(ns => {
    // users is a key-value pairs of socket.id -> user name
    let users = {};
    ns.on('connection', (socket) => {
        // Every socket connection has a unique ID
        io.sockets.emit('users', users); 
        console.log(io.sockets.clients());
        console.log(Object.keys(users))
     //Object.keys(users)
        
        // User Logged in
        socket.on('login', (name) => {
            console.log('login', name)
            // Map socket.id to the name
            users[socket.id] = name;
            console.log(`${name}`);
            socketUsers.push(name);
            console.log(socketUsers)
            // Broadcast to everyone else (except the sender).
            // Say that the user has logged in.
            socket.broadcast.emit('msg', {
                from: 'server',
                message: `${name} logged in.`
            })
        })
        
    io.sockets.emit('Clients', socketUsers)

        // Message Recieved
        socket.on('msg', (message) => {
            console.log('msg', message)
            // Broadcast to everyone else (except the sender)
            socket.broadcast.emit('msg', {
                from: users[socket.id],
                message: message
            })
            // Send back the same message to the sender
            socket.emit('msg', {
                from: users[socket.id],
                message: message
            })
            // You could just do: io.emit('msg', ...)
            // which will send the message to all, including
            // the sender.
        })
        
        
        // Disconnected
        socket.on('disconnect', function() {
            // Remove the socket.id -> name mapping of this user
            let name;
            if (socket.id in users) {
                name = users[socket.id]
            } else {
                name = socket.id
            }
            console.log('disconnect: ' + name)
            
            socket.broadcast.emit('msg', {
                from: 'server',
                message: `${name} disconnected.`
            })
            for(var i = 0; i < socketUsers.length; i++){
                if(socketUsers[i].socketID == socket.id){
                    socketUsers.splice(i, 1);
                    break;
                }
            }
            //fix error 
            socketUsers.pop(name);
            delete users[socket.id]
            // io.emit('disconnect', socket.id)
        })
        io.sockets.emit('Clients', socketUsers)

        // Drawing
        socket.on('mouseDown', ([x, y]) => socket.broadcast.emit('mouseDown', [x, y]))
        socket.on('undo', () => socket.broadcast.emit('undo'))
        socket.on('text', () => socket.broadcast.emit('text'))
        socket.on('mouseUp', () => socket.broadcast.emit('mouseUp'))
        socket.on('setColor', (c) => socket.broadcast.emit('setColor', c))
        socket.on('setThickness', (r) => socket.broadcast.emit('setThickness', r))
        socket.on('clear', () => socket.broadcast.emit('clear'))
        socket.on('mouseMove', ([x, y]) => socket.broadcast.emit('mouseMove', [x, y]))
        
        
    })
})

// Routes
app.get('/lobby', (req, res) => {
    res.render('lobby', {
        namespaces: namespaces
    })
})
app.get('/',     (req, res) => res.redirect('/lobby'))
app.get('/draw', (req, res) => res.redirect('/lobby'))

app.get('/draw/:namespace', (req, res) => {
    const ns = req.params['namespace'];
    if (!namespaces.includes(ns)) {
        return res.sendStatus(404);
    }
    res.render('draw')
})