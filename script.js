/*
- Chinese Soft Shell Turtles Urinate From Their Mouths
- Written by William Winters in 2020 AD
- This work, such as it is, is in the Public Domain
- Attribution would be appreciated
*/


//======================setup canvas==================================

var canvas = document.getElementById("Canvas");
//canvas.width = window.innerWidth - window.innerWidth/16;
//canvas.height = 450;//window.innerHeight;
var cntxt = canvas.getContext('2d');
const cHeight = canvas.height;
const cWidth = canvas.width;




//====================classes========================================

class Sprite{
  constructor(x , y , xVel ,yVel , c , width , aspectRatio){
    this.x = x;
    this.y = y;
    this.xVel = xVel;
    this.yVel = yVel;
	this.c = c;
	this.width = width;
	this.height = aspectRatio * this.width;
	this.img = new Image();
	this.moveClock = performance.now();
  }
  update(){
	this.updatePos();
	this.draw();	
  }
  updatePos(){
	let time = performance.now();
	//update position
	this.x += this.xVel * (time - this.moveClock)/(1000/60);
	this.y += this.yVel * (time - this.moveClock)/(1000/60);
	
	this.moveClock = time;
	//implement wraparound
	if(this.x < 0){
	  this.x += cWidth;
	}
	else if(this.x > cWidth){
	  this.x -= cWidth;
	}
	
	if(this.y < 0){
	  this.y += cHeight;
	}
	else if(this.y > cHeight){
	  this.y -= cHeight;
	}
	
		
  }
  draw(){
	  if (this.img.src){
	   this.c.drawImage(this.img,this.x - this.width/2,this.y - this.height/2,this.width,this.height);
	  }
	  else {
        this.c.beginPath();
	    this.c.fillStyle = "red";
	    this.c.fillRect(this.x - this.width/2 , this.y -this.height/2, this.width, this.height);
	  }
  }
}
//============================Turtle=================================
class Turtle extends Sprite{
	constructor(x , y , xVel ,yVel , c , width , aspectRatio){
	  super(x , y , xVel ,yVel , c , width , aspectRatio);
	  this.fric = 0.3;
	  this.acell = 0.4;
	  this.pee = [];
	  
	  this.xDir; //unit vector giving relative direction of mouse
	  this.yDir;
	  
	  this.peeClock = performance.now();
	}
	update(x,y){
	  var relX = x - this.x;
      var relY = y - this.y;
	  this.xDir = relX/mag(relX,relY);
	  this.yDir = relY/mag(relX,relY);
	  
	  //console.log(this.xDir , this.yDir);
		
		
	  this.updateVel(x,y);
	  this.updatePos();
	  
	  this.peeManager();
	  this.draw(x,y);
	}
	updateVel(){
	  // console.log(relX);
	  // console.log(mag(relX,relY));
	  //console.log(this.x + "  " + this.y);
	  //console.log(this.xVel);
	  
	  if(gamestate.thrust){
	    this.xVel += this.acell * this.xDir;
	    this.yVel += this.acell * this.yDir;
	  }
	  
	  if(this.xVel+this.yVel != 0){//if the turtle is moving
	    this.xVel -= this.fric * this.xVel/mag(this.xVel , this.yVel);
	    this.yVel -= this.fric * this.yVel/mag(this.xVel , this.yVel);
	    //decrease speed porpto x and y
	    //doesn't like dividing by zero.
	  }
	  
	  
	}
	draw(){
		/*displays the turtle, and does rotations*/
		
	  if (this.img.src){ //if the texture is good
		this.c.translate(this.x , this.y); //move ontext to turtle
		this.c.rotate(vectToAngle(this.xDir, this.yDir)); //rotate context
		
		//console.log(this.c.getTransform());
	    this.c.drawImage(this.img, -this.width/2,-this.height/2,this.width,this.height); //draw, adjusting texture to center
		this.c.setTransform(1,0,0,1,0,0); //reset context
		
	  }
	  else {
        this.c.beginPath();
	    this.c.fillStyle = "red";
	    this.c.fillRect(this.x , this.y , this.width, this.height);
	  }
	}
	peeManager(){
		//looks after the pee
	  
	  if (gamestate.fire && performance.now() - this.peeClock > 1000/16){ // fires after a certain amount of time
	  
		//Pee is constructed here
	    var peeTemp = new Pee(this.x , this.y , this.xDir*10 , this.yDir*10 , this.c , 6 , 1);
		peeTemp.img = peePic;
		
		//console.log(this.xDir , this.yDir);
		this.pee.push(peeTemp);
		this.peeClock = performance.now();
	  }
//		console.log(this.pee);
	  
	  
	  //update pees
	  this.pee.forEach(function(value,index,array){//for each drop
	    //value.colision(pad);
		if(value.kill){
		  array.splice(index,1);
	   }
		
  	    value.update();
	   });
	   
	 
	}
}

class Target extends Sprite{
	constructor(x , y , xVel ,yVel , c , width , aspectRatio){
	  super(x , y , xVel ,yVel , c , width , aspectRatio);
	}
	
	
}
//========================Pee class=================================
class Pee extends Sprite{
	constructor(x , y , xVel ,yVel , c , width , aspectRatio){
	  super(x , y , xVel ,yVel , c , width , aspectRatio);
	  this.kill = false;
	}
	updatePos(){
	  let time = performance.now();
	  //update position
	  this.x += this.xVel * (time - this.moveClock)/(1000/60);
	  this.y += this.yVel * (time - this.moveClock)/(1000/60);
	
	  this.moveClock = time;
	  //die if go out of bounds
	  if(this.x < 0 || this.x > cWidth || this.y < 0 || this.y > cHeight){
	    this.kill = true;
	  }
	}
	colision(obj){
	  if(colide(this,obj)){
	    this.kill = true;  
	  }
	}
	draw(){
		this.c.beginPath();
	    this.c.fillStyle = "yellow";
	    this.c.arc(this.x,this.y,this.width/2,0,2*Math.PI);
		this.c.fill();
	}
	
	
}

//======================================== game state ==============
var gamestate = {
	fire:false,
	thrust:false,
	mouseX:0,
	mouseY:0,
	spawnClock: performance.now(),
	score:0,
	highScore:0,
	//target info goes below
	targets: [],
	numTargets: 16,
	speedTargets: 5,
	spawnDelay: 250,
	update: function(){
		this.colisionDetector(turtle.pee);
		this.targetManager();
	},
	targetManager: function(){
		//spawner
		//if there aren't too many and if enough time has passed
		let spawnX = Math.random()*cWidth;
		let spawnY = Math.random()*cHeight;
		
		if(this.targets.length <= this.numTargets && 
		performance.now() - this.spawnClock > this.spawnDelay &&
		Math.abs(spawnX - turtle.x) > 100 &&
		Math.abs(spawnY - turtle.y) > 100
		){
			//add target
			tempTarget = new Target(spawnX ,spawnY , 2*this.speedTargets*Math.random()-this.speedTargets, 2*this.speedTargets*Math.random()-this.speedTargets , cntxt , 32 , 1);
			tempTarget.img = targetPic;
			this.targets.push(tempTarget);
			this.spawnClock = performance.now();
		}
		
		//updates
		this.targets.forEach(function(value,index,array){//for each target
		
		  if(value.kill){
		    array.splice(index,1);
	      }
		
  	      value.update();
	     });//end foreach;
	},
	colisionDetector: function(proj){//takes array of projectiles
		this.targets.forEach(function(value){//for each target
		
		  for(var i = 0 ; i < proj.length ; i++){
			if(colide(value,proj[i])){
				value.kill = true;
				proj[i].kill=true;
				
				gamestate.incScore();
				
			}
		  }
		  
		
	      if (colide(turtle,value)){
			console.log("ded");
			reset();
		  }
		
  	     
	     });//end foreach1
		
	},
	incScore: function(){
		//document.getElementById("score").innerHTML = "gpgpgp";
		this.score += 50;
		document.getElementById("scoreEl").innerHTML = this.score;
		
		if(this.score > this.highScore){
			this.highScore = this.score;
			document.getElementById("highScoreEl").innerHTML = this.highScore;
		}
		
				
		
	}
}
//======================functions========================

function mag(X ,Y){
// returns factor to make a unit vector
  return Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2));
}
function vectToAngle(x , y){
  //returns angle of vector relative to theta = 0;
  return Math.atan2(y,x); 
}

function colide(obj1 , obj2){
	//uses very simple collisions. might update later
	if((obj1.x + obj1.width/2 > obj2.x - obj2.width/2 && 
	  obj1.x - obj1.width/2 < obj2.x + obj2.width/2)&&
	  (obj1.y + obj1.height/2 > obj2.y - obj2.height/2 &&
	  obj1.y - obj1.height/2 < obj2.y + obj2.height/2)){
	    
		console.log("colision");
		return true;
	  }
	else{
	  return false;
	}
}

function reset(){
	gamestate.targets.length = 0;
	gamestate.score = 0;
	
	document.getElementById("scoreEl").innerHTML = 0;
	
	turtle.x = 300;
	turtle.y = 300;
	turtle.xVel = 0;
	turtle.yVel = 0;
	turtle.pee.length = 0;
}




//===============define global vars==================
var peePic = new Image();
peePic.src = "images/PeeV1.png";
var turtlePic = new Image();
turtlePic.src = "images/Chinese-Softshell-Turtle-Sprite.png";
var targetPic = new Image();
targetPic.src = "images/Mush.png";

var test = new Image();
test.src = "images/tile-test4.png";
var pat = "pink";
pat = cntxt.createPattern(test,"repeat");

//===============construct objects====================

var turtle = new Turtle(300,300, 0,0,cntxt , 50 , 69/100);
	turtle.img = turtlePic;
//var pad = new Sprite(300,300, 0, 0, cntxt , 50 , 1);

//=============input functions=========================

canvas.addEventListener("mousemove", function(){
//	console.log(event.offsetX);
//	console.log(event.offsetY);
	
	gamestate.mouseX = event.offsetX;
	gamestate.mouseY = event.offsetY;
});
canvas.addEventListener("mousedown", function(){
//	console.log("down");
	if(event.button == 0){
		gamestate.thrust = true;
	//	gamestate.fire = true;
	}
});
canvas.addEventListener("mouseup", function(){
//	console.log("up");
	if(event.button == 0){
		gamestate.thrust = false;
	//	gamestate.fire = false;
	}
});
window.addEventListener("keydown", function(){
	//console.log("down");
	if(event.key = ' '){
		gamestate.fire = true;
	//	gamestate.thrust = true;
	}
});
window.addEventListener("keyup", function(){
	if(event.key = ' '){
	//	console.log("up");
		gamestate.fire = false;
	//	gamestate.thrust = false;
	}
});


//animation loop  
function drawFrame(){
  window.requestAnimationFrame(drawFrame);
  
  //draw background
  pat = cntxt.createPattern(test,"repeat");
  cntxt.fillStyle = "green";
  cntxt.fillStyle = pat;
  cntxt.fillRect(0,0,cWidth,cHeight);
// pad.update();
 
  turtle.update(gamestate.mouseX,gamestate.mouseY);
  
 
  gamestate.update();
  
   
  
}

//set the ball rolling
drawFrame();

//to do
/*
collisions:
simple
advanced

sound

background

textures:
pee
targets

game loop to control targets/

rescale turtle for final size

draw pee with path. its easier??

make targets things michael is allergic to:
dogs
mr peanut
eggs?


*/