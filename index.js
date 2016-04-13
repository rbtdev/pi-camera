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
	this.sensor.on('thumbnail', onImage.bind(this));
	this.sensor.on('timelapse', onTimelapse.bind(this));
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

function sendFile(socket, event, timestamp, filePath, cb) {
	console.log("Sending file: (" + event + ") " + filePath);
	var fileName = path.basename(filePath);
	var fsStream = fs.createReadStream(filePath);
	fsStream.on('error', function (err) {
		console.log("fsSteam error - " + err);
		cb(err);
	});
	fsStream.on('open', function () {
		console.log("sendFile - " + filePath + " is open.");
		var stream = ioStream.createStream();
		stream.on('finish', function () {
			console.log("fsStream finished");
			cb();
		});
		fsStream.pipe(stream);
		ioStream(socket).emit(event, stream, {timestamp: timestamp, name:fileName});
	});
}

function onImage(data) {
	console.log("Got thumbnail event, calling sendFile");
	sendFile(this.socket, 'thumbnail', data.timestamp, data.imagePath, function (err) {
		if (err) return console.log("Error uploading file: " + err);
		console.log("Thumbnail uploaded.");
	});
}

function onTimelapse(data) {
	var imageDir = data.imageDir;
	var _this = this;
	console.log("Timlapse frames completed in " + imageDir);
	fs.readdir(imageDir, function (err, files) {
		if (err) return console.log("Err reading image dir " + err);
		console.log("files found: " + files);
		var filecount = 0;
		files.forEach(function (fileName) {
			var imagePath = imageDir + "/" + fileName;
			sendFile(_this.socket, 'frame', data.timestamp, imagePath, function (err) {
				filecount++;
				if (err) return console.log("Error uploading frame: " + err);
				console.log("Frame " + fileName + " uploaded.");
				if (filecount >= files.length) {
					_this.socket.emit('mjpeg', data.timestamp);
				}
			});
		});
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