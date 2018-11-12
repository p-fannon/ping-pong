// select canvas
const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// create user paddle
const user = {
    x : 0,
    y : canvas.height/2 - 100/2,
    width : 10,
    height : 100,
    color : "WHITE",
    score : 0
}

// create com paddle
const com = {
    x : canvas.width - 10,
    y : canvas.height/2 - 100/2,
    width : 10,
    height : 100,
    color : "WHITE",
    score : 0
}

// create ball
const ball = {
    x : canvas.width/2,
    y : canvas.height/2,
    radius : 10,
    speed : 4,
    velocityX : 4,
    velocityY : 4,
    color : "WHITE"
}

// create the net
const net = {
    x : canvas.width/2 - 1,
    y : 0,
    width : 2,
    height : 10,
    color : "WHITE"
}

// draw net
function drawNet(){
    for (let i = 0; i < canvas.height; i+=15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// draw rectangle function
function drawRect(x, y, w, h, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h)
}

// draw circle
function drawCircle(x, y, r, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fill();
}

// draw Text
function drawText(text, x, y, color){
    ctx.fillStyle = color;
    ctx.font = "45px fantasy";
    ctx.fillText(text, x, y);
}

function render(){
    //clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, "BLACK");

    //draw the net
    drawNet();

    // draw the score
    drawText(user.score, canvas.width/4, canvas.height/5, "WHITE");
    drawText(com.score, 3*canvas.width/4.25, canvas.height/5, "WHITE");

    // draw the user and com paddles
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);

    // draw the ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// control the user paddle
canvas.addEventListener("mousemove", movePaddle);

function movePaddle(evt) {
    let rect = canvas.getBoundingClientRect();

    user.y = evt.clientY - rect.top  - user.height/2;
}

// collision detection
function collision(b, p) {
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}

// reset the ball
function resetBall() {
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    
    ball.speed = 4;
    ball.velocityX > 0 ? ball.velocityX = -4 : ball.velocityX = 4;
    ball.velocityY > 0 ? ball.velocityY = -4 : ball.velocityY = 4;
}

// update: pos, move, score, etc.
function update(){
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // simple AI to control com paddle
    let computerLevel = 0.08;
    com.y += (ball.y - (com.y + com.height/2)) * computerLevel;

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
        playBounceNote();
    }

    // shove the ball back into the canvas if it gets stuck on edges
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
    }

    let player = (ball.x < canvas.width/2) ? user : com;

    if (collision(ball, player)) {
        // where the ball hit the player
        let collidePoint = ball.y - (player.y + player.height/2);

        // normalization
        collidePoint = collidePoint/(player.height/2);

        // calculate angle in Radian
        let angleRad = collidePoint * Math.PI/4;

        //X direction of the ball when it's hit
        let direction = (ball.x < canvas.width/2) ? 1 : -1;

        // change velocity X and Y
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // speed up every hit
        ball.speed += 0.3;
        playHitNote();
    }

    //update the score
    if (ball.x - ball.radius < 0) {
        //com wins
        com.score++;
        resetBall();
        playDefeat();
    } else if (ball.x + ball.radius > canvas.width) {
        //user wins
        user.score++;
        resetBall();
        playVictory();
    }
}

/*
// enable beep boop sounds
window.onload = function () {
	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: "acoustic-grand-piano",
		onprogress: function(state, progress) {
			console.log(state, progress);
		},
		onsuccess: function() {
			var delay = 0; // play one note every quarter second
			var note = 50; // the MIDI note
			var velocity = 127; // how hard the note hits
			// play the note
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 0.75);
		}
	});
};
*/

window.onload = function () {
    MIDI.loadPlugin({
        instrument: "acoustic-grand-piano",
        onsuccess: function() {
            // playStartUp();
        }
    });
}

function playBounceNote() {
    var delay = 0; // play one note every quarter second
	var note = 55; // the MIDI note
	var velocity = 127; // how hard the note hits
    // play the note
    MIDI.setVolume(0, 127);
	MIDI.noteOn(0, note, velocity, delay);
	MIDI.noteOff(0, note, delay + 0.25);
}

function playHitNote() {
    var delay = 0; // play one note every quarter second
	var note = 75; // the MIDI note
	var velocity = 127; // how hard the note hits
    // play the note
    MIDI.setVolume(0, 127);
	MIDI.noteOn(0, note, velocity, delay);
	MIDI.noteOff(0, note, delay + 0.25);
}

/*
function playStartUp() {
    MIDI.setVolume(0, 127);
    MIDI.chordOn(0, [59, 63, 66], 127, 0.8);
    MIDI.chordOff(0, [59, 63, 66], 1.2);
    MIDI.chordOn(0, [55, 59, 62], 127, 1.2);
    MIDI.chordOff(0, [55, 59, 62], 1.6);
    MIDI.chordOn(0, [63, 67, 70], 127, 1.6);
    MIDI.chordOff(0, [63, 67, 70], 2);
    MIDI.chordOn(0, [61, 65, 68], 127, 2);
    MIDI.chordOff(0, [61, 65, 68], 2.4);
    MIDI.chordOn(0, [68, 73, 77], 127, 2.4);
    MIDI.chordOff(0, [68, 73, 77], 2.8);
}
*/

function playVictory() {
    MIDI.setVolume(0, 127);
    MIDI.noteOn(0, 95, 127, 0);
    MIDI.noteOff(0, 95, 0.2);
    MIDI.noteOn(0, 99, 127, 0.2);
    MIDI.noteOff(0, 99, 0.4);
    MIDI.noteOn(0, 102, 127, 0.4);
    MIDI.noteOff(0, 102, 0.6);
    MIDI.noteOn(0, 105, 127, 0.6);
    MIDI.noteOff(0, 105, 0.8);
    MIDI.noteOn(0, 108, 127, 0.8);
    MIDI.noteOff(0, 108, 1);
}

function playDefeat() {
    MIDI.setVolume(0, 127);
    MIDI.noteOn(0, 35, 127, 0);
    MIDI.noteOff(0, 35, 0.2);
    MIDI.noteOn(0, 31, 127, 0.2);
    MIDI.noteOff(0, 31, 0.4);
}

// game init
function game(){
    update();
    render();
}

// game loop

const framePerSecond = 60;
let loop = setInterval(game, 1000/framePerSecond);
