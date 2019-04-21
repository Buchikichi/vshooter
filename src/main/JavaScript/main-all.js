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
class Animator {
	constructor(actor, src, type = Animator.TYPE.ROTATION, numX = 1, numY = 1) {
		this.actor = actor;
		this.type = type;
		this.numX = numX;
		this.numY = numY;
		this.patNum = 0;
		this.loadImage(actor, src);
	}

	loadImage(actor, src) {
		let imgs = ImageManager.Instance;

		this.img = imgs.dic[src];
		if (this.img) {
			this.width = this.img.width / this.numX;
			this.height = this.img.height / this.numY;
			this.hW = this.width / 2;
			this.hH = this.height / 2;
			actor.width = this.width;
			actor.height = this.height;
			actor.recalculation();
			return;
		}
		// TODO 仮実装なので直す
ImageManager.Instance.reserve([src]);
		this.img = new Image();
		this.img.onload = ()=> {
			this.width = this.img.width / this.numX;
			this.height = this.img.height / this.numY;
			this.hW = this.width / 2;
			this.hH = this.height / 2;
//console.log('loadImage:' + src);
			actor.width = this.width;
			actor.height = this.height;
			actor.recalculation();
		};
		this.img.src = 'img/' + src;
	}

	next(dir) {
		if (this.type & (Animator.TYPE.H | Animator.TYPE.V) && .1 < Math.abs(this.patNum)) {
			if (this.patNum < 0) {
				this.patNum += .1;
			} else {
				this.patNum -= .1;
			}
		}
		if (dir != null) {
			if (this.type & Animator.TYPE.X) {
				this.patNum += Math.cos(dir) * .5;
				let num = Math.floor(this.patNum);

				if (num < 0) {
					this.patNum = this.numX - .1;
				} else if (this.numX <= num) {
					this.patNum = 0;
				}
			} else if (this.type & Animator.TYPE.Y) {
				this.patNum += Math.sin(dir) * .5;
				let num = Math.floor(this.patNum);

				if (num < 0) {
					this.patNum = this.numY - .1;
				} else if (this.numY <= num) {
					this.patNum = 0;
				}
			} else if (this.type & Animator.TYPE.V) {
				let limit = Math.floor(this.numY / 2);

				this.patNum += Math.sin(dir) / 3;
				if (this.patNum < -limit) {
					this.patNum = -limit;
				} else if (limit < this.patNum) {
					this.patNum = limit;
				}
			} else if (this.type & Animator.TYPE.H) {
				let limit = Math.floor(this.numX / 2);

				this.patNum += Math.cos(dir) / 3;
				if (this.patNum < -limit) {
					this.patNum = -limit;
				} else if (limit < this.patNum) {
					this.patNum = limit;
				}
			}
		}
		//this.patNum = Math.round(this.patNum, 3);
		this.patNum *= 1000;
		this.patNum = Math.round(this.patNum) / 1000;
//console.log('patNum:' + this.patNum);
	}

	draw(ctx) {
		let actor = this.actor;
		let sw = this.width;
		let sh = this.height;
		let sx = 0;
		let sy = 0;

		if (this.type & Animator.TYPE.X) {
			sx = sw * Math.floor(this.patNum);
		} else if (this.type & Animator.TYPE.Y) {
			sy = sh * Math.floor(this.patNum);
		} else if (this.type & Animator.TYPE.V) {
			sy = sh * (parseInt(this.patNum) + (this.numY ? parseInt(this.numY / 2) : 0));
		} else if (this.type & Animator.TYPE.H) {
			sx = sw * (parseInt(this.patNum) + (this.numX ? parseInt(this.numX / 2) : 0));
		}
		ctx.save();
		if (this.type == Animator.TYPE.NONE && actor.isInverse) {
			ctx.rotate(Math.PI);
		}
		if (this.type & Animator.TYPE.ROTATION) {
			ctx.rotate(actor.radian);
		}
		if (actor.scale) {
			ctx.scale(actor.scale, actor.scale);
		}
		ctx.drawImage(this.img, sx, sy, sw, sh, -this.hW, -this.hH, sw, sh);
		ctx.restore();
	}
}
Animator.TYPE = {
	NONE: 0,
	ROTATION: 1,
	X: 2,
	Y: 4,
	XY: 6,
	H: 8,
	V: 16,
};
/**
 * Bullet.
 */
class Bullet extends Actor {
	constructor(x, y) {
		super(x, y);
		this.region = new Region(this, 2);
		this.speed = 2;
		this.width = 4;
		this.fillStyle = 'rgba(120, 200, 255, 0.7)';
		this.recalculation();
	}

	move(target) {
		super.move(target);
		if (this.walled) {
			this.eject();
			return;
		}
	}
}
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
/**
 * Controller.
 */
class Controller {
	constructor(isEdit = false) {
		this.init(isEdit);
		Controller.Instance = this;
	}

	init(isEdit) {
		this._contextmenu = false;
		this.mouseMoving = false;
		if (!isEdit) {
			let canvas = document.getElementById('canvas');

			canvas.addEventListener('contextmenu', event => {
				if (!this.mouseMoving) {
					this._contextmenu = true;
				}
				event.preventDefault();
			});
		}
		this.initKeys();
		this.initPointingDevice();
	}

	initKeys() {
		this.keys = {};
		window.addEventListener('keydown', event => {
			if (event.key) {
//console.log('key[' + event.key + ']');
				this.keys[event.key] = true;
			} else {
				this.keys['k' + event.keyCode] = true;
			}
		});
		window.addEventListener('keyup', event => {
			if (event.key) {
				delete this.keys[event.key];
			} else {
				delete this.keys['k' + event.keyCode];
			}
		});
	}

	initPointingDevice() {
		let canvas = document.getElementById('canvas');
		let longPress = false;
		let end = ()=> {
			this.point = [];
			this.prev = [];
			this.move = [];
			longPress = false;
//console.log('end');
		};

		end();
		canvas.addEventListener('mousedown', event => {
			this.point = [FlexibleView.Instance.convert(event.clientX, event.clientY)];
			this.prev = this.point;
			this.move = this.point;
//			longPress = true;
//			setTimeout(()=> {
//				if (longPress) {
//					this._contextmenu = true;
//				}
//			}, 2000);
		});
		canvas.addEventListener('mousemove', event => {
			let point = [FlexibleView.Instance.convert(event.clientX, event.clientY)];

			this.move = point;
			if (0 < this.prev.length) {
				this.point = point;
			}
			longPress = false;
		});
		canvas.addEventListener('mouseup', ()=> end());
		canvas.addEventListener('mouseleave', ()=> end());

		// touch
		canvas.addEventListener('touchstart', event => {
			Array.prototype.forEach.call(event.touches, touch => {
				this.point.push(FlexibleView.Instance.convert(touch.pageX, touch.pageY));
			});
			this.prev = this.point;
			this.move = this.point;
			longPress = true;
			setTimeout(()=> {
				if (longPress) {
					this._contextmenu = true;
				}
			}, 2000);
//console.log('touchstart:' + this.point);
			event.preventDefault();
		});
		canvas.addEventListener('touchmove', event => {
			let point = [];

			Array.prototype.forEach.call(event.touches, touch => {
				point.push(FlexibleView.Instance.convert(touch.pageX, touch.pageY));
			});
//console.log('touchmove:' + this.point);
			this.move = point;
			if (0 < this.prev.length) {
				this.point = point;
			}
			longPress = false;
		});
		canvas.addEventListener('touchend', ()=> end());
	}

	get delta() {
		let delta = [];

		this.mouseMoving = false;
		this.point.forEach((pt, ix) => {
			let dx = pt.x - this.prev[ix].x;
			let dy = pt.y - this.prev[ix].y;

			delta.push({x:dx, y:dy});
			this.prev[ix] = pt;
			if (dx != 0 || dy != 0) {
				this.mouseMoving = true;
			}
		});
		return delta;
	}

	get contextmenu() {
		let contextmenu = this._contextmenu;

		this._contextmenu = false;
		return contextmenu;
	}
}
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
/**
 * Field.
 */
class Field extends Matter {
	constructor(width, height) {
		super(0, 0);
		this.width = width;
		this.height = height;
		this.ship = new Ship(-100, 100);
		this.ship.isGone = true;
		this.shipRemain = 0;
		this.actorList = [];
		this.score = 0;
		this.hiscore = 0;
		this.enemyCycle = 0;
		this.setup();
		Field.Instance = this;
	}

	setup() {
		let canvas = document.getElementById('canvas');

		canvas.width = this.width;
		canvas.height = this.height;
		this.ctx = canvas.getContext('2d');
		this.resize();
	}

	resize() {
		let scaleW = document.body.clientWidth / this.width;
		let scaleH = window.innerHeight / this.height;
		let view = document.getElementById('view');

		this.scale = scaleH < scaleW ? scaleH : scaleW;
//console.log('scale:' + this.scale);
		// transform: scale(2);
		view.setAttribute('style', 'transform: scale(' + this.scale + ');');
	}

	_reset() {
		this.phase = Field.PHASE.NORMAL;
		this.ship.reset();
		this.ship.x = 100;
		this.ship.y = 100;
		this.ship.enter();
		this.actorList = [this.ship];
		this.hibernate = Field.MAX_HIBERNATE;
	}

	reset() {
		this._reset();
	}

	retry() {
		this._reset();
	}

	startGame() {
		this.loosingRate = Field.MAX_LOOSING_RATE;
		this.score = 0;
		this.shipRemain = Field.MAX_SHIP;
		this._reset();
	}

	endGame() {
//		let gameOver = document.getElementById('gameOver');
//
//		gameOver.classList.remove('hidden');
	}

	isGameOver() {
//		let gameOver = document.getElementById('gameOver');
//
//		return !gameOver.classList.contains('hidden');
		return false;
	}

	calcPan(x) {
		return (x - this.hW) / this.hW;
	}

	move() {
		if (this.phase == Field.PHASE.BOSS) {
			return;
		}
		if (this.isGameOver()) {
			return;
		}
		if (Field.MIN_LOOSING_RATE < this.loosingRate) {
			let step = this.loosingRate / 10000;

			this.loosingRate -= step;
		}
	}

	draw() {
		let field = this;
		let ctx = this.ctx;
		let ship = this.ship;
		let shotList = [];
		let enemyList = [];
		let validActors = [];
		let score = 0;

		ctx.save();
		ctx.clearRect(0, 0, this.width, this.height);
		this.actorList.sort(function(a, b) {
			return a.z - b.z;
		});
		this.actorList.forEach(actor => {
			if (actor.isGone) {
				return;
			}
			if (actor instanceof Bullet) {
				actor.isHit(ship);
			} else if (actor instanceof Enemy) {
				actor.triggered = parseInt(Math.random() * field.loosingRate / 10) == 0;
				actor.isHit(ship);
				enemyList.push(actor);
			} else if (actor instanceof Shot || actor instanceof Missile) {
				shotList.push(actor);
			}
			let child = actor.move(ship);

			if (child instanceof Array) {
				child.forEach(enemy => {
					validActors.push(enemy);
				});
			}
			actor.draw(ctx);
			validActors.push(actor);
			if (actor.explosion && actor.score) {
				score += actor.score;
				actor.score = 0;
			}
		});
		shotList.forEach(shot => {
			enemyList.forEach(enemy => enemy.isHit(shot));
		});
		if (this.phase == Field.PHASE.BOSS && enemyList.length == 0) {
			this.phase = Field.PHASE.NORMAL;
		}
		this.actorList = validActors;
		this.score += score;
		this.showScore();
		if (!this.isGameOver() && ship.isGone) {
			if (0 < --this.hibernate) {
				return;
			}
			if (0 < --this.shipRemain) {
				this.retry();
//++this.shipRemain;
			} else {
				this.endGame();
			}
		}
		ctx.restore();
	}

	showScore() {
		if (this.hiscore < this.score) {
			this.hiscore = this.score;
		}
		let scoreNode = document.querySelector('#score > div > div:nth-child(2)');
		let hiscoreNode = document.querySelector('#score > div:nth-child(2) > div:nth-child(2)');
		let debugNode = document.querySelector('#score > div:nth-child(3)');
		let remainNode = document.querySelector('#remain > div > div:nth-child(1)');

		if (!scoreNode) {
			return;
		}
		scoreNode.innerHTML = this.score;
		hiscoreNode.innerHTML = this.hiscore;
//		debugNode.innerHTML = this.actorList.length + ':' + parseInt(this.loosingRate);
		if (this.shipRemain) {
			remainNode.style.width = (this.shipRemain - 1) * 16 + 'px';
		}
	}
}
Field.MAX_ENEMIES = 100;
Field.ENEMY_CYCLE = 10;
Field.MIN_LOOSING_RATE = 1;
Field.MAX_LOOSING_RATE = 20000;
Field.MAX_SHIP = 7;
Field.MAX_HIBERNATE = Actor.MAX_EXPLOSION * 5;
Field.PHASE = {
	NORMAL: 0,
	BOSS: 1
};
class FlexibleView {
	constructor(width, height) {
		this.view = document.getElementById('view');
		this.canvas = document.getElementById('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.scale = 1;
		this.init();
		this.setSize(width, height);
		FlexibleView.Instance = this;
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
		this.resize();
	}

	init() {
		let header = document.querySelector('[data-role="header"]');
		let footer = document.querySelector('[data-role="footer"]');

		this.headerHeight = header ? header.offsetHeight : 0;
		this.footerHeight = footer ? footer.offsetHeight : 0;
		this.margin = this.headerHeight + this.footerHeight;
//console.log('headerH:' + headerHeight);
		window.addEventListener('resize', ()=> {
			this.resize();
		});
		window.addEventListener('keydown', ()=> {
			if (!this.view.classList.contains('addicting')) {
				this.view.classList.add('addicting');
			}
		});
		window.addEventListener('mousemove', ()=> {
			this.view.classList.remove('addicting');
		});
	}

	resize() {
		let scaleW = document.body.clientWidth / this.width;
		let scaleH = (window.innerHeight - this.margin) / this.height;

		this.scale = scaleH < scaleW ? scaleH : scaleW;
		// transform: scale(2);
//console.log('scale:' + this.scale);
		let style = [
			'width:' + this.width + 'px',
			'height:' + this.height + 'px',
			'transform: scale(' + this.scale + ')',
		];
		this.view.setAttribute('style', style.join(';'));
	}

	convert(x, y) {
		let cx = x / this.scale;
		let cy = (y - this.headerHeight) / this.scale;

		return {x: cx, y: cy};
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}
class ImageManager {
	constructor() {
		this.max = 0;
		this.loaded = 0;
		this.dic = {};
	}

	isComplete() {
		return 0 < this.max && this.max == this.loaded;
	}

	reserve(list) {
		list.forEach(src => {
			if (src in this.dic) {
				return;
			}
			let img = new Image();

//console.log('Image.reserve:' + src);
			img.onload = ()=> {
//console.log('Image.onload:' + src);
				this.dic[src] = img;
				this.loaded++;
			};
			img.src = 'img/' + src;
			this.max++;
		});
	}
}
ImageManager.Instance = new ImageManager();
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
/**
 * Matrix.
 * @author Hidetaka Sasai
 */
function Matrix(mat) {
	this.mat = mat;
}
Matrix.NO_EFFECT = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];

Matrix.rotateX = function(r) {
	return new Matrix([[1,0,0,0],[0,Math.cos(r),-Math.sin(r),0],[0,Math.sin(r),Math.cos(r),0],[0,0,0,1]]);
};

Matrix.rotateY = function(r) {
	return new Matrix([[Math.cos(r),0,Math.sin(r),0],[0,1,0,0],[-Math.sin(r),0,Math.cos(r),0],[0,0,0,1]]);
};

Matrix.rotateZ = function(r) {
	return new Matrix([[Math.cos(r),-Math.sin(r),0,0],[Math.sin(r),Math.cos(r),0,0],[0,0,1,0],[0,0,0,1]]);
};

/**
 * Multiply.
 * @param multiplicand matrix
 */
Matrix.prototype.multiply = function(multiplicand) {
	var result = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
	var m = multiplicand.mat;

	this.mat.forEach(function(row, i) {
		row.forEach(function(col, j) {
			var sum = 0;

			for (var cnt = 0; cnt < 4; cnt++) {
				sum += row[cnt] * m[cnt][j];
			}
			result[i][j] = sum;
		});
	});
	return new Matrix(result);
};

Matrix.prototype.affine = function(x, y, z) {
	var m = this.mat;
	var nx = m[0][0] * x + m[0][1] * y + m[0][2] * z + m[0][3];
	var ny = m[1][0] * x + m[1][1] * y + m[1][2] * z + m[1][3];
	var nz = m[2][0] * x + m[2][1] * y + m[2][2] * z + m[2][3];

	return {x:nx, y:ny, z:nz};
};
/**
 * Missile.
 */
class Missile extends Actor {
	constructor(x, y, opt) {
		super(x, y);
		this.dir = opt.dir;
		this.speed = 3;
		this.width = 2.5;
		this.gravity = opt.gravity;
		this.recalculation();
		this.shuttle = 3;
		this.fillStyle = 'rgba(200, 200, 255, 0.6)';
	}

//	move(target) {
//		super.move(target);
//		if (this.walled) {
//			if (this.walled == Landform.BRICK_TYPE.BRITTLE) {
//				Field.Instance.landform.smashWall(this);
//			}
//			this.fate();
//		}
//	}

	reactX(y) {
		super.reactX(y);
		this.shuttle--;
		if (this.shuttle < 0) {
			this.fate();
		}
	}

	fate() {
		this.eject();
	}
}
/**
 * Gizmo.
 */
function Gizmo(type, destination, param = null) {
	this.type = type;
	this.destination = destination;
	this.param = param;
}
Gizmo.TYPE = {
	FIXED: 0,
	OWN: 1,
	AIM: 2,
	CHASE: 3
};
Gizmo.DEST = {
	TO: 0,
	TO_X: 1,
	TO_Y: 2,
	ROTATE: 3,
	ROTATE_L: 4,
	ROTATE_R: 5,
	LEFT: 6,
	RIGHT: 7
};

Gizmo.prototype.tick = function(src, target) {
	if (this.type == Gizmo.TYPE.FIXED) {
		if (this.destination == Gizmo.DEST.ROTATE) {
			src.radian = src.dir;
		} else {
			src.dir = null;
		}
		return;
	}
	if (this.type == Gizmo.TYPE.OWN) {
		if (this.destination == Gizmo.DEST.ROTATE_L) {
			src.dir -= src.step;
		} else if (this.destination == Gizmo.DEST.ROTATE_R) {
			src.dir += src.step;
		} else if (this.destination == Gizmo.DEST.LEFT) {
			src.dir = Math.PI;
		} else if (this.destination == Gizmo.DEST.RIGHT) {
			src.dir = 0;
		}
		return;
	}
	let dx = target.x - src.x;
	let dy = target.y - src.y;

	if (Math.abs(dx) <= src.speed) {
		dx = 0;
	}
	if (Math.abs(dy) <= src.speed) {
		dy = 0;
	}
	if (this.type == Gizmo.TYPE.AIM) {
		if (this.destination == Gizmo.DEST.TO_X) {
			if (dx < 0) {
				src.radian = Math.PI;
			} else {
				src.radian = 0;
			}
		} else if (this.destination == Gizmo.DEST.TO_Y) {
			if (dx < 0) {
				src.radian = -Math.SQ;
			} else {
				src.radian = Math.SQ;
			}
		} else if (this.destination == Gizmo.DEST.ROTATE) {
			let dist = src.calcDistance(target);

			if (src.speed < dist) {
				let step = this.param ? this.param : Math.PI / 30;

				src.radian = Math.close(src.radian, Math.atan2(dy, dx), step);
				src.radian = Math.trim(src.radian);
			}
		}
		return;
	}
	if (this.type == Gizmo.TYPE.CHASE) {
		if (this.destination == Gizmo.DEST.TO) {
			src.dir = Math.atan2(dy, dx);
		} else if (this.destination == Gizmo.DEST.TO_X && dx) {
			src.dir = Math.atan2(0, dx);
		} else if (this.destination == Gizmo.DEST.TO_Y && dy) {
			src.dir = Math.atan2(dy, 0);
		} else if (this.destination == Gizmo.DEST.ROTATE) {
			let step = this.param ? this.param : Math.PI / 60;

			src.dir = Math.close(src.dir, Math.atan2(dy, dx), step);
			src.radian = src.dir;
		}
	}
};

/**
 * Movement.
 */
function Movement(cond) {
	let count = parseInt(cond);

	this.cond = cond;
	this.count = count == cond ? count : null;
	this.list = [];
}
Movement.COND = {
	X: 'x',
	Y: 'y'
};

Movement.prototype.add = function(type, target, param) {
	this.list.push(new Gizmo(type, target, param));
	return this;
};

Movement.prototype.isValid = function(src, target) {
	if (!this.cond) {
		return;
	}
	if (this.count) {
		if (src.routineCnt++ < this.count) {
			return true;
		}
		src.routineCnt = 0;
		return false;
	}
	let dx = target.x - src.x;
	let dy = target.y - src.y;

	if (this.cond == Movement.COND.X && Math.abs(dx) <= src.speed) {
		return false;
	}
	if (this.cond == Movement.COND.Y && Math.abs(dy) <= src.speed) {
		return false;
	}
	return true;
};

Movement.prototype.tick = function(src, target) {
	this.list.forEach(function(gizmo) {
		gizmo.tick(src, target);
	});
	if (!this.isValid(src, target)) {
		src.routineIx++;
		if (src.routine.length <= src.routineIx) {
			src.routineIx = 0;
		}
	}
};
class Region {
	constructor(matter, size = Region.DefaultSize, type = Region.Type.CIRCLE) {
		this.matter = matter;
		this.size = size;
		this.type = type;
		this.width = size * 2;
	}

	isHit(target) {
		if (this.type == Region.Type.CIRCLE) {
			if (target.type == Region.Type.CIRCLE) {
				let wX = this.matter.x - target.matter.x;
				let wY = this.matter.y - target.matter.y;
				let distance = Math.sqrt(wX * wX + wY * wY);

				return distance < this.size + target.size;
			}
		}
console.log('*Not implement*');
	}

	draw(ctx) {
		ctx.save();
		ctx.strokeStyle = 'rgba(80, 255, 80, 0.6)';
		if (this.type == Region.Type.RECTANGLE) {
			ctx.strokeRect(-this.size, -this.size, this.width, this.width);
		} else {
			ctx.beginPath();
			ctx.arc(0, 0, this.size, 0, Math.PI2, false);
			ctx.stroke();
		}
		ctx.restore();
	}
}
Region.DefaultSize = 4;
Region.Type = {
	CIRCLE: 1,
	RECTANGLE: 2,
};
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
class AjaxUtils {
	static fetch(input, data, headers = {}) {
		if (typeof fetch === 'function') {
			// GlobalFetch.fetch()が存在する場合
//console.log('AjaxUtils.fetch:' + input);
			return fetch(input, {
				method: 'post',
				headers: headers,
				body: data,
				credentials: 'include',
			});
		}
//console.log('AjaxUtils.promise:' + input);
		return new Promise((resolve, reject)=> {
			let client = new XMLHttpRequest();

			client.open('post', input);
			client.withCredentials = true;
			client.responseType= 'blob';
			client.addEventListener('loadend', response => {
				if (200 <= client.status && client.status < 300) {
					let contentType = client.getResponseHeader('Content-Type');
					let blob = new Blob([client.response], {type: contentType});

					resolve({blob: ()=>blob});
					return;
				}
				reject(client);
			});
			Object.keys(headers).forEach(key => {
				client.setRequestHeader(key, headers[key]);
			});
			client.send(data);
		});
	}

	static post(input, data, headers = {}) {
		return AjaxUtils.fetch(input, data);
	}

	static postJSON(input, data) {
		let headers = {'Content-Type':'application/json'};
		let csrfHeader = document.querySelector('[name="_csrf_header"]');

		if (csrfHeader) {
			let key = csrfHeader.getAttribute('content');
			let csrfToken = document.querySelector('[name="_csrf"]').getAttribute('content');

			headers[key] = csrfToken;
		}
		return AjaxUtils.fetch(input, data, headers);
	}
}
document.addEventListener('DOMContentLoaded', ()=> {
	let app = new AppMain();
	let activate = ()=> {
		let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

		app.control();
		app.draw();
		requestAnimationFrame(activate);
	};

	activate();
});

class AppMain {
	constructor() {
		this.controller = new Controller();
		this.field = new Field(1024, 768);
		new FlexibleView(1024, 768);
		this.init();
	}

	init() {
		let half = (1024 - 32) / 2;
		let ship = new Ship(half, 768 - 100);

		this.field.actorList.push(ship);
	}

	control() {
	}

	draw() {
		this.field.draw();
	}
}
