
//Global reduction to shaking
var globalscale = 1.0;
//Spring velocity per second
var springamt = 500.0;

///Fields:
/// - currentPos
/// - targetPos
/// - magnitude
/// - duration
/// - magDecay (per second)
var Screenshake = function()
{
	this.currentPos = new Vector2();
	this.targetPos = new Vector2();
	this.duration = this.magnitude = 0;
}

Screenshake.prototype.update = function(elapsed)
{
	if (this.duration > 0 || !this.currentPos.equals(this.targetPos))
	{
		this.duration -= elapsed;
		
		//Move toward target
		var delta = this.targetPos.subtracted(this.currentPos);
		delta.normalize();
		delta.multiply(elapsed * springamt);
		this.currentPos.add(delta);
		
		//Passed target
		if (!this.targetPos.subtracted(this.currentPos).signs().equals(delta.signs()))
		{
			this.currentPos.set(this.targetPos);
		}
		
		if (this.duration <= 0)
		{
			//Time expired, go to center
			this.duration = this.magnitude = 0;
			this.targetPos.setZeros();
		}
		else
		{
			//Keep going with new target
			this.retarget();
		}
	}
}

Screenshake.prototype.kickScreen = function(vector)
{
	this.currentPos.set(vector);
}

Screenshake.prototype.shakeScreen = function(mag, dur)
{
	this.totalDuration = dur;
	this.magnitude = Math.max(this.magnitude, mag);
	this.duration = Math.max(this.duration, dur);
	this.retarget();
}

Screenshake.prototype.getOffset = function()
{
	return this.currentPos.multiplied(globalscale);
}

Screenshake.prototype.retarget = function()
{
	var targTheta = Math.PI * 2 * Math.random();
	var targR = this.magnitude * Math.random() * (this.duration / this.totalDuration);
	this.targetPos.x = Math.cos(targTheta) * targR;
	this.targetPos.y = Math.sin(targTheta) * targR;
}