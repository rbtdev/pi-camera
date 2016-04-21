var ioClient = require('socket.io-client');
var ioStream = require('socket.io-stream');
var env = require('./config');
var fs = require('fs');
var moment = require('moment');
var path = require('path');
var Sound = require('node-aplay');
var spawn  = require('child_process').spawn;
var alarm = new Sound(__dirname + "/sounds/alarm-voice.wav");

function Controller (name, id) {

	this.status = 'disabled';
	this.cloud = null;
	this.name = name;
	this.id = id;
	this.motion = false;
	this.camera = require('./camera');
	this.sensor = require('./sensor');
	this.remote = require('./remote');
	this.remote.on('press', onRemotePress.bind(this));
	this.sensor.on('motion', onMotion.bind(this));
	this.camera.on('thumbnail', onImage.bind(this));
	this.camera.on('timelapse', onTimelapse.bind(this));
}

Controller.prototype.connect = function () {
	console.log("Connecting to " + env.CAMERA_CONTROLLER_ENDPOINT);
	this.cloud = ioClient.connect(env.CAMERA_CONTROLLER_ENDPOINT);
	this.cloud.on('connect', onConnect.bind(this))
};

function onConnect () {
	this.cloud.on('activate', onActivate.bind(this));
	this.cloud.on('deactivate', onDeactivate.bind(this));
	this.cloud.on('disconnect', onDisconnect.bind(this));
	this.cloud.on('speak', onSpeak.bind(this));
	console.log("Camera connected, registering " + this.name);
	this.cloud.emit('register', {name: this.name, id:this.id})
	this.cloud.emit('status', {status: this.status});	
};

function onDisconnect() {
	console.log("Controller disconnected. Clearing event listeners.");
	this.cloud.removeAllListeners("activate");
	this.cloud.removeAllListeners('activate');
	this.cloud.removeAllListeners('deactivate');
	this.cloud.removeAllListeners('disconnect');
}

function onSpeak(text) {
	 speak = spawn("festival",["--tts"]);
	 speak.stdin.write(text);
	 speak.stdin.end();
}

function onMotion () {
	if (!this.motion) {
		console.log("Motion detected by sensor. Sending motion event to cloud and starting camera");
		this.motion = true;
		var timestamp = moment().format("YYYYMMDDHHmmss");

		// notify cloud that we have motion;
		this.cloud.emit("alarm", {type: "motion", timestamp: timestamp});

		// Activate camera and play alarm
		this.camera.startTimelapse(timestamp);

		// Play Alarm
		this.playAlarm(20);
	}
	else {
		console.log("Capturing video. Ignoring any motion alarms.");
	}
};

Controller.prototype.playAlarm = function  () {
	alarm.play();
}

function sendFile(socket, event, timestamp, filePath, cb) {
	var fileName = path.basename(filePath);
	var fsStream = fs.createReadStream(filePath);
	fsStream.on('error', function (err) {
		console.log("fsSteam error - " + err);
		cb(err);
	});
	fsStream.on('open', function () {
		var stream = ioStream.createStream();
		stream.on('finish', function () {
			cb();
		});
		fsStream.pipe(stream);
		ioStream(socket).emit(event, stream, {timestamp: timestamp, name:fileName});
	});
}

function onImage(data) {
	sendFile(this.cloud, 'thumbnail', data.timestamp, data.imagePath, function (err) {
		if (err) return console.log("Error uploading file: " + err);
	});
}

function onTimelapse(data) {
	var imageDir = data.imageDir;
	var _this = this;
	fs.readdir(imageDir, function (err, files) {
		if (err) return console.log("Err reading image dir " + err);
		var filecount = 0;
		files.forEach(function (fileName) {
			var imagePath = imageDir + "/" + fileName;
			sendFile(_this.cloud, 'frame', data.timestamp, imagePath, function (err) {
				filecount++;
				if (err) return console.log("Error uploading frame: " + err);
				if (filecount >= files.length) {
					_this.cloud.emit('mjpeg', data.timestamp);
					_this.motion = false; // done capturing, allow new motion events.
					removeDirRecursive(imageDir);
				}
			});
		});
	});
}

function onRemotePress(buttonLabel) {
	console.log("Remote button " + buttonLabel + " pressed");
	if (buttonLabel === "D") {
		if (this.status === 'active') {
			onDeactivate.bind(this)();
		}
		else {
			onActivate.bind(this)();
		}
	}
}

function onActivate () {
	console.log("PiSim: Turning motion detection system on");
	this.sensor.activate();
	this.status = 'active';
	onSpeak("system activated")
	this.cloud.emit('status', {status: this.status});
}

function onDeactivate () {
	console.log("PiSim: Turning motion detection system off");
	this.sensor.deactivate();
	this.status = 'disabled';
	onSpeak('System deactivated')
	this.cloud.emit('status', {status: this.status});
}

function removeDirRecursive(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        removeDirRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

var controller = new Controller(env.NAME, env.GUID)
controller.connect();
