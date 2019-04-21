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
