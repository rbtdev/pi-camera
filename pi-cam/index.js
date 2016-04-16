var gpio = require('rpi-gpio')
const EventEmitter = require('events');
var env = require('../config');
var moment = require('moment');
var fs = require('fs');
var util = require('util');

var RaspiCam = null;
if (env.PRODUCTION) {
	RaspiCam = require("raspicam");
}
else {
	RaspiCam = require("./raspicam_test.js");
}

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
	var fileName = "frame_%04d.jpg"
	var filePath = imageDir + fileName;
	console.log("Image dir = " + imageDir)
	var filenames = [];
	var cameraOptions  = {
		mode: "timelapse",
		output: filePath,
		tl: 125,
		rot: 180,
		t: 30000
	}
	var camera = new RaspiCam(cameraOptions);
	var preview = null;
	camera.on("read", function(err, imageTime, filename){ 
		if (err) console.log("ERROR-" + err);
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
};


var piCam = new PiCam();
function detectMotion() {
	if (piCam.active) {
		piCam.emit('motion');
	}
}

detectMotion();
setInterval(detectMotion,60*1000)

module.exports = piCam;
