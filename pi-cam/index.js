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
	var _this = this;
	var imageDir = __dirname + "/images/capture/" + timestamp + "/";
	fs.mkdirSync(imageDir);
	var fileName = "frame_%d.jpg"
	var filePath = imageDir + fileName;
	console.log("Image dir = " + imageDir)
	if (RaspiCam) {
		console.log("Using RaspiCam");
		var filenames = [];
		var cameraOptions  = {
			mode: "timelapse",
			output: filePath,
			tl: 250,
			rot: 180,
			t: 15000
		}
		var camera = new RaspiCam(cameraOptions);
		var preview = null;
		camera.on("read", function(err, imageTime, filename){ 
			if (err) console.log("ERROR-" + err);
			console.log("filename = " + filename);
			if (filename.indexOf('~') < 0 && !preview) {
				preview = imageDir + filename;
				_this.emit('thumbnail', {timestamp:timestamp, imagePath: preview});
			}
		});
		camera.on("start", function () {
			console.log("Camera started.");
		})
		camera.on("exit", function () {
			console.log("Camera stopped");
			if (preview) {
				_this.emit('timelapse', {timestamp: timestamp, imageDir:imageDir});
			}
			else {
				console.log("No files were processed.");
			}
		})

		console.log("Starting image capture.");
		camera.start();
	}
	else {
		console.log("Sending test images.");
		var count = 0;
		var imageDir = __dirname + "/images/"
		_sendImage();
		function _sendImage() {
			_this.emit('thumbnail',{timestamp: timestamp, imagePath: imageDir + "pi_logo.png"});
			count++;
			if (count < 5) {
				setTimeout(_sendImage, 100);
			}
			else {
				_this.emit('timelapse', {timestamp: timestamp, imageDir: imageDir})
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
