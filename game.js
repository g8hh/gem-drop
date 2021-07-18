///////////////////////////////////////////////////////////////////////////////////////////////////////////
// GAME.JS
// Nathan Babcock
///////////////////////////////////////////////////////////////////////////////////////////////////////////

var money = 0;

var UI = {
	click_powers: document.getElementById("click_powers"),
	factories: document.getElementById("factories"),
	upgrades: document.getElementById("upgrades"),
	drop: document.getElementById("drop"),
	autodrop_icon: document.getElementById("autodrop_icon"),
	money: document.getElementById("money"),
	actual_money: document.getElementById("actual_money"),
	predicted_money: document.getElementById("predicted_money"),
	vfx: document.getElementById("vfx"),
	buy: document.getElementById("buy"),
	sell: document.getElementById("sell"),
	buy_1: document.getElementById("buy_1"),
	buy_10: document.getElementById("buy_10"),
	buy_100: document.getElementById("buy_100"),
	buy_max: document.getElementById("buy_max"),
	buffs: document.getElementById("buffs"),
	inv_hover: document.getElementById("inv_hover"),
	achievement_popups: document.getElementById("achievement_popups"),
	achievements: document.getElementById("achievements"),
	stats: {
		modal: document.getElementById("stats"),
		modal_inner: document.getElementById("stats").querySelector(".modal_inner"),
		gems: document.getElementById("stats_gems"),
		money: document.getElementById("stats_money"),
		clickpower_gems: document.getElementById("stats_clickpower_gems"),
		wasted: document.getElementById("stats_wasted"),
		upgrades: document.getElementById("stats_upgrades"),
		clickpowers: document.getElementById("stats_clickpowers"),
		factories: document.getElementById("stats_factories"),
		achievements: document.getElementById("stats_achievements"),
		prestige: document.getElementById("stats_prestige"),
		time: document.getElementById("stats_time"),
		prestige_time: document.getElementById("stats_prestige_time"),
		isOpen: false
	},
	settings: {
		modal: document.getElementById("settings"),
		save: document.getElementById("save"),
		lastsaved: document.getElementById("lastsaved"),
		autosave: document.getElementById("autosave"),
		particles: document.getElementById("settings_particles"),
		export: document.getElementById("export"),
		import_field: document.getElementById("import_field"),
		import_button: document.getElementById("import_button"),
		sprites: document.getElementById("sprites"),
		reset: document.getElementById("reset")
	},
	bought_upgrades: {
		modal: document.getElementById("bought_upgrades"),
		modal_inner: document.getElementById("bought_upgrades").querySelector(".modal_inner"),
		close: document.getElementById("bought_upgrades").querySelector(".close")
	} 
};

// TODO this gets immediately overwritten when physics.js loads
var Inventory = {
	getValue: function() {
		return 0;
	},
	build: function() {
		return false;
	}
}

var AutoDrop = {
	open: false,
	timer: 0,
	rate: -1,
	manuallyOpen: false,
	getOpenDuration: function() {
		return 2;
	},
	getIcon: function() {
		if(Upgrades[4].owned)
			return Upgrades[4].img;
		else if (Upgrades[3].owned)
			return Upgrades[3].img;
		else if (Upgrades[2].owned)
			return Upgrades[2].img;
		else
			return "";
	},
	getRate: function() {
		if(Upgrades[4].owned)
			return Upgrades[4].rate;
		else if(Upgrades[3].owned)
			return Upgrades[3].rate;
		else if (Upgrades[2].owned)
			return Upgrades[2].rate;
		return -1;
	}
};

var OfflineMode = {
	bonus: 1 // multiplier to offline gains
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATE UI
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function getClickPowerHTML(gem) {
	var clickpower = gem.clickpower,
		refs = clickpower.ui = {},
		container = refs.container;
	container = document.createElement("div");
	container.className = "gem_click_power popup_container";
	container.innerHTML = `
		<div class="popup_anchor">
			<img class="clickpower">
			<span class="name"></span>
			<span class="price"></span>
		</div>
		<div class="popup">
			<strong class="name">Quartz</strong>
			<div class="rate">+1 quartz per click</div>
			<div class="value">Quartz sells for $1 each</div>
			<div class="costs">Costs $10</div>
		</div>`;

	refs.anchor = container.querySelector(".popup_anchor");
	refs.img = refs.anchor.querySelector("img");
	refs.popup = container.querySelector(".popup");
	refs.name = refs.popup.querySelector(".name");
	refs.rate = refs.popup.querySelector(".rate");
	refs.value = refs.popup.querySelector(".value");
	refs.costs = refs.popup.querySelector(".costs");

	refs.anchor_name = refs.anchor.querySelector(".name");
	refs.anchor_price = refs.anchor.querySelector(".price");

	refs.anchor_name.innerText = gem.name;
	refs.anchor_price.innerText = formatMoney(clickpower.getCost());

	// Onclick
	refs.img.src = clickpower.image;
	refs.anchor.onclick = function() { buyClickPower(gem); };
	// refs.anchor.innerText = gem.name;
	refs.name.innerText = gem.name;

	updateClickPower(gem);
	return container;
}

function getFactoryHTML(gem) {
	/*	<div class="factory popup_container">
			<div class="popup_anchor">Quartz</span>
			<div class="popup">
				<strong class="name">Quartz Factory</strong>
				<div class="rate">+1 per second</div>
				<div class="price">Costs $18</div>
				<div class="owned">0 owned</div>
			</div>
		</div>*/

	var factory = gem.factory,
		refs = factory.ui = {},
		container = refs.container = document.createElement("div");
	container.className = "factory popup_container";
	container.innerHTML = `
		<div class="popup_anchor">
			<img>
			<span class="owned"></span>
			<span class="price"></span>
		</div>
		<div class="popup">
			<strong class="name">Quartz Factory</strong>
			<div class="rate">0.5 quartz per second</div>
			<div class="value">Quartz sells for $1 each</div>
			<div class="price">Costs $18</div>
			<div class="owned">0 owned</div>
		</div>`;

	refs.anchor = container.querySelector(".popup_anchor");
	refs.image = refs.anchor.querySelector("img");
	refs.popup = container.querySelector(".popup");
	refs.name = container.querySelector(".name");
	refs.rate = container.querySelector(".rate");
	refs.price = container.querySelector(".price");
	refs.value = container.querySelector(".value");
	refs.owned = refs.popup.querySelector(".owned");

	refs.anchor_owned = refs.anchor.querySelector(".owned");
	refs.anchor_price = refs.anchor.querySelector(".price");

	refs.image.src = factory.image;

	refs.anchor.onclick = function() { buyFactory(gem); };
	//refs.anchor.innerText = gem.name;
	refs.name.innerText = gem.name + " Factory";

	updateFactory(gem);
	return container;
}

function getUpgradeHTML(upgrade) {
	var refs = upgrade.ui = {},
		container = refs.container = document.createElement("div");
	container.className = "upgrade popup_container";
	container.innerHTML = `
		<div class="popup_anchor"><img></div>
		<div class="popup">
			<strong class="name">asdf</strong>
			<div class="description">blah blah blah</div>
			<div class="price">Costs $18</div>
		</div>`;

	refs.anchor = container.querySelector(".popup_anchor");
	refs.popup = container.querySelector(".popup");
	refs.name = container.querySelector(".name");
	refs.description = container.querySelector(".description");
	refs.costs = container.querySelector(".price");

	refs.anchor.onclick = function() { buyUpgrade(upgrade); };
	refs.name.innerText = upgrade.name;
	refs.anchor.children[0].src = upgrade.img;
	refs.description.innerText = upgrade.description;
	refs.costs.innerText = upgrade.getCost();

	updateUpgrade(upgrade);
	return container;
}

function getBuffHTML(buff) {
	var refs = buff.ui = {},
		container = refs.container = document.createElement("div");
	container.className = "buff_container";
	container.innerHTML = `
		 				<div class="buff popup_container">
							<div class="popup_anchor"><img></div>
							<div class="popup">
								<strong class="name">asdf</strong>
								<div class="description">+10 butts for 3.5 seconds</div>
							</div>
						</div>
						<!--<div style="float:left">-->
							<div class="progressbar_container">
								<div class="progressbar_outer"><div class="progressbar_inner"></div></div>
								<div class="timeleft">3s</div>
							</div>
							<!--<div class="description2" style="clear:left"></div>-->
						<!--</div>-->`;
	refs.anchor = container.querySelector(".popup_anchor");
	refs.popup = container.querySelector(".popup");
	refs.name = container.querySelector(".name");
	refs.description = container.querySelector(".description");
	refs.progressbar = container.querySelector(".progressbar_inner");
	refs.timeleft = container.querySelector(".timeleft");

	refs.anchor.children[0].src = buff.img;
	// container.querySelector(".description2").innerText = buff.description;
	// refs.anchor.innerText = buff.name;
	updateBuff(buff);
	return container;
}

function getAchievementHTML(achievement) {
	var container = document.createElement("div");
	container.className = "achievement";
	container.innerHTML = `
		<div class="achievement">
			<img class="icon" src="img/trophy.png">
			<div class="text">
				<strong class="name">Hello World</strong>
				<span class="description">Popup text goes here</span>
				<small class="redtext">Secret red text</small>
			</div>
			<div class="value">$500</div>
			<div class="clear"></div>
		</div>`;
	container.onclick = function() {
		container.parentNode.removeChild(container);
	};
	updateAchievement(achievement, container);
	return container;
}

function getAchievementIconHTML(achievement) {
	var refs = achievement.ui = {},
		container = refs.container = document.createElement("div");
	container.className = "achievement_icon popup_container";
	container.innerHTML = `<img class="icon popup_anchor achievement_locked" src="img/trophy.png">`;
	refs.anchor = container.querySelector(".popup_anchor");
	var popup = refs.popup = getAchievementHTML(achievement);
	updateAchievement(achievement, popup);
	popup.className += " popup";
	container.appendChild(popup);
	return container;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPDATE UI
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function updateClickPower(gem) {
	//factory.ui.name.innerText = 
	var clickpower = gem.clickpower;
	clickpower.ui.rate.innerText = clickpower.getRate() + " "+gem.name.toLowerCase()+" per click";
	clickpower.ui.value.innerText = gem.name + " sells for " + formatMoney(gem.getValue()) + " each";
	if (!clickpower.owned)
		clickpower.ui.costs.innerText = "Costs " + formatMoney(clickpower.getCost());
	else
		clickpower.ui.costs.innerText = "";

	if (!clickpower.owned && clickpower.getCost() > money)
		clickpower.ui.anchor.className = "popup_anchor cant_afford";
	else if(!clickpower.owned)
		clickpower.ui.anchor.className = "popup_anchor can_afford";
	else if(clickpower.owned && Gems.active_clickpower === gem)
		clickpower.ui.anchor.className = "popup_anchor active";
	else
		clickpower.ui.anchor.className = "popup_anchor owned";

	// TODO redundancy
	// Tippy
	if(gem.clickpower.tippy){
		var index = Gems.indexOf(gem);
		var popper = gem.clickpower.tippy.getPopperElement(document.getElementById("cp_"+index+"_anchor"));
		popper.querySelector(".rate").innerText = clickpower.getRate() + " "+gem.name.toLowerCase()+" per click";
		popper.querySelector(".value").innerText = gem.name + " sells for " + formatMoney(gem.getValue()) + " each";
	}

	// if(gem.clickpower.tippy)
	// 	console.log(gem.clickpower.tippy.tooltippedEls = [gem.clickpower.tippy.tooltippedEls[0]])
}

function updateFactory(gem) {
	//factory.ui.name.innerText = 
	var factory = gem.factory;
	factory.ui.rate.innerText = "+"+factory.getRate() + " "+gem.name.toLowerCase() +" per second";
	var purchase = calculatePurchase(gem);
	var purchaseString = (BuyMode.mode === BuyMode.BUY ? "Buy " : "Sell ") + purchase.quantity + " for " + formatMoney(purchase.cost);
	factory.ui.price.innerText = purchaseString;
	factory.ui.owned.innerText = factory.owned + " owned";

	factory.ui.value.innerText = gem.name + " sells for " + formatMoney(gem.getValue()) + " each";

	factory.ui.anchor_owned.innerText = factory.owned;
	factory.ui.anchor_price.innerText = purchase.quantity+"x "+formatMoney(purchase.cost);

	if (BuyMode.mode == BuyMode.BUY) {
		if (purchase.cost > money || purchase.quantity === 0)
			factory.ui.anchor.className = "popup_anchor cant_afford";
		else
			factory.ui.anchor.className = "popup_anchor can_afford";
	} else {
		if (purchase.quantity === 0)
			factory.ui.anchor.className = "popup_anchor cant_afford";
		else
			factory.ui.anchor.className = "popup_anchor can_afford";
	}

	// TODO redundancy
	// Tippy
	if(gem.factory.tippy){
		var index = Gems.indexOf(gem);
		var popper = gem.factory.tippy.getPopperElement(document.getElementById("fact_"+index+"_anchor"));
		popper.querySelector(".value").innerText = gem.name + " sells for " + formatMoney(gem.getValue()) + " each";
		popper.querySelector(".price").innerText = purchaseString;
		popper.querySelector(".owned").innerText = factory.owned;
	}
}


function updateUpgrade(upgrade) {
	if (!upgrade.owned)
		upgrade.ui.costs.innerText = "Costs " + formatMoney(upgrade.getCost());
	else
		upgrade.ui.costs.innerText = "";

	if (!upgrade.owned && upgrade.getCost() > money)
		upgrade.ui.anchor.className = "popup_anchor disabled";
	else
		upgrade.ui.anchor.className = "popup_anchor";

	if(upgrade.owned && upgrade.ui.container.parentNode === UI.upgrades)
		UI.bought_upgrades.modal_inner.appendChild(UI.upgrades.removeChild(upgrade.ui.container));

	if(money >= upgrade.getCost() / 10){
		upgrade.ui.container.style.display = "block";
		upgrade.ui.container.style.opacity = 1;
	}
}

function updateBuff(buff) {
	if (buff.timeLeft <= 0) {
		buff.ui.container.style.display = "none";
		var anyBuff = false;
		Buffs.forEach(function(buff) {
			if (buff.timeLeft > 0)
				anyBuff = true;
		});
		if (!anyBuff) UI.buffs.style.display = "none";
	} else {
		UI.buffs.style.display = "block";
		buff.ui.container.style.display = "block";
	}
	buff.ui.name.innerHTML = buff.name;
	buff.ui.description.innerHTML = buff.description;
	buff.ui.progressbar.style.width = (buff.timeLeft / buff.getDuration()) * 100 + "%";
	buff.ui.timeleft.innerHTML = Math.ceil(buff.timeLeft)+"s";
}

function updateAchievement(achievement, element) { // TODO this is wack
	/*	<div class="achievement" id="inv_hover">
			<img class="icon" src="">
			<div class="text">
				<strong class="name">Hello World</strong>
				<span class="description">Popup text goes here</span>
				<small class="redtext">Secret red text</small>
			</div>
			<div class="value">$500</div>
			<div class="clear"></div>
		</div>*/

	// if(!achievement.owned)
	// 	element.querySelectorAll(".icon").forEach(function(e){e.style.filter = "brightness(50%) grayscale(100%)"; });
	// else
	// 	element.querySelector(".icon").style.filter = "";
	element.querySelector(".name").innerText = achievement.name;
	element.querySelector(".description").innerText = achievement.description;
	element.querySelector(".value").innerText = formatMoney(achievement.getValue());
	var redtext = element.querySelector(".redtext");
	if (achievement.redtext) {
		redtext.style.display = "block";
		redtext.innerText = achievement.redtext;
	} else {
		redtext.style.display = "none";
	}
	element.achievement = achievement;

	return false;
}

function updateAchievementIcon(achievement){
	if(achievement.owned)
		achievement.ui.anchor.className = "icon popup_anchor achievement_owned";
	else
		achievement.ui.anchor.className = "icon popup_anchor achievement_locked";
}

function updateStats() {
	UI.stats.money.innerText = formatMoney(Stats.money);
	UI.stats.gems.innerText = Stats.gems;
	UI.stats.clickpower_gems.innerText = Stats.clickpower_gems;
	UI.stats.upgrades.innerText = Stats.upgrades;
	UI.stats.clickpowers.innerText = Stats.clickpowers;
	UI.stats.factories.innerText = Stats.factories;
	//UI.stats.prestige.innerText = Stats.prestige;
	UI.stats.time.innerText = formatTime(Stats.play_time);
	//UI.stats.prestige_time.innerText = formatTime(new Date().getTime() - Stats.prestige_start_date);
	UI.stats.wasted.innerText = Stats.wasted;
	UI.stats.achievements.innerText = Stats.achievements;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// MENU/MODAL
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function initSettings() {
	// Save
	UI.settings.save.onclick = function() {
		if(saveGame()){
			alert("Game saved.");
			UI.settings.lastsaved.innerText = "Last saved less than a second ago";
		}
	};
	
	// Export
	UI.settings.export.onclick = exportGame;

	// Import
	UI.settings.import_button.onclick = function() {
		if(importGame(UI.settings.import_field.value)){
			alert("Game imported.");
			saveGame();
			location.reload();
		}
	};

	// Reset
	UI.settings.reset.onclick = function() {
		if(confirm("Are you sure? This will completely wipe your save and reload the game."))
			resetGame();
	}

	// Render Sprites
	UI.settings.sprites.checked = Settings.render_sprites;
	UI.settings.sprites.onclick=function() {
		if(!UI.settings.sprites.checked){
			Settings.render_sprites = false;
			// world.bodies.forEach(function(body){
			// 	body.render.sprite = undefined;
			// });
		} else {
			Settings.render_sprites = true;
			// TODO this will not add sprites to gems already in inv
		}
	}

	// Autosave
	UI.settings.autosave.checked = Settings.enable_save;

	// Particles
	UI.settings.particles.checked = Settings.render_floatingnums;
}

function openAchievements() {
	closeSettings();
	closeStats();
	closeUpgrades();
	UI.achievements.style.display = "block";
}

function closeAchievements() {
	UI.achievements.style.display = "none";
}

function openStats() {
	closeAchievements();
	closeSettings();
	closeUpgrades();
	UI.stats.modal.style.display = "block";
	//UI.stats.timeout = ;
	UI.stats.isOpen = true;
}

function closeStats() {
	UI.stats.modal.style.display = "none";
	//clearInterval(UI.stats.timeout);
	UI.stats.isOpen = false;
}

function openSettings() {
	closeAchievements();
	closeStats();
	closeUpgrades();
	UI.settings.modal.style.display = "block";
}

function closeSettings() {
	UI.settings.modal.style.display = "none";
}

function openUpgrades(){
	closeAchievements();
	closeSettings();
	closeStats();
	UI.bought_upgrades.modal.style.display = "block";
}

function closeUpgrades(){
	UI.bought_upgrades.modal.style.display = "none";
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////
// BUY/SELL/SPAWN
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function setBuyMode(mode, elem) {
	BuyMode.mode = mode;
	[UI.buy, UI.sell].forEach(function(elem) {
		elem.className = "";
	});
	elem.className = "active";
	Gems.forEach(function(gem) { updateFactory(gem); });
	// if(mode === BuyMode.BUY)
	// 	UI.buy.className = "active";
	// else
	// 	UI.sell.className = "active";
}

function setBuyQuantity(quant, elem) {
	BuyMode.quantity = quant;
	[UI.buy_1, UI.buy_10, UI.buy_100, UI.buy_max].forEach(function(elem) {
		elem.className = "";
	});
	elem.className = "active";
	Gems.forEach(function(gem) { updateFactory(gem); });
	// switch(quant){
	// 	case 1:
	// 		UI.buy_1.className = "active";
	// }
}

// function formatRate(num){
// 	return num + " per second";
// }

function buyClickPower(gem) {
	console.log("BUY CP");

	var clickpower = gem.clickpower;
	if (clickpower.owned) {
		Gems.active_clickpower = gem;
		Gems.forEach(function(gem){updateClickPower(gem);});
		return false;
	} else if (clickpower.getCost() > money)
		return false;
	updateMoney(-clickpower.getCost());
	clickpower.owned++;
	Stats.clickpowers++;
	if(gem !== Gems.quartz)
		Achievements.clickpower.byGem(gem).check();
	Achievements.clickpower.total.check();
	Gems.active_clickpower = gem;
	Gems.forEach(function(gem){updateClickPower(gem);});

	var index = Gems.indexOf(gem);
	if(index < Gems.length - 1)
		Gems[index + 1].clickpower.ui.anchor.style.display = "block";

	return true;
}

function buyFactory(gem) {
	var factory = gem.factory;
	var purchase = calculatePurchase(gem);

	if (BuyMode.mode === BuyMode.BUY) {
		if (purchase.cost > money)
			return false;
		factory.owned += purchase.quantity;
		updateMoney(-purchase.cost);

		Stats.factories += purchase.quantity;
		checkAll(Achievements.factory.byGem(gem));
		checkAll(Achievements.factory.each);
		checkAll(Achievements.factory.total);
		//updateFactory(gem);
	} else {
		factory.owned -= purchase.quantity;
		updateMoney(purchase.cost);
		Stats.sold += purchase.quantity;
		Stats.factories -= purchase.quantity;
		Achievements.misc.sell.check();
	}

	var index = Gems.indexOf(gem);
	if(index < Gems.length - 1)
		Gems[index + 1].factory.ui.anchor.style.display = "block";

	return true;
}

function buyUpgrade(upgrade) {
	if (upgrade.owned || upgrade.getCost() > money)
		return false;
	updateMoney(-upgrade.getCost());
	upgrade.owned = true;
	updateUpgrade(upgrade);
	if (upgrade.onPurchase !== undefined)
		upgrade.onPurchase();
	Stats.upgrades++;
	checkAll(Achievements.upgrades);
	return true;
}

function doClick() {
	var bestGem = Gems.active_clickpower;
	// Gems.forEach(function(gem) {
	// 	if (gem.clickpower.owned && (bestGem === null || gem.getValue() > bestGem.getValue()))
	// 		bestGem = gem;
	// });
	var gemsToMake = [];
	for (var i = 0; i < bestGem.clickpower.getRate(); i++)
		gemsToMake.push(bestGem);
	Stats.clickpower_gems += gemsToMake.length;
	checkAll(Achievements.clickpower_gems);
	checkAll(Achievements.gems);
	return gemsToMake;
}

function updateMoney(amount = 0) {
	if (amount > 0) {
		Stats.money += amount;
		checkAll(Achievements.money);
	}

	money += amount;
	UI.actual_money.innerText = formatMoney();
	UI.predicted_money.innerText = " (+" + formatMoney(Inventory.getValue()).substring(1) + ")";
	Gems.forEach(function(gem) {
		if (!gem.clickpower.owned)
			updateClickPower(gem);
		updateFactory(gem);
	});
	Upgrades.forEach(function(upgrade) {
		if (!upgrade.owned)
			updateUpgrade(upgrade);
	});
	return money;
}

function sellGem(gem) {
	updateMoney(gem.getValue());
	Stats.gems++;
	checkAll(Achievements.gems);
}

function clickBuff(buff) {
	buff.timeLeft = buff.getDuration();
	Stats.buffs++;
	checkAll(Achievements.buffs);
	updateBuff(buff);
	updateMoney();
}

function getAchievement(achievement) {
	if (UI.achievement_popups.children.length >= 3)
		UI.achievement_popups.removeChild(UI.achievement_popups.children[0]);
	UI.achievement_popups.appendChild(getAchievementHTML(achievement));
	updateMoney(achievement.getValue());
	updateAchievementIcon(achievement);
	// Stats.achievements++;
}

function genGems_deterministic(delta) {
	var toSpawn = [];
	Gems.forEach(function(gem) {
		var f = gem.factory;
		var rate = f.getRate() * f.owned;
		if (rate <= 0)
			return false;
		//console.log("Rate = " + rate);
		if (f.cooldown === undefined)
			f.cooldown = 0;
		else
			f.cooldown -= delta;

		while (f.cooldown <= 0) {
			toSpawn[toSpawn.length] = gem;
			f.cooldown += (1 / rate);
		}
	});
	return toSpawn;
}


function genGems_probabilistic(delta) {
	var toSpawn = [];
	Gems.forEach(function(gem) {
		var f = gem.factory;
		var chance = delta * f.getRate() * f.owned;
		while (chance > 1) {
			toSpawn[toSpawn.length] = gem;
			chance--;
		}
		if (Math.random() < chance)
			toSpawn[toSpawn.length] = gem;
	});
	return toSpawn;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// LOAD/SAVE/SIM/EXPORT
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function buildSave() {
	var save = {
		gems: [],
		upgrades: [],
		achievements: []
	};

	// Gather all gamestate elements
	save.time = new Date().getTime();
	save.money = money;
	Gems.forEach(function(gem) {
		save.gems.push({
			factory: gem.factory.owned,
			clickpower: gem.clickpower.owned,
			bonus: gem.bonus
		});
	});
	Upgrades.forEach(function(upgrade) {
		save.upgrades.push(upgrade.owned);
	});
	Achievements.all.forEach(function(achievement) {
		save.achievements.push(achievement.owned);
	});
	//save.AutoDrop = AutoDrop.get;
	save.Buffs = {
		baseRate: Buffs.baseRate,
		autocollect: Buffs.autocollect
	};
	save.Settings = Settings;
	save.Stats = Stats;
	save.active_clickpower = Gems.indexOf(Gems.active_clickpower);


	return JSON.stringify(save);
	// console.log(JSON.stringify(save));
}

function loadSave(save){
	// Copy over the gamestate
	money = save.money;
	Gems.active_clickpower = Gems[save.active_clickpower] || Gems.quartz;
	Gems.forEach(function(gem, index) {
		gem.clickpower.owned = save.gems[index].clickpower;
		gem.factory.owned = save.gems[index].factory;
		gem.bonus = save.gems[index].bonus;

		gem.factory.cooldown = getRandomFloat(0, 1 / gem.factory.getRate()); // Randomize cooldown so all the factories don't sync up
		updateClickPower(gem);
		updateFactory(gem);

		if(gem.clickpower.owned){
			gem.clickpower.ui.anchor.style.display = "block";
			var index = Gems.indexOf(gem);
			if(index < Gems.length - 1)
				Gems[index+1].clickpower.ui.anchor.style.display = "block";
		}

		if(gem.factory.owned){
			gem.factory.ui.anchor.style.display = "block";
			if(index < Gems.length - 1)
				Gems[index+1].factory.ui.anchor.style.display = "block";
		}
	});
	Upgrades.forEach(function(upgrade, index) {
		upgrade.owned = save.upgrades[index];
		updateUpgrade(upgrade);
	});
	Achievements.all.forEach(function(achievement, index) {
		achievement.owned = save.achievements[index];
		updateAchievement(achievement, achievement.ui.popup); // TODO
		updateAchievementIcon(achievement);
	});
	//AutoDrop.rate = save.AutoDrop;
	Buffs.baseRate = save.Buffs.baseRate || Infinity;
	Buffs.autocollect = save.Buffs.autocollect;
	Settings = save.Settings;
	Stats = save.Stats;
	Inventory.build();


	// var delta = new Date().getTime() - save.time;
	// var offline_income = simulate(delta / 1000);
	// if (Settings.offline_gains)
	// 	money += offline_income;
	return true;
}

function saveGame() {
	localStorage.setItem("gem_drop_save", buildSave());
	return true;
	//console.log("Game saved");
}

function loadGame() {
	// Get save from localStorage
	var gameString = localStorage.getItem("gem_drop_save");
	if (gameString === null) {
		console.log("No save game found");
		return false;
	}
	var save = JSON.parse(gameString);
	console.log(save);

	loadSave(save);

	// Done
	console.log("Game loaded succesfully");
	return true;
}

function exportGame(){
	//console.log(buildSave());
	//prompt("Copy and paste this import code to a text file.", Base64.encode(buildSave()));
	document.getElementById("export_instructions").style.display = "inline";
	document.getElementById("export_textarea").style.display = "block";
	document.getElementById("export_textarea").innerText = Base64.encode(buildSave());
}

function importGame(code){
	return loadSave(JSON.parse(Base64.decode(code)));
}

function resetGame() {
	Settings.enable_save = false;
	localStorage.clear();
	console.log("Game save deleted");
	location.reload();

	// Gems.forEach(function(gem)){
	// 	gem.clickpower.owned = false;
	// 	gem.factory.owned = 0;
	// 	gem.bonus = 1;
	// 	AutoDrop.rate = -1;
	// 	Buffs.baseRate = Infinity;
	// }
	return true;
}

function simulate(delta) {
	// delta should be time in SECONDS
	console.log("Offline time: " + delta + "s");

	var inv_size = Inventory.getSize();
	var inv_cap = (inv_size.width * inv_size.height) / (DEFAULT_GEM_RADIUS * DEFAULT_GEM_RADIUS * 4);
	console.log("Inventory capacity: " + inv_cap + " gems");


	var max_rate,
		rate = AutoDrop.getRate();
	if (rate === -1)
		max_rate = inv_cap / delta;
	else if (rate === -1)
		max_rate = inv_cap;
	else
		max_rate = inv_cap / rate;
	console.log("Max rate: " + max_rate + " gems/sec");

	var rate = [];
	var total_rate = 0;
	Gems.forEach(function(gem) {
		var spawned = gem.factory.getRate() * gem.factory.owned;
		rate.push(spawned);
		total_rate += spawned;
	});
	console.log("Uncapped rate: " + total_rate + " gems/sec");

	var cap_ratio = 1;
	if (total_rate > max_rate) {
		cap_ratio = max_rate / total_rate;
		total_rate = max_rate;
	}
	console.log("Cap ratio: " + cap_ratio);

	var income = 0;
	rate.forEach(function(rate, index) {
		income += rate * Gems[index].getValue();
	});
	console.log("Uncapped income: " + formatMoney(income) + "/s");

	income *= cap_ratio;
	console.log("Capped income: " + formatMoney(income) + "/s");

	var total_income = Math.round(income * delta);
	console.log("Total income: " + formatMoney(total_income));

	return total_income;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// UTILITIES
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function formatMoney(num = money) {
	var thirdpower = 0;
	while (num >= 1000) {
		num /= 1000;
		thirdpower++;
	}

	var suffix = ["", "k", "M", "B", "T", "Q"];

	var formatted = "";
	if (thirdpower === 0 || num >= 100)
		formatted = Math.floor(num);
	else if (num >= 10) {
		formatted = Math.floor(num * 10) / 10;
	} else {
		formatted = Math.floor(num * 100) / 100;
	}
	formatted += suffix[thirdpower];
	return "$" + formatted;
}

function formatTime (sec_num) {
    //var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+Math.ceil(seconds);
}

// function formatTime(ms) {
// 	return Math.ceil(ms / 1000) + "s";
// }

function getTotalRate() {
	var rate = 0;
	for (var i = 0; i < factories.length; i++) {
		var factory = factories[i];
		if (!factory.owned) continue;
		rate += factory.getRate() * factory.owned;
	}
	return rate;
}

/*function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}*/

function cheat() {
	Upgrades[2].owned = true;
	Upgrades[2].onPurchase();
	Upgrades[3].owned = true;
	Upgrades[3].onPurchase();
	Gems[0].factory.owned = 20;

	//updateMoney(10000);
	// money += 1000000000;
	// updateMoney();
	// updateFactory(Gems[1]);


	/*	// Skip to amethyst
		Upgrades[0].owned = Upgrades[1].owned = true;
		Gems[2].clickpower.owned = true;
		Gems[0].factory.owned = 14;
		Gems[1].factory.owned = 3;
		updateFactory(Gems[0]);
		updateFactory(Gems[1]);
		updateUpgrade(Upgrades[0]);
		updateUpgrade(Upgrades[1]);
		Upgrades[1].onPurchase();
		updateClickPower(Gems[2]);
		Upgrades[2].owned = true;
		Upgrades[2].onPurchase();
		Upgrades[3].owned = true;*/
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// INIT
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function init() {
	kongregateAPI.loadAPI(function(){
	  window.kongregate = kongregateAPI.getAPI();
	  // You can now access the Kongregate API with: kongregate.services.getUsername(), etc
	  // Proceed with loading your game...
	});


	var clickpower_container = UI.click_powers.querySelector(".scroll");
	var factory_container = UI.factories.querySelector(".scroll");

	// Clickpowers and Factories
	Gems.forEach(function(gem, id) {
		clickpower_container.appendChild(getClickPowerHTML(gem));
		//updateClickPower(gem);

		gem.clickpower.ui.anchor.id = "cp_"+id+"_anchor";
		gem.clickpower.ui.popup.id = "cp_"+id;
		gem.clickpower.tippy = new Tippy("#cp_"+id+"_anchor", {
			html: "#cp_"+id,
			animateFill: false,
			arrow: true,
			position: "bottom",
			hideOnClick: false,
			hidden: function() {
			updateClickPower(gem);
		}
	});

		factory_container.appendChild(getFactoryHTML(gem));

		// Tippy
		updateFactory(gem);
		gem.factory.ui.anchor.id = "fact_"+id+"_anchor";
		gem.factory.ui.popup.id = "fact_"+id;
		gem.factory.tippy = new Tippy("#fact_"+id+"_anchor", {
		  html: "#fact_"+id,
		  animateFill: false,
		  arrow: true,
		  position: "bottom",
		  hideOnClick: false
		});
	})

	// Upgrades
	Upgrades.forEach(function(upgrade, id) {
		UI.upgrades.appendChild(getUpgradeHTML(upgrade));

		// Tippy
		upgrade.ui.anchor.id = "upgrade_"+id+"_anchor";
		upgrade.ui.popup.id = "upgrade_"+id;
		new Tippy("#upgrade_"+id+"_anchor", {
		  html: "#upgrade_"+id,
		  animateFill: false,
		  arrow: true,
		  position: "bottom",
		  hideOnClick: false
		});
	});

	// Buffs
	Buffs.forEach(function(buff, id) {
		UI.buffs.appendChild(getBuffHTML(buff))

		// Tippy
		buff.ui.anchor.id = "buff_"+id+"_anchor";
		buff.ui.popup.id = "buff_"+id;
		new Tippy("#buff_"+id+"_anchor", {
		  html: "#buff_"+id,
		  animateFill: false,
		  arrow: true,
		  position: "bottom",
		  hideOnClick: false
		});
	});

	// Achievements
	Achievements.all.forEach(function(achievement, id) {
		UI.achievements.children[2].appendChild(getAchievementIconHTML(achievement));

		// Tippy
		achievement.ui.anchor.id = "ach_"+id+"_anchor";
		achievement.ui.popup.id = "ach_"+id;
		new Tippy("#ach_"+id+"_anchor", {
		  html: "#ach_"+id,
		  animateFill: false,
		  arrow: true,
		  position: "bottom",
		  hideOnClick: false
		});
	});

	// Buy Mode
	UI.buy.onclick = function() { setBuyMode(BuyMode.BUY, UI.buy); };
	UI.sell.onclick = function() { setBuyMode(BuyMode.SELL, UI.sell); };
	UI.buy_1.onclick = function() { setBuyQuantity(1, UI.buy_1); };
	UI.buy_10.onclick = function() { setBuyQuantity(10, UI.buy_10); };
	UI.buy_100.onclick = function() { setBuyQuantity(100, UI.buy_100); };
	UI.buy_max.onclick = function() { setBuyQuantity("max", UI.buy_max); };

	// Modals
	UI.achievements.querySelector(".close").onclick = closeAchievements;
	UI.stats.modal.querySelector(".close").onclick = closeStats;
	UI.bought_upgrades.close.onclick = closeUpgrades;
	UI.settings.modal.querySelector(".close").onclick = closeSettings;
	initSettings();

	Gems.quartz.clickpower.ui.anchor.style.display = "block";
	Gems.topaz.clickpower.ui.anchor.style.display = "block";
	Gems.quartz.factory.ui.anchor.style.display = "block";

	setInterval(function() {
		updateStats();
		document.title = "Gem Drop ("+formatMoney()+")";
		checkAll(Achievements.time);
		if(Settings.enable_save)
			saveGame();

		// Kongregate Stats
		kongregate.stats.submit("Gems Dropped", Stats.gems);
		kongregate.stats.submit("Achievements", Math.min(Stats.achievements, Achievements.all.length));
		kongregate.stats.submit("Money", Stats.money);
	}, 1000);

	loadGame();
	updateMoney();
}

document.body.onload = init;
