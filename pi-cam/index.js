var gpio = require('rpi-gpio')
const EventEmitter = require('events');
const util = require('util');

function PiCam () {
	this.active = false;
	EventEmitter.call(this);
}
util.inherits(PiCam, EventEmitter);

PiCam.prototype.activate = function (callback) {
		this.active = true;
		err = null;
		if (callback) callback(err);
};

PiCam.prototype.deactivate = function (callback) {
	this.active = false;
	err = null;
	if (callback) callback(err);
}




var piCam = new PiCam();
setInterval(function () {
	if (piCam.active) {
		console.log("Simulating motion detection and image generation");
		piCam.emit('motion');
		piCam.emit('image',__dirname + "/images/pi_logo.png");
	}
},10000)

module.exports = piCam;