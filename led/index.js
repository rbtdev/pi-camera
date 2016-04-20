var env = require('../config');


if (env.PRODUCTION) {
	var Gpio = require('onoff').Gpio;
	var led = new Gpio(26,'out');
}
else {
	var led = {
		writeSync: function (value) {
			console.log('simulating LED value = ' + value)
		}
	}
}
var on = 1;
var off = 2;

function Led(pin) {
	led.writeSync(off);
}

Led.prototype.on = function () {
	console.log("LED turned on");
	led.writeSync(on);
}

Led.prototype.off = function () {
	console.log("LED turned off");
	led.writeSync(off);
}

module.exports = Led;
