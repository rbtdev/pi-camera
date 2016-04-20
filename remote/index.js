var EventEmitter = require('events');
var util = require('util');

var env = require('../config');

if (env.PRODUCTION) {
	console.log("Using physical GPIO");
	var Gpio = require('onoff').Gpio;
	var detector = new Gpio(25, 'in', 'both');
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


	var detector = new Detector();

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

function Sensor() {
	this.active = false;
	detector.watch(detectorChanged.bind(this));
	EventEmitter.call(this);
}
util.inherits(Sensor, EventEmitter);

function detectorChanged (err, value) {
	if (value === 1) {
		console.log("Motion detected.");
		if (this.active) {
			this.emit('motion');
		}
		else {
			console.log("Sensor inactive, not reporting motion.")
		}
	}
	else {
		console.log("Sensor reset");
	}
};

Sensor.prototype.activate = function () {
	console.log("Sensor on.");
	this.active = true;
}

Sensor.prototype.deactivate = function () {
	console.log("Sensor off.");
	this.active = false;
;
}

var sensor = new Sensor();




module.exports = sensor;
