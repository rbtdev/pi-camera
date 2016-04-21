var EventEmitter = require('events');
var util = require('util');

var env = require('../config');

if (env.PRODUCTION) {
	console.log("Using physical GPIO");
	var Gpio = require('onoff').Gpio;
	var buttons = [
		{label: "D", gpio: new Gpio(25, 'in', 'both')}
	]
}
else {
}

function Remote() {
	buttons.forEach(function (button) {
		button.gpio.watch(buttonChanged(button.label).bind(this));
	})

	EventEmitter.call(this);
}
util.inherits(Remote, EventEmitter);

function buttonChanged (button) { 
	return function (err, value) {
		console.log("Button " + button + " = " + value);
		if (value === 1) {
			console.log("pressed.");
			this.emit('press', button);
		}
		else {
			console.log("released.");
			this.emit('release', button)
		}
	}
};

var remote = new Remote();

module.exports = remote;
