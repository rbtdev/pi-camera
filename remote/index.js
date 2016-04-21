var EventEmitter = require('events');
var util = require('util');

var env = require('../config');

if (env.PRODUCTION) {
	console.log("Using physical GPIO");
	var Gpio = require('onoff').Gpio;
	var button = new Gpio(25, 'in', 'both');
}
else {
}

function Remote() {
	button.watch(buttonChanged.bind(this));
	EventEmitter.call(this);
}
util.inherits(Remote, EventEmitter);

function buttonChanged (err, value) {
	console.log("Button value = " + value);
	if (value === 1) {
		console.log("Button pressed.");
		this.emit('press');
	}
	else {
		console.log("Button released.");
		this.emit('release')
	}
};

var remote = new Remote();




module.exports = remote;
