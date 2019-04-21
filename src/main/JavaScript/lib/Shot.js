/**
 * Shot.
 */
class Shot extends Actor {
	constructor(x, y) {
		super(x, y);
		this.dir = -Math.PI / 2;
		this.width = 2;
		this.speed = 8;
//		this.effectH = false;
		this.size = 2;
		this.maxX = Field.Instance.width;
		this.fillStyle = 'rgba(255, 255, 0, 0.7)';

		let pan = Field.Instance.calcPan(this.x);
//		AudioMixer.INSTANCE.play('sfx-fire', .4, false, pan);
	}

	fate() {
		this.eject();
	}

	move(target) {
		super.move(target);
		if (this.y < 0) {
			this.eject();
		}
		if (this.walled) {
			this.fate();
		}
	}
}
