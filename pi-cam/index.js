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

PiCam.prototype.startCamera = function (cb) {
	// simulate image taken after 5 seconds
	console.log("Starting image capture.");
	setTimeout( function () {
		cb(__dirname + "/images/pi_logo.png");
	}, 5000);
};


var piCam = new PiCam();
setInterval(function () {
	if (piCam.active) {
		console.log("Simulating motion detection");
		piCam.emit('motion');
	}
},10*1000)

module.exports = piCam;