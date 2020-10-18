// ==UserScript==
// @name         Non-mouse Movement
// @description  Move with keyboard or controller
// @author       SArpnt
// @version      2.0.1
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

	const cRegister = _ => cardboard.register('nonMouseMovement', undefined, false, GM_info);
	if (window.cardboard)
		cRegister();
	else
		window.addEventListener('cardboardLoaded', cRegister);

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
	let controllers = {};

	const
		RATE = 300, // rate to simulate click
		DISTANCE = 70, // distance to move every update
		STOP = true, // stop player when no more input
		BUFFER_LENGTH = 120, // delay inputs if coming too fast
		DELAY = 10, // delays reading inputs so that movements aren't made when being spammed
		DEADZONE = .5; // distance on controller to ignore movement

	let keyFunction = v => e => {
		let dir = buttonMap[e.code];
		if (dir) {
			e.preventDefault();
			if (btnMove[dir] != v) {
				btnMove[dir] = v;
				startUpdate(btnMove);
			}
		}
	};
	let curInt; // stores setInterval so it can be canceled
	function startUpdate(control) {
		clearInterval(curInt);
		curInt = setTimeout(_ => {
			curInt = setInterval(_ => inputUpdate(control), RATE);
			inputUpdate(control);
		}, DELAY);
	}
	function inputUpdate(control) {
		if (world) {
			let pVis = function (x = 0, y = 0) {
				let p = world.stage.room.players[world.player.playerId];
				return [p.x + x, p.y + y];
			};
			let x, y;
			if (Array.isArray(control)) // controller
				[x, y] = control;
			else { // keyboard
				x = btnMove.right - btnMove.left;
				y = btnMove.down - btnMove.up;
			}
			x *= DISTANCE;
			y *= DISTANCE;
			if (!(x || y)) { // when no inputs given
				clearInterval(curInt); // stop updating
				if (STOP)
					moveTo(pVis); // function used because of input buffer
			} else
				moveTo(_ => pVis(x, y)); // function used because of input buffer
		}
	}
	let lastInputTime = -Infinity;
	let moveTimeout;
	function moveTo(x, y) {
		if (moveTimeout)
			clearTimeout(moveTimeout);

		moveTimeout = setTimeout(function () {
			if (typeof x == 'function')
				[x, y] = x();

			let p = world.room.playerCrumbs.find(e => e.i == world.player.playerId);
			if (Math.abs(p.x - x) + Math.abs(p.y - y) < 7) // if little to no movement made
				clearInterval(curInt); // stop updating
			else {
				world.moveTo(x, y);
				lastInputTime = performance.now();
			};
		}, lastInputTime - performance.now() + BUFFER_LENGTH);
	}

	createjs.Ticker.on("tick", function () {
		if (!Object.keys(controllers).length) // if no controllers
			return;
		let g = navigator.getGamepads();
		for (let i in controllers) {
			let newIn = normalizeDead(g[i].axes.slice(0, 2)); // normalize
			if (
				!Array.isArray(controllers[i]) ||
				!controllers[i].every((e, i) => e === newIn[i]) // if old isn't same as new
			)
				startUpdate( // move based on controller data
					controllers[i] = newIn // set controller item
				);
		}
	});

	function normalizeDead(vec) {
		let len = Math.sqrt(vec.map(e => e * e).reduce((a, b) => a + b));
		return vec.map(len > DEADZONE ? (e => e / len) : (e => 0)); // normalized if outside deadzone
	}

	window.addEventListener("gamepadconnected", e => {
		console.log(`Gamepad ${e.gamepad.index} connected`);
		controllers[e.gamepad.index] = null;
	});
	let stage = document.getElementById('stage');
	stage.setAttribute('tabindex', '0');
	stage.style.outline = 'none';
	stage.focus();
	stage.addEventListener('click', _ => stage.focus());
	stage.addEventListener('keydown', keyFunction(true));
	stage.addEventListener('keyup', keyFunction(false));
})();