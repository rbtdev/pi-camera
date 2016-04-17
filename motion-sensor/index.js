var EventEmitter = require('events');
var util = require('util');

var GPIO = require('onoff').GPIO;

function Sensor() {
	this.active = false;
	// set GPIO pin to off
	EventEmitter.call(this);
}
util.inherits(Sensor, EventEmitter);


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


function detectMotion() {
	if (sensor.active) {
		console.log("Sensor sending motion event.");
		sensor.emit('motion');
	}
}

setInterval(detectMotion,60*1000)

module.exports = sensor;