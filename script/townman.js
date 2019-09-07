
var TownMan = function(name)
{
	this.name = name;
	this.barks = [];
	this.talk = null;
	this.moneyGiven = 0;
	this.interaction = window.GAME.I_NONE;
}

TownMan.prototype.speak = function()
{
	if (this.talk)
		this.talk.show();
}

TownMan.prototype.interact = function()
{
	window.GAME.doInteraction(this.interaction, this);
}

TownMan.prototype.setVisual = function(texturePath, width, height)
{
	this.width = width;
	this.height = height;
	this.tex = THREE.ImageUtils.loadTexture(texturePath);
	this.geo = window.threeutil.makePlane(width, height);
	this.mesh = window.threeutil.makeMesh(this.tex, this.geo);
	this.mesh.position.set(window.GAME.townMen.length * 50, window.GAME.characterY - height/2, window.DEPTH.CHARACTER);
	window.GAME.townMeshes.push(this.mesh);
	window.GAME.townMen.push(this);
}

TownMan.prototype.setInteraction = function(interaction)
{
	this.interaction = interaction;
}



var getValue = function(value)
{
	return window.GAME.getGlobalVariable(value);
}


///A basic conversation node
///Displays a speech bubble, has a next node

var ConversationNode = function(text, speaker, nextNode)
{
	this.text = text;
	this.speaker = speaker;
	this.nextNode = nextNode;
}
ConversationNode.prototype.show = function()
{
	var advanceGen = function(thisnode)
	{
		return function(yes)
		{
			window.GAME.hideDialog(thisnode);
			if (thisnode.nextNode) thisnode.nextNode.show();
		}
	}
	window.GAME.onAdvanceDialog = advanceGen(this);
	window.GAME.showDialog(this);
}

///A yes-no conversation node
///Queries player and branches based on response

var YesNoNode = function(yesNode, noNode)
{
	this.text = "(y/n)";
	this.yesNode = yesNode;
	this.noNode = noNode;
}
YesNoNode.prototype.show = function()
{
	var advanceGen = function(thisnode)
	{
		return function(yes)
		{
			window.GAME.hideDialog(thisnode);
			if (yes)
			{
				if (thisnode.yesNode) thisnode.yesNode.show();
			}
			else
			{
				if (thisnode.noNode) thisnode.noNode.show();
			}
		}
	}
	window.GAME.onAdvanceDialog = advanceGen(this);
	window.GAME.showDialog(this);
}

///A random branch node
///Selects one of the specified nodes at random

var RandomNode = function()
{
	this.nodes = [];
	for (var i in arguments)
		this.nodes.push(arguments[i]);
}
RandomNode.prototype.show = function()
{
	var val = Math.floor(Math.random() * this.nodes.length);
	this.nodes[val].show();
}

///A conditional conversation node
///Shows only if condition is met, otherwise shows an alternative

var ConditionalNode = function(condition, passNode, failNode)
{
	this.condition = condition;
	this.passNode = passNode;
	this.failNode = failNode;
}
ConditionalNode.prototype.show = function()
{
	if (this.condition())
	{
		if (this.passNode) this.passNode.show();
	}
	else
	{
		if (this.failNode) this.failNode.show();
	}
}

///An action node
///Does its action and immediately continues

var ActionNode = function(action, nextNode)
{
	this.action = action;
	this.nextNode = nextNode;
}
ActionNode.prototype.show = function()
{
	if (this.action) this.action();
	if (this.nextNode) this.nextNode.show();
}


/*
Conditional Variables are:
C_PLAYER_HAS_FISH = 0;     //The current number of fish held
C_PLAYER_DAMAGE = 1;       //The current sub damage
C_PLAYER_MAX_DEPTH = 2;    //The maximum depth achieved
C_PLAYER_TOTAL_FISH = 3;   //The total number of fish caught and sold
C_PLAYER_MONEY = 4;        //The player's current money
C_PLAYER_TOTAL_PROFIT = 5; //All player income ever

Interactions (for npc.setInteraction):
I_NONE = 0;      //No interaction
I_REPAIR = 1;    //Repair submarine
I_BUYFISH = 2;   //Remove all caught fish and award money
I_GIVEMONEY = 3; //Give all money to the NPC, incrementing his moneyGiven property
*/

var loadTownmen = function()
{
	//Create town geometry
	window.GAME.makeTown(3);
	
	var fixMan = new TownMan("Repair Man");
	fixMan.setVisual("media/repairman.png", 24, 31);
	fixMan.mesh.position.x = -250;
	
	var sellMan = new TownMan("Sell Man");
	sellMan.setVisual("media/sellman.png", 25, 31);
	sellMan.mesh.position.x = -50;
	
	var businessWoman = new TownMan("Business Woman");
	businessWoman.setVisual("media/businesswoman.png", 23, 31);
	businessWoman.mesh.position.x = -400;
	businessWoman.setInteraction(window.GAME.I_GIVEMONEY);
	
	var religousMan = new TownMan("Religous Man");
	religousMan.setVisual("media/religousman.png", 25, 34);
	religousMan.mesh.position.x = 170;
	religousMan.setInteraction(window.GAME.I_GIVEMONEY);
	
	var loveWoman = new TownMan("Love Woman");
	loveWoman.setVisual("media/lovewoman.png", 26, 31);
	loveWoman.mesh.position.x = 350;
	loveWoman.setInteraction(window.GAME.I_GIVEMONEY);
	
	/*Example state and positioned people
	var stateMan = new TownMan("State Man");
	stateMan.setVisual("media/man.png", 20, 31);
	
	var lengthMan = new TownMan("Length Man");
	lengthMan.setVisual("media/man.png", 20, 31);
	
	//You can manually reposition people
	lengthMan.mesh.position.x = -100;
	*/
	
	var loanMan = new TownMan("Loan Man");
	loanMan.setVisual("media/man.png", 20, 31);
	loanMan.mesh.position.x = -150;
	loanMan.setInteraction(window.GAME.I_TAKELOAN);
	
	var needsLoan = function() { return window.GAME.takeLoanValid(); };
	
	loanMan.talk = 
	new ConditionalNode(needsLoan,
		new ConversationNode("Looks like you're in a spot of trouble, buddy.", loanMan,
			new ConversationNode("I can loan you some money, at low rates!", loanMan)),
		new ConversationNode("I can loan you money if you're in a bad spot.", loanMan,
			new ConversationNode("Fortunately, you look like you're keeping afloat.", loanMan)));
	
	//Set up a condition we'll be using
	var subIsUndamaged = function() { return getValue(window.GAME.C_PLAYER_DAMAGE) == 0; };
	var playerHasFish = function() { return getValue(window.GAME.C_PLAYER_HAS_FISH) > 0; };
	var encounteredBigShark = function() { return window.GAME.encounteredMonster(window.GAME.MONSTER_FIN); }
	//An example condition using the soon-to-be-implemented Money Given value
	var gaveFixManEnoughMoney = function() { return fixMan.moneyGiven >= 50; };
	
	//An action we'll be using
	var doRepair = function() { window.GAME.executeAction(window.GAME.A_REPAIR_MAX); };
	
	/*	DOCUMENTATION:
	
	ConversationNode(text, speaker, NEXTNODE);
	- Displays the specified text on the specified speaker. A null speaker defaults to the player.
	  When the player continues, goes to NEXTNODE.
	
	YesNoNode(YESNODE, NONODE);
	- Queries the player for yes or no. The previous dialog will be left on the screen (programming to-do).
	  Goes to YESNODE or NONODE based on the response.
	
	RandomNode(NODE, NODE, NODE, ...);
	- Takes any number of nodes. Jumps to one at random.
	
	ConditionalNode(condition, PASSNODE, FAILNODE);
	- Branches based on a condition. The condition is an anonymous function like this:
	  
	  function() { return getValue(window.GAME.C_PLAYER_DAMAGE) == 0; };
	  
	  Note that this is code, so you can check anything you can figure out how to get access to.
	  If the function returns true, goes to PASSNODE. Otherwise, goes to FAILNODE.
	
	ActionNode(action, NEXTNODE);
	- Does the specified action and immediately moves to the next node. Doesn't display anything.
	
	
	Any node parameter can be undefined or null. That will end the conversation.
	
	*/
	
	var fixManNotMet = function() { return fixMan.state == 0; }
	
	//Actions for changing the state
	var fixManAdvanceState = function() { fixMan.state++; }
	//You could also make actions that set the state to a particular value
	
	fixMan.state = 0;
	
	fixMan.talk =
	new ConditionalNode(fixManNotMet,
			new ConversationNode("It would appear I broke my submarine again.", fixMan,
				new ConversationNode("Because you waste your time messing around with useless gadgets.", sellMan,
					new ConversationNode("Well until one of my gadgets work out, let me know if you need any repairs.", fixMan,
						new ActionNode(fixManAdvanceState)))),
			new ConditionalNode(subIsUndamaged,
				new ConversationNode("I fix submarines to fund my experiments on my own sub.", fixMan,
					new ConversationNode("Unfortunately I destroyed my sub entirely with my last experiment.", fixMan)),
				new ConversationNode("It looks like you could use a repair and I could use some money", fixMan)));
	/*
	new ConditionalNode(subIsUndamaged,
		//Passed
		new ConditionalNode(fixManMet,
			new ConversationNode("It would appear I broke my submarine again.", fixMan,
				new ConversationNode("Because you waste your time messing around with useless gadgets.", sellMan,
					new ConversationNode("Well until one of my gadgets work out, let me know if you need any repairs.", fixMan,
						new ActionNode(fixManAdvanceState)))),
			new ConversationNode("I fix submarines to fund my experiments on my own sub.", fixMan,
				new ConversationNode("Unfortunately I destroyed my sub entirely with my last experiment.", fixMan)))
		//Failed
		new ConversationNode("It looks like you could use a repair and I could use some money", fixMan));
	*/
	fixMan.setInteraction(window.GAME.I_REPAIR);
	
	
	/* Keeping for a history on how the action nodes work.
	//Create the NPC's talk conversation
	fixMan.talk =
	new ConversationNode("Need any submarine repairs?", fixMan,
		new YesNoNode(
			//"Yes" option:
			new ConditionalNode(subIsUndamaged,
				//Condition passed:
				new ConversationNode("Hey, your sub seems fine to me.", fixMan),
				//Condition failed:
				new ConversationNode("Okay, we'll have you running in a jiffy.", fixMan,
					new ActionNode(doRepair,
						new ConditionalNode(subIsUndamaged,
							new ConversationNode("Okay, you're all set!", fixMan),
							new ConversationNode("Hmm...looks like we couldn't complete all the repairs on your budget.", fixMan,
								new ConversationNode("Why don't you come back after you've sold some fish?", fixMan)))))),
			//"No" option:
			new ConversationNode("Well, come back any time.", fixMan)));
	
	*/
	
	sellMan.talk = 
	new ConditionalNode(playerHasFish, 
		//Condition passed:
		new ConversationNode("I'll pay you well for those fish you have.", sellMan),
		new ConversationNode("This town is hungry, go catch some fish.", sellMan));
	sellMan.setInteraction(window.GAME.I_BUYFISH);
	
	
	var businessWomanNotMet = function() { return businessWoman.state == 0; }
	var businessWomanAdvanceState = function() { businessWoman.state++; }
	businessWoman.state = 0;
	
	businessWoman.talk = 
	new ConditionalNode(encounteredBigShark,
		new ConversationNode("Stay away from that giant shark.", businessWoman,
			new ConversationNode("You'll put this whole town in danger by angering a massive monster.", businessWoman)),
		new ConditionalNode(businessWomanNotMet,
			new ConversationNode("This town has been here for hundreds of years.", businessWoman,
				new ConversationNode("If we want to survive for hundreds more,", businessWoman,
					new ConversationNode("we need to invest in the future.", businessWoman,
						new ActionNode(businessWomanAdvanceState)))),
			new ConversationNode("Don't do anything that will put the future of this town in danger.", businessWoman)));
	
	var religousManNotMet = function() { return religousMan.state == 0; }
	var religousManAdvanceState = function() { religousMan.state++; }
	religousMan.state = 0;
	
	religousMan.talk = 
	new ConditionalNode(encounteredBigShark,
		new ConversationNode("Our Father has granted us the life of this large shark you have found.", religousMan,
			new ConversationNode("I would love to see this great life form with you.", religousMan)),
		new ConditionalNode(religousManNotMet,
			new ConversationNode("Hello brother.", religousMan,
				new ConversationNode("All life was given to us by our Father in the deep sea.", religousMan,
					new ConversationNode("If you want to honor the life given to us,", religousMan,
						new ConversationNode("please help those struggling to live.", religousMan,
							new ActionNode(religousManAdvanceState))))),
			new ConversationNode("We will make sure your offerings are not wasted.", religousMan)));
				
	var loveWomanNotMet = function() { return loveWoman.state == 0; }
	var loveWomanAdvanceState = function() { loveWoman.state++; }
	loveWoman.state = 0;
	
	loveWoman.talk = 
	new ConditionalNode(encounteredBigShark,
		new ConversationNode("I'm so glad you're safe.", loveWoman,
			new ConversationNode("Does this giant shark seem dangerous?", loveWoman,
				new YesNoNode(
					new ConversationNode("Then I hate to ask you this, but you need to slay this Shark.", loveWoman,
						new ConversationNode("If this monstrosity is allowed to live, it could take more lives.", loveWoman)),
					new ConversationNode("Well that's a relief.", loveWoman,
						new ConversationNode("Please just be safe around it.", loveWoman))))),
		new ConditionalNode(loveWomanNotMet,
			new ConversationNode("Hey you!", loveWoman,
				new ConversationNode("My restaurant has been booming with all the fish you're catching.", loveWoman,
					new ConversationNode("Please be careful out there...I'll see you after work.", loveWoman,
						new ActionNode(loveWomanAdvanceState)))),
			new ConversationNode("Be careful out there, I don't want to end up like my father.", loveWoman)));
		
			
	/* Keeping for example of how to do a random conversation.
	randomMan.talk = 
	new RandomNode(
		new ConversationNode("1 Potato", randomMan),
		new ConversationNode("2 Carrot", randomMan),
		new ConversationNode("3 Apple Pie", randomMan),
		new ConversationNode("4 SUBMARINE!", randomMan));
	*/
	
	/* State man example
	//Conditions for checking the state
	var isBreakfastState = function() { return stateMan.state == 0; }
	var isLunchState = function() { return stateMan.state == 1; }
	var isDinnerState = function() { return stateMan.state == 2; }
	
	//Actions for changing the state
	var advanceState = function() { stateMan.state++; }
	//You could also make actions that set the state to a particular value
	
	stateMan.state = 0;
	
	stateMan.talk = 
	new ConversationNode("Whatever I say next is determined by my state.", stateMan,
		new ConditionalNode(isBreakfastState,
			new ConversationNode("It's time for breakfast.", stateMan,
				new ActionNode(advanceState)),
			new ConditionalNode(isLunchState,
				new ConversationNode("It's time for lunch.", stateMan,
					new ActionNode(advanceState)),
				new ConditionalNode(isDinnerState,
					new ConversationNode("It's time for dinner.", stateMan,
						new ActionNode(advanceState)),
					new ConversationNode("I don't know what time it is!", stateMan)))));
	
	//Length man test
	lengthMan.talk = 
	new ConversationNode("Four word 24 characters.", lengthMan,
		new ConversationNode("Six words that has 33 characters.", lengthMan,
			new ConversationNode("There are eight words that has 45 characters.", lengthMan,
				new ConversationNode("There are ten words that have 50 characters in it.", lengthMan,
					new ConversationNode("There are thirteen words in this sentence with 73 characters in it total.", lengthMan,
						new ConversationNode("This is a big sentence with seventeen words in this sentence with a total of 91 characters.", lengthMan))))));
						*/
}