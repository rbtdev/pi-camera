var ioClient = require('socket.io-client');
var env = require('./config');


function PiCam (name) {

	this.active = false;
	this.socket = null;
	this.name = name;
}

PiCam.prototype.connect = function () {
	var _this = this;
	console.log("Connecting to " + env.CAMERA_CONTROLLER_ENDPOINT);
	this.socket = ioClient.connect(env.CAMERA_CONTROLLER_ENDPOINT);
	this.socket.on('connect', onConnect.bind(this))
}

function onConnect () {
	this.socket.on('activate', onActivate.bind(this));
	this.socket.on('deactivate', onDeactivate.bind(this));
	console.log("Camera connected, registering " + this.name);
	this.socket.emit('register', {name: this.name})
	this.socket.emit('status', {active: this.active});	
}
function onActivate () {
	console.log("PiSim: Turning motion detection system on");
	// do all the stuff to enable motion detection
	this.active = true
	this.socket.emit('status', {active: this.active});
}

function onDeactivate () {
	console.log("PiSim: Turning motion detection system off");
	// disable motion detection
	this.active = false;
	this.socket.emit('status', {active: this.active});
}

PiCam.prototype.sendImage = function (src) {
	this.socket.emit('image', {src: src})
}

var piCam = new PiCam("My Pi")
piCam.connect();

setTimeout(function () {
	console.log("Sending image...");
	piCam.sendImage("https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSrYrONHmEvJE7F7sdXoJRhivju1dYYQ9UeZFgz4Ekee8HTrpLvSs939LM");
}, 10000)