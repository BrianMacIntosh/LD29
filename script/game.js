
var gameAttachDOM = function(){

window.GAME = {};
window.GAME.flockAvoiders = [];

//Set up global variables
window.GAME.C_PLAYER_HAS_FISH = 0;     //The current number of fish held
window.GAME.C_PLAYER_DAMAGE = 1;       //The current sub damage
window.GAME.C_PLAYER_MAX_DEPTH = 2;    //The maximum depth achieved
window.GAME.C_PLAYER_TOTAL_FISH = 3;   //The total number of fish caught and sold ever
window.GAME.C_PLAYER_MONEY = 4;        //The player's current money
window.GAME.C_PLAYER_TOTAL_PROFIT = 5; //All player income ever

//Out-of-convo interactions
window.GAME.I_NONE = 0;
window.GAME.I_REPAIR = 1;
window.GAME.I_BUYFISH = 2;
window.GAME.I_GIVEMONEY = 3;
window.GAME.I_TAKELOAN = 4;

window.GAME.C_COUNT = 6;

var maxDepthAchieved = 0;
var totalFishSold = 0;
var totalMoneyMade = 0;

window.GAME.getGlobalVariable = function(variable)
{
	switch (variable)
	{
	case window.GAME.C_PLAYER_HAS_FISH:
		var fish = 0;
		for (var i = 0; i < fishList.length; i++)
			if (fishList[i].caught) fish++;
		return fish;
	case window.GAME.C_PLAYER_DAMAGE:
		return currentDamage();
	case window.GAME.C_PLAYER_MAX_DEPTH:
		return maxDepthAchieved;
	case window.GAME.C_PLAYER_TOTAL_FISH:
		return totalFishSold;
	case window.GAME.C_PLAYER_MONEY:
		return playerMoney;
	case window.GAME.C_PLAYER_TOTAL_PROFIT:
		return totalMoneyMade;
	default:
		return globalVariables[variable];
	};
};

window.GAME.caughtFishOfType = function(fishtype)
{
	var ret = 0;
	for (var i = 0; i < fishList.length; i++)
		if (fishList[i].type == fishtype)
			ret++;
	return ret;
}

var currentDamage = function()
{
	return playerMaxHealth - playerHealth;
}

var currentDamageCost = function()
{
	return repairCost * currentDamage();
}

var takeLoanValid = window.GAME.takeLoanValid = function()
{
	return playerDead && playerMoney < currentDamageCost();
}

var destroyCaughtFish = function()
{
	for (var i = fishList.length - 1; i >= 0; i--)
	{
		if (fishList[i].caught && !fishList[i].unloaded)
		{
			fishList[i].destroy();
			fishList.splice(i, 1);
		}
	}
}

var sellCaughtFish = function()
{
	for (var i = fishList.length - 1; i >= 0; i--)
	{
		if (fishList[i].caught && !fishList[i].unloaded)
		{
			totalMoneyMade += fishBase[fishList[i].type].value;
			totalFishSold++;
			playerMoney += fishBase[fishList[i].type].value;
			fishList[i].destroy();
			fishList.splice(i, 1);
		}
	}
}

window.GAME.doInteraction = function(interaction, target)
{
	switch (interaction)
	{
	case window.GAME.I_REPAIR:
		for (var i = playerHealth; i < playerMaxHealth && playerMoney >= repairCost; i++)
		{
			playerMoney -= repairCost;
			playerHealth++;
		}
		break;
	case window.GAME.I_BUYFISH:
		sellCaughtFish();
		break;
	case window.GAME.I_GIVEMONEY:
		target.moneyGiven += playerMoney;
		playerMoney = 0;
		break;
	case window.GAME.I_TAKELOAN:
		if (takeLoanValid())
			playerMoney = currentDamageCost();
		break;
	}
};

var getInteractionString = function(interaction)
{
	switch (interaction)
	{
	case window.GAME.I_NONE:
		return "Do Nothing";
	case window.GAME.I_REPAIR:
		return "Repair Sub";
	case window.GAME.I_BUYFISH:
		return "Sell Fish";
	case window.GAME.I_GIVEMONEY:
		return "Give Money";
	case window.GAME.I_TAKELOAN:
		return "Take Out Loan";
	default:
		return "Unknown";
	}
}

var showInteractText = function(text, target)
{
	interactText.innerHTML = text;
	var d = gameToAbsolute(target.position.x, characterY);
	interactText.style.bottom = (d.y + 40) + "px";
	interactText.style.left = (d.x - 50) + "px";
	interactText.style.visibility = "visible";
};

var hideInteractText = function()
{
	interactText.style.visibility = "hidden";
}

var createSpeechBox = function(text, node)
{
	//Set up convo
	var speech = document.createElement("div");
	speech.setAttribute("class", "speechBox");
	speech.innerHTML = text;
	positionSpeechBox(speech, node);
	canvasDiv.appendChild(speech);
	return speech;
};

var gameToAbsolute = function(x, y)
{
	return new Vector2(
		Math.floor(x - camOffX + screenWidth/2),
		Math.floor(screenHeight - (y - camOffY + screenHeight/2)));
}

var absoluteToGame = function(x, y)
{
	return new Vector2(
		x + camOffX - screenWidth/2,
		(y - screenHeight) + camOffY + screenHeight/2);
}

var positionSpeechBox = function(box, node)
{
	var d = gameToAbsolute(node.speaker ? node.speaker.mesh.position.x : playerMesh.position.x,
			node.speaker ? node.speaker.mesh.position.y : playerMesh.position.y);
	box.style.bottom = (d.y + 30) + "px";
	box.style.left = (d.x - 50) + "px";
};

var speechBoxes = [];
var activeConvo = null;

window.GAME.showDialog = function(node)
{
	node.speechElement = createSpeechBox(node.text, node);
	activeConvo = node;
	speechBoxes.push(node);
};

window.GAME.hideDialog = function(node)
{
	canvasDiv.removeChild(node.speechElement);
	node.speechElement = null;
	for (var i = speechBoxes.length; i >= 0; i--)
		if (speechBoxes[i] == node)
			speechBoxes.splice(i, 1);
	if (activeConvo == node)
		activeConvo = null;
};

window.GAME.onAdvanceDialog = null;


var playerMaxSpeed = 150.0;
var playerReallyMaxSpeed = 400;
var playerAccel = 300.0;
var playerDecel = 100.0;

var playerWalkSpeed = 80;

var minimumShadow = 0.4;
var depthToPitch = 6000;

var maxSpawnInterval = 3000;
var minSpawnInterval = 1200;
var spawnRand = 800;
var depthToMinSpawn = 5000;

var harpoonVelocity = 700;
var harpoonRange = 300;
var harpoonReelSpeed = 250;
var harpoonOffX = 25;
var harpoonOffY = 28;

var killOffscreenFish = 400;

var interactRadius = 30;
var playerMaxHealth = 6;
var repairCost = 10;
var playerInvulnerableTime = 3;
var floatSpeed = 30;
var deathTime = 4;

var lightRadius = 280;
var lightMinRadius = 190;

var bgColor = 0x125198;

var canvasDiv = document.getElementById("canvasDiv");
var renderer = new THREE.WebGLRenderer();
canvasDiv.appendChild(renderer.domElement);
canvasDiv.oncontextmenu = function() { return false; };
screenWidth = canvasDiv.offsetWidth;
screenHeight = canvasDiv.offsetHeight;
renderer.setSize(screenWidth, screenHeight);
renderer.setClearColor(bgColor, 1);

var interactText = document.getElementById("interactText");

var moneyLabel = document.getElementById("moneyLabel");
var uiMoney = 0;
var uiMoneySpeed = 80;
var updateMoneyLabel = function(delta)
{
	if (uiMoney < playerMoney)
	{
		uiMoney += delta*uiMoneySpeed;
		if (uiMoney >= playerMoney) uiMoney = playerMoney;
		moneyLabel.innerHTML = "$" + Math.floor(uiMoney);
	}
	else if (uiMoney > playerMoney)
	{
		uiMoney -= delta*uiMoneySpeed;
		if (uiMoney <= playerMoney) uiMoney = playerMoney;
		moneyLabel.innerHTML = "$" + Math.floor(uiMoney);
	}
}


window.DEPTH = {};
var CAM_NEAR = 1;
var DEPTH_LIGHT = window.DEPTH.LIGHT = -5;
var DEPTH_TOWNFG = -10
var DEPTH_HARPOON = -13;
var DEPTH_PLAYER = -14;
var DEPTH_CHARACTER = window.DEPTH.CHARACTER = -15;
var DEPTH_FISH = window.DEPTH.FISH = -20;
var DEPTH_TOWNBG = -25;
var DEPTH_SKY = -30;
var DEPTH_BG3 = -40;
var DEPTH_BG2 = -78;
var DEPTH_BG1 = -80;
var CAM_FAR = 100;

var scene = window.GAME.scene = new THREE.Scene();

var camera = new THREE.OrthographicCamera(-screenWidth/2, screenWidth/2, -screenHeight/2, screenHeight/2, CAM_NEAR, CAM_FAR);
camera.position.set(0,0,0);

var camOffX = 0;
var camOffY = 0;

var PLANE_CORRECTION = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI,0,0));

var isPaused = false;
var eatFrame = false;

window.onblur = document.onfocusout = function()
{
	isPaused = true;
};
window.onfocus = document.onfocusin = function()
{
	isPaused = false;
	eatFrame = true;
};

//Input
var keyboard = new THREEx.KeyboardState();
var mouse = new MOUSEMON(canvasDiv);

window.threeutil = {};
var makeMesh = window.threeutil.makeMesh = function(tex, geo, filter)
{
	if (filter === undefined)
		tex.minFilter = tex.magFilter = THREE.NearestFilter;
	else
		tex.minFilter = tex.magFilter = filter;
	var material = new THREE.MeshBasicMaterial({map:tex,transparent:true});
	var mesh = new THREE.Mesh(geo, material);
	scene.add(mesh);
	return mesh;
}
var makePlane = window.threeutil.makePlane = function(width, height)
{
	var geo = new THREE.PlaneGeometry(width, height);
	geo.applyMatrix(PLANE_CORRECTION);
	return geo;
}

var debugTexture = THREE.ImageUtils.loadTexture("media/debug.png");
var debugGeometry = makePlane(4, 4);
var debugMesh = makeMesh(debugTexture, debugGeometry);
debugMesh.position.z = -2;
debugMesh.visible = false;

var crosshairsTex = THREE.ImageUtils.loadTexture("media/crosshairs.png");
var crosshairsGeo = makePlane(32, 32);
var crosshairsMesh = makeMesh(crosshairsTex, crosshairsGeo);
crosshairsMesh.position.z = -2;

//Load light overlay
var lightTexture = THREE.ImageUtils.loadTexture("media/lightsm.png");
var lightGeometry = makePlane(1, 1);
var lightMesh = makeMesh(lightTexture, lightGeometry, THREE.LinearFilter);
lightMesh.position.set(0, 0, DEPTH_LIGHT);

var blackTexture = THREE.ImageUtils.loadTexture("media/black.png");

var lightEdges = [];
for (var i = 0; i < 4; i++)
{
	var edge = {};
	edge.geo = makePlane(1, 1);
	edge.mesh = makeMesh(blackTexture, edge.geo);
	lightEdges.push(edge);
}

//Load sub
var subTexture = [];
subTexture.push(THREE.ImageUtils.loadTexture("media/sub_busted.png"));
subTexture.push(THREE.ImageUtils.loadTexture("media/sub_lotsdamage.png"));
subTexture.push(THREE.ImageUtils.loadTexture("media/sub_somedamage.png"));
subTexture.push(THREE.ImageUtils.loadTexture("media/sub_good.png"));
var subGeometry = makePlane(64, 55);
var subMesh = makeMesh(subTexture[3], subGeometry);
subMesh.position.set(0, 0, DEPTH_PLAYER);
var subHitbox = new Hitbox(7-32, -27+15, 57-32, 27-15);
window.GAME.flockAvoiders.push(subMesh);

var playerFacing = -1;

var harpoonTex = THREE.ImageUtils.loadTexture("media/harpoon.png");
var harpoonGeo = makePlane(58, 10);
var harpoonMesh = makeMesh(harpoonTex, harpoonGeo, THREE.LinearFilter);
harpoonMesh.position.set(0, 0, DEPTH_HARPOON);
window.GAME.flockAvoiders.push(harpoonMesh);

var ropeTex = THREE.ImageUtils.loadTexture("media/rope.png");
ropeTex.wrapS = ropeTex.wrapT = THREE.RepeatWrapping;
ropeTex.repeat.set(1, 1);
var ropeGeo = makePlane(4, 4);
ropeGeo.applyMatrix(new THREE.Matrix4().makeTranslation(2, 0, 0));
var ropeMesh = makeMesh(ropeTex, ropeGeo, THREE.LinearFilter);
ropeMesh.visible = false;

var harpoonState = 0;
var harpoonRope = 0;
var harpoonPoint = new Vector2();

//Load sky
var waves = [];
for (var i = 0; i < 2; i++)
{
	waves[i] = {};
	waves[i].tex = THREE.ImageUtils.loadTexture("media/skywave.png");
	waves[i].tex.wrapS = waves[i].tex.wrapT = THREE.RepeatWrapping;
	waves[i].tex.repeat.set(Math.ceil(screenWidth / 163) * (1 + 0.3333*i), 1);
	waves[i].geo = makePlane(screenWidth, 55);
	waves[i].mesh = makeMesh(waves[i].tex, waves[i].geo);
	waves[i].mesh.position.set(0, -15, DEPTH_SKY);
	waves[i].scroll = ((i%2)*2-1) * 100 * (1 + i*0.4);
	waves[i].offx = 0;
}

var skyTexture = THREE.ImageUtils.loadTexture("media/sky.png");
var skyGeometry = makePlane(screenWidth, 425);
var skyMesh = makeMesh(skyTexture, skyGeometry);
skyMesh.position.set(0, -254, DEPTH_SKY);

var waveScroll = function(wave, exX, exY, delta)
{
	wave.offx += wave.scroll * delta / (150*wave.tex.repeat.x); //HACK: power to the hack
	wave.offx += exX / screenWidth;
	wave.mesh.geometry.faceVertexUvs[0] = [];
	wave.mesh.geometry.faceVertexUvs[0][0] = [
		new THREE.Vector2(wave.offx, 1),
		new THREE.Vector2(wave.offx, 0),
		new THREE.Vector2(wave.offx + 1, 1)];
	wave.mesh.geometry.faceVertexUvs[0][1] = [
		new THREE.Vector2(wave.offx, 0),
		new THREE.Vector2(wave.offx + 1, 0),
		new THREE.Vector2(wave.offx + 1, 1)];
	wave.mesh.geometry.uvsNeedUpdate = wave.mesh.geometry.__dirtyUvs = true;
}

//Define background
var bgs = [];
var bg;

var bgScroll = function(bg, exX, exY, delta)
{
	bg.off.add(bg.dir.multiplied(delta));
	bg.off.x += bg.lax * exX / 600;
	bg.off.y -= bg.lax * exY / 600;
	bg.mesh.geometry.faceVertexUvs[0] = [];
	bg.mesh.geometry.faceVertexUvs[0][0] = [
		new THREE.Vector2(bg.off.x, bg.off.y + 1),
		new THREE.Vector2(bg.off.x, bg.off.y),
		new THREE.Vector2(bg.off.x + 1,  bg.off.y + 1)];
	bg.mesh.geometry.faceVertexUvs[0][1] = [
		new THREE.Vector2(bg.off.x, bg.off.y),
		new THREE.Vector2(bg.off.x + 1,  bg.off.y),
		new THREE.Vector2(bg.off.x + 1, bg.off.y + 1)];
	bg.mesh.geometry.uvsNeedUpdate = bg.mesh.geometry.__dirtyUvs = true;
}

bg = {};
bg.tex = THREE.ImageUtils.loadTexture("media/bg1.png");
bg.tex.wrapS = bg.tex.wrapT = THREE.RepeatWrapping;
bg.geo = makePlane(600, 600);
bg.mesh = makeMesh(bg.tex, bg.geo, THREE.LinearFilter);
bg.depth = DEPTH_BG1
bg.mesh.position.set(0, 0, bg.depth);
bg.off = new Vector2(0.5, 0.5);
bg.dir = new Vector2(10, 5).multiplied(1 / 600.0);
bg.lax = 0.9;
bgs.push(bg);

bg = {};
bg.tex = THREE.ImageUtils.loadTexture("media/bg2.png");
bg.tex.wrapS = bg.tex.wrapT = THREE.RepeatWrapping;
bg.geo = makePlane(600, 600);
bg.mesh = makeMesh(bg.tex, bg.geo, THREE.LinearFilter);
bg.depth = DEPTH_BG2
bg.mesh.position.set(0, 0, bg.depth);
bg.off = new Vector2();
bg.dir = new Vector2(-7.5, -4).multiplied(1 / 600.0);
bg.lax = 1.0;
bgs.push(bg);

bg = {};
bg.tex = THREE.ImageUtils.loadTexture("media/bg3.png");
bg.tex.wrapS = bg.tex.wrapT = THREE.RepeatWrapping;
bg.geo = makePlane(600, 600);
bg.mesh = makeMesh(bg.tex, bg.geo, THREE.LinearFilter);
bg.depth = DEPTH_BG3
bg.mesh.position.set(0, 0, bg.depth);
bg.off = new Vector2(0.25, 0.25);
bg.dir = new Vector2(4.5, 4).multiplied(1 / 600.0);
bg.lax = 1.1;
bgs.push(bg);

//Black screen
var screenGeo = makePlane(screenWidth, screenHeight);
blackTexture.minFilter = blackTexture.magFilter = THREE.NearestFilter;
var screenMaterial = new THREE.MeshBasicMaterial({map:blackTexture,transparent:true});
var screenMesh = new THREE.Mesh(screenGeo, screenMaterial);
scene.add(screenMesh);
screenMaterial.opacity = 0;

//Define town
var townGlobalPosition = new Vector2();
var floorWidth = 310;
var floorStep = floorWidth - 10;

var ladderTex = THREE.ImageUtils.loadTexture("media/ladder.png");
var ladderGeo = makePlane(20,89);
var floorTex = THREE.ImageUtils.loadTexture("media/floor.png");
var floorGeo = makePlane(floorWidth,21);
var manTex = THREE.ImageUtils.loadTexture("media/man.png");
var manGeo = makePlane(20,31);
var pylonTex = THREE.ImageUtils.loadTexture("media/pylon.png");
var pylonGeo = makePlane(99,250);

var floorHeight = 40;
var pylonY = -floorHeight + 10 + 125;
var townVisibleDepth = screenHeight/2 + pylonY + 125;
var characterY = window.GAME.characterY = -floorHeight - 10;

var townMeshes = window.GAME.townMeshes = [];
var disembarkMeshes = [];
var townWidth = 0;

window.GAME.makeTown = function(townSegments)
{
	var bgTex = THREE.ImageUtils.loadTexture("media/town.png");
	var bgGeo = makePlane(900, 200);
	var bgMesh = makeMesh(bgTex, bgGeo, THREE.LinearFilter);
	bgMesh.position.set(0, -floorHeight-100, DEPTH_TOWNBG);
	townMeshes.push(bgMesh);
	
	townWidth = townSegments * floorStep;
	for (var i = 0; i < townSegments; i++)
	{
		//Add floor
		var floor = makeMesh(floorTex, floorGeo, THREE.LinearFilter);
		floor.position.set((i+0.5) * floorStep - townWidth / 2, -floorHeight, DEPTH_TOWNBG);
		townMeshes.push(floor);
		
		//Add ladder
		var ladder = makeMesh(ladderTex, ladderGeo);
		ladder.position.set(floor.position.x, -floorHeight + 20, DEPTH_TOWNFG);
		townMeshes.push(ladder);
		disembarkMeshes.push(ladder);
		
		//Add pylon
		if (i > 0)
		{
			var pylon = makeMesh(pylonTex, pylonGeo, THREE.LinearFilter);
			pylon.position.set(floor.position.x - floorStep / 2, pylonY, DEPTH_TOWNBG);
			townMeshes.push(pylon);
		}
	}
	//Add start/end pylons
	var pylon = makeMesh(pylonTex, pylonGeo, THREE.LinearFilter);
	pylon.position.set(-townWidth / 2 + 30, pylonY, DEPTH_TOWNBG);
	townMeshes.push(pylon);
	var pylon = makeMesh(pylonTex, pylonGeo, THREE.LinearFilter);
	pylon.position.set(townWidth / 2 - 30, pylonY, DEPTH_TOWNBG);
	townMeshes.push(pylon);
}

//Add peeps
var townMen = window.GAME.townMen = [];
loadTownmen();

var positionTown = function(x, y)
{
	for (var i in townMeshes)
	{
		townMeshes[i].position.x = (townMeshes[i].position.x - townGlobalPosition.x)+x;
		townMeshes[i].position.y = (townMeshes[i].position.y - townGlobalPosition.y)+y;
	}
	townGlobalPosition.x = x;
	townGlobalPosition.y = y;
}

var townBobAmp = 1.2;
var townBobPeriod = 1.5;
var townBobPos = 0;

//Load player character
var playerTex = THREE.ImageUtils.loadTexture("media/man.png");
var playerGeo = makePlane(20, 31);
var playerMesh = makeMesh(playerTex, playerGeo);
playerMesh.position.set(0, characterY - 16, DEPTH_PLAYER);
townMeshes.push(playerMesh);

var disembarkedAt = -1; //Points to disembarkMeshes


//Define gameplay structures
var playerVelocity = new Vector2();
var submarineDir = 1;
var fishList = window.GAME.fishList = [];

var bigHeld = function()
{
	for (var i in fishList)
		if (fishBase[fishList[i].type].big && fishList[i].newCaught)
			return true;
	return false;
}

var screenshake = new Screenshake();

var playerHealth = playerMaxHealth;
var playerMoney = 0;
var playerDead = false;

var playerInvulnerable = 0;
var playerDying = 0;
var atDockRespawn = false;

var FishSpawn = function(type, minqty, maxqty)
{
	this.type = type;
	this.minqty = minqty;
	this.maxqty = maxqty;
}
FishSpawn.prototype.execute = function()
{
	var qty = this.minqty + Math.floor(Math.random() * (this.maxqty-this.minqty));
	var dir = Math.ceil(Math.random() - 0.5) * 2 - 1;
	
	var loc = new Vector2(
		camOffX + -dir*(screenWidth/2 + window.FISH.SPAWNRANGE),
		camOffY);
	
	//If player is moving down, option to spawn them within the horizontal bounds of the screen
	if (playerVelocity.y > playerMaxSpeed * 0.75 && Math.random() >= 0.5)
	{
		loc.x = camOffX + -dir * Math.random() * screenWidth / 2;
		loc.y = camOffY + screenHeight/2 + window.FISH.SPAWNRANGE;
	}
	
	for (var i = 0; i < qty; i++)
	{
		fishList.push(new Fish(this.type, dir, loc));
	}
}
var fishSpawns = [];

//Some fish
var spawn = {};
spawn.mindepth = 300;
spawn.maxdepth = 3000;
spawn[0] = new FishSpawn(window.FISH.NORMAL, 2, 4);
spawn.spawncount = 1;
fishSpawns.push(spawn);

//Lotsa fish
var spawn = [];
spawn.mindepth = 1000;
spawn.maxdepth = 3000;
spawn[0] = new FishSpawn(window.FISH.NORMAL, 6, 12);
spawn.spawncount = 1;
fishSpawns.push(spawn);

//A shark!
var spawn = [];
spawn.mindepth = 700;
spawn.maxdepth = 5000;
spawn[0] = new FishSpawn(window.FISH.SHARK, 1, 1);
spawn.spawncount = 1;
fishSpawns.push(spawn);

//Tuna school
var spawn = [];
spawn.mindepth = 2000;
spawn.maxdepth = 9000;
spawn[0] = new FishSpawn(window.FISH.SPIKE, 6, 15);
spawn.spawncount = 1;
fishSpawns.push(spawn);

//Barracudas
var spawn = [];
spawn.mindepth = 4000;
spawn.maxdepth = 9000;
spawn[0] = new FishSpawn(window.FISH.BARRACUDA, 1, 2);
spawn.spawncount = 1;
fishSpawns.push(spawn);


var hitPlayer = function(d)
{
	playerVelocity.add(d);
	
	//Shake
	screenshake.shakeScreen(90, 0.3);
	
	if (playerInvulnerable <= 0)
	{
		playerHealth--;
		
		//Iframes
		playerInvulnerable = playerInvulnerableTime;
	}
}


//Make monster parts
var monsters = [];

window.GAME.MONSTER_FIN = 0;
window.GAME.MONSTER_TENTACLE = 1;

window.GAME.encounteredMonster = function(monster)
{
	return monsters[monster] != undefined && !!monsters[monster].encountered;
}

//Fin
var monster = {};
monster.init = function()
{
	this.tex = THREE.ImageUtils.loadTexture("media/monster_fin.png");
	this.geo = makePlane(752, 353);
	this.mesh = makeMesh(this.tex, this.geo);
	this.mesh.visible = false;
	
	this.attacking = false;
	this.speed = 600;
	this.depth = 7000;
	
	this.hitbox = new Hitbox(-20, -353/2, 20, 353/2);
	this.chunkType = window.FISH.MONSTER_FIN;
};
monster.update = function(delta)
{
	var defeated = window.GAME.caughtFishOfType(this.chunkType) > 0;
	if (subMesh.position.y > this.depth && !this.attacking && !defeated)
	{
		//Start attack
		this.attacking = true;
		this.mesh.visible = true;
		this.dir = Math.ceil(Math.random()-0.5)*2-1;
		this.mesh.position.x = subMesh.position.x + -this.dir*(screenWidth/2 + 752/2);
		this.mesh.position.y = subMesh.position.y + 400;
		this.mesh.position.z = DEPTH_FISH;
		
		this.geo.faceVertexUvs[0] = [];
		var x = this.dir < 0 ? 1 : 0;
		var y = 1;
		this.geo.faceVertexUvs[0][0] = [new THREE.Vector2(1-x, y  ), new THREE.Vector2(1-x, 1-y), new THREE.Vector2(x, y)];
		this.geo.faceVertexUvs[0][1] = [new THREE.Vector2(1-x, 1-y), new THREE.Vector2(  x, 1-y), new THREE.Vector2(x, y)];
		this.geo.uvsNeedUpdate = this.geo.__dirtyUvs = true;
		
		this.encountered = true;
	}
	else
	{
		this.mesh.position.x += this.dir*this.speed*delta;
		
		//Collide with player
		this.hitbox.setPosition(this.mesh.position);
		if (this.hitbox.checkCollide(subHitbox))
		{
			hitPlayer(new Vector2(this.dir*200, -500));
		}
		
		//Collide with harpoon
		if (this.hitbox.contains(harpoonPoint) && !defeated && harpoonState == 1)
		{
			//Create chunk
			this.fish = new Fish(this.chunkType, 0, new Vector2(0,0));
			fishList.push(this.fish);
			
			this.fish.caught = true;
			this.fish.newCaught = true;
			
			this.beaten = true;
		}
		
		//End attack
		if ((this.dir < 0 && this.mesh.position.x < subMesh.position.x - 752/2 - screenWidth/2)
		 || (this.dir > 0 && this.mesh.position.x > subMesh.position.x + 752/2 + screenWidth/2))
		{
			this.attacking = false;
			this.mesh.visible = false;
		}
	}
};
monsters[window.GAME.MONSTER_FIN] = monster;

var currentMonster = 0;
monsters[currentMonster].init();

//Start on dock
disembarkedAt = 0;
playerMesh.position.x = disembarkMeshes[disembarkedAt].position.x;


//AUDIO STUFF HERE
var surfaceMusic = new Audio("music/ngxmusicalngx+theflyingdinglestwinkles_shortened.mp3");
var shallowMusic = new Audio("music/ngxmusicalngx+majesticbouncywaters_shortened.mp3");
var deepMusic = new Audio("music/ngxmusicalngx+astrangedream_shortened.mp3");
surfaceMusic.loop = true;
shallowMusic.loop = true;
deepMusic.loop = true;
var nextMusic;
var fadeOutTime = 3;
var fadeout = fadeOutTime;
var currentMusic;
var playMusic = function(music)
{
	nextMusic = music;
}

var musicVol = 0;

var musics = [];

var surfaceMusicO = {};
surfaceMusicO.music = surfaceMusic;
surfaceMusicO.minDepth = -1000;
musics.push(surfaceMusicO);

var shallowMusicO = {};
shallowMusicO.music = shallowMusic;
shallowMusicO.minDepth = 200;
musics.push(shallowMusicO);

var deepMusicO = {};
deepMusicO.music = deepMusic;
deepMusicO.minDepth = 5500;
musics.push(deepMusicO);

var depthFuzzy = 300;
var currentDepth = -1;
var updateMusic = function(deltaSec)
{
	if (nextMusic)
	{
		fadeout -= deltaSec;
		if (currentMusic) currentMusic.volume = Math.max(0, musicVol * fadeout / fadeOutTime);
		if ((fadeout <= 0 || !currentMusic) && musicVol > 0)
		{
			fadeout = fadeOutTime;
			if (currentMusic) currentMusic.pause();
			if (nextMusic.readyState != 0)
			{
				nextMusic.currentTime = 0;
				nextMusic.play();
				nextMusic.volume = musicVol;
				currentMusic = nextMusic;
				nextMusic = undefined;
			}
		}
	}
}

var nextSpawnAt = 0;

var updateSpawn = function(deltaSec, depth)
{
	nextSpawnAt -= deltaSec;
	if (nextSpawnAt <= 0)
	{
		nextSpawnAt = (minSpawnInterval + (maxSpawnInterval-minSpawnInterval)
			* Math.max(0, 1 - depth/depthToMinSpawn) + Math.random()*spawnRand) / 1000;
		
		//Find eligible spawns
		var possible = [];
		for (var i in fishSpawns)
		{
			if (fishSpawns[i].mindepth <= depth && fishSpawns[i].maxdepth >= depth)
				possible.push(i);
		}
		
		//Pick
		if (possible.length > 0)
		{
			var use = fishSpawns[possible[Math.floor(Math.random()*possible.length)]];
			for (var i = 0; i < use.spawncount; i++)
				use[i].execute();
		}
	}
}


var deltaSec = 0;
var lastFrame = Date.now();
animate();

var camOffX = 0;
var camOffY = 0;

var eWas = false;
var yWas = false;
var nWas = false;
var rWas = false;
var mWas = false;
var spaceWas = false;

function animate()
{
	deltaSec = (Date.now() - lastFrame) / 1000;
	lastFrame = Date.now();
	
	requestAnimationFrame(animate);
	
	if (eatFrame)
	{
		eatFrame = false;
		return;
	}
	
	if (isPaused)
	{
		return;
	}
	
	updateMoneyLabel(deltaSec);
	
	//Music changing by depth
	var depth = subMesh.position.y;
	for (var i = musics.length-1; i >= 0; i--)
	{
		if (depth > musics[i].minDepth
			)//&& (currentDepth != i+1 || depth < musics[currentDepth].minDepth - depthFuzzy))
		{
			if (i != currentDepth)
			{
				playMusic(musics[i].music);
				currentDepth = i;
			}
			break;
		}
	}
	
	//Music toggle
	if (keyboard.pressed("m"))
	{
		if (!mWas)
		{
			mWas = true;
			if (musicVol > 0)
				musicVol = 0;
			else
				musicVol = 0.6;
			for (var i in musics)
				musics[i].music.volume = musicVol;
		}
	}
	else
		mWas = false;
	
	updateMusic(deltaSec);
	
	var playerWasDead = playerDead;
	playerDead = playerHealth <= 0;
	if (playerHealth > 0) atDockRespawn = false;
	
	if (playerDead && !atDockRespawn)
	{
		if (playerDying <= 0)
			playerDying = deathTime;
		playerDying -= deltaSec;
		if (playerDying <= 0)
		{
			//Respawn
			disembarkedAt = 0;
			playerMesh.position.x = disembarkMeshes[disembarkedAt].position.x;
			atDockRespawn = true;
			destroyCaughtFish();
		}
	}
	screenMaterial.opacity = playerDead && !atDockRespawn ? (1 - playerDying / deathTime) : 0;
	
	//Control player
	var controlDir = new Vector2();
	if (!activeConvo)
	{
		if (keyboard.pressed("w") || keyboard.pressed("up"))
			controlDir.y--;
		if (keyboard.pressed("s") || keyboard.pressed("down"))
			controlDir.y++;
		if (keyboard.pressed("a") || keyboard.pressed("left"))
			controlDir.x--;
		if (keyboard.pressed("d") || keyboard.pressed("right"))
			controlDir.x++;
	}
	
	//Monster logic
	monsters[currentMonster].update(deltaSec);
	
	//Convo advancing?
	var convoContinue = false;
	var convoResponse = false;
	if (keyboard.pressed("y"))
	{
		if (!yWas)
		{
			yWas = true;
			convoContinue = true;
			convoResponse = true;
		}
	}
	else
		yWas = false;
	if (keyboard.pressed(" "))
	{
		if (!spaceWas)
		{
			spaceWas = true;
			convoContinue = true;
			convoResponse = true;
		}
	}
	else
		spaceWas = false;
	if (keyboard.pressed("n"))
	{
		if (!nWas)
		{
			nWas = true;
			convoContinue = true;
		}
	}
	else
		nWas = false;
	
	//Show interactable text
	var nearLadder = -1;
	var nearNpc = -1;
	var found = false;
	if (!activeConvo)
	{
		//disembark
		if (!found)
		{
			for (var i in disembarkMeshes)
			{
				if (disembarkedAt < 0)
				{
					if (Math.abs(subMesh.position.x - disembarkMeshes[i].position.x) < interactRadius && subMesh.position.y < 50)
					{
						nearLadder = i;
						showInteractText("[E]:Disembark", disembarkMeshes[i]);
						found = true;
						break;
					}
				}
			}
		}
		
		//embark
		if (!found && disembarkedAt >= 0)
		{
			if (Math.abs(playerMesh.position.x - disembarkMeshes[disembarkedAt].position.x) < interactRadius)
			{
				nearLadder = i;
				showInteractText("[E]:Embark", disembarkMeshes[disembarkedAt]);
				found = true;
			}
		}
		
		//Talk to people
		if (!found && disembarkedAt >= 0)
		{
			for (var i in townMen)
			{
				if (Math.abs(playerMesh.position.x - townMen[i].mesh.position.x) < interactRadius)
				{
					nearNpc = i;
					var text = "";
					if (townMen[i].talk)
						text += "[E]:Talk";
					if (townMen[i].interaction != window.GAME.I_NONE
					 && (townMen[i].interaction != window.GAME.I_TAKELOAN || takeLoanValid()))
						text += "\n[R]:" + getInteractionString(townMen[i].interaction);
					showInteractText(text, townMen[i].mesh);
					found = true;
					break;
				}
			}
		}
	}
	
	if (nearNpc < 0 && nearLadder < 0) hideInteractText();
	
	//'R' controls
	if (keyboard.pressed("r"))
	{
		if (!rWas)
		{
			rWas = true;
			
			if (!activeConvo)
			{
				//Interact with people
				if (nearNpc >= 0)
					townMen[nearNpc].interact();
			}
		}
	}
	else
		rWas = false;
	
	//'E' controls
	if (keyboard.pressed("e"))
	{
		if (!eWas)
		{
			eWas = true;
			
			if (activeConvo)
			{
				//Continue conversation
				convoContinue = true;
				convoResponse = true;
			}
			else
			{
				//Attempt to (dis)embark
				if (nearLadder >= 0)
				{
					if (disembarkedAt < 0)
					{
						disembarkedAt = i;
						var disembarkX = disembarkMeshes[i].position.x;
						playerMesh.position.x = disembarkX;
						
						//Move "big" caught fish onto dock
						for (var i = 0; i < fishList.length; i++)
						{
							if (fishList[i].caught && fishBase[fishList[i].type].big)
							{
								fishList[i].unloaded = true;
								fishList[i].newCaught = false;
								fishList[i].mesh.position.x = disembarkX + (Math.random()-0.5)*200;
								fishList[i].mesh.position.y = characterY - fishBase[fishList[i].type].height/2;
								fishList[i].mesh.position.z = DEPTH_CHARACTER;
								townMeshes.push(fishList[i].mesh);
							}
						}
					}
					else
					{
						disembarkedAt = -1;
					}
				}
				
				//Talk to people
				if (nearNpc >= 0)
				{
					townMen[nearNpc].speak();
				}
			}
		}
	}
	else
		eWas = false;
	
	playerMesh.visible = disembarkedAt >= 0;
	
	//Really advance convo
	if (convoContinue && window.GAME.onAdvanceDialog)
		window.GAME.onAdvanceDialog(convoResponse);
	
	if (disembarkedAt == -1)
	{
		var lenPreAccel = playerVelocity.length();
		
		//Add controls
		if (playerDead)
		{
			//Float up
			playerVelocity.y -= floatSpeed * deltaSec;
		}
		else if (controlDir.lengthSq() == 0)
		{
			//Deccelerate
			var currentSpeed = playerVelocity.length() - deltaSec * playerDecel;
			if (currentSpeed < 0) currentSpeed = 0;
			playerVelocity.normalize();
			playerVelocity.multiply(currentSpeed);
		}
		else
		{
			//Accelerate
			controlDir.normalize();
			controlDir.multiply(deltaSec * playerAccel);
			playerVelocity.add(controlDir);
		}
		
		//Restrict speed
		if (playerVelocity.lengthSq() > playerReallyMaxSpeed * playerReallyMaxSpeed)
		{
			playerVelocity.normalize();
			playerVelocity.multiply(playerReallyMaxSpeed);
		}
		else if (playerVelocity.lengthSq() > playerMaxSpeed * playerMaxSpeed)
		{
			playerVelocity.normalize();
			playerVelocity.multiply(lenPreAccel <= playerMaxSpeed*1.05 ? playerMaxSpeed : lenPreAccel - deltaSec * playerDecel);
		}
	}
	else
	{
		//We are on shore
		playerMesh.position.x += playerWalkSpeed * deltaSec * controlDir.x;
		playerMesh.position.x = Math.max(playerMesh.position.x, townGlobalPosition.x - townWidth / 2);
		playerMesh.position.x = Math.min(playerMesh.position.x, townGlobalPosition.x + townWidth / 2);
		
		//Pull sub to ladder
		subMesh.position.set(disembarkMeshes[disembarkedAt].position.x, 0, DEPTH_PLAYER);
		playerVelocity.x = 0;
		playerVelocity.y = 0;
	}
	
	playerFacing = playerVelocity.x < 0 ? -1 : (playerVelocity.x > 0 ? 1 : playerFacing);
	
	//Push out of sky
	if (subMesh.position.y < 0)
		playerVelocity.y -= subMesh.position.y
	
	var subMeshOldY = subMesh.position.y;
	
	subMesh.position.x += playerVelocity.x * deltaSec;
	subMesh.position.y += playerVelocity.y * deltaSec;
	subHitbox.setPosition(subMesh.position);
	var oldOffX = camOffX;
	var oldOffY = camOffY;
	camOffX = disembarkedAt < 0 ? subMesh.position.x : playerMesh.position.x;
	camOffY = subMesh.position.y;
	var playerDelX = camOffX - oldOffX;
	var playerDelY = camOffY - oldOffY;
	
	//Submarine UVs (flipping for velocity)
	if (submarineDir != playerFacing || playerDead != playerWasDead)
	{
		submarineDir = playerFacing;
		subMesh.geometry.faceVertexUvs[0] = [];
		var x = playerVelocity.x > 0 ? 1 : 0;
		var y = playerDead ? 0 : 1;
		subMesh.geometry.faceVertexUvs[0][0] = [new THREE.Vector2(1-x, y  ), new THREE.Vector2(1-x, 1-y), new THREE.Vector2(x, y)];
		subMesh.geometry.faceVertexUvs[0][1] = [new THREE.Vector2(1-x, 1-y), new THREE.Vector2(  x, 1-y), new THREE.Vector2(x, y)];
		subMesh.geometry.uvsNeedUpdate = subMesh.geometry.__dirtyUvs = true;
	}
	
	//Magically teleport town to player
	//Also bob it up and down (saves calls)
	var townBobPeriod = 1.5;
	townBobPos += deltaSec;
	if (townBobPos > townBobPeriod) townBobPos -= townBobPeriod;
	var towny = townBobAmp * Math.sin(2 * 3.14159266 * townBobPos / townBobPeriod);
	if (subMeshOldY > townVisibleDepth && subMesh.position.y <= townVisibleDepth)
		positionTown(subMesh.position.x, towny);
	else
		positionTown(townGlobalPosition.x, towny);
	
	//Update light
	var depth = subMesh.position.y;
	maxDepthAchieved = Math.max(maxDepthAchieved, depth);
	if (camOffY < screenHeight / 2)
		lightMesh.material.opacity = 0;
	else if (camOffY < screenHeight)
		lightMesh.material.opacity = minimumShadow * (camOffY - screenHeight/2)/(screenHeight/2);
	else
		lightMesh.material.opacity = minimumShadow + (1-minimumShadow) * Math.max(0, Math.min(1, depth / depthToPitch));
	
	//Change sub texture based on damage
	var healthPro = Math.min(1, Math.max(0, (playerHealth / playerMaxHealth)));
	if (playerHealth == 0) healthPro = 0;
	subMesh.material.map = subTexture[Math.ceil((subTexture.length-1) * healthPro)];
	
	//Spawn fishies
	updateSpawn(deltaSec, depth);
	
	//Calculate harpoon pointy end
	var tempcos = 28 * Math.cos(harpoonMesh.rotation.z);
	var tempsin = 28 * Math.sin(harpoonMesh.rotation.z);
	harpoonPoint = new Vector2(harpoonMesh.position.x + tempcos, harpoonMesh.position.y + tempsin);
	var harpoonRing = new Vector2(harpoonMesh.position.x - tempcos, harpoonMesh.position.y - tempsin);
	
	//Update fishies
	var dangleCount = 0;
	for (var fish in fishList)
	{
		fishList[fish].update(deltaSec);
		
		if (fishList[fish].newCaught)
		{
			//Move caught fish with harpoon
			fishList[fish].mesh.position.x = harpoonPoint.x;
			fishList[fish].mesh.position.y = harpoonPoint.y;
		}
		else if (fishList[fish].caught && !fishList[fish].unloaded)
		{
			//Move these fish with sub
			fishList[fish].mesh.position.x = subMesh.position.x;
			fishList[fish].mesh.position.y = subMesh.position.y + 15;
			
			//Dangle (e.g. Ridiculous Fishing)
			var rootAngle = 3.14159266 / 2;
			if (dangleCount > 1)
				var pro = (1 - 1/dangleCount);
			else
				pro = 0.7;
			rootAngle += 1.5 * playerVelocity.x / playerMaxSpeed * pro;
			fishList[fish].mesh.rotation.z = rootAngle;
			dangleCount++;
		}
	}
	for (var fish in fishList)
		fishList[fish].postUpdate(deltaSec);
	
	var subHarpoonPointX = subMesh.position.x + playerFacing * harpoonOffX;
	var subHarpoonPointY = subMesh.position.y + harpoonOffY;
	if (harpoonState == 0)
		harpoonMesh.position.set(subHarpoonPointX, subHarpoonPointY, DEPTH_HARPOON);
	
	//Update harpoon
	harpoonDisplacement = new Vector2(harpoonMesh.position.x - subHarpoonPointX, harpoonMesh.position.y - subHarpoonPointY);
	if (disembarkedAt < 0)
	{
		if (harpoonState == 0)
		{
			//Aiming
			var harpAngle = Math.atan2(
				harpoonMesh.position.y - crosshairsMesh.position.y,
				harpoonMesh.position.x - crosshairsMesh.position.x) + 3.14159265;
			harpoonMesh.rotation.z = harpAngle;
			
			if (mouse.mouseDownNew[1] && !playerDead && !bigHeld())
				harpoonState = 1;
		}
		else if (harpoonState == 1)
		{
			//Firing
			harpoonMesh.position.x += Math.cos(harpoonMesh.rotation.z) * harpoonVelocity * deltaSec;
			harpoonMesh.position.y += Math.sin(harpoonMesh.rotation.z) * harpoonVelocity * deltaSec;
			
			if (!playerDead)
			{
				if (harpoonDisplacement.lengthSq() > harpoonRange*harpoonRange
				 || mouse.mouseDownNew[1] || harpoonPoint.y <= -floorHeight)
				{
					harpoonRope = harpoonDisplacement.length();
					harpoonState = 2;
				}
			}
		}
		else
		{
			//Reel in
			if (mouse.mouseDown[1])
			{
				harpoonRope -= harpoonReelSpeed * deltaSec;
				if (harpoonRope < 0)
				{
					harpoonRope = 0
					harpoonState = 0;
					
					//Collect new-caught fish
					for (var i in fishList)
					{
						if (fishList[i].newCaught && !fishBase[fishList[i].type].big)
						{
							fishList[i].newCaught = false;
							fishList[i].catchOffset();
						}
					}
				}
			}
			
			if (harpoonDisplacement.lengthSq() > harpoonRope * harpoonRope)
			{
				harpoonDisplacement.normalize();
				harpoonDisplacement.multiply(harpoonRope);
				harpoonMesh.position.x = subHarpoonPointX + harpoonDisplacement.x;
				harpoonMesh.position.y = subHarpoonPointY + harpoonDisplacement.y;
				
				var harpAngle = Math.atan2(harpoonDisplacement.y, harpoonDisplacement.x);
				harpoonMesh.rotation.z = harpAngle;
			}
		}
	}
	
	//Update harpoon rope
	ropeMesh.visible = harpoonState != 0;
	if (ropeMesh.visible)
	{
		var ringDisplacement = new Vector2(harpoonRing.x - subHarpoonPointX, harpoonRing.y - subHarpoonPointY);
		ropeMesh.position.set(subHarpoonPointX, subHarpoonPointY, DEPTH_HARPOON);
		ropeMesh.scale.x = ringDisplacement.length() / 4;
		ropeMesh.rotation.z = Math.atan2(ringDisplacement.y, ringDisplacement.x);
		ropeTex.repeat.x = ropeMesh.scale.x;
	}
	
	//Iframes
	if (playerInvulnerable > 0)
		playerInvulnerable -= deltaSec;
	subMesh.material.opacity = playerInvulnerable > 0 ? 0.4 : 1;
	
	//Fishy collision
	for (var i = fishList.length-1; i >= 0; i--)
	{
		if (fishList[i].caught) continue;
		
		//Hit player
		if (subHitbox.checkCollide(fishList[i].hitBox))
		{
			//Knock away
			var d = new Vector2(subMesh.position.x - fishList[i].mesh.position.x,
				subMesh.position.y - fishList[i].mesh.position.y);
			d.normalize();
			d.multiply(fishBase[fishList[i].type].strength);
			
			if (fishBase[fishList[i].type].predator)
				hitPlayer(d);
			
			fishList[i].destroy();
			fishList.splice(i, 1);
			
			continue;
		}
		//Hit harpoon
		if (harpoonState == 1 && fishList[i].hitBox.contains(harpoonPoint))
		{
			fishList[i].caught = true;
			fishList[i].newCaught = true;
			continue;
		}
		//Go offscreen
		var dx = camOffX - fishList[i].mesh.position.x;
		var dy = camOffY - fishList[i].mesh.position.y;
		if (Math.abs(dx) > killOffscreenFish + screenWidth/2
		 || Math.abs(dy) > killOffscreenFish + screenHeight/2)
		{
			fishList[i].destroy();
			fishList.splice(i, 1);
		}
	}
	
	//Keep speech boxes aligned to game
	for (var i in speechBoxes)
		positionSpeechBox(speechBoxes[i].speechElement, speechBoxes[i]);
	
	//Scroll particles
	for (var bg in bgs)
		bgScroll(bgs[bg], playerDelX, playerDelY, deltaSec);
	
	//Scroll waves
	for (var wave in waves)
		waveScroll(waves[wave], playerDelX, playerDelY, deltaSec);
	
	//Position camera
	screenshake.update(deltaSec);
	camera.position.set(camOffX + screenshake.getOffset().x, camOffY + screenshake.getOffset().y, 0);
	
	lightMesh.position.set(subMesh.position.x, subMesh.position.y, DEPTH_LIGHT);
	var useradius = lightMinRadius + (lightRadius-lightMinRadius) * Math.max(0, playerHealth/playerMaxHealth);
	lightMesh.scale.set(useradius*2, useradius*2, 1);
	
	var mousepos = MOUSEPOSREL(canvasDiv);
	mousepos = absoluteToGame(mousepos.x, mousepos.y);
	crosshairsMesh.position.x = mousepos.x;
	crosshairsMesh.position.y = mousepos.y;
	
	//Light edges
	var left = camera.position.x - screenWidth/2;
	var right = camera.position.x + screenWidth/2;
	var top = camera.position.y - screenHeight/2;
	var bottom = camera.position.y + screenHeight/2;
	var lleft = lightMesh.position.x - lightMesh.scale.x/2;
	var lright = lightMesh.position.x + lightMesh.scale.x/2;
	var ltop = lightMesh.position.y - lightMesh.scale.y/2;
	var lbottom = lightMesh.position.y + lightMesh.scale.y/2;
	lightEdges[0].mesh.scale.set(   lleft-left,      screenHeight,1);
	lightEdges[0].mesh.position.set((lleft+left)/2,  (bottom+top)/2,DEPTH_LIGHT);
	lightEdges[1].mesh.scale.set(   right-lright,    screenHeight,1);
	lightEdges[1].mesh.position.set((right+lright)/2,(bottom+top)/2,DEPTH_LIGHT);
	
	lightEdges[2].mesh.scale.set(   lright-lleft,     ltop-top,1);
	lightEdges[2].mesh.position.set((lright+lleft)/2, (ltop+top)/2,DEPTH_LIGHT);
	lightEdges[3].mesh.scale.set(   lright-lleft,     bottom-lbottom,1);
	lightEdges[3].mesh.position.set((lright+lleft)/2, (bottom+lbottom)/2,DEPTH_LIGHT);
	for (var i = 0; i < 4; i++)
		lightEdges[i].mesh.material.opacity = lightMesh.material.opacity;
	
	screenMesh.position.set(camera.position.x, camera.position.y, DEPTH_LIGHT);
	
	for (var bg in bgs)
		bgs[bg].mesh.position.set(camOffX, camOffY, bgs[bg].depth);
	for (var wave in waves)
		waves[wave].mesh.position.x = camOffX;
	skyMesh.position.x = camOffX;
	
	mouse.resetMouseNew();
	
	renderer.render(scene, camera);
}

}