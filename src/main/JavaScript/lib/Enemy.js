/**
 * Enemy.
 */
class Enemy extends Actor {
	constructor(x, y, z = 0) {
		super(x, y, z);
		this.radian = Math.PI;
		this.routine = null;
		this.routineIx = 0;
		this.routineCnt = 0;
		this.chamberList = [new Chamber(Bullet, Enemy.TRIGGER_CYCLE)];
	}

	move(target) {
		if (this.routine) {
			let mov = this.routine[this.routineIx];

			mov.tick(this, target);
		}
		let result = super.move(target);
//console.log('enemy[' + this.x + ',' + this.y + ']');
		if (!(target instanceof Enemy) && this.calcDistance(target) < Enemy.TRIGGER_ALLOWANCE) {
			result = [];
		}
		return result;
	}
}
Enemy.TRIGGER_CYCLE = 50;
Enemy.TRIGGER_ALLOWANCE = 100;
Enemy.MAX_TYPE = 0x7f;
Enemy.LIST = [];
Enemy.assign = function(ix, x, y) {
	let enemy = Object.assign({}, Enemy.LIST[ix % Enemy.LIST.length]);

	enemy.x = x;
	enemy.y = y;
	return enemy;
}

/**
 * Chain.
 */
class Chain extends Enemy {
	constructor(x, y) {
		super(x, y);
		this.prev = null;
		this.next = null;
	}

	unshift(element) {
		element.next = this;
		element.prev = this.prev;
		if (this.prev) {
			this.prev.next = element;
		}
		this.prev = element;
		return this;
	}

	push(element) {
		element.prev = this;
		element.next = this.next;
		if (this.next) {
			this.next.prev = element;
		}
		this.next = element;
		return this;
	}

	remove() {
		this.prev.next = this.next;
		this.next.prev = this.prev;
		return this.next;
	}
}
