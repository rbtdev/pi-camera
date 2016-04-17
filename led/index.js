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

module.exports = Led;
