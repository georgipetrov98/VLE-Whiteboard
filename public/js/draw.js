import socket from './net.js'

console.log('draw.js')

// Canvas 2D Context
let context;

// Elements
let _canvasContainer;
let _canvas;

// Game's Local and Remote States
let state = {
    dragging: false,
    undoStack: [],
    
    color: 'black',
    setColor(c) {
        this.color = c
        this.refresh()
        console.log('setColor to', this.color)
    },

    thickness: 3,
    setThickness(r) {
        this.thickness = r
        this.refresh()
        console.log('setThickness to', this.thickness)
    },

    refresh() {
        context.fillStyle   = this.color
        context.strokeStyle = this.color
        context.lineWidth   = this.thickness * 2
        context.radius      = this.thickness
        console.log('refresh')
    }
}

window.addEventListener('load', onPageLoad)
window.addEventListener('resize', onResize)

//eraser has weird outline fix
const eraseButton = document.getElementById('eraser');
eraseButton.addEventListener('click', eraserClick);

function eraserClick() {
    context.canvas.addEventListener('click', function(event) {
        var mouseX = event.clientX - context.canvas.offsetLeft;
        var mouseY = event.clientY - context.canvas.offsetTop;

        context.beginPath();
        //context.globalCompositeOperation = "destination-out"; breaks color change
       // context.strokeStyle = "rgb(255, 255, 255)";
        
        context.strokeStyle = ("rgba(255,255,255,255)"); /* or */ context.fillStyle = "rgba(255,0,0,0)";

 
    });
    
}

const setimageButton = document.getElementById('imageSet');
setimageButton.addEventListener('click', setImage);

function setImage() {
    var image = document.getElementById("preview");
    context.drawImage(image,0,0, canvas.width,canvas.height);

    console.log(context.canvas.width, context.canvas.height)
}

//Circle shapes button
const circleButton = document.getElementById('circle');
circleButton.addEventListener('click', initiateCanvasCircle);

    function initiateCanvasCircle() {
        context.canvas.addEventListener('mousemove', function(event) {state.dragging = false;
            var mouseX = event.clientX - context.canvas.offsetLeft;
            var mouseY = event.clientY - context.canvas.offsetTop;
        });

        context.canvas.addEventListener('click', function(event) {state.dragging = false;
            var mouseX = event.clientX - context.canvas.offsetLeft;
            var mouseY = event.clientY - context.canvas.offsetTop;

            context.beginPath();
            context.arc(mouseX, mouseY, 50, 0, 2 * Math.PI, false);
            context.fillStyle = 'green';
            context.fill();
            context.closePath();
        });

    } //SAME LOGIC FOR OTHER SHAPES. //FIX outlines and data

//Figure out how to set image/preview it thanks.
//Don't forget to host data and refactor code so its tidier
const downloadButton = document.getElementById('download');
downloadButton.addEventListener('click', downloadImage);

//download image
function downloadImage() {
    if (window.navigator.msSaveBlobl) {
        window.navigator.msSaveBlob(canvas.msToBlob(), "canvas-image.png");
    }else {
        const a = document.createElement("a");

        document.body.appendChild(a);
        a.href = canvas.toDataURL();
        a.download = "canvas-image.png";
        a.click();
        document.body.removeChild(a);
    }
    }
    //ERASE




    function text() {
        context.canvas.addEventListener('mousemove', function(event) {
            var mouseX = event.clientX - context.canvas.offsetLeft;
            var mouseY = event.clientY - context.canvas.offsetTop;
        });

        context.canvas.addEventListener('click', function(event) {
            var mouseX = event.clientX - context.canvas.offsetLeft;
            var mouseY = event.clientY - context.canvas.offsetTop;

                var text = prompt("Text:", "");
                if (text) {
                    var mouseX = event.clientX - context.canvas.offsetLeft;
                    var mouseY = event.clientY - context.canvas.offsetTop;
                    context.font = Math.max(12, context.lineWidth) + "px sans-serif";
                    context.fillText(text, mouseX, mouseY);
                   
                }

        });

    } //SAME LOGIC FOR OTHER SHAPES.


function onResize() {
    const image = context.getImageData(_canvas.clientLeft, _canvas.clientTop, _canvas.width, _canvas.height)
    const {width, height} = _canvasContainer.getBoundingClientRect()
    _canvas.width = width
    _canvas.height = height
    context.putImageData(image, _canvas.clientLeft, _canvas.clientTop)
    state.refresh()
}

function onPageLoad() {
    // Canvas
    initCanvasFunction()
    state.refresh()
    
    // Undo button
    document.getElementById('undo').addEventListener('click', undoHandler)
    document.getElementById('text').addEventListener('click', textHandler)

    // Ctrl+Z Undo
    document.addEventListener('keydown', (evt) => {
        if (evt.ctrlKey && evt.keyCode === 90) {
            undoHandler()
        }
    })

    function textHandler() {
        text()
        Remote.send(Remote.e.text)
    }

    function undoHandler() {
        undo()
        Remote.send(Remote.e.undo)
    }
    
    // Clear button
    document.getElementById('clear').addEventListener('click', () => {
        clear()
        Remote.send(Remote.e.clear)
    })
    
    // Color Select Shortcuts (Numbers)
    const colors = [
        'black', // 1
        'blue',  // 2
        'red',   // 3
        'green', // 4
        'white', // 5
        'pink', // 6
        'yellow', //7
        'grey' // 8
    ];
    document.addEventListener('keydown', (evt) => {        
        const num = evt.keyCode - 49;
        const color = colors[num];
        if (color) {
            state.setColor(color)
            Remote.send(Remote.e.setColor, color)
        }
    })
    // Color Buttons
    const _colors = document.getElementById('colors');
    for(const color of colors) {
        const btn = document.createElement('button')
        btn.style.backgroundColor = color;
        btn.addEventListener('click', () => {
            state.setColor(color)
            Remote.send(Remote.e.setColor, color)
        })
        _colors.appendChild(btn)
    }

    
    // Line Width Buttons
    for(const btn of document.getElementsByClassName('thickness')) {
        btn.addEventListener('click', () => {
            const thickness = btn.getAttribute('data-thickness');
            state.setThickness(thickness)
            Remote.send(Remote.e.setThickness, thickness)
        })
    }
}



function clear() {
    _canvas.width = _canvas.width // this magically clears canvas
    state.undoStack = []
    state.refresh()
}

function undo() {
    if (state.undoStack.length >= 1) {
        const image = state.undoStack.pop()
        context.putImageData(image, _canvas.clientLeft, _canvas.clientTop)
    } else {
        console.log('undo stack is empty')
    }
}

function initCanvasFunction() {
    // Canvas
    _canvasContainer = document.getElementById('canvasContainer');
    _canvas = document.getElementById('canvas')
    // Initialization
    let {width, height} = _canvasContainer.getBoundingClientRect()
    _canvas.width = width
    _canvas.height = height
    context = _canvas.getContext('2d')

    // Canvas Events
    _canvas.addEventListener('mousedown', mouseDown)
    _canvas.addEventListener('mousemove', mouseMove)
    _canvas.addEventListener('mouseup', mouseUp)


    function mouseMove(e) {
        const [x, y] = getMousePos(e)
        // may use e.clientX instead of e.offsetX
        if (state.dragging) {
            context.lineTo(x, y)
            context.stroke()
            context.beginPath()
            context.arc(x, y, state.thickness, 0, Math.PI*2)
            context.fill()
            context.beginPath()
            context.moveTo(x, y)
            Remote.send(Remote.e.mouseMove, resizeScale(x, y))
        }
    }

    function mouseUp(e) {
        state.dragging = false
        context.beginPath() // clears the previous path
        Remote.send(Remote.e.mouseUp)
    }

    function mouseDown(e) {
        const [x, y] = getMousePos(e)
        Remote.send(Remote.e.mouseDown, resizeScale(x, y))
        // Update undoStack
        const image = context.getImageData(_canvas.clientLeft, _canvas.clientTop, _canvas.width, _canvas.height)
        state.undoStack.push(image)
        
        state.dragging = true
        mouseMove(e) // draw a point
    }

}

function unResizeScale(x, y) {
    return [
        x * _canvas.width,
        y * _canvas.height,
    ]
}

function resizeScale(x, y) {
    return [
        x / _canvas.width,
        y / _canvas.height,
    ]
}
function getMousePos(e) {
    const rect = _canvas.getBoundingClientRect()
    // console.log(canvas.width, rect.width)
    const scaleX = _canvas.width / rect.width
    const scaleY = _canvas.height / rect.height
    return [
        (e.clientX - rect.left) * scaleX,
        (e.clientY - rect.top)  * scaleY,
    ];
}





const Remote = {
    e: {
        mouseDown: 'mouseDown',
        mouseMove: 'mouseMove',
        mouseUp: 'mouseUp',
        
        setColor: 'setColor',
        setThickness: 'setThickness',
        
        clear: 'clear',
        undo: 'undo',
        text: 'text',
    },

    send(event, message) {
        if (!(event in this.e)) {
            throw new Error("Unknown event: " + event)
        }

        if (message) {
            socket.emit(event, message)
        } else {
            socket.emit(event)
        }
    },

    // init listens for remote events on the socket. It is the recieving code.
    init() {
        console.log('Remote init()')
        socket.on(this.e.mouseMove, ([x, y]) => {
            [x, y] = unResizeScale(x, y)
            context.lineTo(x, y)
            context.stroke()
            context.beginPath()
            context.arc(x, y, state.thickness, 0, Math.PI*2)
            context.fill()
            context.beginPath()
            context.moveTo(x, y)
        })
        
        socket.on(this.e.mouseDown, ([x, y]) => {
            let image = context.getImageData(_canvas.clientLeft, _canvas.clientTop, _canvas.width, _canvas.height)
            state.undoStack.push(image)
        })
        
        socket.on(this.e.mouseUp, () => {
            context.beginPath() // clears the previous path
        })
        
        socket.on(this.e.clear, clear)
        socket.on(this.e.undo, undo)
        socket.on(this.e.text, text)
        socket.on(this.e.setColor, (c) => state.setColor(c))
        socket.on(this.e.setThickness, (r) => state.setThickness(r))
    },
}
Remote.init();