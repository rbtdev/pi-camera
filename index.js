var ioClient = require('socket.io-client');
var env = require('./config');

function PiCam (name, id) {

	this.status = 'disabled';
	this.socket = null;
	this.name = name;
	this.id = id;
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
	this.socket.emit('register', {name: this.name, id:this.id})
	this.socket.emit('status', {status: this.status});	
}
function onActivate () {
	console.log("PiSim: Turning motion detection system on");
	// do all the stuff to enable motion detection
	this.status = 'active';
	this.socket.emit('status', {status: this.status});
}

function onDeactivate () {
	console.log("PiSim: Turning motion detection system off");
	// disable motion detection
	this.status = 'disabled';
	this.socket.emit('status', {status: this.status});
}

PiCam.prototype.sendImage = function (src) {
	this.socket.emit('image', {src: src})
}

var piCam = new PiCam(env.NAME, env.GUID)
piCam.connect();