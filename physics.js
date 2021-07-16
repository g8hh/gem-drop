// Matter.js shorthand
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Bounds = Matter.Bounds,
    Events = Matter.Events,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Query = Matter.Query,
    Vector = Matter.Vector;

// create engine
var engine = Engine.create(),
    world = engine.world;

// create renderer
var render = Render.create({
    element: document.getElementById("render"),
    engine: engine,
    options: {
        width: Math.min(document.documentElement.clientWidth, 300),
        height: Math.min(document.documentElement.clientHeight, 500),
        background: 'transparent',
        wireframes: false
    }
});

// Set up collision filters
var MOUSE_FILTER = {
		group: 0,
		category: 1,
		mask: 1
	},
	BODY_FILTER = {
		group: 1,
		category: 2,
		mask: 2
	},
	BG_FILTER = {
		group: 2,
		category: 4,
		mask: 5
	},
	NOCLIP = {
		group: 0,
		category:8,
		mask:0
	};

// run the engine
// var runner = Engine.run(engine);
var runner = Runner.run(engine);

// run the renderer
Render.run(render);

// INVENTORY
var Inventory = {
	// defaults
	wall_radius: 5,
	bottom_margin: 10,
	wall_options: {
		isStatic: true,
		collisionFilter: BODY_FILTER,
		render: {
			fillStyle: "gray",
			strokeStyle: "gray"
		}
	},
	getSize: function() {
		// TODO shorthand like this? Array must be ordered descending according to size/priority
		// Upgrades.InvSize.forEach(function(upgrade){
		// });
		// if(Upgrades[2].owned)
		// 	return Upgrades[2].size;
		if(Upgrades[1].owned)
			return Upgrades[1].size;
		else if(Upgrades[0].owned)
			return Upgrades[0].size;
		else return { width: 100, height: 300 };//{ width: 50, height: 250 };
	},

	// body references
	left: undefined,
	right: undefined,
	ground: undefined,

	// methods
	build: function() {
		var size = this.getSize();

		// Remove old
		[this.left, this.right, this.ground].forEach(function(body){
			if(body !== undefined)
				Composite.remove(world, body);
		});

		// Set canvas dims
		render.canvas.width = size.width + this.wall_radius * 2;
		render.canvas.height = size.height + this.wall_radius;

		// Construct
		this.left = Bodies.rectangle(this.wall_radius / 2, render.canvas.height / 2 - this.bottom_margin, this.wall_radius, render.canvas.height, this.wall_options);
		this.right = Bodies.rectangle(render.canvas.width - (this.wall_radius / 2), render.canvas.height / 2  - this.bottom_margin, this.wall_radius, render.canvas.height, this.wall_options);
		this.ground = Bodies.rectangle(render.canvas.width / 2, render.canvas.height - (this.wall_radius / 2) - this.bottom_margin, render.canvas.width, this.wall_radius, this.wall_options);

		if(AutoDrop.open)
			openDrop();

		// Add
		World.add(engine.world, [this.left, this.right, this.ground]);
	},

	getValue: function() {
		var val = 0;
		world.bodies.forEach(function(body){
			if(body.gem){
				val += body.gem.getValue();
			} else if (body.achievement) {
				val += body.achievement.getValue();
			}
		});
		return val;
	}
};


// add all of the bodies to the world
// World.add(engine.world, [ground, left, right]);
Inventory.build();

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        collisionFilter: MOUSE_FILTER,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

// keep the mouse in sync with rendering
render.mouse = mouse;

World.add(world, mouseConstraint);

// Vector.dist = function(v1, v2){
// 	return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
// }

// an example of using mouse events on a mouse
Events.on(mouseConstraint, 'mousedown', function(event) {
    var mousePosition = event.mouse.position;
    
    // Walls block clicks
    var skip = false;
    [Inventory.left, Inventory.right, Inventory.ground].forEach(function(body){
    	if(Bounds.contains(body.bounds, mousePosition)){
    		//console.log("ignoring a click on the bounds");
    		skip = true;
    		return false;
    	}	
    });
    
    // Handle buff clicks
    // TODO maybe refactor this whole bit to just use Query.point?
    Query.point(world.bodies, mousePosition).forEach(function(body){
    	if(body.buff){
    		console.log("buff clicked");
    		clickBuff(body.buff);

			// TODO should these lines be in clickBuff? Should clickBuff be in physics.js?
			// Apply impulse to other bodies
			world.bodies.forEach(function(otherBody){
				if(otherBody === body) return false;
				if([Inventory.left, Inventory.right, Inventory.ground].includes(otherBody)) return false;
				//if(otherBody === Inventory.left || otherBody === Inventory.right || otherBody === Inventory.ground) return false;
				var vector = {x: otherBody.position.x - mousePosition.x, y:otherBody.position.y - mousePosition.y};
				if(Vector.magnitude(vector) <= 100){
					Body.setVelocity(otherBody, Vector.mult(Vector.normalise(vector), 10));
				}

					//Body.applyForce(otherBody, mousePosition, {x: 0, y: 1}); // TODO FIXME
			});
    		Composite.remove(world, body);
    		skip = true;
    		return false;
    	}
    });

	if(skip || mousePosition.y >= render.canvas.height - Inventory.bottom_margin) return;

    // Spawn gems
    var toSpawn = doClick();
    toSpawn.forEach(function(e, index){
    	if(index > 1)
    		mousePosition.y += 15;
    	spawnGem(mousePosition, e);
    });
});

Math.toRadians = function(deg){
	return (Math.PI / 180) / deg;
};

function spawnGem(pos, gem){
	var body;
	var DEFAULT_RADIUS = DEFAULT_GEM_RADIUS;
	switch(gem.name){
		case "Quartz":
			body = Bodies.fromVertices(pos.x, pos.y, [
				{x: 0, y:40},
				{x:46, y:40},
				{x:23, y: 1}
			], {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "gray",
					strokeStyle: "transparent",
					sprite: {
                        texture: "img/quartz-small.png"
                    },
				}
			});
			break;
		case "Topaz":
			body = Bodies.fromVertices(pos.x, pos.y, [
					{x: 0, y:37},
					{x:15, y:50},
					{x:30, y:37},
					{x:30, y:12},
					{x:15, y: 0},
					{x: 0, y:12}
				], {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "orange",
					strokeStyle: "transparent",
					sprite: {
                        texture: "img/topaz-small.png"
                    },
				}
			});
			break;
		case "Amethyst":
			body = Bodies.fromVertices(pos.x, pos.y, [
					{x: 8, y:38},
					{x:32, y:38},
					{x:40, y:15},
					{x:20, y: 0},
					{x: 0, y:15}
				], {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "purple",
					strokeStyle: "transparent",
					sprite: {
                        texture: 'img/amethyst-small.png'
                    },
				}
			});
			break;
		case "Sapphire":
			body = Bodies.fromVertices(pos.x, pos.y, [
					{x: 8, y:35},
					{x:22, y:40},
					{x:35, y:32},
					{x:39, y:17},
					{x:32, y: 4},
					{x:17, y: 0},
					{x: 4, y: 7},
					{x: 0, y: 22}
				], {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "blue",
					strokeStyle: "transparent",
					sprite: {
                        texture: 'img/sapphire-small.png'
                    },
				}
			});
			break;
		case "Emerald":
			body = Bodies.fromVertices(pos.x, pos.y, [
					{x: 0, y:40},
					{x:40, y:40},
					{x:40, y: 0},
					{x: 0, y: 0}
				], {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "green",
					strokeStyle: "transparent",
					sprite: {
                        texture: 'img/emerald-small.png'
                    },
				}
			});
			break;
		case "Ruby":
			body = Bodies.circle(pos.x, pos.y, DEFAULT_RADIUS, {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "red",
					strokeStyle: "transparent",
					sprite: {
                        texture: 'img/ruby-small.png'
                    },
				}
			});
			break;
		case "Diamond":
			body = Bodies.fromVertices(pos.x, pos.y, [
					{x:25, y:40},
					{x:50, y:13},
					{x:37, y: 0},
					{x:12, y: 0},
					{x:0,  y:13}
				], {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "lightblue",
					strokeStyle: "transparent",
					sprite: {
                        texture: 'img/diamond-small.png'
                    },
				}
			});
			break;
		case "Rainbow":
			body = Bodies.fromVertices(pos.x, pos.y, [
					{x:10, y:39},
					{x:28, y:39},
					{x:40, y:25},
					{x:35, y: 7},
					{x:20, y: 0},
					{x: 4, y: 7},
					{x: 0, y:25}
				], {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "pink",
					strokeStyle: "transparent",
					sprite: {
                        texture: 'img/rainbow-small.png'
                    },
				}
			});
			break;
		default:
			console.log("Unknown gem of type " + gem.name);
			return false;
	}
	body.gem = gem;

	// Noclip
	if(AutoDrop.getRate() === 0)
		body.collisionFilter = NOCLIP;

	World.add(engine.world, body);
	updateMoney();
}

function spawnBuff(pos, buff){
	var body;
	var DEFAULT_RADIUS = DEFAULT_GEM_RADIUS;
	switch(buff.name){
		case "Star":
			body = Bodies.fromVertices(pos.x, pos.y, [
					// {x: 9, y:48},
					// {x:25, y:39},
					// {x:40, y:48},
					// {x:37, y:30},
					// {x:49, y:18},
					// {x:32, y:17},
					// {x:25, y: 1},
					// {x:18, y:17},
					// {x: 1, y:18},
					// {x:13, y:30}
					{x: 9, y:48},
					{x:40, y:48},
					{x:49, y:18},
					{x:25, y: 1},
					{x: 1, y:18}
				], {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "yellow",
					strokeStyle: "transparent",
					sprite: {
						texture: 'img/star-small.png'
					},
				}
			});
			break;
		case "Heart":
			body = Bodies.fromVertices(pos.x, pos.y, [
					{x:25, y:43},
					{x:50, y:18},
					{x:50, y: 7},
					{x:43, y: 0},
					{x: 7, y: 0},
					{x: 0, y: 7},
					{x: 0, y:18}
				], {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "pink",
					strokeStyle: "transparent",
					sprite: {
						texture: 'img/heart-small.png'
					},
				}
			});
			break;
		case "Cursor":
			body = Bodies.fromVertices(pos.x, pos.y, [
					{x: 0, y:43},
					{x:18, y:52},
					{x:25, y:49},
					{x:31, y:29},
					{x: 1, y: 1}
				], {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "white",
					strokeStyle: "black",
					sprite: {
						texture: 'img/cursor-small.png'
					},
				}
			});
			break;
		case "Teardrop":
			body = Bodies.fromVertices(pos.x, pos.y, [
					{x: 0, y:38},
					{x: 5, y:50},
					{x:19, y:54},
					{x:31, y:48},
					{x:35, y:35},
					{x:17, y: 1}
				], {
				collisionFilter: BODY_FILTER,
				render: {
					fillStyle: "lightblue",
					strokeStyle: "transparent",
					sprite: {
						texture: 'img/teardrop-small.png'
					},
				}
			});
			break;
		default:
			console.log("Unknown buff of type " + buff.name);
			return false;
	}
	body.buff = buff;
	World.add(engine.world, body);
}

function spawnTrophy(achievement){
	var body;
	var DEFAULT_RADIUS = DEFAULT_GEM_RADIUS;
	var spawnRect = getSpawnRect();
	var pos = {
		x: getRandomInt(spawnRect.x1, spawnRect.x2),
		y: getRandomInt(spawnRect.y1, spawnRect.y2)
	};
	body = Bodies.fromVertices(pos.x, pos.y, [
		{x:10, y:53},
		{x:40, y:53},
		{x:50, y: 3},
		{x:41, y: 0},
		{x: 9, y: 0},
		{x: 0, y: 3}
			// {x:10, y:53},
			// {x:40, y:53},
			// {x:40, y:50},
			// {x:28, y:44},
			// {x:28, y:32},
			// {x:46, y:17},
			// {x:49, y:10},
			// {x:50, y: 3},
			// {x:41, y: 3},
			// {x:41, y: 0},
			// {x: 9, y: 0},
			// {x: 9, y: 3},
			// {x: 0, y: 3},
			// {x: 1, y:10},
			// {x: 5, y:17},
			// {x:22, y:32},
			// {x:22, y:44},
			// {x:10, y:50}
		], {
		collisionFilter: BODY_FILTER,
		render: {
			fillStyle: "yellow",
			strokeStyle: "transparent",
			sprite: {
                texture: 'img/trophy-small.png'
            },
		}
	});
	body.achievement = achievement;
	World.add(engine.world, body);
}

function showFloatingNumber(canvasX, canvasY, num){
	// if(!Settings.render_floatnums)
	return false;

	var rect = render.canvas.getBoundingClientRect();
	var x = canvasX + rect.left;
	var y = canvasY - rect.top;
    
	y += getRandomInt(0, UI.money.getBoundingClientRect().height);

    // Spawn it
    var float = document.createElement("span");
    float.className = "floatingnum";
    float.innerText = "+" + formatMoney(num).substring(1);
    float.style.position = "absolute";
    float.style.top = y;
    float.style.left = x;
	UI.vfx.appendChild(float);

    // Scale the font size
    var fontsize = { min: 10, max: 25 };
    var value = { min: Math.log(Gems[0].getValue()), max: Math.log(Gems[Gems.length-1].getValue()) };

    // Do d3-style proportional scaling
    var scaledsize = ((Math.log(num) - value.min) / (value.max - value.min) ) * (fontsize.max - fontsize.min) + fontsize.min;
    //console.log(scaledsize);
    float.style.fontSize = scaledsize;

    // Bold big numbers
    if(num >= 1e6)
    	float.style.color = "green";
    if (num >= 1e3)
    	float.style.fontWeight = "bold";
   	else
   		float.style.color = "gray";
    
   

    // Animate it
	var FLOAT_DIST = 100;
	var ANIM_DURATION = 1000; // should match the CSS value

    setTimeout(function(){
	    float.style.top = y - FLOAT_DIST * getRandomFloat(0.8, 1.2);
	    float.style.opacity = 0;
	}, 1);

	setTimeout(function(){
		UI.vfx.removeChild(float);
	}, ANIM_DURATION);
    
}

var lastTime = 0;
Events.on(engine, 'tick', function(event) {
	// Remove gems
	world.bodies.forEach(function(body){
		if(body.position.y > render.canvas.height && body.position.x <= render.canvas.width){
			//console.log("gem sold at "+body.position.x+","+body.position.y);
			Composite.remove(world, body);
			if(body.gem){
				showFloatingNumber(body.position.x, body.position.y, body.gem.getValue());
				sellGem(body.gem);
			} else if(body.buff && Buffs.autocollect){
				clickBuff(body.buff);
			} else if (body.achievement) {
				showFloatingNumber(body.position.x, body.position.y, body.achievement.getValue());
				getAchievement(body.achievement);
			}
		} else if(body.position.y < 0) {
			Composite.remove(world, body);
			if(body.gem){
				Stats.wasted++;
				checkAll(Achievements.wasted);
				updateMoney();
			} else if (body.buff && Buffs.autocollect){
			} else if (body.achievement){
				showFloatingNumber(body.position.x, body.position.y, body.achievement.getValue());
				getAchievement(body.achievement);
			}
		}
	});

	// Spawn gems
	var delta = (event.timestamp - lastTime) / 1000;
	lastTime = event.timestamp;
	//if(delta < BackgroundMode.threshhold)
	genGems(delta);
	genBuffs(delta);
	if(!Stats.play_time)
		Stats.play_time = 0;
	Stats.play_time += delta;
	// else
	// 	console.warn("Dropped frames, delta = " + delta);


	// Auto drop
	var rate = AutoDrop.getRate();
	if(rate === 0){
		if(!AutoDrop.open){
			UI.autodrop_icon.src = AutoDrop.getIcon();
			UI.autodrop_icon.style.display = "inline-block";
			UI.drop.disabled = true;
			openDrop();
		}
	} else if(rate > 0){
		AutoDrop.timer -= delta;
		if(AutoDrop.timer <= 0){
			if(AutoDrop.open){
				UI.autodrop_icon.style.display = "none";
				UI.drop.disabled = false;
				closeDrop();
				AutoDrop.open = false;
				AutoDrop.timer = rate;
			} else {
				UI.drop.disabled = true;
				UI.autodrop_icon.src = AutoDrop.getIcon();
				UI.autodrop_icon.style.display = "inline-block";
				openDrop();
				AutoDrop.open = true;
				AutoDrop.timer = AutoDrop.getOpenDuration();
			}
		}	
	}

	// Buff timers
	Buffs.forEach(function(buff){
		if(buff.timeLeft < 0){
			buff.timeLeft = 0;
			updateBuff(buff);
			updateMoney();
		}
		if(buff.timeLeft === 0)
			return false;
		buff.timeLeft -= delta;
		updateBuff(buff);
	});

	// Achievement hover
	var showing = false;
	world.bodies.forEach(function(body){
		if(!body.achievement) return false;
		if(Bounds.contains(body.bounds, render.mouse.position)){
			showing = true;
			hoverAchievement(body.achievement, render.mouse.position);
		}
	});
	if(!showing)
		clearHover();

	// if(ui.stats.isOpen)
	// 	updateStats();
	// TODO this freezes the game loop

	// Save game
	// if(Settings.enable_save)
	// 	saveGame();
	// Moved to setinterval loop
});

function hoverAchievement(achievement, pos){
	var rect = render.canvas.getBoundingClientRect(),
		x = pos.x + rect.left;
		y = pos.y - rect.top;

	UI.inv_hover.style.left = x + "px";
	UI.inv_hover.style.top = y + "px";
	if(UI.inv_hover.achievement !== achievement)
		updateAchievement(achievement, UI.inv_hover);
	UI.inv_hover.style.display = "block";
}

function clearHover(){
	UI.inv_hover.style.display = "none";
	UI.inv_hover.achievement = null;
}

function getSpawnRect(){
	return { x1: Inventory.wall_radius, y1: 0, x2: render.canvas.width, y2: 50 };
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max){
	return Math.random() * (max - min) + min;
}

function genGems(delta){
	//var toSpawn = genGems_deterministic(delta) = genGems_probabilistic(delta);
	var toSpawn = genGems_deterministic(delta);
	toSpawn.forEach(function(g){
		var spawnRect = getSpawnRect();
		var pos = {
			x: getRandomInt(spawnRect.x1, spawnRect.x2),
			y: getRandomInt(spawnRect.y1, spawnRect.y2)
		};
		//console.log(pos);
		// Stats.factory_gems++;
		// checkAll(Achievements.gems);
		spawnGem(pos, g);
	});
}

function genBuffs(delta){
	// First roll to see if we spawn a buff this frame
	if(getRandomFloat(0, 1) > delta / Buffs.getRate())
		return false;

	// Then roll for the type
	var sum = 0,
		sums = [],
		buff;
	Buffs.forEach(function(buff){
		sums.push(sum + buff.getChance());
		sum += buff.getChance();
	});
	var roll = getRandomInt(0, sum);
	for(var i = 0; i < sums.length; i++){
		if(roll <= sums[i]){
			buff = Buffs[i];
			break;
		}
	}
	//console.log("Spawning a "+buff.name);

	// Spawn the buff
	var spawnRect = getSpawnRect();
	var pos = {
		x: getRandomInt(spawnRect.x1, spawnRect.x2),
		y: getRandomInt(spawnRect.y1, spawnRect.y2)
	};
	spawnBuff(pos, buff);
}

function openDrop(){
	Inventory.ground.collisionFilter = BG_FILTER;
	Inventory.ground.render.fillStyle = "#D3D3D3";
	Inventory.ground.render.strokeStyle = "#D3D3D3";

}

function closeDrop(){
	Inventory.ground.collisionFilter = BODY_FILTER;
	Inventory.ground.render.fillStyle = "gray";
	Inventory.ground.render.strokeStyle = "gray";
}

// Drop
UI.drop.onmousedown = function(){
	AutoDrop.manuallyOpen = true;
	AutoDrop.timer = Infinity;
	openDrop();
}
UI.drop.onmouseup = UI.drop.onmouseout = function(){
	AutoDrop.manuallyOpen = false;
	closeDrop();
	AutoDrop.timer = AutoDrop.getRate();
}

var BackgroundMode = {
	gem_radius: 20,
	interval: 16,
	threshhold: 250,
	lastTime: undefined,
	update: function() {
		var now = new Date().getTime();
		if(lastTime === undefined)
			return this.lastTime = now;
		var delta = now - this.lastTime;
		this.lastTime = now;

		if(delta >= this.threshhold) {
			console.log("doing background sim update");
			BackgroundMode.simulate(delta);
		} else {
			// do nothing; physics loop is running
			//console.log("doing normal update");
		}
	},
	timeout: null,//setInterval(function(){ BackgroundMode.update(); }, this.interval),
	simulate: function(delta){
		var engine_delta = 16.66;
		var iterations = delta / engine_delta;
		console.log(delta + "ms passed: updating engine x"+iterations);
		if(iterations >= 61){
			console.warn("Too many iterations to simulate; capping at 60");
			iterations = 60;
		}
		for(var i = 0; i < iterations; i++){
			Engine.update(engine);
		}
		// var a = world.gravity.y * world.gravity.scale;
		// var t = delta;
		// var v_i = 0;
		// var delta_x_max = 0.5 * a * Math.pow(t, 2) + v_i * t;
		// var timesteps = delta_x_max / (this.gem_radius * 2);
		// var new_delta = delta / timesteps;
		// console.log(delta_x_max + " " + timesteps);

		// // Snap all gems to grid
		// for(var i = 0; i < timesteps; i++){
		// 	// Spawn new ones
		// 	// Open dropgate if necessary
		// 	// Move all of them
		// 	// Sell bottom ones
		// }
	}
};

function debug(){
	// body = Bodies.circle(100, 10, 20, {
	// 	collisionFilter: BODY_FILTER,
	// 	render: {
	// 		fillStyle: "white",
	// 		strokeStyle: "grey"
	// 	}
	// });
	// body.gem = gems[0];
	// //World.add(engine.world, body);
	// for(var i = 0; i < 60 * 10; i++){
	// 	Engine.update(engine, 1000 / 60);
	// }
	// engine.update(10);
}