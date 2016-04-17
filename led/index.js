var GPIO = require('onoff').GPIO;
var env = require('../config');

if (env.PRODUCTION) {
	function Led(pin) {
		console.log("Initializing LED on pin " + pin);
		this.pin = pin
		this.led = new GPIO(this.pin, 'out');
		this.led.writeSync(0);
	}

	Led.prototype.on = function () {
		console.log("LED turned on");
		this.led.writeSync(1);
	}

	Led.prototype.off = function () {
		console.log("LED turned off");
		this.led.writeSync(0);
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
