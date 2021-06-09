// 50 x 30 is bird's footprint

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

// flappy object to scope all Flappy Bird game specific variables and methods
var flappyGame = {
	soundPlayed: false, // if sound for scoring has been played yet
	score: 0, // score in current game
	enabled: true, // if flappy bird game is being played
	bird: {
		upForce: -35, // how much flappy bird goes up when the spacebar is clicked
		gravity: 2.0, // how much flappy bird goes down each loop iteration
		x: 0, y: 0, // bird's x and y position
		update: function(){ // to be called once per game loop, updates x and y coords for bird
			this.x = getXPosition("flappyBird"), this.y = getYPosition("flappyBird");
		},
		death: function(){
			this.gravity = 20.0; // makes bird fall down
			playSound("sound://category_points/negative_point_counter.mp3", false);
			
		}
	},
	
	pipes: {  // nested pipes object to store pipe specific attributes
		x: 0, y: 0, // pipe's x and y positions
		diff: 410,  // gap between top and bottom pipe
		speed: -2.0,  // speed for pipes to move across screen by
		move: function(){ // moves both pipes by specified amount
			// this.x += this.speed;
			move("topPipe", this.speed, 0);
			move("bottomPipe", this.speed, 0);
		}, 
		update: function(){ // to be called once per game loop, updates x and y coords for pipes
			this.x = getXPosition("bottomPipe"), this.y = getYPosition("bottomPipe");
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

onEvent("flappyBirdButton", "click", function( ) {
	setScreen("flappyBirdHomeScreen");
	flappyGame.pipes.spawn();
	timedLoop(20, function() {
	// applies gravity if flappy bird is being played and bird is above the ground
	if (flappyGame.enabled && getYPosition("flappyBird") < 405){
		move("flappyBird", 0, flappyGame.bird.gravity);
	}
	else console.log("hit ground");
	
	flappyGame.pipes.move();
	flappyGame.pipes.update();
	flappyGame.bird.update();
	
	// collision detection for flappy (i.e. bird has hit pipe)

	if (!flappyGame.bird.soundPlayed && flappyGame.bird.x > flappyGame.pipes.x - 45 && flappyGame.bird.x < flappyGame.pipes.x + 70 && (flappyGame.bird.y < flappyGame.pipes.y - 107 || flappyGame.bird.y > flappyGame.pipes.y - 30)){
		flappyGame.bird.death();
		flappyGame.bird.soundPlayed = true;
		hitCount++;
		console.log("bird hit pipe" + hitCount);
	}
	
	if (!flappyGame.bird.soundPlayed && flappyGame.pipes.x < flappyGame.bird.x - 70){
		playSound("sound://category_accent/puzzle_game_accent_a_06.mp3");
		flappyGame.bird.soundPlayed = true;
	}
	// if pipes have reached end of screen, increase the score and respawn pipes
	if (flappyGame.pipes.x < -80){
		flappyGame.score++;
		flappyGame.pipes.speed -= 0.2;
		flappyGame.pipes.spawn();
	}
	
	});
});

onEvent("flappyBirdHomeScreen", "keypress", function(event) {
	// var key = event.key;  // saves state of keypress in the variable key
	if (event.key == " "){
		// makes the bird "fly" if not at top of screen
		if(flappyGame.bird.y > 15) move("flappyBird", 0, flappyGame.bird.upForce);
		else console.log("hit roof");
	}
});
		




