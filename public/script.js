var socket = io();

var messages = document.getElementById('messages');
var users = document.getElementById('users');
var form = document.getElementById('form-container');
var roomContainer = document.getElementById('room-container');
var input = document.getElementById('input');


  const name = prompt('What is your name?')
  socket.emit('new-user', name);

  form.addEventListener('submit', function(e)  {
    e.preventDefault();
    const msg = input.value
    var item = document.createElement('li');
    item.textContent = (`You : ${msg}`);
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    socket.emit('chat message', msg)
    input.value = ""
  });


socket.on('user-connected', function(name) {
  var item = document.createElement('li');
  var username = document.createElement('li')
  username.textContent = (`${name}`);
  item.textContent = (`${name} connected`);
  messages.appendChild(item);

  window.scrollTo(0, document.body.scrollHeight);
})

socket.on('users', function(socketUsers) { 
  var newHTML = '';
  for(var i = 0; i < socketUsers.length; i++){
    newHTML += '<li class="user">' + socketUsers[i].name + '</li>';
  }
  document.getElementById('users').innerHTML = newHTML;
})

socket.on('user-disconnected', function(name) {
  var item = document.createElement('li');
  item.textContent = (`${name} disconnected`);
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
  
})


socket.on('chat message', function(msg) {
  var item = document.createElement('li');
  item.textContent = (`${msg.name} : ${msg.msg}`);
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});


  
var canvas = document.querySelector('#paint');
var ctx = canvas.getContext('2d');

var sketch = document.querySelector('#sketch');
var sketch_style = getComputedStyle(sketch);
canvas.width = parseInt(sketch_style.getPropertyValue('width'));
canvas.height = parseInt(sketch_style.getPropertyValue('height'));


var mouse = {x: 0, y: 0};
var last_mouse = {x: 0, y: 0};


/* Mouse Capturing Work */
canvas.addEventListener('mousemove', function(e) {
    last_mouse.x = mouse.x;
    last_mouse.y = mouse.y;

    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    
}, false);


/* Drawing on Paint App */
ctx.lineWidth = 5;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = 'blue';

canvas.addEventListener('mousedown', function(e) {
    canvas.addEventListener('mousemove', onPaint, false);
}, false);

canvas.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', onPaint, false);
}, false);

var onPaint = function(e) {
    ctx.beginPath();
    ctx.moveTo(last_mouse.x, last_mouse.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.closePath();
    ctx.stroke();

    var data = {
      x: last_mouse.x,
      y: last_mouse.y,
      x1: mouse.x,
      y1: mouse.y,
  }
  socket.emit('mouse', data)
};

socket.on('mouseMsg', function(data) {
  ctx.moveTo(data.x, data.y);
  ctx.lineTo(data.x1,data.y1);
  ctx.closePath();
  ctx.stroke();
});



