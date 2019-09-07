/// A simple 2d vector data structure.
/// Fields: x, y
var Vector2 = function()
{
	if (arguments[0] != null && arguments[1] != null)
	{
		this.x = arguments[0];
		this.y = arguments[1];
	}
	else
	{
		this.x = 0;
		this.y = 0;
	}
}

var sign = Math.sign = function(x)
{
	return x > 0 ? 1 : (x < 0 ? -1 : 0);
}

Vector2.prototype.copied = function()
{
	return new Vector2(this.x, this.y);
}

Vector2.prototype.added = function(other)
{
	return new Vector2(
		this.x + other.x,
		this.y + other.y);
}

Vector2.prototype.add = function(other)
{
	this.x += other.x;
	this.y += other.y;
}

Vector2.prototype.subtracted = function(other)
{
	return new Vector2(
		this.x - other.x,
		this.y - other.y);
}

Vector2.prototype.subtract = function(other)
{
	this.x -= other.x;
	this.y -= other.y;
}

Vector2.prototype.multiplied = function(scalar)
{
	return new Vector2(
		this.x * scalar,
		this.y * scalar);
}

Vector2.prototype.multiply = function(scalar)
{
	this.x *= scalar;
	this.y *= scalar;
}

Vector2.prototype.equals = function(other)
{
	return other.x === this.x && other.y === this.y;
}

Vector2.prototype.normalize = function()
{
	var len = this.length();
	if (len != 0)
	{
		this.x /= len;
		this.y /= len;
	}
}

Vector2.prototype.normalized = function()
{
	var len = this.length();
	if (len != 0)
		return new Vector2(this.x / len, this.y / len);
	else
		return new Vector2();
}

Vector2.prototype.length = function()
{
	return Math.sqrt(this.lengthSq());
}

Vector2.prototype.lengthSq = function()
{
	return this.x*this.x+this.y*this.y;
}

Vector2.prototype.setZeros = function()
{
	this.x = 0;
	this.y = 0;
}

Vector2.prototype.set = function(other)
{
	this.x = other.x;
	this.y = other.y;
}

Vector2.prototype.signs = function()
{
	return new Vector2(sign(this.x), sign(this.y));
}

Vector2.prototype.inverted = function()
{
	return new Vector2(-this.x, -this.y);
}

Vector2.prototype.invert = function()
{
	this.x = -this.x;
	this.y = -this.y;
}

Vector2.prototype.moduloed = function(other)
{
	return new Vector2(this.x % other.x, this.y % other.y);
}

Vector2.prototype.modulo = function(other)
{
	this.x = this.x % other.x;
	this.y = this.y % other.y;
}