var ioClient = require('socket.io-client');
var ioStream = require('socket.io-stream');
var env = require('./config');
var fs = require('fs');
var moment = require('moment');
var path = require('path');
var Sound = require('node-aplay');
var alarm = new Sound(__dirname + "/sounds/alarm-voice.wav");

function Controller (name, id) {

	this.status = 'disabled';
	this.socket = null;
	this.name = name;
	this.id = id;
	this.sensor = require('./pi-cam');
	this.sensor.on('motion', onMotion.bind(this));
	this.sensor.on('timelapse', onTimelapse.bind(this));
	this.sensor.on('thumbnail', onImage.bind(this));
}

Controller.prototype.connect = function () {
	console.log("Connecting to " + env.CAMERA_CONTROLLER_ENDPOINT);
	this.socket = ioClient.connect(env.CAMERA_CONTROLLER_ENDPOINT);
	this.socket.on('connect', onConnect.bind(this))
};

function onConnect () {
	this.socket.on('activate', onActivate.bind(this));
	this.socket.on('deactivate', onDeactivate.bind(this));
	this.socket.on('disconnect', onDisconnect.bind(this));
	console.log("Camera connected, registering " + this.name);
	this.socket.emit('register', {name: this.name, id:this.id})
	this.socket.emit('status', {status: this.status});	
};

function onDisconnect() {
	console.log("Controller disconnected. Clearing event listeners.");
	this.socket.removeAllListeners("activate");
	this.socket.removeAllListeners('activate');
	this.socket.removeAllListeners('deactivate');
	this.socket.removeAllListeners('disconnect');
}

function onMotion () {
	console.log("Motion detected by sensor. Sending motion event to cloud and starting camera");
	var timestamp = moment().format("YYYYMMDDHHmmss");
	this.socket.emit("alarm", {type: "motion", timestamp: timestamp});
	// Activate camera
	var _this = this;
	this.sensor.startCamera(timestamp);
	this.playAlarm();
};

Controller.prototype.playAlarm = function () {
	console.log("Playing alarm sound");
	alarm.play();
}

function onImage(data) {
	var timestamp = data.timestamp;
	var imagePath = data.imagePath
	console.log("Image generated. Sending to cloud. Path = " + imagePath);
	var stream = ioStream.createStream();
	stream.on('finish', function () {
		console.log("Image uploaded.");
	});
	ioStream(this.socket).emit('thumbnail', stream, {timestamp: timestamp, name:path.basename(imagePath)});
	fs.createReadStream(imagePath).pipe(stream);
}

function onTimelapse(data) {
	var timestamp = data.timestamp;
	var imageDir = data.imageDir;
	var _this = this;
	console.log("Timlapse frames completed in " + imageDir);
	fs.readdir(imageDir, function (err, files) {
		if (err) return console.log("Err reading image dir " + err);
		console.log("files found: " + files);
		files.forEach(function (fileName) {
			var imagePath = imageDir + "/" + fileName;
			console.log("Sending " + imagePath)
			var fsStream = fs.createReadStream(imagePath);
			fsStream.on('error', function (error) {console.log("Cant open file " + fileName, error);});
			fsStream.on('readable', function () {
				var stream = ioStream.createStream();
				stream.on('finish', function () {console.log("Frame uploaded.");});
				fsStream.pipe(stream);
				ioStream(_this.socket).emit('frame', stream, {timestamp: timestamp, name:fileName});
			});
			
		})
	});
}

function onActivate () {
	console.log("PiSim: Turning motion detection system on");
	var _this = this;
	this.sensor.activate(function (err) {
		if (!err) {
			_this.status = 'active';
			_this.socket.emit('status', {status: _this.status});
		}
	});
}

function onDeactivate () {
	console.log("PiSim: Turning motion detection system off");
	var _this = this;
	this.sensor.deactivate(function (err) {
		if (!err) {
			_this.status = 'disabled';
			_this.socket.emit('status', {status: _this.status});
		}
	});
}

var controller = new Controller(env.NAME, env.GUID)
controller.connect();