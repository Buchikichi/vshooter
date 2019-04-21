/**
 * Ship.
 */
class Ship extends Actor {
	constructor(x, y) {
		super(x, y);
		this.effectH = false;
		this.anim = new Animator(this, 'ship001.png', Animator.TYPE.H, Ship.PATTERNS * 2 + 1, 1);
		this.reset();
	}

	recalculation() {
		let field = Field.Instance;

		super.recalculation();
		if (field) {
			this.right = field.width - this.width * 2;
			this.bottom = field.height - this.hH;
		}
	}

	reset() {
		this.speed = Ship.MIN_SPEED;
		this.triggered = false;
		this.chamberList = [
			new Chamber(Shot, 4, Ship.MAX_SHOTS),
//new Chamber(Missile, 16, 2, {gravity:.05, dir:0}), new Chamber(Missile, 16, 2, {gravity:-.05, dir:0}),
//new Chamber(Missile, 16, 2, {gravity:.05, dir:Math.PI}), new Chamber(Missile, 16, 2, {gravity:-.05, dir:Math.PI}),
		];
		this.chamberList.forEach(chamber => chamber.reset());
		this.missileLevel = 0;
	}

	speedup() {
		this.speed *= 1.25;
//		console.log('speed:' + this.speed);
		if (Ship.MAX_SPEED < this.speed) {
			this.speed = Ship.MAX_SPEED;
		}
	}

	powerUpMissile() {
		this.missileLevel++;
		if (this.missileLevel == 1) {
			this.chamberList.push(new Chamber(Missile, 16, 2, {gravity:.05, dir:0}));
		} else if (this.missileLevel == 2) {
			this.chamberList.push(new Chamber(Missile, 16, 2, {gravity:-.05, dir:0}));
		} else if (this.missileLevel == 3) {
			this.chamberList.push(new Chamber(Missile, 16, 2, {gravity:.05, dir:Math.PI}));
			this.chamberList.push(new Chamber(Missile, 16, 2, {gravity:-.05, dir:Math.PI}));
		}
	}

	inkey(keys) {
		let hit = false;
		let dir = 0;

		if (keys['ArrowLeft'] || keys['Left'] || keys['k37']) {
			dir = 1;
			hit = true;
		} else if (keys['ArrowRight'] || keys['Right'] || keys['k39']) {
			dir = -1;
			hit = true;
		}
		if (keys['ArrowUp'] || keys['Up'] || keys['k38']) {
			dir = 2 - dir * .5;
			hit = true;
		} else if (keys['ArrowDown'] || keys['Down'] || keys['k40']) {
			dir *= .5;
			hit = true;
		}
		if (hit) {
			this.dir = (dir + 1) * Math.SQ;
		}
		if (keys['Control'] || keys['Shift'] || keys['k16'] || keys['k17']) {
			this.triggered = true;
		}
	}

	move() {
		this.dir = null;
		this.aim(Controller.Instance.point);
		this.inkey(Controller.Instance.keys);
		if (Controller.Instance.touch) {
			this.triggered = true;
		}
		let result = super.move();
		if (this.isGone) {
			return;
		}
		if (this.walled) {
			this.fate();
			return;
		}
		if (this.x < this.hW || this.right < this.x) {
			this.x = this.svX;
		}
		if (this.y < this.hH || this.bottom < this.y) {
			this.y = this.svY;
		}
		return result;
	}
}
Ship.MIN_SPEED = 3;
Ship.MAX_SPEED = 5;
Ship.MAX_SHOTS = 7;
Ship.PATTERNS = 2;
