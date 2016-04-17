var EventEmitter = require('events');
var util = require('util');
var Gpio = require('onoff').Gpio

var detecter = new Gpio(22, 'in', 'both');

function Sensor() {
	this.active = false;
	detecter.watch(detecterChanged.bind(this);
	EventEmitter.call(this);
}
util.inherits(Sensor, EventEmitter);

function detecterChanged (err, value) {
	console.log('Detecter changed: ' + value);
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


function detectMotion() {
	if (sensor.active) {
		console.log("Sensor sending motion event.");
		sensor.emit('motion');
	}
}

setInterval(detectMotion,60*1000)

module.exports = sensor;