var Gpio = require('onoff').Gpio;
var env = require('../config');
var led = new Gpio(26,'out');

if (env.PRODUCTION) {
	function Led(pin) {
		led.writeSync(0);
	}

	Led.prototype.on = function () {
		console.log("LED turned on");
		led.writeSync(1);
	}

	Led.prototype.off = function () {
		console.log("LED turned off");
		led.writeSync(0);
	}
}
else {
	function Led(pin) {
		console.log("Initializing LED on pin " + pin);
	}
	Led.prototype.on = function () {
		console.log("LED turned on");
	}
	Led.prototype.off = function () {
		console.log("LED turned off");
	}
}

module.exports = Led;
