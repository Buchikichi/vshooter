/**
 * Chamber.
 */
class Chamber {
	constructor(type, cycle, max = Number.MAX_SAFE_INTEGER, opt = {}) {
		this.type = type;
		this.cycle = cycle;
		this.max = max;
		this.opt = opt;
		this.reset();
	}

	reset() {
		this.tick = 0;
		this.hands = [];
	}

	probe() {
		let validList = [];

		this.hands.forEach(elem => {
			if (!elem.isGone) {
				validList.push(elem);
			}
		});
		this.hands = validList;
		this.tick++;
	}

	fire(actor, target = null) {
		if (this.tick < this.cycle || this.max <= this.hands.length) {
			return null;
		}
		let x = actor.x;
		let y = actor.y;
		let elem = new this.type(x, y, this.opt);

		if (target) {
			let dist = actor.calcDistance(target);
			let fg = Field.Instance.stage.getFg();
			let estimation = dist / elem.speed * fg.speed;
			let dx = target.x - actor.x + estimation;
			let dy = target.y - actor.y;

			elem.dir = Math.atan2(dy, dx);
		}
		this.tick = 0;
		this.hands.push(elem);
		return elem;
	}
}
