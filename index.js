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

// to be called once per game loop, updates x and y coords for object
function update(obj){
	obj.x = getXPosition(obj.id), obj.y = getYPosition(obj.id);
}

function showScore(){ // displays score text
  showElement("scoreText");
  setPosition("scoreText", 145, 410, 175, 35);
  setText("scoreText", "Score: 0");
}


// flappy object to scope all Flappy Bird game specific variables and methods
var flappyGame = {
	soundPlayed: false, // if sound for scoring has been played yet
	score: 0, // score in current game
	enabled: true, // if flappy bird game is being played
	bird: {
		id: "flappyBird",	// flappy image id
		upForce: -35, // how much flappy bird goes up when the spacebar is clicked
		gravity: 2.0, // how much flappy bird goes down each loop iteration
		x: 0, y: 0, // bird's x and y position
		death: function(){
			this.gravity = 20.0; // makes bird fall down
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

onEvent("flappyBirdButton", "click", function( ) {
	setScreen("flappyBirdHomeScreen");
	flappyGame.pipes.spawn();
	showScore();
	timedLoop(20, function() {
  	// applies gravity if flappy bird is being played and bird is above the ground
  	if (flappyGame.enabled && getYPosition("flappyBird") < 405){
  		move("flappyBird", 0, flappyGame.bird.gravity);
  	}
  	else{
  	  console.log("hit ground");
  	
  	}
  	flappyGame.pipes.move();
		update(flappyGame.pipes);
		update(flappyGame.bird);
  	
  	// collision detection for flappy (i.e. bird has hit pipe)
  	if (!flappyGame.bird.soundPlayed && flappyGame.bird.x > flappyGame.pipes.x - 45 && flappyGame.bird.x < flappyGame.pipes.x + 70 && (flappyGame.bird.y < flappyGame.pipes.y - 107 || flappyGame.bird.y > flappyGame.pipes.y - 30)){
  		flappyGame.bird.death();
  		flappyGame.bird.soundPlayed = true;
  		hitCount++;
  		console.log("bird hit pipe" + hitCount);
  		stopTimedLoop();
  	}
  	
  	if (!flappyGame.bird.soundPlayed && flappyGame.pipes.x < flappyGame.bird.x - 70){
  		playSound("sound://category_accent/puzzle_game_accent_a_06.mp3");
  		flappyGame.bird.soundPlayed = true;
  	}
  	// if pipes have reached end of screen, increase the score and respawn pipes
  	if (flappyGame.pipes.x < -80){
  		flappyGame.score++;
  		setText("scoreText", "Score: " + flappyGame.score);
  		flappyGame.pipes.speed -= 0.2;
  		flappyGame.pipes.spawn();
  	}
  	
  	});
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
	score: 0,
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
		// update: function(){  // to be called once per game loop, updates x and y coords for spike
		// 	this.x = getXPosition("spikeCanvas");
		// 	this.y = getYPosition("spikeCanvas");
		// },
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
	ninjaGame.ninja.state = "topNinja";
	showScore();
  setActiveCanvas("spikeCanvas");
	rect(0,0, 55, 100);
	timedLoop(20, function() {
		ninjaGame.ninja.update();
		update(ninjaGame.spike);
		move("spikeCanvas", ninjaGame.spike.speed, 0);
		if(ninjaGame.spike.x < -55){	// respawns spike when at end of screen
			ninjaGame.score++;	// increments score
			setText("scoreText", "Score: " + ninjaGame.score);
			ninjaGame.spike.speed -= 0.4;
			ninjaGame.spike.spawn();
		}
		// collision detection for spike and ninja
		// makes sure states of ninja and spike match up before checking if both x positions match up
		if(ninjaGame.spike.y == ninjaGame.ninja.y && ninjaGame.spike.x > ninjaGame.ninja.x && ninjaGame.spike.x < ninjaGame.ninja.x + 100){ 
			console.log("spike hit ninja");
			stopTimedLoop();
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
