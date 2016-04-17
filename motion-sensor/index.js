var EventEmitter = require('events');
var util = require('util');

var env = require('../config');

if (env.PRODUCTION) {
	console.log("Using physical GPIO");
	var Gpio = require('onoff').Gpio;
	var detector = new Gpio(22, 'in', 'both');
}
else {
	console.log("Using simulated GPIO");
	var detector = {
		watch: function (cb) {
		  console.log("Simulating motion detector.")
		}
	}
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
	// set GPIP pin to off;
}

Sensor.prototype.deactivate = function () {
	console.log("Sensor off.");
	this.active = false;
	// set GPIP pin to off;
}

var sensor = new Sensor();


// function detectMotion() {
// 	if (sensor.active) {
// 		console.log("Sensor sending motion event.");
// 		sensor.emit('motion');
// 	}
// }

// setInterval(detectMotion,60*1000)

module.exports = sensor;
