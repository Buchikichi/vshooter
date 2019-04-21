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
