var DEFAULT_COST_FACTOR = 1.15;
var DEFAULT_GEM_RADIUS = 20;

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// GEMS (CLICKPOWERS & FACTORIES)
///////////////////////////////////////////////////////////////////////////////////////////////////////////

var BuyMode = {
	BUY: 0,
	SELL: 1,
	mode: 0,
	quantity: 1
};

function log(b, n) {
	return Math.log(n) / Math.log(b);
}

// Calculates the cost of a factory purchase for the given gem according to BUY MODE
function calculatePurchase(gem, quantity = BuyMode.quantity, mode = BuyMode.mode) {
	var r = gem.factory.getCostFactor(),
		b = gem.factory.baseCost,
		k = gem.factory.owned,
		c = money,
		n = 0;
	if (mode === BuyMode.BUY) {
		var max_quantity = Math.floor(log(r, Math.pow(r, k) - c * ((1 - r) / b)) - k);
		if (quantity === "max")
			n = Math.max(max_quantity, 1);
		else
			n = quantity;
	} else {
		if (quantity === "max")
			n = gem.factory.owned;
		else
			n = Math.min(gem.factory.owned, quantity);
		k = gem.factory.owned - n;
	}
	var cost = b * ((Math.pow(r, k) - Math.pow(r, k + n)) / (1 - r));
	return { cost: cost, quantity: n };
}

// Gem constructor
function Gem(options){
	// Initialize gem defaults
	var gem = {
		name: null,
		bonus: 1.0,
		baseValue: null,
		getValue: function() {
			var mult = this.bonus;
			if(Buffs.star.timeLeft > 0)
				mult *= Buffs.star.getPower();
			return this.baseValue * mult;
		},
		clickpower: {
			owned: false,
			baseCost: null,
			getCost: function(){ return this.baseCost; },
			baseRate: 1,
			getRate: function(){
				var mult = 1.0;
				if(Buffs.cursor.timeLeft > 0)
					mult *= Buffs.cursor.getPower();
				return this.baseRate * mult;
			}
			//getDescription: function() { return "" },
			//getName:function() { return this.super.name; }
		},
		factory: {
			owned: 0,
			baseCostFactor: DEFAULT_COST_FACTOR,
			getCostFactor: function() { return this.baseCostFactor; },
			baseCost: null,
			getCost: function(owned = this.owned){ return this.baseCost * Math.pow(this.getCostFactor(), owned); },
			baseRate: 0.5,
			getRate: function(){
				var mult = 1.0;
				if(Buffs.heart.timeleft > 0)
					mult *= Buffs.heart.getPower();
				return this.baseRate * mult;
			},
			//getDescription: function() { return "" },
			//getName:function() { return this.super.name + " Factory"; }
		}
	};

	return applyOptions(gem, options);
}

function applyOptions(object, options){
	// Base case
	if(object === undefined || object === null || options === null || typeof options !== 'object')
		return options;

	// Apply options
	for(property in options){
		if (options.hasOwnProperty(property))
			object[property] = applyOptions(object[property], options[property]);
	}
	return object;
}

var Gems = [
	new Gem({
		name: "Quartz",
		baseValue: 1,
		clickpower: {
			owned: true,
			baseCost: 0,
			image: "img/quartz-clickpower.png"
		},
		factory: {
			baseCost: 25,
			image: "img/quartz-factory.png"
		}
	}),
	new Gem({
		name: "Topaz",
		baseValue: 10,
		clickpower: {
			baseCost: 850,
			image: "img/topaz-clickpower.png"
		},
		factory: {
			baseCost: 100,
			image: "img/topaz-factory.png"
		}
	}),
	new Gem({
		name: "Amethyst",
		baseValue: 75,
		clickpower: {
			baseCost: 16000,
			image: "img/amethyst-clickpower.png"
		},
		factory: {
			baseCost: 1750,
			image: "img/amethyst-factory.png"
		}
	}),
	new Gem({
		name: "Sapphire",
		baseValue: 500,
		clickpower: {
			baseCost: 250e3,
			image: "img/sapphire-clickpower.png"
		},
		factory: {
			baseCost: 22e3,
			image: "img/sapphire-factory.png"
		}
	}),
	new Gem({
		name: "Emerald",
		baseValue: 2500,
		clickpower: {
			baseCost: 3e6,
			image: "img/emerald-clickpower.png"
		},
		factory: {
			baseCost: 300e3,
			image: "img/emerald-factory.png"
		}
	}),
	new Gem({
		name: "Ruby",
		baseValue: 15e3,
		clickpower: {
			baseCost: 30e6,
			image: "img/ruby-clickpower.png"
		},
		factory: {
			baseCost: 3.5e6,
			image: "img/ruby-factory.png"
		}
	}),
	new Gem({
		name: "Diamond",
		baseValue: 75e3,
		clickpower: {
			baseCost: 123456789,
			image: "img/diamond-clickpower.png"
		},
		factory: {
			baseCost: 15e6,
			image: "img/diamond-factory.png"
		}
	}),
	new Gem({
		name: "Rainbow",
		baseValue: 500e3,
		clickpower: {
			baseCost: 5e9,
			image: "img/rainbow-clickpower.png"
		},
		factory: {
			baseCost: 600e6,
			image: "img/rainbow-factory.png"
		}
	})
];

// Grab quick references for debug/convenience
Gems.quartz = Gems[0];
Gems.topaz = Gems[1];
Gems.amethyst = Gems[2];
Gems.sapphire = Gems[3];
Gems.emerald = Gems[4];
Gems.ruby = Gems[5];
Gems.diamond = Gems[6];
Gems.rainbow = Gems[7];

Gems.active_clickpower = Gems.quartz;

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPGRADES
///////////////////////////////////////////////////////////////////////////////////////////////////////////

var UPGRADE_CATEGORY = {
	AUTO_DROP: 0,
	INVENTORY_SIZE: 1
}

var Upgrades = [
	// {
	// 	name: "Inventory Size I",
	// 	description: "More space to hold gems.",
	// 	baseCost:12,
	// 	getCost: function() { return this.baseCost; },
	// 	category: UPGRADE_CATEGORY.INVENTORY_SIZE,
	// 	onPurchase: function(){
	// 		Inventory.build();
	// 	},
	// 	size: { width: 100, height: 300 },
	// 	owned: false
	// },
	{
		name: "Inventory Size I",
		description: "More space to hold gems.",
		baseCost:250,
		getCost: function() { return this.baseCost; },
		category: UPGRADE_CATEGORY.INVENTORY_SIZE,
		onPurchase: function(){
			Inventory.build();
		},
		size: { width: 200, height: 350 },
		owned: false,
		img: "img/inv-1.png"
	},
	{
		name: "Inventory Size II",
		description: "More space to hold gems.",
		baseCost:4500,
		getCost: function() { return this.baseCost; },
		category: UPGRADE_CATEGORY.INVENTORY_SIZE,
		onPurchase: function(){
			Inventory.build();
			//Achievements.misc.inventory.condition = function(){ return true; };
			Achievements.misc.inventory.check();
		},
		size: { width: 300, height: 500},
		owned: false,
		img: "img/inv-2.png"
	},
	{
		name: "Auto Drop",
		description: "Automatically drops gems every 10 seconds.",
		baseCost:10000,
		getCost: function() { return this.baseCost; },
		category: UPGRADE_CATEGORY.AUTO_DROP,
		rate: 10,
		owned: false,
		onPurchase: function(){
			UI.autodrop_icon.src = AutoDrop.getIcon();
		},
		img: "img/autodrop-1.png"
	},
	{
		name: "Auto Drop v2",
		description: "Automatically drops gems every 5 seconds.",
		baseCost:50000,
		getCost: function() { return this.baseCost; },
		category: UPGRADE_CATEGORY.AUTO_DROP,
		rate: 5,
		owned: false,
		onPurchase: function(){
			UI.autodrop_icon.src = AutoDrop.getIcon();
		},
		img: "img/autodrop-2.png"
	},
	{
		name: "Auto Drop v3",
		description: "Keep the gate open permanently.",
		baseCost:250000,
		getCost: function() { return this.baseCost; },
		category: UPGRADE_CATEGORY.AUTO_DROP,
		rate: 0,
		owned: false,
		onPurchase: function(){
			UI.autodrop_icon.src = AutoDrop.getIcon();
			Achievements.misc.autodrop.check();
		},
		img: "img/autodrop-3.png"
	},
	{
		name: "Buffs",
		description: "Buffs randomly spawn (about once every 20 seconds). Click on a buff to collect it.",
		baseCost:1000,
		getCost: function() { return this.baseCost; },
		category: undefined,
		rate: 20,
		owned: false,
		onPurchase: function(){
			Buffs.baseRate = this.rate;
		},
		img: "img/heart-1.png"
	},
	{
		name: "More Buffs",
		description: "Buffs spawn more often (about once every 10 seconds).",
		baseCost:15e3,
		getCost: function() { return this.baseCost; },
		category: undefined,
		rate: 10,
		owned: false,
		onPurchase: function(){
			Buffs.baseRate = this.rate;
		},
		img: "img/heart-2.png"
	},
	{
		name: "Buff Autocollect",
		description: "Buffs are automatically collected when they are dropped.",
		baseCost:400e3,
		getCost: function() { return this.baseCost; },
		category: undefined,
		owned: false,
		onPurchase: function(){
			Buffs.autocollect = true;
		},
		img: "img/heart-3.png"
	},
];

Gems.forEach(function(gem){
	Upgrades.push({
		name: gem.name+" Value",
		description: gem.name+" sell price doubled",
		baseCost:calculatePurchase(gem, 15, BuyMode.BUY).cost,
		getCost: function() { return this.baseCost; },
		category: undefined,
		owned: false,
		onPurchase: function(){
			gem.bonus *= 2;
			updateClickPower(gem);
			updateFactory(gem);
		},
		img: "img/"+gem.name.toLowerCase()+"-1.png"
	});

	Upgrades.push({
		name: gem.name+" Value II",
		description: gem.name+" doubled again (4x total)",
		baseCost:calculatePurchase(gem, 30, BuyMode.BUY).cost,
		getCost: function() { return this.baseCost; },
		category: undefined,
		owned: false,
		onPurchase: function(){
			gem.bonus *= 2;
			updateClickPower(gem);
			updateFactory(gem);
		},
		img: "img/"+gem.name.toLowerCase()+"-2.png"
	});

	Upgrades.push({
		name: gem.name+" Value III",
		description: gem.name+" doubled again (8x total)",
		baseCost:calculatePurchase(gem, 45, BuyMode.BUY).cost,
		getCost: function() { return this.baseCost; },
		category: undefined,
		owned: false,
		onPurchase: function(){
			gem.bonus *= 2;
			updateClickPower(gem);
			updateFactory(gem);
		},
		img: "img/"+gem.name.toLowerCase()+"-3.png"
	});
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// BUFFS
///////////////////////////////////////////////////////////////////////////////////////////////////////////

var Buffs = [
	{
		name: "Star",
		description: "+50% sell price for 15 seconds",
		baseDuration: 15,
		getDuration: function(){ return this.baseDuration; },
		basePower: 1.5,
		getPower: function(){ return this.basePower; },
		timeLeft: 0,
		baseChance: 3, // % of all buff spawns which will be this one
		getChance: function(){ return this.baseChance; },
		img: "img/star.png"
	},
	{
		name: "Heart",
		description: "+200% factory production for 10 seconds",
		baseDuration: 10,
		getDuration: function(){ return this.baseDuration; },
		basePower: 2.0,
		getPower: function(){ return this.basePower; },
		timeLeft: 0,
		baseChance: 3, // % of all buff spawns which will be this one
		getChance: function(){ return this.baseChance; },
		img: "img/heart.png"
	},
	{
		name: "Teardrop",
		description: "Spawn twice as many gems by clicking for 5 seconds",
		baseDuration: 5,
		getDuration: function(){ return this.baseDuration; },
		basePower: 2.0,
		getPower: function(){ return this.basePower; },
		timeLeft: 0,
		baseChance: 3, // % of all buff spawns which will be this one
		getChance: function(){ return this.baseChance; },
		img: "img/teardrop.png"
	},
	{
		name: "Teardrop",
		description: "Hold down the mouse button to continuously spawn gems for 10 seconds",
		baseDuration: 10,
		getDuration: function(){ return this.baseDuration; },
		timeLeft: 0,
		baseChance: 0, // % of all buff spawns which will be this one
		getChance: function(){ return this.baseChance; },
		img: "img/teardrop.png"
	}
];
Buffs.baseRate = Infinity;
Buffs.getRate = function(){ return Buffs.baseRate; };
Buffs.autocollect = false;
Buffs.star = Buffs[0];
Buffs.heart = Buffs[1];
Buffs.cursor = Buffs[2];
Buffs.teardrop = Buffs[3];


///////////////////////////////////////////////////////////////////////////////////////////////////////////
// STATS
///////////////////////////////////////////////////////////////////////////////////////////////////////////

var Stats = {
	money: 0,
	gems: 0,
	clickpower_gems: 0,
	factory_gems: 0,
	upgrades: 0,
	clickpowers: 1,
	factories: 0,
	achievements:0,
	prestige: 0,
	play_time: 0,
	prestige_start_date: new Date().getTime(),
	sold: 0,
	wasted: 0
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// ACHIEVEMENTS
///////////////////////////////////////////////////////////////////////////////////////////////////////////

var Achievements = {all: []};

function Achievement(name, description, value, condition, options={}){
	var achievement = {
		name: name,
		description: description,
		baseValue: value,
		condition: condition,
		getValue: function(){ return this.baseValue; },
		check: function(){
			if(this.owned || !this.condition()) return false;
			this.owned = true;
			Stats.achievements++;
			spawnTrophy(this);
			//updateMoney(this.getValue());
			// console.log("Unlocked achievement: "+this.name);
			// console.log(">"+this.description);
			checkAll(Achievements.meta);
		},
		owned: false
	};
	achievement = applyOptions(achievement, options)
	Achievements.all.push(achievement);
	return achievement;
}

function cp_ach_val(gem){ return gem.clickpower.getCost() * 0.1; };
//function fact_ach_val(gem, num){ return calculatePurchase(gem, num) * 0.1; };

// Gems.quartz.clickpower.achievements = [];
// Gems.quartz.factory.achievements = [];
// Achievements.money = [];
// Achievements.clickpower = [];

// gem.factory.achievements.forEach(function(a){ a.check(); });
// Achievements.factory.byGem(gem).forEach(function(a){ a.check(); });
// Achievements.all.forEach();

// Clickpower owned
Achievements.clickpower = {
	topaz: new Achievement("Topaz Toucher", "Buy the topaz clickpower", cp_ach_val(Gems.topaz), function(){ return Gems.topaz.clickpower.owned; }),
	amethyst: new Achievement("Amethyst Amateur", "Buy the amethyst clickpower", cp_ach_val(Gems.amethyst), function(){ return Gems.amethyst.clickpower.owned; }),
	sapphire: new Achievement("The Blues", "Buy the sapphire clickpower", cp_ach_val(Gems.sapphire), function(){ return Gems.sapphire.clickpower.owned; }),
	emerald: new Achievement("Green Thumb", "Buy the emerald clickpower", cp_ach_val(Gems.emerald), function(){ return Gems.emerald.clickpower.owned; }),
	ruby: new Achievement("Red Handed", "Buy the ruby clickpower", cp_ach_val(Gems.ruby), function(){ return Gems.ruby.clickpower.owned; }),
	diamond: new Achievement("DIAMONDS!", "Buy the diamond clickpower", cp_ach_val(Gems.diamond), function(){ return Gems.diamond.clickpower.owned; }),
	rainbow: new Achievement("Jazz Hands", "Buy the rainbow clickpower", cp_ach_val(Gems.rainbow), function(){ return Gems.rainbow.clickpower.owned; }),
	total: new Achievement("7-Fingered Man", "Buy all 7 clickpowers", cp_ach_val(Gems.rainbow) / 2, function(){ return Stats.clickpowers >= Gems.length; }, {redtext: "You killed my father. Prepare to die."}),
	byGem: function(gem){ return this[gem.name.toLowerCase()]}
};

// Factory quantity
Achievements.factory = {};
Achievements.factory.quartz = [
	new Achievement("Triangles are my favorite shape", "Buy a quartz factory", 10, function(){ return Gems.quartz.factory.owned >= 1; }, {redtext: "Three points where two lines meet"}),
	new Achievement("Quartz Quarry", "Buy 50 quartz factories", 5000, function(){ return Gems.quartz.factory.owned >= 50; }),
	new Achievement("Quartz Mogul", "Buy 100 quartz factories", 20e6, function(){ return Gems.quartz.factory.owned >= 100; })
];
var asdf_factor = 100;

Achievements.factory.topaz = [
	new Achievement("Diversifying Your Portfolio", "Buy a topaz factory", 20, function(){ return Gems.topaz.factory.owned >= 1; }),
	new Achievement("Topaz x50", "Buy 50 topaz factories", calculatePurchase(Gems.topaz, 50, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.topaz.factory.owned >= 50; }), // TODO
	new Achievement("Topaz Tycoon", "Buy 100 topaz factories", calculatePurchase(Gems.topaz, 100, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.topaz.factory.owned >= 100; }),
];
Achievements.factory.amethyst = [
	new Achievement("Amethyst Automation", "Buy an amethyst factory", calculatePurchase(Gems.amethyst, 1, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.amethyst.factory.owned >= 1; }),
	new Achievement("Amethyst x50", "Buy 50 amethyst factories", calculatePurchase(Gems.amethyst, 50, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.amethyst.factory.owned >= 50; }), // TODO
	new Achievement("Purple Haze", "Buy 100 amethyst factories", calculatePurchase(Gems.amethyst, 100, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.amethyst.factory.owned >= 100; }),
];
Achievements.factory.sapphire = [
	new Achievement("Sapphire Supplier", "Buy a sapphire factory", calculatePurchase(Gems.sapphire, 1, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.sapphire.factory.owned >= 1; }),
	new Achievement("Blue Skies", "Buy 50 sapphire factories", calculatePurchase(Gems.sapphire, 50, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.sapphire.factory.owned >= 50; }),
	new Achievement("Sapphic Love", "Buy 100 sapphire factories", calculatePurchase(Gems.sapphire, 100, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.sapphire.factory.owned >= 100; }),
];
Achievements.factory.emerald = [
	new Achievement("Emerald Entrepreneur", "Buy an emerald factory", calculatePurchase(Gems.emerald, 1, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.emerald.factory.owned >= 1; }),
	new Achievement("Emerald Enthusiast", "Buy 50 emerald factories", calculatePurchase(Gems.emerald, 50, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.emerald.factory.owned >= 50; }),
	new Achievement("Emerald Engineer", "Buy 100 emerald factory", calculatePurchase(Gems.emerald, 100, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.emerald.factory.owned >= 100; }),
];
Achievements.factory.ruby = [
	new Achievement("Ruby Producer", "Buy a ruby factory", calculatePurchase(Gems.ruby, 1, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.ruby.factory.owned >= 1; }),
	new Achievement("Ruby x50", "Buy 50 ruby factories", calculatePurchase(Gems.ruby, 50, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.ruby.factory.owned >= 50; }), // TODO
	new Achievement("Seeing Red", "Buy 100 ruby factories", calculatePurchase(Gems.ruby, 100, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.ruby.factory.owned >= 100; }),
];
Achievements.factory.diamond = [
	new Achievement("Diamond Miner", "Buy a diamond factory", calculatePurchase(Gems.diamond, 1, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.diamond.factory.owned >= 1; }),
	new Achievement("Lucy in the Sky", "Buy 50 diamond factories", calculatePurchase(Gems.diamond, 50, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.diamond.factory.owned >= 50; }),
	new Achievement("The 1%", "Buy 100 diamond factories", calculatePurchase(Gems.diamond, 100, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.diamond.factory.owned >= 100; }),
];
Achievements.factory.rainbow = [
	new Achievement("Leprechaun", "Buy a rainbow factory", calculatePurchase(Gems.rainbow, 1, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.rainbow.factory.owned >= 1; }),
	new Achievement("Double Rainbow", "Buy 2 rainbow factories", calculatePurchase(Gems.rainbow, 1, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.rainbow.factory.owned >= 2; }, {redtext: "What does it mean?"}),
	new Achievement("Rainbow x50", "Buy 50 rainbow factories", calculatePurchase(Gems.rainbow, 50, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.rainbow.factory.owned >= 50; }), // TODO
	new Achievement("The 0.1%", "Buy 100 rainbow factory", calculatePurchase(Gems.rainbow, 100, BuyMode.BUY).cost / asdf_factor, function(){ return Gems.rainbow.factory.owned >= 100; }),
];
Achievements.factory.total = [
	new Achievement("Overseer", "Buy 500 total factories", 100e6, function(){ return Stats.factories >= 500; }),
	new Achievement("CEO", "Buy 1000 total factories", 100e9, function(){ return Stats.factories >= 1000; }),
];
Achievements.factory.each = [
	//new Achievement("asdf", "Buy a factory of every type", 0, function(){ var got = true; Gems.forEach(function(gem){ got = got && gem.factory.owned >= 1; }); return got; }),
	//new Achievement("asdf", "Buy 50 factories of every type", 50, function(){ var got = true; Gems.forEach(function(gem){ got = got && gem.factory.owned >= 50; }); return got; }),
	new Achievement("Stacked", "Buy 100 factories of every type", 1e12, function(){ var got = true; Gems.forEach(function(gem){ got = got && gem.factory.owned >= 100; }); return got; }),
];
Achievements.factory.byGem = function(gem){ return this[gem.name.toLowerCase()]};

// Clickpower gems
Achievements.clickpower_gems = [
	new Achievement("Hello world", "Spawn a gem by clicking", 1, function(){ return Stats.clickpower_gems >= 1; }),
	new Achievement("Click x1000", "Spawn 1000 gems by clicking", 1000, function(){ return Stats.clickpower_gems >= 1000; }), // TODO
	new Achievement("Click x10k", "Spawn 10k gems by clicking", 10000, function(){ return Stats.clickpower_gems >= 10000; }), // TODO
];

// Upgrades owned
Achievements.upgrades = [
	new Achievement("My First Upgrade", "Buy an upgrade", 1, function(){ return Stats.upgrades >= 1; }),
	new Achievement("Upgrade x25", "Buy 25 upgrades", 1e9, function(){ return Stats.upgrades >= 25; }), // TODO
	//new Achievement("Upgrade x50", "Buy 50 upgrades", 10e6, function(){ return Stats.upgrades >= 50; }), // TODO
	new Achievement("Lvl 99", "Buy all upgrades", 1e12, function(){ return Stats.upgrades >= Upgrades.length; })
];

// Buffs
Achievements.buffs = [
	new Achievement("Buffed", "Collected a buff", 100, function(){ return Stats.buffs >= 1; }),
	new Achievement("Buff AF", "Collected 50 buffs", 5000, function(){ return Stats.buffs >= 50; }), // TODO
	new Achievement("Do you even lift?", "Collected 100 buffs", 10e3, function(){ return Stats.buffs >= 100; }), // TODO
	new Achievement("Sick gains", "Collected 1k buffs", 1e6, function(){ return Stats.buffs >= 1000; }), // TODO
	new Achievement("Gym rat", "Collected 10k buffs", 10e6, function(){ return Stats.buffs >= 10000; }, { redtext : "Or is it gem rat?"}), // TODO
	new Achievement("Schwarzenegger", "Collected 100k buffs", 100e6, function(){ return Stats.buffs >= 100000; }), // TODO
];

// Total gems
Achievements.gems = [
	new Achievement("Gem Dropper", "Drop 100 gems", 100, function(){ return Stats.gems >= 100; }),
	new Achievement("Bejewelled", "Drop 1k gems", 1e3, function(){ return Stats.gems >= 1e3; }),
	new Achievement("Gem Dropper III", "Drop 10k gems", 10e3, function(){ return Stats.gems >= 10e3; }), // TODO
	new Achievement("Gem Dropper IV", "Drop 100k gems", 100e3, function(){ return Stats.gems >= 100e3; }), // TODO
	new Achievement("Outrageous", "Drop 1M gems", 1e6, function(){ return Stats.gems >= 1e6; }, { redtext: "Truly, truly, TRULY outrageous."}),
];

// Total money
Achievements.money = [
	new Achievement("Middle-Class", "Make $1k", 2.5e2, function(){ return Stats.money >= 1e3; }),
	new Achievement("Wealthy", "Make $1M", 2.5e5, function(){ return Stats.money >= 1e6; }),
	new Achievement("Opulent", "Make $1B", 2.5e8, function(){ return Stats.money >= 1e9; }),
	new Achievement("Obscene", "Make $1T", 2.5e11, function(){ return Stats.money >= 1e12; }),
]

// Meta-Achievement
Achievements.meta = [
	new Achievement("Meta-Achievement I", "Unlock 15 achievements", 1.5e3, function(){ return Stats.achievements >= 15; }),
	new Achievement("Meta-Achievement II", "Unlock 30 achievements", 3e3, function(){ return Stats.achievements >= 30; }),
	new Achievement("Meta-Achievement III", "Unlock 45 achievements", 4.5e3, function(){ return Stats.achievements >= 45; }),
	new Achievement("Meta-Achievement IV", "Unlock 60 achievements", 6e3, function(){ return Stats.achievements >= 60; }),
	new Achievement("Meta-Meta-Achievement", "Unlock 4 meta-achievements", 4e3, function(){
		for(var i = 0; i < 4; i++)
			if(!Achievements.meta[i].owned) return false;
		return true;
	}),
	new Achievement("Overachiever", "Unlock every achievement", 420, function(){ return Stats.achievements >= Stats.achievements.length - 1; }, {redtext: "(except this one)"}),
];

// Prestige
Achievements.prestige = [
	// new Achievement("The Prestige", "Prestige once", 0, function(){ return Stats.prestige >= 1; }, {redtext: "Are you watching closely?"}),
	// new Achievement("Once more, with feeling", "Prestige twice", 0, function(){ return Stats.prestige >= 2; }),
	// new Achievement("Ultimate Gem Hunter Mode", "Prestige three times", 0, function(){ return Stats.prestige >= 3; }),
	// new Achievement("Gem Drop 4: The Droppening", "Prestige four times", 0, function(){ return Stats.prestige >= 4; }),
	// new Achievement("Pentakill", "Prestige five times", 0, function(){ return Stats.prestige >= 5; }),
];

// Time played
Achievements.time = [
	new Achievement("60 minutes", "1 hour of total playtime", 0, function(){ return Stats.play_time / 60 / 60 >= 1; }),
	new Achievement("24 hours", "1 day of total playtime", 0, function(){ return Stats.play_time / 60 / 60 / 24 >= 1; }),
	new Achievement("2 days", "2 days of total playtime", 0, function(){ return Stats.play_time / 60 / 60 / 24 >= 2; }),
	new Achievement("3 days", "3 days of total playtime", 0, function(){ return Stats.play_time / 60 / 60 / 24 >= 3; }),
	new Achievement("4 days", "4 days of total playtime", 0, function(){ return Stats.play_time / 60 / 60 / 24 >= 4; }),
	new Achievement("5 days", "5 days of total playtime", 0, function(){ return Stats.play_time / 60 / 60 / 24 >= 5; }),
	new Achievement("6 days", "6 days of total playtime", 0, function(){ return Stats.play_time / 60 / 60 / 24 >= 6; }),
	new Achievement("7 days", "One week of total playtime", 0, function(){ return Stats.play_time / 60 / 60 / 24 >= 7; })
];

Achievements.wasted = [
	new Achievement("Spillage", "Lose a gem when it falls outside the inventory", 10, function(){ return Stats.wasted >= 1; }),
	new Achievement("Buffer Overflow", "Lose 50 gems when they fall outside the inventory", 100, function(){ return Stats.wasted >= 50; }),
	new Achievement("Why can't I hold all these gems?", "Lose 100 gems when they fall outside the inventory", 1000, function(){ return Stats.wasted >= 100; }),
];

// Misc
Achievements.misc = {
	inventory: new Achievement("So much space for activities", "Max out the inventory", 500, function(){ return Upgrades[1].owned; }),
	autodrop: new Achievement("Open the Floodgates", "Upgrade to 100% autodrop", 10e3, function(){ return Upgrades[4].owned; }),
	sell: new Achievement("Reimbursement", "Sell a factory", 100, function(){ return Stats.sold >= 1; }),
	hack: new Achievement("Script kiddie", "", -1, function(){ return true; }, {redtext: "Alternatively: Introduction to the Developer Console."}),
};

function checkAll(list){
	return list.forEach(function(ach){ ach.check(); });
}

// Offline money
// Settings (export save, toggle fx/sound, etc)
// Have 3 buffs active at once

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// SETTINGS
///////////////////////////////////////////////////////////////////////////////////////////////////////////

var Settings = {
	enable_save: true,
	offline_gains: false,
	render_sprites: true,
	render_floatingnums: true
}