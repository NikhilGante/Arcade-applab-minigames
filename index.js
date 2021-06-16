// Nikhil Gante
// June 14th, 2021
// ICS2O0
// "Nikhil's Arcade"
/*
The following project serves as a 4 minigame app, consisting of
Flappy Bird, Ninja, Pong, and Simon.
*/

var doneLoop = false; // global variable to make synchronous functions (waits)
var lastGame;	// global variable to sotre last game (used when game is lost)

// function to set x,y, and size attributes for all elements
function init(){
	setPosition("flappyBirdButton", 110, 100, 100, 40);
	setPosition("ninjaButton", 110, 190, 100, 40);
	setPosition("pongButton", 110, 280, 100, 40);
	setPosition("simonButton", 110, 370, 100, 40);
	setPosition("flappyBird", 50, 190, 60, 60);
}

// function to move specified elements around the screen
function move(id, x, y){
	setPosition(id, getXPosition(id) + x, getYPosition(id) + y);
}

// returns "sign" of a number (1 for positive, -1 for negative, and 0 for zero) - useful for velocities
function sgn(num){
  return num > 0 ? 1 : num < 0 ? -1 : 0;
}

// since Applab's setTimeout function is asynchronous(creates a new thread), this wait serves as blocking code
// it waits for the specified amount of milliseconds
function wait(time) {
	var timer = getTime();
	while (getTime() - timer < time){}
  }

// to be called once per game loop, updates x and y coords for all game objects
function update(game){	
	game.x = getXPosition(game.id), game.y = getYPosition(game.id);
}

// updates the score display for a game object passed in
function updateScore(game){
	setText(game.scoreId, "Score: " + game.score);
}

// function to be called when user dies
function endGame(game){
	lastGame = game;
	stopTimedLoop(game.loop);
	setScreen("deathScreen");
	setText("scoreDeathText", "Your score was: " + game.score);
}

// flappy object to scope all Flappy Bird game specific variables and methods
var flappyGame = {
	loop: null,	// variable to store timedloop id
	score: 0,  // score of flappyGame
	screen: "flappyBirdHomeScreen",	// screen for game
	soundPlayed: false, // if sound for scoring has been played yet
	scoreId: "scoreTextFlappy",	// id of the score display element
	enabled: true, // if flappy bird game is being played
	reset: function(){
		console.log("resetted");
		setScreen(this.screen);
		this.loop = null;
		this.score = 0;
		this.soundPlayed = false;
		this.enabled = true;
		this.bird.gravity = 2.0;
		setPosition("flappyBird", 50, 190);
		flappyGame.pipes.spawn();	// spawns new pipes
		// shows score
		showElement(flappyGame.scoreId);
		setPosition(flappyGame.scoreId, 155, 410, 175, 35);
		setText(flappyGame.scoreId, "Score: 0");
	},
	main: function(){	// where the repeated part of the game code lies
		flappyGame.loop = timedLoop(20, function() {
			// applies gravity if flappy bird is being played and bird is above the ground
			if (flappyGame.enabled && getYPosition("flappyBird") < 405){
				move("flappyBird", 0, flappyGame.bird.gravity);
			}
			else{
				console.log("hit ground");
				endGame(flappyGame);
			}
			
			flappyGame.pipes.move();
			update(flappyGame.pipes);
			update(flappyGame.bird);
			
			// collision detection for flappy (i.e. bird has hit pipe)
			if (!flappyGame.bird.soundPlayed && flappyGame.bird.x > flappyGame.pipes.x - 45 && flappyGame.bird.x < flappyGame.pipes.x + 70 && (flappyGame.bird.y < flappyGame.pipes.y - 107 || flappyGame.bird.y > flappyGame.pipes.y - 20)){
				flappyGame.bird.death();
				flappyGame.bird.soundPlayed = true;
				hitCount++;
				console.log("bird hit pipe" + hitCount);
				endGame(flappyGame);
			}
			
			if (!flappyGame.bird.soundPlayed && flappyGame.pipes.x < flappyGame.bird.x - 70){
				playSound("sound://category_accent/puzzle_game_accent_a_06.mp3");
				flappyGame.bird.soundPlayed = true;
			}
			// if pipes have reached end of screen, increase the score and respawn pipes
			if (flappyGame.pipes.x < -80){
				flappyGame.score++;
				setText(flappyGame.scoreId, "Score: " + flappyGame.score);	// updates score display
				flappyGame.pipes.speed -= 0.2;
				flappyGame.pipes.spawn();
			}
		  });
	},
	bird: {
		id: "flappyBird",	// flappy image id
		upForce: -35, // how much flappy bird goes up when the spacebar is clicked
		gravity: 2.0, // how much flappy bird goes down each loop iteration
		x: 0, y: 0, // bird's x and y position
		death: function(){
			this.gravity = 25.0; // makes bird fall down
			playSound("sound://category_points/negative_point_counter.mp3", false);
		}
	},
	pipes: {  // nested pipes object to store pipe specific attributes
		id: "bottomPipe",	// flappy image id
		x: 0, y: 0, // pipe's x and y positions
		diff: 410,  // gap between top and bottom pipe
		speed: -2.0,  // speed for pipes to move across screen by
		move: function(){ // moves both pipes by specified amount
			move("topPipe", this.speed, 0);
			move("bottomPipe", this.speed, 0);
		}, 
		spawn: function(){
			// creates "new" set of bottom and top pipes, and position them randomly but still on screen
			flappyGame.pipes.x = 320,  flappyGame.pipes.y = randomNumber(125, 395);
			setPosition("bottomPipe", flappyGame.pipes.x, flappyGame.pipes.y);
			setPosition("topPipe", flappyGame.pipes.x, flappyGame.pipes.y - flappyGame.pipes.diff);
			flappyGame.bird.soundPlayed = false;
		}
	}
};
var hitCount = 0;
init();

// on events for buttons to enter minigames

onEvent("flappyBirdButton", "click", function() {
	flappyGame.reset();	// resets game variables and elements
	flappyGame.main();	// main game loop
});

onEvent("flappyBirdHomeScreen", "keypress", function(event) {
	if (event.key == " "){
		// makes the bird "fly" if not at top of screen
		if(flappyGame.bird.y > 15) move("flappyBird", 0, flappyGame.bird.upForce);
		else{
		  console.log("hit roof");
		}	
	}
});

// NINJA GAME

// ninja object to scope all ninja game specific variables and methods
var ninjaGame = {
	loop: null,	// variable to store timedloop id
	score: 0, // score of ninjaGame
	scoreId: "scoreTextNinja",	// id of the score display element
	ninja: { // ninja object
		id: "ninja",	// ninja image id
		x: 0, y: 0, // ninja's x and y position
		topY: 130, bottomY: 220,	// y position of ninja at top and bottom state
		prevState: "bottomNinja", // id of last state of ninja (top or bottom) 
		curState: "topNinja", // id of current state of ninja (top or bottom)
		update: function(){  // to be called once per game loop, updates x and y coords for ninja
			// uses ternary operator to efficiently determine y position
			this.y = this.curState == "topNinja"? this.topY: this.bottomY;
		},
	},
	spike:  {  // spike object
		id: "spikeCanvas",	// spike image id
		x: 0, y: 0, // spike's x and y position
		topY: 130, bottomY: 220,	// y position of spike at top and bottom state
		speed: -3,  // spikes's speed to move across screen
		move: function(){ // moves spike across screen at spikes's speed
			move("spikeCanvas", this.speed, 0);
		},
		spawn: function(){  // creates "new" spike and picks random position
			this.x = 320,	this. y = Math.random() < 0.5? this.topY : this.bottomY;
			setPosition("spikeCanvas", this.x, this.y);
		}
	}
};  
onEvent("ninjaButton", "click", function( ) {
	setScreen("ninjaHomeScreen");
	hideElement("bottomNinja");
	ninjaGame.ninja.state = "topNinja";	// the ninja starts on top by default
	
	// shows score
	showElement(ninjaGame.scoreId);
	setPosition(ninjaGame.scoreId, 145, 410, 175, 35);
	setText(ninjaGame.scoreId, "Score: 0");

	setActiveCanvas("spikeCanvas");	// makes the spike canvas active to draw on
	rect(0,0, 55, 100);	// fills in the canvas with a black rectangle (which is the spike)
	
	ninjaGame.loop = timedLoop(20, function() {
		ninjaGame.ninja.update();
		update(ninjaGame.spike);
		move("spikeCanvas", ninjaGame.spike.speed, 0);
		if(ninjaGame.spike.x < -55){	// respawns spike when at end of screen
			ninjaGame.score++;	// increments score
			setText(ninjaGame.scoreId, "Score: " + ninjaGame.score);	// updates score display
			ninjaGame.spike.speed -= 0.4;
			ninjaGame.spike.spawn();
		}
		// collision detection for spike and ninja
		// makes sure states of ninja and spike match up before checking if both x positions match up
		if(ninjaGame.spike.y == ninjaGame.ninja.y && ninjaGame.spike.x > ninjaGame.ninja.x && ninjaGame.spike.x < ninjaGame.ninja.x + 100){ 
			console.log("spike hit ninja");
			endGame(ninjaGame);
		}	
	});
}); 
onEvent("ninjaHomeScreen", "keypress", function(event) {
	if (event.key == " "){
		// flips ninja on platform
		// remember to play some woosh sound here
		if(ninjaGame.ninja.curState == "topNinja"){ // ninja is now on bottom
			ninjaGame.ninja.prevState = "topNinja";
			ninjaGame.ninja.curState = "bottomNinja";
		}
		else{ // ninja is now on top
			ninjaGame.ninja.prevState = "bottomNinja";
			ninjaGame.ninja.curState = "topNinja"; 
		}
		hideElement(ninjaGame.ninja.prevState);
		showElement(ninjaGame.ninja.curState);
	}
});

// PONG GAME

var pongGame = {
	loop: null,	// variable to store timedloop id
	score: 0, // score of pongGame
	scoreId: "scoreTextPong",	// id of the score display element
	ball: {
		id: "ball",	// ball image id
		x: randomNumber(20, 288), y: randomNumber(20, 300), // sets ball at random position every run
		xSpeed: 2.4, ySpeed : 2.4, // how fast ball moves in x and y
	},
	paddle: {
		id: "paddle",	// paddle image id
		x: 0, y: 0, // position of ball
	}
};

onEvent("pongHomeScreen", "keydown", function(event) {
	switch(event.key){
		case "Left":
			if(pongGame.paddle.x > 0){
				move("paddle", -20, 0);
			}
			break;
		case "Right":
			if(pongGame.paddle.x < 252){
				move("paddle", 20, 0);
			}
			break;
	}
});

onEvent("pongButton", "click", function() {
	setScreen("pongHomeScreen");
		// shows score
		showElement(pongGame.scoreId);
		setPosition(pongGame.scoreId, 145, 410, 175, 35);
		setText(pongGame.scoreId, "Score: 0");
	
		pongGame.loop = timedLoop(20, function() {
			update(pongGame.ball);
			update(pongGame.paddle);
			// if ball hits sides of screen, bounces off screen by inverting the ball's x velocity
			if(pongGame.ball.x < 0 || pongGame.ball.x > 307){
				pongGame.ball.xSpeed *= -1;
			}
			// if ball hits top of screen, bounces off screen by inverting ball's y velocity
			if(pongGame.ball.y < 0 || pongGame.ball.y > 437){
				pongGame.ball.ySpeed *= -1;
			}
			// otherwise, if the ball hits the paddle, also invert ball's y velocity and increment score
			else if(pongGame.ball.x > pongGame.paddle.x && pongGame.ball.x < pongGame.paddle.x + 64 && pongGame.ball.y < pongGame.paddle.y && pongGame.ball.y > pongGame.paddle.y - 12){
				pongGame.ball.ySpeed *= -1;
				pongGame.score++;
				setText(pongGame.scoreId, "Score: " + pongGame.score);
				pongGame.ball.xSpeed += sgn(pongGame.ball.xSpeed) * 0.2;
				pongGame.ball.ySpeed += sgn(pongGame.ball.ySpeed) * 0.2;
			}
			// ends game if ball touches ground
			if(pongGame.ball.y > 430){
				console.log("game over");
				endGame(pongGame);
			}
			move("ball", pongGame.ball.xSpeed, pongGame.ball.ySpeed);
	});
});

// SIMON GAME

var simonGame = {
	loop: null,	// variable to store timedloop id
	score: 0,	// score of simonGame
	scoreId: "scoreTextSimon",	// id of the score display element
	curNum: 0,	// iterator of user input loop (keeps track of how far in the sequence the user is in)
	compPattern: [],	// array to store computer-generated pattern
	input: 0, // number of button last pressed
	userTurn: false,	// if in user sequence phase
	addCompElement: function(){
		console.log("adding comp element");
		this.compPattern.push(randomNumber(0, 4));
	},
	flashButton: function(buttonId){	// rapidly shrinks and grows button to singify it's been pressed

		// playSound();

		// shrinks button (and moves it correspondingly so the centre is still in the same position)
  		move(buttonId, 20, 20);
  		setProperty(buttonId, "width", 60);
  		setProperty(buttonId, "height", 60);

		wait(150);	// pauses for 150 milliseconds

		// enlarges button (and moves it back to the original position)
		move(buttonId, -20, -20);
		setProperty(buttonId, "width", 100);
		setProperty(buttonId, "height", 100);

		wait(150);	// pauses for 150 milliseconds	
	},
	compSequence: function(){
		wait(500);	// pauses for 500 milliseconds	
		console.log("in comp sequence");

		for(var x in this.compPattern){
			console.log(this.compPattern[x]);
			simonGame.flashButton("simonButton" + this.compPattern[x]);
		}
		console.log("exited comp sequence");
		this.userTurn = true;	// it is the user's turn now
	},
	handleInput: function(buttonNum) {
		console.log("handling input");
		
		if (this.userTurn){	// if it is user's turn
			this.flashButton("simonButton" + buttonNum);
			this.input = buttonNum;	// sets the input according to the button pressed
			if(this.input == this.compPattern[this.curNum]){	// user correctly selected the level
				this.curNum++;	// increment sequence iterator
				if(this.curNum >= this.compPattern.length){	// user has passed level
					this.score++;	// increments score
					setText(this.scoreId, "Score: " + this.score);	// updates score display
					this.curNum = 0;	// resets iterator for next round
					this.userTurn = false;
				}
			}
			else{
				console.log(this.compPattern);
				console.log("num: " + this.curNum);
				console.log("user failed" + "input was: " + this.input + " target was: " + this.compPattern[this.curNum]);
				endGame(this);
			}
		}
	},
};

onEvent("simonButton0", "click", function() {	// Top button
	simonGame.handleInput(0);
});
onEvent("simonButton1", "click", function() {	// Left button
	simonGame.handleInput(1);
});
onEvent("simonButton2", "click", function() {	// Centre button
	simonGame.handleInput(2);
});
onEvent("simonButton3", "click", function() {	// Right button
	simonGame.handleInput(3);
});
onEvent("simonButton4", "click", function() {	// Bottom button
	simonGame.handleInput(4);
});

// main simon game
onEvent("simonButton", "click", function() {
	setScreen("simonHomeScreen");
	
	// shows score
	showElement(simonGame.scoreId);
	setPosition(simonGame.scoreId, 145, 410, 175, 35);
	setText(simonGame.scoreId, "Score: 0");

	simonGame.loop = timedLoop(20, function() {
		if(!simonGame.userTurn){
			simonGame.addCompElement();	// adds one new element to the computer's pattern
			simonGame.compSequence();	// flashes the buttons according to the sequence chosen by the computer
		}
	});
});

onEvent("playAgainButton", "click", function() {
	lastGame.reset();	// resets game
	lastGame.main();	// plays main game loop
});

onEvent("homeButton", "click", function() {
	setScreen("homeScreen");
});
