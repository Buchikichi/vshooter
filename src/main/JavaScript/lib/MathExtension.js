/** One rotation(360 degree). */
Math.PI2 = Math.PI2 || Math.PI * 2;
/** Square(90 degree). */
Math.SQ = Math.SQ || Math.PI / 2;

/**
 * trim.
 * @return the range of -pi to pi.
 */
Math.trim = Math.trim || function(radian) {
	var rad = radian;

	while (Math.PI < rad) {
		rad -= Math.PI2;
	}
	while (rad < -Math.PI) {
		rad += Math.PI2;
	}
	return rad;
};

/**
 * close.
 */
Math.close = Math.close || function(src, target, pitch) {
	var diff = Math.trim(src - target);

	if (Math.abs(diff) <= pitch) {
		return src;
	}
	if (0 < diff) {
		return src - pitch;
	}
	return src + pitch;
};
