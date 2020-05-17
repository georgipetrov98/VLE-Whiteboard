import socket from './net.js'

// username is used to be compared with 'from' in 'msg' events
let username;
var socketio = io.connect('http://127.0.0.1:3000');
window.addEventListener('load', () => {

    const _loginForm = document.getElementById('loginForm')
    const _messageForm = document.getElementById('messageForm')
    const _usernameInput = document.getElementById('nameInput')
    const _canvas = document.getElementById('canvas')
    const _canvasButtons = document.getElementById('canvasButtonsRow')
    const _messagesContainer = document.getElementById('messagesContainer')
    const _messageInput = document.getElementById('messageInput');
    
    
    // Login
    _loginForm.addEventListener('submit', function(event) {
        event.preventDefault()
        // Login with `name`
        let name = _usernameInput.value;
        login(name)

        // Remove the login form and show other UI components
        _loginForm.remove()
        _messageForm.classList.remove('hidden')
        _canvas.classList.remove('hidden')
        _canvasButtons.classList.remove('hidden')
    })

    // Send Message
    _messageForm.addEventListener('submit', function(event) {
        event.preventDefault()
        const message = _messageInput.value;
        _messageInput.value = "";
        // Send
        socket.emit('msg', message)
    })


    function login(name) {
        username = name;
        socket.emit('login', username)
        
        // Recieve Messages
        socket.on('msg', (data) => {
            if (data.from != username) {
                say(data.from, data.message)
            } else {
                say('me', data.message)
            }
        })
    }

    socketio.on('Clients', function(socketUsers){
        var newHTML = '';
        for(var i = 0; i < socketUsers.length; i++){
             newHTML += '<li class="user">' + socketUsers[i] + '</li>';
        }
        document.getElementById('chatters').innerHTML = newHTML; 
    });

    function say(name, message) {
        _messagesContainer.innerHTML +=
        `<div class="chat-message">
            <span style="color: red; font-weight: bold;">${name}:</span> <span class="msg">${message}</span>
        </div>`
        // Scroll down to last message
        _messagesContainer.scrollTop = _messagesContainer.scrollHeight
    }
})

