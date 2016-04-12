function Obj () {
	this.first = "First";
	this.last = "Last";
}

Obj.prototype.fullName = function () {
	return this.first + " " + this.last;
}

var obj = new Obj();
console.log(obj.fullName());
