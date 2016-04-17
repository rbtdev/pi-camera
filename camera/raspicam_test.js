var EventEmitter = require('events');
var path = require('path');
var util = require('util');
var fs = require('fs');
var sprintf = require('sprintf-js').sprintf;


var testImage =  __dirname + "/images/test/pi_logo.png"
function Raspicam (options) {
	this.options = options;
	EventEmitter.call(this);
}
util.inherits(Raspicam, EventEmitter);

Raspicam.prototype.start = function () {
	var _this = this;
	this.emit('start');
	var count = 0;
	function sendFile() {
		var data = fs.readFileSync(testImage);
		var outfile = sprintf(_this.options.output, count);
		fs.writeFileSync(outfile, data);
		_this.emit('read', null, "", path.basename(outfile));
		count++
		if (count <= 10)
		{
			setTimeout(sendFile, 250);
		}
		else {
			_this.emit('exit');
		}
	}
	sendFile();

	
}

module.exports = Raspicam;