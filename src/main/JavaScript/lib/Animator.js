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
