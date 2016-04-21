var EventEmitter = require('events');
var util = require('util');

var env = require('../config');

if (env.PRODUCTION) {
	console.log("Using physical GPIO");
	var Gpio = require('onoff').Gpio;
	var button = new Gpio(25, 'in', 'both');
}
else {
	function Detector () {
		this.watch = function (cb) {
			this.cb = cb;
		};

		this.set = function (value) {
			this.cb(null, value);
		}
	}


	var button = new Detector();

	console.log("Using simulated GPIO");
	function detectMotion() {
		console.log("Simulating motion");
		detector.set(1);
		setTimeout(function () {
			detector.set(0)
		}, 30*1000);
	}
	setInterval(detectMotion,60*1000)
}

function Remote() {
	button.watch(detectorChanged.bind(this));
	EventEmitter.call(this);
}
util.inherits(Remote, EventEmitter);

function buttonChanged (err, value) {
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
