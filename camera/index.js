const EventEmitter = require('events');
var env = require('../config');
var moment = require('moment');
var fs = require('fs');
var util = require('util');
var Led = require('../led');

var RaspiCam = null;
if (env.PRODUCTION) {
	RaspiCam = require("raspicam");
}
else {
	RaspiCam = require("./raspicam_test.js");
}

function PiCam () {
	this.active = false;
	this.led = new Led();
	this.led.off();
	EventEmitter.call(this);
}
util.inherits(PiCam, EventEmitter);

PiCam.prototype.startTimelapse = function (timestamp, sendImage) {
	// simulate image taken after 5 seconds
	var _this = this;
	var imageDir = __dirname + "/images/capture/" + timestamp + "/";
	fs.mkdirSync(imageDir);
	var fileName = "frame_%04d.jpg"
	var filePath = imageDir + fileName;
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
	})
	camera.on("exit", function () {
		if (preview) {
			_this.emit('timelapse', {timestamp: timestamp, imageDir:imageDir});
		}
		else {
			console.log("No files were processed.");
		}
		_this.led.off();
	})

	console.log("Starting image capture.");
	this.led.on();
	camera.start();
};


var piCam = new PiCam();
module.exports = piCam;
