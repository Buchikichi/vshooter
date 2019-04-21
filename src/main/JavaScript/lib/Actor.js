class Matter {
	constructor(x, y, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = 0;
		this.h = 0;
		this.dy = 0;
		this.dir = null;
		this.radian = 0;
		this.gravity = 0;
		this.speed = 1;
	}

	get width() {
		return this.w;
	}
	set width(val) {
		this.w = val;
		this.hW = val / 2;
	}

	get height() {
		return this.h;
	}
	set height(val) {
		this.h = val;
		this.hH = val / 2;
	}
}

/**
 * Actor.
 */
class Actor extends Matter {
	constructor(x, y, z = 0) {
		super(x, y, z);
		this.region = new Region(this);
		this.width = 16;
		this.height = 16;
		this.animList = [];
		this.chamberList = [];
		this.hasBounds = true;
		this.reaction = 0;
		this.effectH = true;
		this.effectV = true;
		this.hitPoint = 1;
		this.absorbed = false;
		this.score = 0;
		this.walled = false;
		this.recalculation();
		this.img = new Image();
		this.img.addEventListener('load', ()=> {
			this.width = this.img.width;
			this.height = this.img.height;
			this.recalculation();
		});
		this.fillStyle = null;
		this.sfx = 'sfx-explosion';
		this.sfxAbsorb = 'sfx-absorb';
		this.enter();
	}

	set anim(val) {
		if (Array.isArray(val)) {
			this.animList = val;
		} else {
			this.animList = [val];
		}
	}

	recalculation() {
		let field = Field.Instance;

		if (field) {
			let margin = this.hasBounds ? 0 : field.width;

			this.minX = -this.width - margin;
			this.minY = -this.height - margin;
			this.maxX = field.width + this.width + margin;
			this.maxY = field.height + this.height + margin;
//console.log('recalculation:' + margin);
		}
	}

	enter() {
		this.explosion = 0;
		this.isGone = false;
	}

	eject() {
		this.isGone = true;
		this.x = Number.MIN_SAFE_INTEGER;
	}

	aim(target) {
		if (target) {
			let dist = this.calcDistance(target);

			if (this.speed < dist) {
				let dx = target.x - this.x;
				let dy = target.y - this.y;

				this.dir = Math.atan2(dy, dx);
			}
		} else {
			this.dir = null;
		}
		return this;
	}

	closeGap(target) {
		let dx = target.x - this.x;
		let dy = target.y - this.y;
		let diff = Math.trim(this.radian - Math.atan2(dy, dx));

		if (Math.abs(diff) <= Actor.DEG_STEP) {
			return 0;
		}
		if (0 < diff) {
			return -Actor.DEG_STEP;
		}
		return Actor.DEG_STEP;
	}

	reactX(y) {
		this.dir = Math.trim(this.dir + Math.PI);
	}

	reactY(y) {
		this.y = y;
		this.dy *= -this.reaction;
		this.radian = 0;
	}

	trigger(target, force = false) {
		let result = [];

		this.chamberList.forEach(chamber => chamber.probe());
		if (this.triggered || force) {
			this.triggered = false;
			this.chamberList.forEach(chamber => {
				let shot = chamber.fire(this, target);

				if (shot) {
					result.push(shot);
				}
			});
		}
		return result;
	}

	/**
	 * Move.
	 * @param target
	 */
	move(target) {
		if (0 < this.explosion) {
			this.explosion--;
			if (this.explosion == 0) {
				this.eject();
				return;
			}
		}
		this.svX = this.x;
		this.svY = this.y;
		if (this.dir != null) {
			this.x += Math.cos(this.dir) * this.speed;
			this.y += Math.sin(this.dir) * this.speed;
		}
		if (this.gravity != 0) {
			let y = 0;
			let lift = false;

			if (this.gravity < 0) {
				y += this.hH;
				if (y < this.y) {
					this.dy += this.gravity;
				} else if (this.y < y) {
					lift = true;
				}
			} else {
				y -= this.hH;
				if (this.y < y) {
					this.dy += this.gravity;
				} else if (y < this.y) {
					lift = true;
				}
			}
			if (lift) {
				let diff = Math.abs(this.y - y);

//				if (Landform.BRICK_WIDTH * 2 < diff) {
//					this.reactX(y);
//				} else {
					this.reactY(y);
//				}
			}
		}
		this.y += this.dy * this.speed;
		this.animList.forEach(anim => {
			anim.next(this.dir);
		});
		return this.trigger(target);
	}

	drawCircle(ctx) {
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = this.fillStyle;
		ctx.arc(0, 0, this.width, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.restore();
	}

	drawHitPoint(ctx) {
		if (this.hitPoint < 100000) {
			ctx.save();
			ctx.fillStyle = 'white';
			ctx.fillText(this.hitPoint, 0, 20);
			ctx.restore();
		}
	}

	drawNormal(ctx) {
		this.animList.forEach(anim => {
			anim.draw(ctx);
		});
		if (this.animList.length == 0 && this.fillStyle) {
			this.drawCircle(ctx);
		}
//		this.drawHitPoint(ctx);
//		this.region.draw(ctx);
	}

	drawExplosion(ctx) {
		let size = this.explosion;

		ctx.save();
		ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
		ctx.beginPath();
		ctx.arc(0, 0, size, 0, Math.PI2, false);
		ctx.fill();
		ctx.restore();
	}

	/**
	 * Draw.
	 * @param ctx
	 */
	draw(ctx) {
		if (this.isGone) {
			return;
		}
		ctx.save();
		ctx.translate(this.x, this.y);
		if (0 < this.explosion) {
			this.drawExplosion(ctx);
		} else {
			this.drawNormal(ctx);
		}
		ctx.restore();
	}

	/**
	 * 当たり判定.
	 * @param target
	 * @returns {Boolean}
	 */
	isHit(target) {
		if (this.isGone || 0 < this.explosion || 0 < target.explosion) {
			return false;
		}
		if (this.region.isHit(target.region)) {
			this.fate(target);
			target.fate(this);
			return true;
		}
		return false;
	}

	calcDistance(target) {
		let wX = this.x - target.x;
		let wY = this.y - target.y;

		return Math.sqrt(wX * wX + wY * wY);
	}

	/**
	 * やられ.
	 */
	fate(target) {
		if (this.isGone || this.explosion) {
			return;
		}
		this.hitPoint--;
		if (0 < this.hitPoint) {
			this.absorb(target);
			return;
		}
		this.explosion = Actor.MAX_EXPLOSION;
		let pan = Field.Instance.calcPan(this.x);
//		AudioMixer.INSTANCE.play(this.sfx, .2, false, pan);
	}

	absorb(target) {
		this.absorbed = true;
		if (this.sfxAbsorb) {
			let ctx = Field.Instance.ctx;

			ctx.fillStyle = 'rgba(255, 200, 0, 0.4)';
			ctx.save();
			ctx.translate(target.x, target.y);
			ctx.beginPath();
			ctx.arc(0, 0, 5, 0, Math.PI2, false);
			ctx.fill();
			ctx.restore();
			let pan = Field.Instance.calcPan(this.x);
//			AudioMixer.INSTANCE.play(this.sfxAbsorb, .3, false, pan);
		}
	}
}
Actor.MAX_EXPLOSION = 12;
Actor.DEG_STEP = Math.PI / 180;
