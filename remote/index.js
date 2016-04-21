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
	EventEmitter.call(this);
}
util.inherits(Remote, EventEmitter);

Remote.prototype.init = function () {
	var _this = this;
	buttons.forEach(function (button) {
		button.gpio.watch(_this.buttonChanged(button.label));
	})
}

Remote.prototype.buttonChanged = function (button) { 
	var _this = this;
	return function (err, value) {
		console.log("Button " + button + " = " + value);
		if (value === 1) {
			console.log("pressed.");
			_this.emit('press', button);
		}
		else {
			console.log("released.");
			_this.emit('release', button)
		}
	}
};

var remote = new Remote();
remote.init();

module.exports = remote;
