var gpio = require('rpi-gpio')
const EventEmitter = require('events');
var env = require('../config');
var moment = require('moment');
var fs = require('fs');
var RaspiCam = null;
if (env.PRODUCTION) {
	var RaspiCam = require("raspicam");
};

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

PiCam.prototype.startCamera = function (timestamp, sendImage) {
	// simulate image taken after 5 seconds
	var imageDir = __dirname + "/images/capture/" + timestamp + "/";
	fs.mkdirSync(imageDir);
	var fileName = "capture_%d.jpg"
	var filePath = imageDir + fileName;
	console.log("Image dir = " + imageDir)
	if (RaspiCam) {
		console.log("Using RaspiCam");

		var cameraOptions  = {
			mode: "timelapse",
			tl: 250,
			output: filePath
		}
		var camera = new RaspiCam(cameraOptions);
		camera.on("read", function(err, timestamp, filename){ 
			console.log("Image available: " + filename);
			sendImage(imagePath + filename);
		});
		camera.on("start", function () {
			console.log("Camera started.");
		})
		camera.on("stop", function () {
			console.log("Camera stopped");
		})

		console.log("Starting image capture.");
		camera.start();
	}
	else {
		console.log("Sending test images.");
		var count = 0;
		_sendImage();
		function _sendImage() {
			sendImage(__dirname + "/images/pi_logo.png");
			count++;
			if (count < 5) {
				setTimeout(_sendImage, 100);
			}
		}
	}
};


var piCam = new PiCam();
setInterval(function () {
	if (piCam.active) {
		console.log("Simulating motion detection");
		piCam.emit('motion');
	}
},30*1000)

module.exports = piCam;