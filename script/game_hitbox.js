
var Hitbox = function(left, top, right, bottom)
{
	this.min = new Vector2(left, top);
	this.max = new Vector2(right, bottom);
	this.position = new Vector2();
}

Hitbox.prototype.copy = function()
{
	return new Hitbox(this.min.x, this.min.y, this.max.x, this.max.y);
}

Hitbox.prototype.setPosition = function(position)
{
	this.position.x = position.x;
	this.position.y = position.y;
}

Hitbox.prototype.checkCollide = function(other)
{
	var myright = (this.max.x + this.position.x) >= (other.min.x + other.position.x);
	var yuright = (other.max.x + other.position.x) >= (this.min.x + this.position.x);
	if (!myright || !yuright) return false;
	
	var mybottom = (this.max.y + this.position.y) >= (other.min.y + other.position.y);
	var yubottom = (other.max.y + other.position.y) >= (this.min.y + this.position.y);
	if (!mybottom || !yubottom) return false;
	
	return true;
}

Hitbox.prototype.contains = function(vector2)
{
	return vector2.x >= (this.min.x+this.position.x) && vector2.x <= (this.max.x+this.position.x)
	    && vector2.y >= (this.min.y+this.position.y) && vector2.y <= (this.max.y+this.position.y);
}