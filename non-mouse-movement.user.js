// ==UserScript==
// @name         Non-mouse Movement
// @description  Move with keyboard or controller
// @author       SArpnt
// @version      1.0.0
// @namespace    https://boxcrittersmods.ga/authors/sarpnt/
// @homepage     https://boxcrittersmods.ga/projects/cardboard/
// @updateURL    https://github.com/SArpnt/cardboard/raw/master/script.user.js
// @downloadURL  https://github.com/SArpnt/cardboard/raw/master/script.user.js
// @supportURL   https://github.com/SArpnt/cardboard/issues
// @icon         https://github.com/SArpnt/cardboard/raw/master/icon16.png
// @icon64       https://github.com/SArpnt/cardboard/raw/master/icon64.png
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
	let buttonMovement = {
		up: false,
		down: false,
		left: false,
		right: false,
	};
	let keyFunction = v => ({ code: key }) => {
		buttonMovement[buttonMap[key]] = v;
		keyUpdate();
	};
	function keyUpdate() {

	}
	window.addEventListener('keydown', keyFunction(true));
	window.addEventListener('keyup', keyFunction(false));
})();