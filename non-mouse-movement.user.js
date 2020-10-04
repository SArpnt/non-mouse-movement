// ==UserScript==
// @name         Non-mouse Movement
// @description  Move with keyboard or controller
// @author       SArpnt
// @version      1.0.0
// @namespace    https://boxcrittersmods.ga/authors/sarpnt/
// @homepage     https://boxcrittersmods.ga/mods/non-mouse-movement/
// @updateURL    https://github.com/SArpnt/non-mouse-movement/raw/master/non-mouse-movement.user.js
// @downloadURL  https://github.com/SArpnt/non-mouse-movement/raw/master/non-mouse-movement.user.js
// @supportURL   https://github.com/SArpnt/non-mouse-movement/issues
// @icon         https://github.com/SArpnt/non-mouse-movement/raw/master/icon16.png
// @icon64       https://github.com/SArpnt/non-mouse-movement/raw/master/icon64.png
// @run-at       document-end
// @grant        none
// @match        https://boxcritters.com/play/
// @match        https://boxcritters.com/play/?*
// @match        https://boxcritters.com/play/#*
// @match        https://boxcritters.com/play/index.html
// @match        https://boxcritters.com/play/index.html?*
// @match        https://boxcritters.com/play/index.html#*
// ==/UserScript==

(function () {
	'use strict';
	let buttonMap = {
		ArrowUp: 'up',
		ArrowDown: 'down',
		ArrowLeft: 'left',
		ArrowRight: 'right',
		KeyW: 'up',
		KeyS: 'down',
		KeyA: 'left',
		KeyD: 'right',
	};
	let btnMove = { // directions to move with buttons
		up: false,
		down: false,
		left: false,
		right: false,
	};
	const RATE = 300; // rate to simulate click
	const DISTANCE = 70; // distance to move every update
	const STOP = true; // stop player when no more input
	const BUFFER_LENGTH = 120; // delay inputs if coming too fast

	let curInt; // stores setInterval so it can be canceled
	let keyFunction = v => e => {
		let dir = buttonMap[e.code];
		if (dir) {
			e.preventDefault();
			if (btnMove[dir] != v) {
				btnMove[dir] = v;
				clearInterval(curInt);
				curInt = setTimeout(_ => {
					curInt = setInterval(keyUpdate, RATE);
					keyUpdate();
				}, 10);
			}
		}
	};
	function keyUpdate() {
		if (world) {
			let p = world.room.playerCrumbs.find(e => e.i == world.player.playerId);
			let pVis = world.stage.room.players[world.player.playerId];
			let x = btnMove.right - btnMove.left;
			let y = btnMove.down - btnMove.up;
			if (true && !(x || y)) { // stop updating when no inputs given
				clearInterval(curInt);
				if (STOP)
					moveTo(function () {
						let pVis = world.stage.room.players[world.player.playerId];
						return [pVis.x, pVis.y]
					}); // function used because of input buffer
				return;
			}
			x = x * DISTANCE + pVis.x;
			y = y * DISTANCE + pVis.y;
			if (Math.abs(p.x - x) + Math.abs(p.y - y) < 7) // if little to no movement made
				clearInterval(curInt);
			else
				moveTo(x, y);
		}
	}
	let lastInputTime = -Infinity;
	let moveTimeout;
	function moveTo(x, y) {
		if (moveTimeout)
			clearTimeout(moveTimeout);

		moveTimeout = setTimeout(function () {
			if (typeof x == 'function')
				world.moveTo(...x());
			else
				world.moveTo(x, y);
			lastInputTime = performance.now();
		}, lastInputTime - performance.now() + BUFFER_LENGTH);
	}

	let stage = document.getElementById('stage');
	stage.setAttribute('tabindex', '0');
	stage.style.outline = 'none';
	stage.focus();
	stage.addEventListener('click', _ => stage.focus());
	stage.addEventListener('keydown', keyFunction(true));
	stage.addEventListener('keyup', keyFunction(false));
})();