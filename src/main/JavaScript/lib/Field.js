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
