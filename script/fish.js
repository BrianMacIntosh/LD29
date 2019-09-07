window.FISH = {};
window.FISH.NORMAL = 1;
window.FISH.SHARK = 2;
window.FISH.SPIKE = 3;
window.FISH.BARRACUDA = 4;
window.FISH.MONSTER_FIN = 5;
window.FISH.MONSTER_TENTACLE = 6;

var fishBase = [];
fishBase[window.FISH.NORMAL] = {};
fishBase[window.FISH.NORMAL].normalVel = 70;
fishBase[window.FISH.NORMAL].normalAnimDelay = 120 / 1000.0;
fishBase[window.FISH.NORMAL].texture = THREE.ImageUtils.loadTexture("media/fish.png");
fishBase[window.FISH.NORMAL].frames = 4;
fishBase[window.FISH.NORMAL].width = 33;
fishBase[window.FISH.NORMAL].height = 16;
fishBase[window.FISH.NORMAL].geometryPool = [];
fishBase[window.FISH.NORMAL].hitBox = new Hitbox(-16, -8, 17, 8);
fishBase[window.FISH.NORMAL].headingWeight = 2;
fishBase[window.FISH.NORMAL].displaceWeight = 0.5;
fishBase[window.FISH.NORMAL].avoidWeight = 2;
fishBase[window.FISH.NORMAL].noncompliance = 0.2;
fishBase[window.FISH.NORMAL].perceptionRadius = 130;
fishBase[window.FISH.NORMAL].value = 1;
fishBase[window.FISH.NORMAL].strength = 180;

fishBase[window.FISH.SHARK] = {};
fishBase[window.FISH.SHARK].normalVel = 190;
fishBase[window.FISH.SHARK].normalAnimDelay = 200 / 1000.0;
fishBase[window.FISH.SHARK].texture = THREE.ImageUtils.loadTexture("media/shark.png");
fishBase[window.FISH.SHARK].frames = 4;
fishBase[window.FISH.SHARK].width = 100;
fishBase[window.FISH.SHARK].height = 36;
fishBase[window.FISH.SHARK].geometryPool = [];
fishBase[window.FISH.SHARK].hitBox = new Hitbox(-50, -10, 50, 11);
fishBase[window.FISH.SHARK].headingWeight = 0;
fishBase[window.FISH.SHARK].displaceWeight = 0.5;
fishBase[window.FISH.SHARK].avoidWeight = -3;
fishBase[window.FISH.SHARK].noncompliance = 0.1;
fishBase[window.FISH.SHARK].perceptionRadius = 170;
fishBase[window.FISH.SHARK].predator = true;
fishBase[window.FISH.SHARK].value = 3;
fishBase[window.FISH.SHARK].strength = 240;

fishBase[window.FISH.SPIKE] = {};
fishBase[window.FISH.SPIKE].normalVel = 220;
fishBase[window.FISH.SPIKE].normalAnimDelay = 100 / 1000.0;
fishBase[window.FISH.SPIKE].texture = THREE.ImageUtils.loadTexture("media/spike.png");
fishBase[window.FISH.SPIKE].frames = 4;
fishBase[window.FISH.SPIKE].width = 66;
fishBase[window.FISH.SPIKE].height = 33;
fishBase[window.FISH.SPIKE].geometryPool = [];
fishBase[window.FISH.SPIKE].hitBox = new Hitbox(-16.5, -28, 16.5, 33);
fishBase[window.FISH.SPIKE].headingWeight = 1;
fishBase[window.FISH.SPIKE].displaceWeight = 0.5;
fishBase[window.FISH.SPIKE].avoidWeight = -0.5;
fishBase[window.FISH.SPIKE].noncompliance = 0.2;
fishBase[window.FISH.SPIKE].perceptionRadius = 250;
fishBase[window.FISH.SPIKE].predator = true;
fishBase[window.FISH.SPIKE].value = 8;
fishBase[window.FISH.SPIKE].strength = 290;

fishBase[window.FISH.BARRACUDA] = {};
fishBase[window.FISH.BARRACUDA].normalVel = 260;
fishBase[window.FISH.BARRACUDA].normalAnimDelay = 80 / 1000.0;
fishBase[window.FISH.BARRACUDA].texture = THREE.ImageUtils.loadTexture("media/barracuda.png");
fishBase[window.FISH.BARRACUDA].frames = 4;
fishBase[window.FISH.BARRACUDA].width = 114;
fishBase[window.FISH.BARRACUDA].height = 33;
fishBase[window.FISH.BARRACUDA].geometryPool = [];
fishBase[window.FISH.BARRACUDA].hitBox = new Hitbox(-57, -25, 57, 33);
fishBase[window.FISH.BARRACUDA].headingWeight = 1;
fishBase[window.FISH.BARRACUDA].displaceWeight = 0.5;
fishBase[window.FISH.BARRACUDA].avoidWeight = -2;
fishBase[window.FISH.BARRACUDA].noncompliance = 0.1;
fishBase[window.FISH.BARRACUDA].perceptionRadius = 320;
fishBase[window.FISH.BARRACUDA].predator = true;
fishBase[window.FISH.BARRACUDA].value = 15;
fishBase[window.FISH.BARRACUDA].strength = 320;

fishBase[window.FISH.MONSTER_FIN] = {};
fishBase[window.FISH.MONSTER_FIN].texture = THREE.ImageUtils.loadTexture("media/monster_fin_chunk.png");
fishBase[window.FISH.MONSTER_FIN].frames = 1;
fishBase[window.FISH.MONSTER_FIN].width = 59;
fishBase[window.FISH.MONSTER_FIN].height = 62;
fishBase[window.FISH.MONSTER_FIN].geometryPool = [];
fishBase[window.FISH.MONSTER_FIN].value = 50;
fishBase[window.FISH.MONSTER_FIN].big = true;

var SPAWNRANGE = window.FISH.SPAWNRANGE = 140;


var Fish = function(type, dir, loc)
{
	this.dir = dir;
	this.type = type;
	if (this.type == 1)
	{
		
	}
	
	//Make resources
	//if (fishBase[this.type].geometryPool.length > 0)
	//	var geometry = fishBase[this.type].geometryPool.pop();
	//else
		var geometry = window.threeutil.makePlane(fishBase[this.type].width, fishBase[this.type].height);
	this.mesh = window.threeutil.makeMesh(fishBase[this.type].texture, geometry);
	
	var spawnDist = (Math.random()-0.5)*SPAWNRANGE*2;
	var spawnAng = Math.random() * 3.14159266 * 2;
	this.mesh.position.set(
		loc.x + spawnDist * Math.cos(spawnAng),
		loc.y + spawnDist * Math.sin(spawnAng),
		window.DEPTH.FISH);
	
	this.vel = new Vector2();
	this.vel.x = this.dir * this.velocity();
	this.vel.y = (Math.random()-0.5) * this.velocity();
	this.usevel = new Vector2();
	
	this.headingSum = new Vector2();
	this.displacementSum = new Vector2();
	this.avoidSum = new Vector2();
	
	this.nextFrame = fishBase[this.type].normalAnimDelay * Math.random();
	this.frame = Math.floor(Math.random()*fishBase[this.type].frames);
	this.incFrame();
	
	if (fishBase[this.type].hitBox)
		this.hitBox = fishBase[this.type].hitBox.copy();
}

Fish.prototype.update = function(deltaSec)
{
	if (this.caught) return;
	
	this.nextFrame -= deltaSec;
	if (this.nextFrame < 0)
	{
		this.nextFrame = this.frameLength();
		this.incFrame();
	}
	
	this.headingSum.x = this.headingSum.y = 0;
	this.displacementSum.x = this.displacementSum.y = 0;
	this.avoidSum.x = this.avoidSum.y = 0;
	
	//Flocking: find values
	for (var fishi in window.GAME.fishList)
	{
		var other = window.GAME.fishList[fishi];
		var dx = other.mesh.position.x - this.mesh.position.x;
		var dy = other.mesh.position.y - this.mesh.position.y;
		var distsq = dx*dx + dy*dy;
		if (distsq < fishBase[this.type].perceptionRadius*fishBase[this.type].perceptionRadius)
		{
			if (fishBase[other.type].predator && !fishBase[this.type].predator)
			{
				//Avoid predators
				this.avoidSum.x += dx;
				this.avoidSum.y += dy;
			}
			if (fishBase[other.type].predator == fishBase[this.type].predator)
			{
				//Displace from same foodchain
				this.displacementSum.x += dx;
				this.displacementSum.y += dy;
			}
			if (other.type == this.type)
			{
				//Flock with same type
				this.headingSum.add(other.vel);
			}
		}
	}
	for (var i in window.GAME.flockAvoiders)
	{
		var other = window.GAME.flockAvoiders[i];
		var dx = other.position.x - this.mesh.position.x;
		var dy = other.position.y - this.mesh.position.y;
		var distsq = dx*dx + dy*dy;
		if (distsq < fishBase[this.type].perceptionRadius*fishBase[this.type].perceptionRadius)
		{
			this.avoidSum.x += dx;
			this.avoidSum.y += dy;
		}
	}
	
	this.headingSum.normalize();
	this.headingSum.multiply(fishBase[this.type].headingWeight);
	this.displacementSum.normalize();
	this.displacementSum.multiply(fishBase[this.type].displaceWeight);
	this.avoidSum.normalize();
	this.avoidSum.multiply(fishBase[this.type].avoidWeight);
	
	this.usevel.x = (this.headingSum.x - this.displacementSum.x - this.avoidSum.x) + this.vel.x * fishBase[this.type].noncompliance;
	this.usevel.y = (this.headingSum.y - this.displacementSum.y - this.avoidSum.y) + this.vel.y * fishBase[this.type].noncompliance;
	
	this.usevel.normalize();
	this.usevel.multiply(this.velocity());
	
	//Fall out of sky
	if (this.mesh.position.y < 0)
		this.usevel.y = 100;
	
	this.dir = Math.sign(this.vel.x);
	
	this.mesh.position.set(
		this.mesh.position.x + this.usevel.x * deltaSec,
		this.mesh.position.y + this.usevel.y * deltaSec,
		window.DEPTH.FISH);
	
	this.hitBox.setPosition(this.mesh.position);
}

Fish.prototype.postUpdate = function(deltaSec)
{
	this.vel.x = this.usevel.x;
	this.vel.y = this.usevel.y;
}

Fish.prototype.catchOffset = function()
{
	var matrix = new THREE.Matrix4().makeTranslation(fishBase[this.type].width / 2, 0, 0);
	this.mesh.geometry.applyMatrix(matrix);
	this.mesh.geometry.verticesNeedUpdate = true;
}

Fish.prototype.destroy = function()
{
	//fishBase[this.type].geometryPool.push(this.mesh.geometry);
	this.mesh.geometry.dispose();
	window.GAME.scene.remove(this.mesh);
}

Fish.prototype.frameLength = function()
{
	return fishBase[this.type].normalAnimDelay;
}

Fish.prototype.velocity = function()
{
	return fishBase[this.type].normalVel;
}

Fish.prototype.incFrame = function()
{
	this.frame++;
	if (this.frame >= fishBase[this.type].frames) this.frame = 0;
	
	//Set UVs
	var incx = (1 / fishBase[this.type].frames);
	var stx = this.frame * incx;
	var enx = stx + incx;
	this.mesh.geometry.faceVertexUvs[0] = [];
	if (this.dir == 1)
	{
		this.mesh.geometry.faceVertexUvs[0][0] = [
			new THREE.Vector2(stx, 1),
			new THREE.Vector2(stx, 0),
			new THREE.Vector2(enx, 1)];
		this.mesh.geometry.faceVertexUvs[0][1] = [
			new THREE.Vector2(stx, 0),
			new THREE.Vector2(enx, 0),
			new THREE.Vector2(enx, 1)];
	}
	else
	{
		this.mesh.geometry.faceVertexUvs[0][0] = [
			new THREE.Vector2(enx, 1),
			new THREE.Vector2(enx, 0),
			new THREE.Vector2(stx, 1)];
		this.mesh.geometry.faceVertexUvs[0][1] = [
			new THREE.Vector2(enx, 0),
			new THREE.Vector2(stx, 0),
			new THREE.Vector2(stx, 1)];
	}
	this.mesh.geometry.uvsNeedUpdate = this.mesh.geometry.__dirtyUvs = true;
}